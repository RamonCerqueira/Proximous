from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from sqlalchemy import or_

from src.models.user import db, User
from src.models.admin import Admin, SupportTicket, SupportMessage, FAQ, FAQVote

support_bp = Blueprint('support', __name__)

def require_admin_support():
    """Decorator to require admin access"""
    def decorator(f):
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            if claims.get('type') != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

@support_bp.route('/tickets', methods=['POST'])
@jwt_required(optional=True)
def create_support_ticket():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['subject', 'description', 'category', 'user_email', 'user_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create support ticket
        ticket = SupportTicket(
            user_id=current_user_id,
            user_email=data['user_email'],
            user_name=data['user_name'],
            subject=data['subject'],
            description=data['description'],
            category=data['category'],
            priority=data.get('priority', 'medium')
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        # Create initial message
        initial_message = SupportMessage(
            ticket_id=ticket.id,
            sender_type='user',
            sender_id=current_user_id or 'anonymous',
            sender_name=data['user_name'],
            content=data['description']
        )
        db.session.add(initial_message)
        db.session.commit()
        
        return jsonify({
            'message': 'Support ticket created successfully',
            'ticket': ticket.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create support ticket', 'details': str(e)}), 500

@support_bp.route('/tickets/my', methods=['GET'])
@jwt_required()
def get_my_tickets():
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        status = request.args.get('status')
        
        query = SupportTicket.query.filter_by(user_id=current_user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        tickets = query.order_by(SupportTicket.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        tickets_data = []
        for ticket in tickets.items:
            ticket_dict = ticket.to_dict()
            
            # Get message count
            ticket_dict['message_count'] = SupportMessage.query.filter_by(
                ticket_id=ticket.id
            ).count()
            
            # Get last message
            last_message = SupportMessage.query.filter_by(
                ticket_id=ticket.id
            ).order_by(SupportMessage.created_at.desc()).first()
            
            if last_message:
                ticket_dict['last_message'] = last_message.to_dict()
            
            tickets_data.append(ticket_dict)
        
        return jsonify({
            'tickets': tickets_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': tickets.total,
                'pages': tickets.pages,
                'has_next': tickets.has_next,
                'has_prev': tickets.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get tickets', 'details': str(e)}), 500

@support_bp.route('/tickets/<ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket_details(ticket_id):
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        user_type = claims.get('type', 'user')
        
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        # Check access permissions
        if user_type == 'user' and ticket.user_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get ticket messages
        messages = SupportMessage.query.filter_by(
            ticket_id=ticket_id
        ).order_by(SupportMessage.created_at.asc()).all()
        
        # Filter internal messages for regular users
        if user_type == 'user':
            messages = [msg for msg in messages if not msg.is_internal]
        
        ticket_data = ticket.to_dict()
        ticket_data['messages'] = [message.to_dict() for message in messages]
        
        return jsonify({'ticket': ticket_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get ticket details', 'details': str(e)}), 500

@support_bp.route('/tickets/<ticket_id>/messages', methods=['POST'])
@jwt_required()
def add_ticket_message(ticket_id):
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        user_type = claims.get('type', 'user')
        
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        # Check access permissions
        if user_type == 'user' and ticket.user_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        if ticket.status == 'closed':
            return jsonify({'error': 'Cannot add message to closed ticket'}), 400
        
        data = request.get_json()
        content = data.get('content')
        is_internal = data.get('is_internal', False)
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        # Only admins can send internal messages
        if is_internal and user_type != 'admin':
            is_internal = False
        
        # Get sender info
        if user_type == 'admin':
            admin = Admin.query.get(current_user_id)
            sender_name = admin.name if admin else 'Admin'
        else:
            user = User.query.get(current_user_id)
            sender_name = user.name if user else ticket.user_name
        
        # Create message
        message = SupportMessage(
            ticket_id=ticket_id,
            sender_type=user_type,
            sender_id=current_user_id,
            sender_name=sender_name,
            content=content,
            is_internal=is_internal
        )
        db.session.add(message)
        
        # Update ticket status
        if user_type == 'user' and ticket.status == 'waiting_user':
            ticket.status = 'in_progress'
        elif user_type == 'admin' and ticket.status == 'open':
            ticket.status = 'in_progress'
        
        ticket.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Message added successfully',
            'message_data': message.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add message', 'details': str(e)}), 500

@support_bp.route('/tickets/<ticket_id>/close', methods=['POST'])
@jwt_required()
def close_ticket(ticket_id):
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        user_type = claims.get('type', 'user')
        
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        # Check access permissions
        if user_type == 'user' and ticket.user_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        if ticket.status == 'closed':
            return jsonify({'error': 'Ticket is already closed'}), 400
        
        # Close the ticket
        ticket.close()
        
        return jsonify({
            'message': 'Ticket closed successfully',
            'ticket': ticket.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to close ticket', 'details': str(e)}), 500

@support_bp.route('/tickets/<ticket_id>/satisfaction', methods=['POST'])
@jwt_required()
def add_satisfaction_rating(ticket_id):
    try:
        current_user_id = get_jwt_identity()
        
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        if ticket.user_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        if ticket.status != 'resolved':
            return jsonify({'error': 'Can only rate resolved tickets'}), 400
        
        data = request.get_json()
        rating = data.get('rating')
        feedback = data.get('feedback')
        
        if not rating or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        ticket.add_satisfaction_rating(rating, feedback)
        
        return jsonify({
            'message': 'Satisfaction rating added successfully',
            'ticket': ticket.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add satisfaction rating', 'details': str(e)}), 500

# FAQ endpoints
@support_bp.route('/faq', methods=['GET'])
def get_faqs():
    try:
        category = request.args.get('category')
        search = request.args.get('search', '').strip()
        featured_only = request.args.get('featured_only', 'false').lower() == 'true'
        
        query = FAQ.query.filter_by(is_published=True)
        
        if category:
            query = query.filter_by(category=category)
        
        if featured_only:
            query = query.filter_by(is_featured=True)
        
        if search:
            query = query.filter(
                or_(
                    FAQ.question.ilike(f'%{search}%'),
                    FAQ.answer.ilike(f'%{search}%')
                )
            )
        
        faqs = query.order_by(FAQ.order_index.asc(), FAQ.created_at.desc()).all()
        
        faqs_data = []
        for faq in faqs:
            faq_dict = faq.to_dict()
            
            # Increment view count
            faq.increment_view()
            
            faqs_data.append(faq_dict)
        
        return jsonify({'faqs': faqs_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get FAQs', 'details': str(e)}), 500

@support_bp.route('/faq/categories', methods=['GET'])
def get_faq_categories():
    try:
        categories = [
            {'value': 'general', 'label': 'Geral'},
            {'value': 'account', 'label': 'Conta'},
            {'value': 'premium', 'label': 'Premium'},
            {'value': 'safety', 'label': 'Segurança'},
            {'value': 'technical', 'label': 'Técnico'}
        ]
        
        return jsonify({'categories': categories}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get FAQ categories', 'details': str(e)}), 500

@support_bp.route('/faq/<faq_id>/vote', methods=['POST'])
@jwt_required(optional=True)
def vote_faq(faq_id):
    try:
        current_user_id = get_jwt_identity()
        
        faq = FAQ.query.get(faq_id)
        if not faq:
            return jsonify({'error': 'FAQ not found'}), 404
        
        data = request.get_json()
        is_helpful = data.get('is_helpful')
        feedback = data.get('feedback')
        
        if is_helpful is None:
            return jsonify({'error': 'is_helpful is required'}), 400
        
        # Check if user already voted
        if current_user_id:
            existing_vote = FAQVote.query.filter_by(
                faq_id=faq_id,
                user_id=current_user_id
            ).first()
            
            if existing_vote:
                return jsonify({'error': 'You have already voted on this FAQ'}), 409
        
        # Create vote
        vote = FAQVote(
            faq_id=faq_id,
            user_id=current_user_id,
            is_helpful=is_helpful,
            feedback=feedback,
            ip_address=request.remote_addr
        )
        db.session.add(vote)
        
        # Update FAQ vote counts
        if is_helpful:
            faq.helpful_votes += 1
        else:
            faq.not_helpful_votes += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Vote recorded successfully',
            'faq': faq.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to vote on FAQ', 'details': str(e)}), 500

# Admin endpoints for support management
@support_bp.route('/admin/tickets', methods=['GET'])
@jwt_required()
@require_admin_support()
def admin_get_tickets():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        status = request.args.get('status')
        category = request.args.get('category')
        priority = request.args.get('priority')
        assigned_to_me = request.args.get('assigned_to_me', 'false').lower() == 'true'
        
        current_admin_id = get_jwt_identity()
        
        query = SupportTicket.query
        
        if status:
            query = query.filter_by(status=status)
        
        if category:
            query = query.filter_by(category=category)
        
        if priority:
            query = query.filter_by(priority=priority)
        
        if assigned_to_me:
            query = query.filter_by(assigned_admin_id=current_admin_id)
        
        tickets = query.order_by(
            SupportTicket.priority.desc(),
            SupportTicket.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        tickets_data = []
        for ticket in tickets.items:
            ticket_dict = ticket.to_dict()
            
            # Get unread message count for admin
            unread_count = SupportMessage.query.filter_by(
                ticket_id=ticket.id,
                sender_type='user'
            ).filter(
                SupportMessage.created_at > ticket.updated_at
            ).count()
            
            ticket_dict['unread_messages'] = unread_count
            
            tickets_data.append(ticket_dict)
        
        return jsonify({
            'tickets': tickets_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': tickets.total,
                'pages': tickets.pages,
                'has_next': tickets.has_next,
                'has_prev': tickets.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get tickets', 'details': str(e)}), 500

@support_bp.route('/admin/tickets/<ticket_id>/assign', methods=['POST'])
@jwt_required()
@require_admin_support()
def admin_assign_ticket(ticket_id):
    try:
        current_admin_id = get_jwt_identity()
        
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        data = request.get_json()
        admin_id = data.get('admin_id', current_admin_id)
        
        # Verify admin exists
        admin = Admin.query.get(admin_id)
        if not admin:
            return jsonify({'error': 'Admin not found'}), 404
        
        ticket.assign_to_admin(admin_id)
        
        return jsonify({
            'message': 'Ticket assigned successfully',
            'ticket': ticket.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to assign ticket', 'details': str(e)}), 500

@support_bp.route('/admin/tickets/<ticket_id>/resolve', methods=['POST'])
@jwt_required()
@require_admin_support()
def admin_resolve_ticket(ticket_id):
    try:
        current_admin_id = get_jwt_identity()
        
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        data = request.get_json()
        resolution = data.get('resolution')
        
        if not resolution:
            return jsonify({'error': 'Resolution is required'}), 400
        
        ticket.resolve(resolution, current_admin_id)
        
        return jsonify({
            'message': 'Ticket resolved successfully',
            'ticket': ticket.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to resolve ticket', 'details': str(e)}), 500

@support_bp.route('/admin/faq', methods=['GET'])
@jwt_required()
@require_admin_support()
def admin_get_faqs():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        category = request.args.get('category')
        
        query = FAQ.query
        
        if category:
            query = query.filter_by(category=category)
        
        faqs = query.order_by(FAQ.order_index.asc(), FAQ.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        faqs_data = [faq.to_dict() for faq in faqs.items]
        
        return jsonify({
            'faqs': faqs_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': faqs.total,
                'pages': faqs.pages,
                'has_next': faqs.has_next,
                'has_prev': faqs.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get FAQs', 'details': str(e)}), 500

@support_bp.route('/admin/faq', methods=['POST'])
@jwt_required()
@require_admin_support()
def admin_create_faq():
    try:
        data = request.get_json()
        
        required_fields = ['question', 'answer', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        faq = FAQ(
            question=data['question'],
            answer=data['answer'],
            category=data['category'],
            order_index=data.get('order_index', 0),
            is_published=data.get('is_published', True),
            is_featured=data.get('is_featured', False)
        )
        
        if data.get('tags'):
            faq.set_tags(data['tags'])
        
        db.session.add(faq)
        db.session.commit()
        
        return jsonify({
            'message': 'FAQ created successfully',
            'faq': faq.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create FAQ', 'details': str(e)}), 500

@support_bp.route('/admin/faq/<faq_id>', methods=['PUT'])
@jwt_required()
@require_admin_support()
def admin_update_faq(faq_id):
    try:
        faq = FAQ.query.get(faq_id)
        if not faq:
            return jsonify({'error': 'FAQ not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        allowed_fields = ['question', 'answer', 'category', 'order_index', 'is_published', 'is_featured']
        for field in allowed_fields:
            if field in data:
                setattr(faq, field, data[field])
        
        if 'tags' in data:
            faq.set_tags(data['tags'])
        
        faq.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'FAQ updated successfully',
            'faq': faq.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update FAQ', 'details': str(e)}), 500

@support_bp.route('/admin/faq/<faq_id>', methods=['DELETE'])
@jwt_required()
@require_admin_support()
def admin_delete_faq(faq_id):
    try:
        faq = FAQ.query.get(faq_id)
        if not faq:
            return jsonify({'error': 'FAQ not found'}), 404
        
        db.session.delete(faq)
        db.session.commit()
        
        return jsonify({'message': 'FAQ deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete FAQ', 'details': str(e)}), 500

@support_bp.route('/contact', methods=['POST'])
def contact_form():
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create a support ticket for contact form submissions
        ticket = SupportTicket(
            user_email=data['email'],
            user_name=data['name'],
            subject=data['subject'],
            description=data['message'],
            category='general',
            priority='medium'
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        return jsonify({
            'message': 'Your message has been sent successfully. We will get back to you soon.',
            'ticket_number': ticket.ticket_number
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to send message', 'details': str(e)}), 500

