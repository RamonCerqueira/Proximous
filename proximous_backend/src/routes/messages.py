from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import or_, and_

from src.models.user import db, User, Message, Match, Achievement, UserAchievement, record_empathy_points

messages_bp = Blueprint('messages', __name__)

def check_and_award_achievement(user_id, achievement_name):
    """Check if user should receive an achievement and award it"""
    try:
        achievement = Achievement.query.filter_by(name=achievement_name).first()
        if not achievement:
            return
        
        existing = UserAchievement.query.filter_by(
            user_id=user_id,
            achievement_id=achievement.id
        ).first()
        
        if existing:
            return
        
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement.id
        )
        db.session.add(user_achievement)
        
        record_empathy_points(user_id, 10, 'achievement', f"Conquistou '{achievement.name}'")
        
        db.session.commit()
        return achievement
        
    except Exception as e:
        print(f"Error awarding achievement: {e}")
        return None

@messages_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        receiver_id = data.get('receiver_id')
        content = data.get('content')
        message_type = data.get('message_type', 'text')
        match_id = data.get('match_id')
        
        if not receiver_id or not content:
            return jsonify({'error': 'receiver_id and content are required'}), 400
        
        if receiver_id == current_user_id:
            return jsonify({'error': 'Cannot send message to yourself'}), 400
        
        # Check if user has at least 2 photos
        if not current_user.has_required_photos():
            return jsonify({
                'error': 'Você precisa ter pelo menos 2 fotos no seu perfil para enviar mensagens.',
                'code': 'PROFILE_PHOTOS_REQUIRED'
            }), 403
        
        # Check if receiver exists and is active
        receiver = User.query.get(receiver_id)
        if not receiver or not receiver.is_active:
            return jsonify({'error': 'Receiver not found or not available'}), 404
        
        # Check if user can send messages (daily limit for free users)
        if not current_user.can_send_message():
            return jsonify({
                'error': 'Daily message limit reached',
                'message': 'Upgrade to Premium for unlimited messages'
            }), 429
        
        # Verify match exists if match_id is provided
        if match_id:
            match = Match.query.filter(
                Match.id == match_id,
                or_(
                    and_(Match.user1_id == current_user_id, Match.user2_id == receiver_id),
                    and_(Match.user1_id == receiver_id, Match.user2_id == current_user_id)
                ),
                Match.is_active == True
            ).first()
            
            if not match:
                return jsonify({'error': 'Match not found or not active'}), 404
        else:
            # Find existing match
            match = Match.query.filter(
                or_(
                    and_(Match.user1_id == current_user_id, Match.user2_id == receiver_id),
                    and_(Match.user1_id == receiver_id, Match.user2_id == current_user_id)
                ),
                Match.is_active == True
            ).first()
        
        # Create the message
        message = Message(
            sender_id=current_user_id,
            receiver_id=receiver_id,
            match_id=match.id if match else None,
            content=content.strip(),
            message_type=message_type
        )
        db.session.add(message)
        
        # Use daily message
        current_user.use_daily_message()
        
        db.session.commit()
        
        # Dispatch Push Notification to Receiver
        from src.utils.push_notifications import send_expo_push_notification
        send_expo_push_notification(
            receiver_id,
            f"Nova mensagem de {current_user.name}",
            content.strip()[:100],
            {"type": "message", "match_id": match.id if match else None, "sender_id": current_user_id}
        )

        # Emit WebSocket event to room if match exists
        if match:
            try:
                from src.main import socketio
                if socketio:
                    socketio.emit(
                        'new_message_received',
                        message.to_dict(),
                        to=f"match_{match.id}"
                    )
            except Exception as se:
                print(f"SocketIO broadcast notice: {se}")
        
        # Award achievements
        message_count = Message.query.filter_by(sender_id=current_user_id).count()
        if message_count >= 5:
            check_and_award_achievement(current_user_id, 'Construtor de Pontes')
        
        # Check for response achievement
        response_count = Message.query.filter_by(
            sender_id=current_user_id,
            receiver_id=receiver_id
        ).count()
        
        # If this is a response to a message
        previous_message = Message.query.filter_by(
            sender_id=receiver_id,
            receiver_id=current_user_id
        ).first()
        
        if previous_message:
            total_responses = Message.query.filter(
                Message.sender_id == current_user_id,
                Message.receiver_id.in_(
                    db.session.query(Message.sender_id).filter(
                        Message.receiver_id == current_user_id
                    ).distinct()
                )
            ).count()
            
            if total_responses >= 10:
                check_and_award_achievement(current_user_id, 'Ouvinte Atento')
        
        return jsonify({
            'message': 'Message sent successfully',
            'message_data': message.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to send message', 'details': str(e)}), 500

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        # Get all distinct partner user IDs from sent or received messages
        sent_user_ids = [m[0] for m in db.session.query(Message.receiver_id).filter(Message.sender_id == current_user_id).distinct().all()]
        received_user_ids = [m[0] for m in db.session.query(Message.sender_id).filter(Message.receiver_id == current_user_id).distinct().all()]
        all_partner_ids = set(sent_user_ids + received_user_ids)
        
        # Also include matches user might have even if no message sent yet
        matches = Match.query.filter(
            or_(Match.user1_id == current_user_id, Match.user2_id == current_user_id),
            Match.is_active == True
        ).all()
        for m in matches:
            other_id = m.user2_id if m.user1_id == current_user_id else m.user1_id
            all_partner_ids.add(other_id)

        conversations_data = []
        for other_id in all_partner_ids:
            other_user = User.query.get(other_id)
            if not other_user or not other_user.is_active:
                continue
                
            last_message = Message.query.filter(
                or_(
                    and_(Message.sender_id == current_user_id, Message.receiver_id == other_id),
                    and_(Message.sender_id == other_id, Message.receiver_id == current_user_id)
                )
            ).order_by(Message.created_at.desc()).first()
            
            unread_count = Message.query.filter_by(
                sender_id=other_id,
                receiver_id=current_user_id,
                is_read=False
            ).count()
            
            match = Match.query.filter(
                or_(
                    and_(Match.user1_id == current_user_id, Match.user2_id == other_id),
                    and_(Match.user1_id == other_id, Match.user2_id == current_user_id)
                ),
                Match.is_active == True
            ).first()
            
            conversations_data.append({
                'other_user': other_user.to_dict(),
                'last_message': last_message.to_dict() if last_message else None,
                'unread_count': unread_count,
                'match_id': match.id if match else None,
                'is_match': match is not None,
                'last_activity': last_message.created_at if last_message else (match.created_at if match else datetime.min)
            })
            
        # Sort conversations by last_activity descending
        conversations_data.sort(key=lambda x: x['last_activity'], reverse=True)
        for c in conversations_data:
            c.pop('last_activity', None)
        
        total = len(conversations_data)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_data = conversations_data[start:end]
        
        return jsonify({
            'conversations': paginated_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page if total > 0 else 1,
                'has_next': end < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get conversations', 'details': str(e)}), 500

@messages_bp.route('/conversation/<other_user_id>', methods=['GET'])
@jwt_required()
def get_conversation_messages(other_user_id):
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        if other_user_id == current_user_id:
            return jsonify({'error': 'Cannot get conversation with yourself'}), 400
        
        # Verify other user exists
        other_user = User.query.get(other_user_id)
        if not other_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get messages between the two users
        messages_query = Message.query.filter(
            or_(
                and_(Message.sender_id == current_user_id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == current_user_id)
            ),
            Message.expires_at > datetime.utcnow()  # Only non-expired messages
        ).order_by(Message.created_at.desc())
        
        messages = messages_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Mark messages from other user as read
        unread_messages = Message.query.filter_by(
            sender_id=other_user_id,
            receiver_id=current_user_id,
            is_read=False
        ).all()
        
        for message in unread_messages:
            message.is_read = True
        
        db.session.commit()
        
        # Convert messages to dict (reverse order for chronological display)
        messages_data = [message.to_dict() for message in reversed(messages.items)]
        
        # Get match information
        match = Match.query.filter(
            or_(
                and_(Match.user1_id == current_user_id, Match.user2_id == other_user_id),
                and_(Match.user1_id == other_user_id, Match.user2_id == current_user_id)
            ),
            Match.is_active == True
        ).first()
        
        return jsonify({
            'messages': messages_data,
            'other_user': other_user.to_dict(),
            'match_id': match.id if match else None,
            'is_match': match is not None,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': messages.total,
                'pages': messages.pages,
                'has_next': messages.has_next,
                'has_prev': messages.has_prev
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to get conversation', 'details': str(e)}), 500

@messages_bp.route('/<message_id>/read', methods=['POST'])
@jwt_required()
def mark_message_read(message_id):
    try:
        current_user_id = get_jwt_identity()
        
        message = Message.query.filter_by(
            id=message_id,
            receiver_id=current_user_id
        ).first()
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        message.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Message marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to mark message as read', 'details': str(e)}), 500

@messages_bp.route('/mark-all-read/<other_user_id>', methods=['POST'])
@jwt_required()
def mark_all_messages_read(other_user_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Mark all unread messages from other user as read
        unread_messages = Message.query.filter_by(
            sender_id=other_user_id,
            receiver_id=current_user_id,
            is_read=False
        ).all()
        
        for message in unread_messages:
            message.is_read = True
        
        db.session.commit()
        
        return jsonify({
            'message': f'Marked {len(unread_messages)} messages as read'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to mark messages as read', 'details': str(e)}), 500

@messages_bp.route('/<message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    try:
        current_user_id = get_jwt_identity()
        
        message = Message.query.filter_by(
            id=message_id,
            sender_id=current_user_id
        ).first()
        
        if not message:
            return jsonify({'error': 'Message not found or not authorized'}), 404
        
        # Check if message is recent enough to delete (e.g., within 5 minutes)
        time_limit = datetime.utcnow() - timedelta(minutes=5)
        if message.created_at < time_limit:
            return jsonify({'error': 'Message too old to delete'}), 400
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Message deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete message', 'details': str(e)}), 500

@messages_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    try:
        current_user_id = get_jwt_identity()
        
        unread_count = Message.query.filter_by(
            receiver_id=current_user_id,
            is_read=False
        ).count()
        
        return jsonify({'unread_count': unread_count}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get unread count', 'details': str(e)}), 500

@messages_bp.route('/search', methods=['GET'])
@jwt_required()
def search_messages():
    try:
        current_user_id = get_jwt_identity()
        query = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        if len(query) < 3:
            return jsonify({'error': 'Search query must be at least 3 characters'}), 400
        
        # Search in messages where user is sender or receiver
        messages_query = Message.query.filter(
            or_(
                Message.sender_id == current_user_id,
                Message.receiver_id == current_user_id
            ),
            Message.content.ilike(f'%{query}%'),
            Message.expires_at > datetime.utcnow()
        ).order_by(Message.created_at.desc())
        
        messages = messages_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Add context for each message (other user info)
        messages_data = []
        for message in messages.items:
            message_dict = message.to_dict()
            
            # Get other user info
            other_user_id = message.receiver_id if message.sender_id == current_user_id else message.sender_id
            other_user = User.query.get(other_user_id)
            
            if other_user:
                message_dict['other_user'] = other_user.to_dict()
            
            messages_data.append(message_dict)
        
        return jsonify({
            'messages': messages_data,
            'search_query': query,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': messages.total,
                'pages': messages.pages,
                'has_next': messages.has_next,
                'has_prev': messages.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to search messages', 'details': str(e)}), 500

@messages_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_message_stats():
    try:
        current_user_id = get_jwt_identity()
        
        # Calculate message statistics
        messages_sent = Message.query.filter_by(sender_id=current_user_id).count()
        messages_received = Message.query.filter_by(receiver_id=current_user_id).count()
        
        # Count unique conversations
        sent_conversations = db.session.query(Message.receiver_id).filter_by(
            sender_id=current_user_id
        ).distinct().count()
        
        received_conversations = db.session.query(Message.sender_id).filter_by(
            receiver_id=current_user_id
        ).distinct().count()
        
        # Count unique conversations in a cross-database compatible way
        conv_col1 = db.case((Message.sender_id < Message.receiver_id, Message.sender_id), else_=Message.receiver_id)
        conv_col2 = db.case((Message.sender_id > Message.receiver_id, Message.sender_id), else_=Message.receiver_id)
        total_conversations = db.session.query(conv_col1, conv_col2).filter(
            or_(
                Message.sender_id == current_user_id,
                Message.receiver_id == current_user_id
            )
        ).distinct().count()
        
        # Calculate average response time (in minutes)
        # This is a simplified calculation
        avg_response_time = None
        
        # Count unread messages
        unread_messages = Message.query.filter_by(
            receiver_id=current_user_id,
            is_read=False
        ).count()
        
        stats = {
            'messages_sent': messages_sent,
            'messages_received': messages_received,
            'total_conversations': total_conversations,
            'unread_messages': unread_messages,
            'average_response_time_minutes': avg_response_time
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get message stats', 'details': str(e)}), 500

@messages_bp.route('/cleanup-expired', methods=['POST'])
@jwt_required()
def cleanup_expired_messages():
    try:
        # This endpoint can be called periodically to clean up expired messages
        # In production, this should be a background job
        
        expired_messages = Message.query.filter(
            Message.expires_at <= datetime.utcnow()
        ).all()
        
        count = len(expired_messages)
        
        for message in expired_messages:
            db.session.delete(message)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Cleaned up {count} expired messages'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to cleanup expired messages', 'details': str(e)}), 500

