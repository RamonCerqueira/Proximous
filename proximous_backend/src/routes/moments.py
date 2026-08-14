from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import db, User, Message, Match, record_empathy_points
from src.models.moment import Moment, MomentLike

moments_bp = Blueprint('moments', __name__)

@moments_bp.route('', methods=['GET'], strict_slashes=False)
@moments_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_moments():
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        # Query moments sorted by creation date
        query = Moment.query.order_by(Moment.created_at.desc())
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        moments_data = [m.to_dict(current_user_id=current_user_id) for m in paginated.items]
        
        return jsonify({
            'moments': moments_data,
            'total': paginated.total,
            'page': page,
            'pages': paginated.pages
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch moments', 'details': str(e)}), 500


@moments_bp.route('', methods=['POST'], strict_slashes=False)
@moments_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_moment():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json() or {}
        content = data.get('content')
        photo_url = data.get('photo_url')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
            
        moment = Moment(
            user_id=current_user_id,
            content=content,
            photo_url=photo_url
        )
        
        # Award empathy points for sharing a moment
        record_empathy_points(current_user_id, 15, 'moments', 'Publicou um Momento no feed')
        
        db.session.add(moment)
        db.session.commit()
        
        return jsonify({
            'message': 'Moment created successfully',
            'moment': moment.to_dict(current_user_id=current_user_id)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create moment', 'details': str(e)}), 500


@moments_bp.route('/<moment_id>/like', methods=['POST'], strict_slashes=False)
@jwt_required()
def toggle_like_moment(moment_id):
    try:
        current_user_id = get_jwt_identity()
        moment = Moment.query.get(moment_id)
        if not moment:
            return jsonify({'error': 'Moment not found'}), 404
            
        existing_like = MomentLike.query.filter_by(
            moment_id=moment_id,
            user_id=current_user_id
        ).first()
        
        if existing_like:
            db.session.delete(existing_like)
            moment.likes_count = max(0, (moment.likes_count or 1) - 1)
            liked = False
        else:
            new_like = MomentLike(moment_id=moment_id, user_id=current_user_id)
            db.session.add(new_like)
            moment.likes_count = (moment.likes_count or 0) + 1
            liked = True
            
        db.session.commit()
        return jsonify({
            'liked_by_me': liked,
            'likes_count': moment.likes_count
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to toggle like', 'details': str(e)}), 500


@moments_bp.route('/<moment_id>/icebreaker', methods=['POST'], strict_slashes=False)
@jwt_required()
def send_moment_icebreaker(moment_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        moment = Moment.query.get(moment_id)
        if not moment:
            return jsonify({'error': 'Moment not found'}), 404
            
        receiver_id = moment.user_id
        if receiver_id == current_user_id:
            return jsonify({'error': 'Cannot send icebreaker to your own moment'}), 400
            
        data = request.get_json()
        custom_text = data.get('text', 'Adorei seu momento!')
        
        # Ensure a Match / Conversation exists between the two users
        match = Match.query.filter(
            ((Match.user1_id == current_user_id) & (Match.user2_id == receiver_id)) |
            ((Match.user1_id == receiver_id) & (Match.user2_id == current_user_id))
        ).first()
        
        if not match:
            match = Match(
                user1_id=current_user_id,
                user2_id=receiver_id,
                is_active=True
            )
            db.session.add(match)
            db.session.flush()

        # Format full icebreaker content with moment quote context
        formatted_content = f"💬 [Momento: \"{moment.content[:60]}...\"] {custom_text}"
        
        # Create real SQL Message
        message = Message(
            sender_id=current_user_id,
            receiver_id=receiver_id,
            match_id=match.id,
            content=formatted_content,
            message_type='icebreaker'
        )
        db.session.add(message)
        
        # Award Empathy Points for initiating conversation
        record_empathy_points(current_user_id, 20, 'icebreaker', 'Enviou um Icebreaker em um Momento')
        db.session.commit()
        
        return jsonify({
            'message': 'Icebreaker sent successfully',
            'conversation_id': receiver_id,
            'match_id': match.id,
            'sent_message': message.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to send icebreaker', 'details': str(e)}), 500
