from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import uuid
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile Information
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True, default='female')  # 'male', 'female', 'other'
    looking_for = db.Column(db.String(20), nullable=True, default='all')  # 'male', 'female', 'all'
    bio = db.Column(db.Text, nullable=True)
    profile_photo_url = db.Column(db.String(255), nullable=True)
    photos = db.Column(db.Text, nullable=True)  # JSON array of photo URLs (Min 2, Max 8)


    
    # Personality and Preferences
    personality_tags = db.Column(db.Text, nullable=True)  # JSON string
    interests = db.Column(db.Text, nullable=True)  # JSON string
    social_style = db.Column(db.String(50), nullable=True)  # shy, introverted, extroverted
    
    # Location
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_city = db.Column(db.String(100), nullable=True)
    location_country = db.Column(db.String(100), nullable=True)
    search_radius = db.Column(db.Integer, default=5)  # km
    push_token = db.Column(db.String(255), nullable=True)  # Expo Push Token
    
    # Account Status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    is_premium = db.Column(db.Boolean, default=False)
    premium_expires_at = db.Column(db.DateTime, nullable=True)
    
    # Privacy & Intent Settings
    is_visible = db.Column(db.Boolean, default=True)
    anonymous_mode = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='available')  # available, busy, observing
    intent_mode = db.Column(db.String(30), default='all')  # romance, friendship, networking, sports, games, events, all
    profile_prompts = db.Column(db.Text, nullable=True)  # JSON string
    
    # Real-Time Availability (Modo AGORA)
    available_until = db.Column(db.DateTime, nullable=True)
    current_status_text = db.Column(db.String(120), nullable=True)
    
    # Gamification
    empathy_points = db.Column(db.Integer, default=0)
    achievements = db.Column(db.Text, nullable=True)  # JSON string
    daily_likes_used = db.Column(db.Integer, default=0)
    daily_messages_sent = db.Column(db.Integer, default=0)
    last_activity_reset = db.Column(db.Date, default=datetime.utcnow().date())
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sent_likes = db.relationship('Like', foreign_keys='Like.sender_id', backref='sender', lazy='dynamic')
    received_likes = db.relationship('Like', foreign_keys='Like.receiver_id', backref='receiver', lazy='dynamic')
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy='dynamic')
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy='dynamic')
    reports_made = db.relationship('Report', foreign_keys='Report.reporter_id', backref='reporter', lazy='dynamic')
    reports_received = db.relationship('Report', foreign_keys='Report.reported_id', backref='reported', lazy='dynamic')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_personality_tags(self):
        if self.personality_tags:
            return json.loads(self.personality_tags)
        return []

    def set_personality_tags(self, tags):
        self.personality_tags = json.dumps(tags)

    def get_interests(self):
        if self.interests:
            return json.loads(self.interests)
        return []

    def set_interests(self, interests):
        self.interests = json.dumps(interests)

    def get_photos(self):
        if self.photos:
            try:
                p = json.loads(self.photos)
                if isinstance(p, list) and len(p) > 0:
                    return p
            except Exception:
                pass
        if self.profile_photo_url:
            return [self.profile_photo_url]
        return []

    def set_photos(self, photos_list):
        if not isinstance(photos_list, list):
            raise ValueError("Photos must be a list")
        if len(photos_list) > 8:
            raise ValueError("Maximum of 8 photos allowed")
        self.photos = json.dumps(photos_list)
        if photos_list:
            self.profile_photo_url = photos_list[0]
        else:
            self.profile_photo_url = None

    def has_required_photos(self):
        return len(self.get_photos()) >= 2


    def get_achievements(self):
        if self.achievements:
            return json.loads(self.achievements)
        return []

    def set_achievements(self, achievements):
        self.achievements = json.dumps(achievements)

    def get_profile_prompts(self):
        if self.profile_prompts:
            try:
                return json.loads(self.profile_prompts)
            except Exception:
                return []
        return []

    def set_profile_prompts(self, prompts):
        self.profile_prompts = json.dumps(prompts)

    def calculate_compatibility_score(self, other_user):
        """Calculates a compatibility score percentage (0-100%) based on personality tags, interests, and intent mode."""
        if not other_user or other_user.id == self.id:
            return 0
        
        my_tags = set(self.get_personality_tags())
        other_tags = set(other_user.get_personality_tags())
        
        my_interests = set(self.get_interests())
        other_interests = set(other_user.get_interests())
        
        tag_intersection = my_tags.intersection(other_tags)
        interest_intersection = my_interests.intersection(other_interests)
        
        tag_union = my_tags.union(other_tags)
        interest_union = my_interests.union(other_interests)
        
        score = 50.0
        
        if tag_union:
            score += (len(tag_intersection) / len(tag_union)) * 25.0
        else:
            score += 10.0

        if interest_union:
            score += (len(interest_intersection) / len(interest_union)) * 25.0
        else:
            score += 10.0

        if self.intent_mode and getattr(other_user, 'intent_mode', None):
            if self.intent_mode == other_user.intent_mode or self.intent_mode == 'all' or other_user.intent_mode == 'all':
                score += 10.0
                
        return min(99, max(50, int(round(score))))


    def add_achievement(self, achievement):
        current_achievements = self.get_achievements()
        if achievement not in current_achievements:
            current_achievements.append(achievement)
            self.set_achievements(current_achievements)

    def is_premium_active(self):
        try:
            from src.models.admin import SystemSetting
            global_enabled = SystemSetting.get_bool('global_free_premium_enabled', True)
            if global_enabled:
                free_days = SystemSetting.get_int('global_free_premium_days', 120)
                if self.created_at and (datetime.utcnow() - self.created_at).days < free_days:
                    return True
        except Exception:
            pass

        if not self.is_premium:
            return False
        if self.premium_expires_at and self.premium_expires_at < datetime.utcnow():
            self.is_premium = False
            db.session.commit()
            return False
        return True

    def is_available_now(self):
        return self.available_until is not None and self.available_until > datetime.utcnow()

    def can_send_like(self):
        if self.is_premium_active():
            return True
        
        # Reset daily counters if needed
        today = datetime.utcnow().date()
        if self.last_activity_reset != today:
            self.daily_likes_used = 0
            self.daily_messages_sent = 0
            self.last_activity_reset = today
            db.session.commit()
        
        return self.daily_likes_used < 10

    def can_send_message(self):
        if self.is_premium_active():
            return True
        
        # Reset daily counters if needed
        today = datetime.utcnow().date()
        if self.last_activity_reset != today:
            self.daily_likes_used = 0
            self.daily_messages_sent = 0
            self.last_activity_reset = today
            db.session.commit()
        
        return self.daily_messages_sent < 10

    def use_daily_like(self):
        self.daily_likes_used += 1
        db.session.commit()

    def use_daily_message(self):
        self.daily_messages_sent += 1
        db.session.commit()

    @staticmethod
    def format_distance_range(distance_km):
        """Format distance in approximate ranges to preserve user privacy (anti-trilateration)"""
        if distance_km is None or distance_km == float('inf'):
            return "Localização desconhecida"
        if distance_km < 1.0:
            return "A menos de 1 km"
        elif distance_km < 2.0:
            return "A cerca de 1 a 2 km"
        elif distance_km < 5.0:
            return f"A cerca de {int(distance_km)} km"
        elif distance_km < 10.0:
            return "A menos de 10 km"
        else:
            return f"A cerca de {int(round(distance_km, -1))} km"

    def to_dict(self, include_private=False):
        data = {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'gender': self.gender or 'female',
            'looking_for': self.looking_for or 'all',
            'bio': self.bio,

            'profile_photo_url': self.profile_photo_url,
            'photos': self.get_photos(),
            'has_required_photos': self.has_required_photos(),
            'min_photos_required': 2,
            'max_photos_allowed': 8,
            'personality_tags': self.get_personality_tags(),

            'interests': self.get_interests(),
            'social_style': self.social_style,
            'location_city': self.location_city,
            'location_country': self.location_country,
            'is_verified': self.is_verified,
            'is_premium': self.is_premium_active(),
            'status': self.status,
            'intent_mode': self.intent_mode or 'all',
            'available_until': self.available_until.isoformat() if self.available_until else None,
            'current_status_text': self.current_status_text,
            'is_available_now': self.is_available_now(),
            'profile_prompts': self.get_profile_prompts(),
            'empathy_points': self.empathy_points,
            'achievements': self.get_achievements(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None
        }
        
        if include_private:
            data.update({
                'email': self.email,
                'search_radius': self.search_radius,
                'is_visible': self.is_visible,
                'anonymous_mode': self.anonymous_mode,
                'daily_likes_used': self.daily_likes_used,
                'daily_messages_sent': self.daily_messages_sent,
                'push_token': self.push_token,
                'premium_expires_at': self.premium_expires_at.isoformat() if self.premium_expires_at else None
            })
        
        return data

    def __repr__(self):
        return f'<User {self.name}>'


class Like(db.Model):
    __tablename__ = 'likes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    like_type = db.Column(db.String(20), default='like')  # like, compliment, icebreaker
    message = db.Column(db.Text, nullable=True)  # For compliments and icebreakers
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('sender_id', 'receiver_id', name='unique_like'),)

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'like_type': self.like_type,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Match(db.Model):
    __tablename__ = 'matches'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user1_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])
    
    __table_args__ = (db.UniqueConstraint('user1_id', 'user2_id', name='unique_match'),)

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self):
        return {
            'id': self.id,
            'user1_id': self.user1_id,
            'user2_id': self.user2_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }


