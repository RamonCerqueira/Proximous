from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
import re
import uuid

from src.models.user import db, User
from src.models.admin import Admin
from src.utils.redis_client import token_blacklist
from src.utils.datetime_utils import utc_now

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    if not email or not isinstance(email, str) or len(email) > 254 or len(email) < 5:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    if not password or not isinstance(password, str):
        return False, "A senha é obrigatória"
    if len(password) < 8:
        return False, "A senha deve ter no mínimo 8 caracteres"
    if len(password) > 128:
        return False, "A senha deve ter no máximo 128 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "A senha deve conter ao menos uma letra maiúscula"
    if not re.search(r'[a-z]', password):
        return False, "A senha deve conter ao menos uma letra minúscula"
    if not re.search(r'\d', password):
        return False, "A senha deve conter ao menos um número"
    return True, "Senha válida"

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        name = data['name'].strip()
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user with Promotional Free Premium from SystemSetting
        from src.models.admin import SystemSetting
        free_days = SystemSetting.get_int('global_free_premium_days', 7)
        
        user = User(
            email=email,
            name=name,
            age=data.get('age'),
            social_style=data.get('social_style', 'shy'),
            is_premium=True,
            premium_expires_at=datetime.utcnow() + timedelta(days=free_days)
        )
        user.set_password(password)
        
        # Set initial personality tags if provided
        if data.get('personality_tags'):
            user.set_personality_tags(data['personality_tags'])
        
        # Set initial interests if provided
        if data.get('interests'):
            user.set_interests(data['interests'])
        
        db.session.add(user)
        db.session.commit()
        
        # Send welcome email in background thread
        import threading
        from src.utils.email import send_welcome_email
        threading.Thread(
            target=send_welcome_email,
            args=(user.email, user.name),
            daemon=True
        ).start()
        
        # Create tokens
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'type': 'user', 'email': user.email}
        )
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(include_private=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last seen
        user.last_seen = datetime.utcnow()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'type': 'user', 'email': user.email}
        )
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(include_private=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find admin
        admin = Admin.query.filter_by(email=email).first()
        
        if not admin or not admin.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not admin.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last login
        admin.update_last_login()
        
        # Create tokens
        access_token = create_access_token(
            identity=admin.id,
            additional_claims={'type': 'admin', 'email': admin.email, 'role': admin.role}
        )
        refresh_token = create_refresh_token(identity=admin.id)
        
        return jsonify({
            'message': 'Admin login successful',
            'admin': admin.to_dict(include_sensitive=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Admin login failed', 'details': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        
        # Check if token is blacklisted
        jti = claims['jti']
        if token_blacklist.is_blacklisted(jti):
            return jsonify({'error': 'Token has been revoked'}), 401
        
        # Create new access token
        access_token = create_access_token(
            identity=current_user_id,
            additional_claims={
                'type': claims.get('type', 'user'),
                'email': claims.get('email'),
                'role': claims.get('role')
            }
        )
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token refresh failed', 'details': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()['jti']
        token_blacklist.add(jti)
        
        return jsonify({'message': 'Successfully logged out'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        user_type = claims.get('type', 'user')
        
        if user_type == 'admin':
            admin = Admin.query.get(current_user_id)
            if not admin:
                return jsonify({'error': 'Admin not found'}), 404
            return jsonify({'admin': admin.to_dict(include_sensitive=True)}), 200
        else:
            user = User.query.get(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            return jsonify({'user': user.to_dict(include_private=True)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user info', 'details': str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400
        
        email = data['email'].lower().strip()
        user = User.query.filter_by(email=email).first()
        
        # Don't reveal if email exists or not for security
        if not user:
            return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
        
        # Generate token, save to DB with 1h expiration
        reset_token = str(uuid.uuid4())
        user.password_reset_token = reset_token
        user.password_reset_expires_at = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        # Send email
        from src.utils.email import send_password_reset_email
        send_password_reset_email(email, reset_token)

        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password reset failed', 'details': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        
        required_fields = ['token', 'new_password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        token = data['token']
        new_password = data['new_password']

        # Find user by reset token
        user = User.query.filter_by(password_reset_token=token).first()
        if not user:
            return jsonify({'error': 'Invalid or expired reset token'}), 400

        # Check token expiration
        if not user.password_reset_expires_at or user.password_reset_expires_at < datetime.utcnow():
            return jsonify({'error': 'Reset token has expired. Please request a new one.'}), 400
        
        # Validate new password strength
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Update password and clear token
        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_expires_at = None
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password reset failed', 'details': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['current_password', 'new_password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Validate new password
        new_password = data['new_password']
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Update password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password change failed', 'details': str(e)}), 500

@auth_bp.route('/verify-token', methods=['POST'])
@jwt_required()
def verify_token():
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        
        # Check if token is blacklisted
        jti = claims['jti']
        if token_blacklist.is_blacklisted(jti):
            return jsonify({'error': 'Token has been revoked'}), 401
        
        return jsonify({
            'valid': True,
            'user_id': current_user_id,
            'type': claims.get('type', 'user'),
            'expires_at': claims.get('exp')
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token verification failed', 'details': str(e)}), 500

