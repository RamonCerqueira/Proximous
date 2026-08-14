from src.models.user import db
from datetime import datetime
import uuid

class Moment(db.Model):
    __tablename__ = 'moments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    photo_url = db.Column(db.String(255), nullable=True)
    likes_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('moments_list', lazy=True))
    likes = db.relationship('MomentLike', backref='moment', lazy=True, cascade='all, delete-orphan')

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self, current_user_id=None):
        liked_by_me = False
        if current_user_id:
            liked_by_me = any(like.user_id == current_user_id for like in self.likes)
            
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else 'Usuário',
            'user_age': self.user.age if self.user else 25,
            'user_avatar': self.user.profile_photo_url if self.user else None,
            'user_city': self.user.location_city if self.user else 'São Paulo',
            'content': self.content,
            'photo_url': self.photo_url,
            'likes_count': self.likes_count,
            'liked_by_me': liked_by_me,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MomentLike(db.Model):
    __tablename__ = 'moment_likes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    moment_id = db.Column(db.String(36), db.ForeignKey('moments.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