class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    match_id = db.Column(db.String(36), db.ForeignKey('matches.id'), nullable=True)
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, emoji, icebreaker
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))
    
    match = db.relationship('Match', backref='messages')

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'match_id': self.match_id,
            'content': self.content,
            'message_type': self.message_type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }


class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reporter_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    reported_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    reason = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    admin_notes = db.Column(db.Text, nullable=True)

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self):
        return {
            'id': self.id,
            'reporter_id': self.reporter_id,
            'reported_id': self.reported_id,
            'reason': self.reason,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'admin_notes': self.admin_notes
        }


class Achievement(db.Model):
    __tablename__ = 'achievements'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(100), nullable=True)
    category = db.Column(db.String(50), nullable=False)  # social, engagement, milestone
    points_required = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'category': self.category,
            'points_required': self.points_required,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.String(36), db.ForeignKey('achievements.id'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='user_achievements')
    achievement = db.relationship('Achievement', backref='user_achievements')
    
    __table_args__ = (db.UniqueConstraint('user_id', 'achievement_id', name='unique_user_achievement'),)

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    actor_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(30), default='system')  # match, like, message, empathy, activity
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    actor = db.relationship('User', foreign_keys=[actor_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'actor_id': self.actor_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'actor': {
                'id': self.actor.id,
                'name': self.actor.name,
                'avatar': self.actor.profile_photo_url
            } if self.actor else None
        }


class EmpathyTransaction(db.Model):
    __tablename__ = 'empathy_transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    points = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # 'moments', 'icebreaker', 'achievement', 'profile', 'interaction'
    description = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'points': self.points,
            'category': self.category,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


def record_empathy_points(user_id, points, category, description):
    """
    Helper function to award empathy points to a user and log the transaction.
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return None
        
        user.empathy_points = (user.empathy_points or 0) + points
        
        transaction = EmpathyTransaction(
            user_id=user_id,
            points=points,
            category=category,
            description=description
        )
        db.session.add(transaction)
        return transaction
    except Exception as e:
        print(f"Error recording empathy points: {e}")
        return None




