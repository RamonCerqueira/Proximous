from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
import math
from sqlalchemy import or_, and_

from src.models.user import db, User, Like, Match, Achievement, UserAchievement, EmpathyTransaction, record_empathy_points

users_bp = Blueprint('users', __name__)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers using Haversine formula"""
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf')
    
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict(include_private=True)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get profile', 'details': str(e)}), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = [
            'name', 'age', 'bio', 'profile_photo_url', 'social_style',
            'location_city', 'location_country', 'search_radius',
            'is_visible', 'anonymous_mode', 'status', 'push_token',
            'intent_mode'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        # Update personality tags
        if 'personality_tags' in data:
            user.set_personality_tags(data['personality_tags'])
        
        # Update interests
        if 'interests' in data:
            user.set_interests(data['interests'])

        # Update profile prompts
        if 'profile_prompts' in data:
            user.set_profile_prompts(data['profile_prompts'])
        
        # Update photos list with 2-8 validation
        if 'photos' in data:
            photos_list = data['photos']
            if isinstance(photos_list, list):
                if len(photos_list) > 8:
                    return jsonify({'error': 'Maximum 8 photos allowed per profile'}), 400
                user.set_photos(photos_list)
        
        # Update location coordinates
        if 'latitude' in data and 'longitude' in data:
            user.latitude = data['latitude']
            user.longitude = data['longitude']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

@users_bp.route('/availability', methods=['PUT'])
@jwt_required()
def update_availability():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json() or {}
        hours = data.get('hours', 2)
        status_text = data.get('status_text', 'Disponível agora')
        intent_mode = data.get('intent_mode')
        clear = data.get('clear', False)
        
        if clear:
            user.available_until = None
            user.current_status_text = None
        else:
            try:
                hours_val = float(hours)
            except (ValueError, TypeError):
                hours_val = 2.0
            
            user.available_until = datetime.utcnow() + timedelta(hours=hours_val)
            user.current_status_text = status_text
            if intent_mode:
                user.intent_mode = intent_mode
                
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Disponibilidade atualizada com sucesso',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Falha ao atualizar disponibilidade', 'details': str(e)}), 500

@users_bp.route('/photos', methods=['POST'])
@jwt_required()
def add_photo():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        data = request.get_json()
        photo_url = data.get('photo_url')
        if not photo_url:
            return jsonify({'error': 'photo_url is required'}), 400
        
        current_photos = user.get_photos()
        if len(current_photos) >= 8:
            return jsonify({'error': 'Maximum limit of 8 photos reached'}), 400
        
        if photo_url not in current_photos:
            current_photos.append(photo_url)
            user.set_photos(current_photos)
            db.session.commit()
        
        return jsonify({
            'message': 'Photo added successfully',
            'photos': user.get_photos(),
            'has_required_photos': user.has_required_photos()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add photo', 'details': str(e)}), 500

@users_bp.route('/photos', methods=['DELETE'])
@jwt_required()
def delete_photo():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        data = request.get_json()
        photo_url = data.get('photo_url')
        if not photo_url:
            return jsonify({'error': 'photo_url is required'}), 400
        
        current_photos = user.get_photos()
        if photo_url in current_photos:
            current_photos.remove(photo_url)
            user.set_photos(current_photos)
            db.session.commit()
        
        return jsonify({
            'message': 'Photo removed successfully',
            'photos': user.get_photos(),
            'has_required_photos': user.has_required_photos()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to remove photo', 'details': str(e)}), 500


@users_bp.route('/discover', methods=['GET'])
@jwt_required()
def discover_users():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        age_min = request.args.get('age_min', type=int)
        age_max = request.args.get('age_max', type=int)
        social_style = request.args.get('social_style')
        interests = request.args.getlist('interests')
        gender_filter = request.args.get('gender') or request.args.get('looking_for')
        requested_radius = request.args.get('radius', type=float) or request.args.get('max_distance', type=float)
        
        intent_mode = request.args.get('intent_mode')
        available_now_arg = request.args.get('available_now')
        is_available_only = available_now_arg in ['true', '1', 'True', True]
        
        # Base query - exclude current user and already liked users
        liked_user_ids = [like.receiver_id for like in current_user.sent_likes]
        liked_user_ids.append(current_user_id)
        
        query = User.query.filter(
            User.id.notin_(liked_user_ids),
            User.is_active == True,
            User.is_visible == True
        )
        
        if is_available_only:
            query = query.filter(User.available_until.isnot(None), User.available_until > datetime.utcnow())
        
        if intent_mode and intent_mode != 'all':
            query = query.filter(or_(User.intent_mode == intent_mode, User.intent_mode == 'all', User.intent_mode.is_(None)))
            
        # Apply filters
        if age_min:
            query = query.filter(User.age >= age_min)
        if age_max:
            query = query.filter(User.age <= age_max)
        if social_style and social_style != 'all':
            query = query.filter(User.social_style == social_style)
        if gender_filter and gender_filter != 'all':
            query = query.filter(User.gender == gender_filter)
        
        # Get all potential matches
        potential_matches = query.all()
        
        # Dynamic Radius and Location Distance Filtering
        applied_radius = requested_radius if requested_radius is not None else (current_user.search_radius or 50)
        is_expanded_radius = requested_radius is not None and requested_radius > (current_user.search_radius or 50)
        
        nearby_users = []
        mock_distances = [1.5, 3.8, 8.2, 14.5, 28.0, 42.0]
        
        for idx, u in enumerate(potential_matches):
            if current_user.latitude and current_user.longitude and u.latitude and u.longitude:
                dist = calculate_distance(
                    current_user.latitude, current_user.longitude,
                    u.latitude, u.longitude
                )
            else:
                dist = mock_distances[idx % len(mock_distances)]
            
            if dist <= applied_radius:
                u.distance = round(dist, 1)
                nearby_users.append(u)
                
        potential_matches = nearby_users


        
        # Filter by interests if specified
        if interests:
            filtered_users = []
            for user in potential_matches:
                user_interests = user.get_interests()
                if any(interest in user_interests for interest in interests):
                    filtered_users.append(user)
            potential_matches = filtered_users
        
        # Sort by distance if available, otherwise by creation date
        if current_user.latitude and current_user.longitude:
            potential_matches.sort(key=lambda x: getattr(x, 'distance', float('inf')))
        else:
            potential_matches.sort(key=lambda x: x.created_at, reverse=True)
        
        # Paginate results
        start = (page - 1) * per_page
        end = start + per_page
        paginated_users = potential_matches[start:end]
        
        # Convert to dict with privacy fuzzing and compatibility score
        users_data = []
        for user in paginated_users:
            user_dict = user.to_dict()
            user_dict['compatibility_score'] = current_user.calculate_compatibility_score(user)
            if hasattr(user, 'distance'):
                user_dict['distance_text'] = User.format_distance_range(user.distance)
                # Omit exact coordinate floats from public user search result
                user_dict.pop('latitude', None)
                user_dict.pop('longitude', None)
            users_data.append(user_dict)
        
        return jsonify({
            'users': users_data,
            'location_info': {
                'original_radius_km': current_user.search_radius or 5,
                'applied_radius_km': applied_radius,
                'is_expanded_radius': is_expanded_radius,
                'message': f"Expandimos a busca para {applied_radius}km para conectar você a mais pessoas próximas!" if is_expanded_radius else "Busca dentro do seu raio preferido."
            },
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': len(potential_matches),
                'pages': math.ceil(len(potential_matches) / per_page) if potential_matches else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to discover users', 'details': str(e)}), 500

@users_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        if user_id == current_user_id:
            return jsonify({'error': 'Use /profile endpoint for your own profile'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_active or not user.is_visible:
            return jsonify({'error': 'User not available'}), 404
        
        # Check if current user is in anonymous mode
        current_user = User.query.get(current_user_id)
        if current_user and current_user.anonymous_mode:
            # Don't track the view in anonymous mode
            pass
        else:
            # In production, you might want to track profile views
            pass
        
        user_data = user.to_dict()
        user_data.pop('latitude', None)
        user_data.pop('longitude', None)
        
        # Add distance if both users have location
        if (current_user and current_user.latitude and current_user.longitude and 
            user.latitude and user.longitude):
            distance = calculate_distance(
                current_user.latitude, current_user.longitude,
                user.latitude, user.longitude
            )
            user_data['distance_text'] = User.format_distance_range(distance)
        
        # Check if current user has already liked this user
        existing_like = Like.query.filter_by(
            sender_id=current_user_id,
            receiver_id=user_id
        ).first()
        user_data['already_liked'] = existing_like is not None
        
        # Check if there's a mutual match
        mutual_like = Like.query.filter_by(
            sender_id=user_id,
            receiver_id=current_user_id
        ).first()
        user_data['mutual_match'] = existing_like is not None and mutual_like is not None
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user', 'details': str(e)}), 500

@users_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_user_achievements():
    try:
        current_user_id = get_jwt_identity()
        
        # Get user's achievements
        user_achievements = UserAchievement.query.filter_by(
            user_id=current_user_id
        ).all()
        
        # Get all available achievements
        all_achievements = Achievement.query.filter_by(is_active=True).all()
        
        earned_achievement_ids = [ua.achievement_id for ua in user_achievements]
        
        earned_achievements = [ua.to_dict() for ua in user_achievements]
        available_achievements = [
            achievement.to_dict() for achievement in all_achievements
            if achievement.id not in earned_achievement_ids
        ]
        
        return jsonify({
            'earned_achievements': earned_achievements,
            'available_achievements': available_achievements
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get achievements', 'details': str(e)}), 500

@users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate user statistics
        likes_sent = Like.query.filter_by(sender_id=current_user_id).count()
        likes_received = Like.query.filter_by(receiver_id=current_user_id).count()
        
        # Count matches (mutual likes)
        sent_likes = Like.query.filter_by(sender_id=current_user_id).all()
        matches_count = 0
        for like in sent_likes:
            mutual_like = Like.query.filter_by(
                sender_id=like.receiver_id,
                receiver_id=current_user_id
            ).first()
            if mutual_like:
                matches_count += 1
        
        # Count messages
        from src.models.user import Message
        messages_sent = Message.query.filter_by(sender_id=current_user_id).count()
        messages_received = Message.query.filter_by(receiver_id=current_user_id).count()
        
        # Count achievements
        achievements_earned = UserAchievement.query.filter_by(user_id=current_user_id).count()
        
        # Calculate days since joining
        days_since_joining = (datetime.utcnow() - user.created_at).days
        
        stats = {
            'likes_sent': likes_sent,
            'likes_received': likes_received,
            'matches': matches_count,
            'messages_sent': messages_sent,
            'messages_received': messages_received,
            'achievements_earned': achievements_earned,
            'empathy_points': user.empathy_points,
            'days_since_joining': days_since_joining,
            'daily_likes_remaining': max(0, 10 - user.daily_likes_used) if not user.is_premium_active() else 'unlimited',
            'daily_messages_remaining': max(0, 10 - user.daily_messages_sent) if not user.is_premium_active() else 'unlimited'
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user stats', 'details': str(e)}), 500

@users_bp.route('/deactivate', methods=['POST'])
@jwt_required()
def deactivate_account():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        reason = data.get('reason', 'User requested deactivation')
        
        # Deactivate user
        user.is_active = False
        user.is_visible = False
        user.updated_at = datetime.utcnow()
        
        # In production, you might want to:
        # - Cancel active subscriptions
        # - Send confirmation email
        # - Log the deactivation reason
        
        db.session.commit()
        
        return jsonify({'message': 'Account deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to deactivate account', 'details': str(e)}), 500

@users_bp.route('/reactivate', methods=['POST'])
@jwt_required()
def reactivate_account():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Reactivate user
        user.is_active = True
        user.is_visible = True
        user.updated_at = datetime.utcnow()
        user.last_seen = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Account reactivated successfully',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reactivate account', 'details': str(e)}), 500

@users_bp.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_account():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        password = data.get('password')
        
        if not password or not user.check_password(password):
            return jsonify({'error': 'Password confirmation required'}), 400
        
        # In production, instead of deleting, you might want to:
        # - Anonymize the data
        # - Keep for legal/audit purposes
        # - Soft delete with retention period
        
        # For now, we'll just deactivate and mark for deletion
        user.is_active = False
        user.is_visible = False
        user.email = f"deleted_{user.id}@proximous.com"
        user.name = "Deleted User"
        user.bio = None
        user.profile_photo_url = None
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Account deletion initiated'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete account', 'details': str(e)}), 500

@users_bp.route('/privacy-settings', methods=['GET'])
@jwt_required()
def get_privacy_settings():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        privacy_settings = {
            'is_visible': user.is_visible,
            'anonymous_mode': user.anonymous_mode,
            'search_radius': user.search_radius,
            'status': user.status
        }
        
        return jsonify({'privacy_settings': privacy_settings}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get privacy settings', 'details': str(e)}), 500

@users_bp.route('/privacy-settings', methods=['PUT'])
@jwt_required()
def update_privacy_settings():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update privacy settings
        if 'is_visible' in data:
            user.is_visible = data['is_visible']
        
        if 'anonymous_mode' in data:
            # Anonymous mode is a premium feature
            if data['anonymous_mode'] and not user.is_premium_active():
                return jsonify({'error': 'Anonymous mode requires Premium subscription'}), 403
            user.anonymous_mode = data['anonymous_mode']
        
        if 'search_radius' in data:
            radius = data['search_radius']
            if radius < 1 or radius > 100:
                return jsonify({'error': 'Search radius must be between 1 and 100 km'}), 400
            user.search_radius = radius
        
        if 'status' in data:
            valid_statuses = ['available', 'busy', 'observing']
            if data['status'] in valid_statuses:
                user.status = data['status']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Privacy settings updated successfully',
            'privacy_settings': {
                'is_visible': user.is_visible,
                'anonymous_mode': user.anonymous_mode,
                'search_radius': user.search_radius,
                'status': user.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update privacy settings', 'details': str(e)}), 500


@users_bp.route('/empathy-history', methods=['GET'])
@jwt_required()
def get_empathy_history():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate weekly points (last 7 days)
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        weekly_txs = EmpathyTransaction.query.filter(
            EmpathyTransaction.user_id == current_user_id,
            EmpathyTransaction.created_at >= one_week_ago
        ).all()
        weekly_points = sum(tx.points for tx in weekly_txs)
        
        # Fetch all transactions ordered by date descending
        all_txs = EmpathyTransaction.query.filter_by(
            user_id=current_user_id
        ).order_by(EmpathyTransaction.created_at.desc()).all()
        
        transactions_data = [tx.to_dict() for tx in all_txs]
        
        return jsonify({
            'total_points': user.empathy_points or 0,
            'weekly_points': weekly_points,
            'transactions': transactions_data
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch empathy history', 'details': str(e)}), 500


