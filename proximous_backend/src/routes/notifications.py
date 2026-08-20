from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, Notification
from datetime import datetime

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    
    # Query real notifications from database
    notifications = Notification.query.filter_by(user_id=current_user_id)\
        .order_by(Notification.created_at.desc()).limit(30).all()
        
    unread_count = Notification.query.filter_by(user_id=current_user_id, is_read=False).count()
    
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200

@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    current_user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=current_user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'Todas as notificações foram marcadas como lidas', 'unread_count': 0}), 200

@notifications_bp.route('/<notification_id>/read', methods=['POST'])
@jwt_required()
def mark_single_read(notification_id):
    current_user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()
    if notification:
        notification.is_read = True
        db.session.commit()
    
    unread_count = Notification.query.filter_by(user_id=current_user_id, is_read=False).count()
    return jsonify({'message': 'Notificação lida', 'unread_count': unread_count}), 200


def create_notification(user_id, title, message, notif_type='system', actor_id=None):
    """Helper utility to persist real notifications into the database and emit via Socket.IO"""
    try:
        notif = Notification(
            user_id=user_id,
            actor_id=actor_id,
            title=title,
            message=message,
            type=notif_type,
            is_read=False
        )
        db.session.add(notif)
        db.session.commit()

        # Emit real-time notification via Socket.IO
        try:
            from src.main import socketio
            if socketio:
                socketio.emit(
                    'notification_received',
                    notif.to_dict(),
                    to=f"user_{user_id}"
                )
        except Exception as se:
            print(f"Socket notification emit notice: {se}")

        return notif
    except Exception as e:
        db.session.rollback()
        print(f"Error creating notification: {e}")
        return None
