from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
from sqlalchemy import and_, or_, func

from src.models.user import db, User, Like, Match, Message
from src.models.admin import Admin, AdminAction, SupportTicket, SupportMessage, FAQ, FAQVote, SystemSetting
from src.models.subscription import Subscription, Payment
from src.models.advertising import Advertiser, AdCampaign

admin_bp = Blueprint('admin', __name__)

def require_admin_role():
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

def require_admin_permission(permission):
    """Decorator to require specific admin permission"""
    def decorator(f):
        def wrapper(*args, **kwargs):
            current_admin_id = get_jwt_identity()
            admin = Admin.query.get(current_admin_id)
            
            if not admin or not admin.has_permission(permission):
                return jsonify({'error': f'Permission {permission} required'}), 403
            
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
@require_admin_role()
def get_admin_settings():
    try:
        free_premium_days = SystemSetting.get_int('global_free_premium_days', 120)
        global_free_premium_enabled = SystemSetting.get_bool('global_free_premium_enabled', True)
        
        settings = {
            'app_version': SystemSetting.get_setting('app_version', '1.0.0'),
            'maintenance_mode': SystemSetting.get_bool('maintenance_mode', False),
            'registration_enabled': SystemSetting.get_bool('registration_enabled', True),
            'premium_features_enabled': SystemSetting.get_bool('premium_features_enabled', True),
            'advertising_enabled': SystemSetting.get_bool('advertising_enabled', True),
            'max_daily_likes_free': SystemSetting.get_int('max_daily_likes_free', 10),
            'max_daily_messages_free': SystemSetting.get_int('max_daily_messages_free', 10),
            'message_expiry_days': SystemSetting.get_int('message_expiry_days', 30),
            'global_free_premium_days': free_premium_days,
            'global_free_premium_enabled': global_free_premium_enabled
        }
        
        return jsonify({'settings': settings}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get settings', 'details': str(e)}), 500

@admin_bp.route('/settings', methods=['PUT'])
@jwt_required()
@require_admin_role()
def update_admin_settings():
    try:
        data = request.get_json() or {}
        current_admin_id = get_jwt_identity()
        
        # Save settings if provided
        if 'global_free_premium_days' in data:
            val = int(data['global_free_premium_days'])
            if val < 0:
                return jsonify({'error': 'Os dias de premium devem ser maiores ou iguais a 0'}), 400
            SystemSetting.set_setting('global_free_premium_days', val, 'Período de Premium gratuito para todos os usuários (dias)')

        if 'global_free_premium_enabled' in data:
            SystemSetting.set_setting('global_free_premium_enabled', bool(data['global_free_premium_enabled']), 'Ativar ou desativar Premium gratuito global')

        if 'maintenance_mode' in data:
            SystemSetting.set_setting('maintenance_mode', bool(data['maintenance_mode']))

        if 'registration_enabled' in data:
            SystemSetting.set_setting('registration_enabled', bool(data['registration_enabled']))

        if 'max_daily_likes_free' in data:
            SystemSetting.set_setting('max_daily_likes_free', int(data['max_daily_likes_free']))

        if 'max_daily_messages_free' in data:
            SystemSetting.set_setting('max_daily_messages_free', int(data['max_daily_messages_free']))

        # Log the settings change
        action = AdminAction(
            admin_id=current_admin_id,
            action_type='settings_update',
            target_type='system',
            target_id='settings',
            description='Updated system settings',
            details=str(data)
        )
        db.session.add(action)
        db.session.commit()

        # Fetch updated settings
        free_premium_days = SystemSetting.get_int('global_free_premium_days', 120)
        global_free_premium_enabled = SystemSetting.get_bool('global_free_premium_enabled', True)

        updated_settings = {
            'app_version': SystemSetting.get_setting('app_version', '1.0.0'),
            'maintenance_mode': SystemSetting.get_bool('maintenance_mode', False),
            'registration_enabled': SystemSetting.get_bool('registration_enabled', True),
            'premium_features_enabled': SystemSetting.get_bool('premium_features_enabled', True),
            'advertising_enabled': SystemSetting.get_bool('advertising_enabled', True),
            'max_daily_likes_free': SystemSetting.get_int('max_daily_likes_free', 10),
            'max_daily_messages_free': SystemSetting.get_int('max_daily_messages_free', 10),
            'message_expiry_days': SystemSetting.get_int('message_expiry_days', 30),
            'global_free_premium_days': free_premium_days,
            'global_free_premium_enabled': global_free_premium_enabled
        }
        
        return jsonify({
            'message': 'Configurações atualizadas com sucesso',
            'settings': updated_settings
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update settings', 'details': str(e)}), 500

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@require_admin_role()
def get_dashboard_stats():
    try:
        # Calculate dashboard statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        premium_users = User.query.filter(User.is_premium == True).count()
        
        # Users registered in last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_users = User.query.filter(User.created_at >= thirty_days_ago).count()
        
        # Matches and messages stats
        total_matches = Match.query.filter_by(is_active=True).count()
        total_messages = Message.query.count()
        
        # Revenue stats
        total_revenue = db.session.query(func.sum(Payment.amount)).filter_by(status='completed').scalar() or 0
        monthly_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.status == 'completed',
            Payment.created_at >= thirty_days_ago
        ).scalar() or 0
        
        # Support tickets
        open_tickets = SupportTicket.query.filter(
            SupportTicket.status.in_(['open', 'in_progress'])
        ).count()
        
        # Advertising stats
        active_campaigns = AdCampaign.query.filter_by(status='active').count()
        pending_campaigns = AdCampaign.query.filter_by(status='pending_review').count()
        
        stats = {
            'users': {
                'total': total_users,
                'active': active_users,
                'premium': premium_users,
                'new_this_month': new_users,
                'premium_rate': round((premium_users / total_users * 100), 2) if total_users > 0 else 0
            },
            'engagement': {
                'total_matches': total_matches,
                'total_messages': total_messages,
                'avg_matches_per_user': round(total_matches / active_users, 2) if active_users > 0 else 0
            },
            'revenue': {
                'total': total_revenue,
                'monthly': monthly_revenue,
                'currency': 'BRL'
            },
            'support': {
                'open_tickets': open_tickets
            },
            'advertising': {
                'active_campaigns': active_campaigns,
                'pending_campaigns': pending_campaigns
            }
        }
        
        return jsonify({'dashboard_stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get dashboard stats', 'details': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@require_admin_role()
@require_admin_permission('user_management')
def get_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        search = request.args.get('search', '').strip()
        status = request.args.get('status')
        is_premium = request.args.get('is_premium')
        
        query = User.query
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    User.name.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        if status == 'active':
            query = query.filter_by(is_active=True)
        elif status == 'inactive':
            query = query.filter_by(is_active=False)
        
        if is_premium == 'true':
            query = query.filter_by(is_premium=True)
        elif is_premium == 'false':
            query = query.filter_by(is_premium=False)
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        users_data = []
        for user in users.items:
            user_dict = user.to_dict(include_private=True)
            
            # Add additional admin info
            user_dict['total_likes_sent'] = Like.query.filter_by(sender_id=user.id).count()
            user_dict['total_likes_received'] = Like.query.filter_by(receiver_id=user.id).count()
            user_dict['total_messages'] = Message.query.filter_by(sender_id=user.id).count()
            user_dict['total_matches'] = Match.query.filter(
                or_(Match.user1_id == user.id, Match.user2_id == user.id),
                Match.is_active == True
            ).count()
            
            users_data.append(user_dict)
        
        return jsonify({
            'users': users_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get users', 'details': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['GET'])
@jwt_required()
@require_admin_role()
@require_admin_permission('user_management')
def get_user_details(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = user.to_dict(include_private=True)
        
        # Add detailed statistics
        user_data['stats'] = {
            'likes_sent': Like.query.filter_by(sender_id=user_id).count(),
            'likes_received': Like.query.filter_by(receiver_id=user_id).count(),
            'messages_sent': Message.query.filter_by(sender_id=user_id).count(),
            'messages_received': Message.query.filter_by(receiver_id=user_id).count(),
            'matches': Match.query.filter(
                or_(Match.user1_id == user_id, Match.user2_id == user_id),
                Match.is_active == True
            ).count(),
            'days_since_last_seen': (datetime.utcnow() - user.last_seen).days if user.last_seen else None
        }
        
        # Get subscription info
        subscription = Subscription.query.filter_by(
            user_id=user_id,
            status='active'
        ).first()
        
        if subscription:
            user_data['subscription'] = subscription.to_dict()
        
        # Get recent admin actions on this user
        recent_actions = AdminAction.query.filter_by(
            target_type='user',
            target_id=user_id
        ).order_by(AdminAction.created_at.desc()).limit(10).all()
        
        user_data['recent_admin_actions'] = [action.to_dict() for action in recent_actions]
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user details', 'details': str(e)}), 500

@admin_bp.route('/users/<user_id>/ban', methods=['POST'])
@jwt_required()
@require_admin_role()
@require_admin_permission('user_moderation')
def ban_user(user_id):
    try:
        current_admin_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        reason = data.get('reason', 'Banned by admin')
        duration_days = data.get('duration_days')  # None for permanent ban
        
        # Ban the user
        user.is_active = False
        user.is_visible = False
        
        if duration_days:
            user.ban_expires_at = datetime.utcnow() + timedelta(days=duration_days)
        
        # Log admin action
        action = AdminAction(
            admin_id=current_admin_id,
            action_type='user_ban',
            target_type='user',
            target_id=user_id,
            description=f'Banned user {user.name}',
            reason=reason
        )
        db.session.add(action)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User banned successfully',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to ban user', 'details': str(e)}), 500

@admin_bp.route('/users/<user_id>/unban', methods=['POST'])
@jwt_required()
@require_admin_role()
@require_admin_permission('user_moderation')
def unban_user(user_id):
    try:
        current_admin_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Unban the user
        user.is_active = True
        user.is_visible = True
        user.ban_expires_at = None
        
        # Log admin action
        action = AdminAction(
            admin_id=current_admin_id,
            action_type='user_unban',
            target_type='user',
            target_id=user_id,
            description=f'Unbanned user {user.name}'
        )
        db.session.add(action)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User unbanned successfully',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to unban user', 'details': str(e)}), 500

@admin_bp.route('/messages/<message_id>/remove', methods=['POST'])
@jwt_required()
@require_admin_role()
@require_admin_permission('content_moderation')
def remove_message(message_id):
    try:
        current_admin_id = get_jwt_identity()
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        data = request.get_json()
        reason = data.get('reason', 'Removed by admin')
        
        # Remove the message
        db.session.delete(message)
        
        # Log admin action
        action = AdminAction(
            admin_id=current_admin_id,
            action_type='content_remove',
            target_type='message',
            target_id=message_id,
            description=f'Removed message from user {message.sender_id}',
            reason=reason
        )
        db.session.add(action)
        
        db.session.commit()
        
        return jsonify({'message': 'Message removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to remove message', 'details': str(e)}), 500

@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
@require_admin_role()
@require_admin_permission('content_moderation')
def get_reports():
    try:
        # This would get user reports/flags
        # For now, return empty as we haven't implemented reporting system
        return jsonify({'reports': []}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get reports', 'details': str(e)}), 500

@admin_bp.route('/analytics/users', methods=['GET'])
@jwt_required()
@require_admin_role()
@require_admin_permission('analytics')
def get_user_analytics():
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Daily user registrations
        daily_registrations = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at >= start_date
        ).group_by(
            func.date(User.created_at)
        ).all()
        
        # Daily active users (users who sent messages or likes)
        daily_active = db.session.query(
            func.date(User.last_seen).label('date'),
            func.count(User.id).label('count')
        ).filter(
            User.last_seen >= start_date,
            User.is_active == True
        ).group_by(
            func.date(User.last_seen)
        ).all()
        
        # User retention (simplified)
        retention_data = []
        for i in range(1, 8):  # 1-7 days
            retention_date = datetime.utcnow() - timedelta(days=i)
            registered_users = User.query.filter(
                func.date(User.created_at) == retention_date.date()
            ).count()
            
            active_users = User.query.filter(
                func.date(User.created_at) == retention_date.date(),
                User.last_seen >= datetime.utcnow() - timedelta(hours=24)
            ).count()
            
            retention_rate = (active_users / registered_users * 100) if registered_users > 0 else 0
            
            retention_data.append({
                'day': i,
                'retention_rate': round(retention_rate, 2)
            })
        
        analytics = {
            'daily_registrations': [
                {'date': str(item.date), 'count': item.count}
                for item in daily_registrations
            ],
            'daily_active_users': [
                {'date': str(item.date), 'count': item.count}
                for item in daily_active
            ],
            'retention_rates': retention_data
        }
        
        return jsonify({'analytics': analytics}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user analytics', 'details': str(e)}), 500

@admin_bp.route('/analytics/revenue', methods=['GET'])
@jwt_required()
@require_admin_role()
@require_admin_permission('analytics')
def get_revenue_analytics():
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Daily revenue
        daily_revenue = db.session.query(
            func.date(Payment.created_at).label('date'),
            func.sum(Payment.amount).label('revenue')
        ).filter(
            Payment.created_at >= start_date,
            Payment.status == 'completed'
        ).group_by(
            func.date(Payment.created_at)
        ).all()
        
        # Revenue by subscription type
        revenue_by_plan = db.session.query(
            Subscription.plan_type,
            func.sum(Payment.amount).label('revenue'),
            func.count(Payment.id).label('count')
        ).join(Payment).filter(
            Payment.created_at >= start_date,
            Payment.status == 'completed'
        ).group_by(Subscription.plan_type).all()
        
        analytics = {
            'daily_revenue': [
                {'date': str(item.date), 'revenue': float(item.revenue)}
                for item in daily_revenue
            ],
            'revenue_by_plan': [
                {
                    'plan_type': item.plan_type,
                    'revenue': float(item.revenue),
                    'subscriptions': item.count
                }
                for item in revenue_by_plan
            ]
        }
        
        return jsonify({'analytics': analytics}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get revenue analytics', 'details': str(e)}), 500

@admin_bp.route('/admins', methods=['GET'])
@jwt_required()
@require_admin_role()
@require_admin_permission('admin_management')
def get_admins():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        admins = Admin.query.order_by(Admin.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        admins_data = [admin.to_dict() for admin in admins.items]
        
        return jsonify({
            'admins': admins_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': admins.total,
                'pages': admins.pages,
                'has_next': admins.has_next,
                'has_prev': admins.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get admins', 'details': str(e)}), 500

@admin_bp.route('/admins', methods=['POST'])
@jwt_required()
@require_admin_role()
@require_admin_permission('admin_management')
def create_admin():
    try:
        data = request.get_json()
        
        required_fields = ['email', 'name', 'role', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if admin already exists
        existing = Admin.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'error': 'Admin with this email already exists'}), 409
        
        # Create admin
        admin = Admin(
            email=data['email'],
            name=data['name'],
            role=data['role']
        )
        admin.set_password(data['password'])
        
        if data.get('permissions'):
            admin.set_permissions(data['permissions'])
        
        db.session.add(admin)
        db.session.commit()
        
        return jsonify({
            'message': 'Admin created successfully',
            'admin': admin.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create admin', 'details': str(e)}), 500

@admin_bp.route('/actions', methods=['GET'])
@jwt_required()
@require_admin_role()
def get_admin_actions():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        action_type = request.args.get('action_type')
        admin_id = request.args.get('admin_id')
        
        query = AdminAction.query
        
        if action_type:
            query = query.filter_by(action_type=action_type)
        
        if admin_id:
            query = query.filter_by(admin_id=admin_id)
        
        actions = query.order_by(AdminAction.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        actions_data = [action.to_dict() for action in actions.items]
        
        return jsonify({
            'actions': actions_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': actions.total,
                'pages': actions.pages,
                'has_next': actions.has_next,
                'has_prev': actions.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get admin actions', 'details': str(e)}), 500



