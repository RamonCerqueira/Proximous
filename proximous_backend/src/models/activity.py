from datetime import datetime, timedelta
import uuid
import json

from src.models.user import db

class Activity(db.Model):
    __tablename__ = 'activities'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    category = db.Column(db.String(100), nullable=False)  # Custom dynamic category (e.g. '🎾 Beach Tennis', '☕ Café & Papo', etc.)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location_name = db.Column(db.String(150), nullable=True)
    scheduled_time = db.Column(db.String(100), nullable=True)  # e.g. "Hoje às 19:30"
    
    latitude = db.Column(db.Float, nullable=False, default=-23.5505)
    longitude = db.Column(db.Float, nullable=False, default=-46.6333)
    photo_url = db.Column(db.Text, nullable=True)
    
    max_participants = db.Column(db.Integer, default=2)  # Aberto para 2 ou mais pessoas
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=6))
    status = db.Column(db.String(20), default='active')  # 'active', 'cancelled', 'expired'
    
    creator = db.relationship('User', backref='created_activities')
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def is_active(self):
        return self.status == 'active' and (self.expires_at is None or self.expires_at > datetime.utcnow())

    def to_dict(self):
        participants = ActivityParticipant.query.filter_by(activity_id=self.id).all()
        approved_count = sum(1 for p in participants if getattr(p, 'status', 'approved') == 'approved' and p.user_id != self.user_id)
        return {
            'id': self.id,
            'user_id': self.user_id,
            'creator_name': self.creator.name if self.creator else 'Usuário Proximous',
            'creator_photo': self.creator.profile_photo_url if self.creator else None,
            'category': self.category,
            'title': self.title,
            'description': self.description,
            'photo_url': self.photo_url,
            'location_name': self.location_name or 'São Paulo, SP',
            'scheduled_time': self.scheduled_time or 'Hoje mais tarde',
            'latitude': self.latitude,
            'longitude': self.longitude,
            'max_participants': self.max_participants or 2,
            'participant_count': approved_count,
            'participants': [p.to_dict() for p in participants],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active()
        }


class ActivityParticipant(db.Model):
    __tablename__ = 'activity_participants'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    activity_id = db.Column(db.String(36), db.ForeignKey('activities.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    activity = db.relationship('Activity', backref='participants')
    user = db.relationship('User', backref='activity_participations')
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'activity_id': self.activity_id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'user_photo': self.user.profile_photo_url if self.user else None,
            'user_age': self.user.age if self.user else None,
            'status': getattr(self, 'status', 'pending') or 'pending',
            'joined_at': self.joined_at.isoformat() if self.joined_at else None
        }
