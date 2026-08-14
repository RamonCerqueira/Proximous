from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid
import json

from src.models.user import db

class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile Information
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # super_admin, admin, moderator, support
    
    # Permissions
    permissions = db.Column(db.Text, nullable=True)  # JSON string
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    actions = db.relationship('AdminAction', backref='admin', lazy='dynamic')
    support_tickets_assigned = db.relationship('SupportTicket', backref='assigned_admin', lazy='dynamic')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_permissions(self):
        if self.permissions:
            return json.loads(self.permissions)
        return []

    def set_permissions(self, permissions):
        self.permissions = json.dumps(permissions)

    def has_permission(self, permission):
        if self.role == 'super_admin':
            return True
        return permission in self.get_permissions()

    def update_last_login(self):
        self.last_login = datetime.utcnow()
        db.session.commit()

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_sensitive:
            data['permissions'] = self.get_permissions()
        
        return data

    def __repr__(self):
        return f'<Admin {self.name}>'


class AdminAction(db.Model):
    __tablename__ = 'admin_actions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id = db.Column(db.String(36), db.ForeignKey('admins.id'), nullable=False)
    
    # Action Details
    action_type = db.Column(db.String(50), nullable=False)  # user_ban, content_remove, campaign_approve, etc.
    target_type = db.Column(db.String(50), nullable=False)  # user, message, campaign, etc.
    target_id = db.Column(db.String(36), nullable=False)
    
    # Action Data
    description = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text, nullable=True)  # JSON string with additional details
    reason = db.Column(db.Text, nullable=True)
    
    # Context
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get_details(self):
        if self.details:
            return json.loads(self.details)
        return {}

    def set_details(self, details):
        self.details = json.dumps(details)

    def to_dict(self):
        return {
            'id': self.id,
            'admin_id': self.admin_id,
            'action_type': self.action_type,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'description': self.description,
            'details': self.get_details(),
            'reason': self.reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'admin': self.admin.to_dict() if self.admin else None
        }


class SupportTicket(db.Model):
    __tablename__ = 'support_tickets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)
    
    # User Information
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    user_email = db.Column(db.String(120), nullable=False)
    user_name = db.Column(db.String(100), nullable=False)
    
    # Ticket Details
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # technical, billing, account, abuse, other
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    
    # Status and Assignment
    status = db.Column(db.String(20), default='open')  # open, in_progress, waiting_user, resolved, closed
    assigned_admin_id = db.Column(db.String(36), db.ForeignKey('admins.id'), nullable=True)
    
    # Resolution
    resolution = db.Column(db.Text, nullable=True)
    satisfaction_rating = db.Column(db.Integer, nullable=True)  # 1-5 stars
    satisfaction_feedback = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    closed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='support_tickets')
    messages = db.relationship('SupportMessage', backref='ticket', lazy='dynamic')

    def generate_ticket_number(self):
        # Generate a unique ticket number
        import random
        import string
        while True:
            number = 'TK' + ''.join(random.choices(string.digits, k=8))
            if not SupportTicket.query.filter_by(ticket_number=number).first():
                return number

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.ticket_number:
            self.ticket_number = self.generate_ticket_number()

    def assign_to_admin(self, admin_id):
        self.assigned_admin_id = admin_id
        self.status = 'in_progress'
        self.updated_at = datetime.utcnow()
        db.session.commit()

    def resolve(self, resolution, admin_id):
        self.resolution = resolution
        self.status = 'resolved'
        self.resolved_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        # Log admin action
        action = AdminAction(
            admin_id=admin_id,
            action_type='ticket_resolve',
            target_type='support_ticket',
            target_id=self.id,
            description=f'Resolved support ticket {self.ticket_number}',
            reason=resolution
        )
        db.session.add(action)
        db.session.commit()

    def close(self):
        self.status = 'closed'
        self.closed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        db.session.commit()

    def add_satisfaction_rating(self, rating, feedback=None):
        self.satisfaction_rating = rating
        self.satisfaction_feedback = feedback
        self.updated_at = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_number': self.ticket_number,
            'user_id': self.user_id,
            'user_email': self.user_email,
            'user_name': self.user_name,
            'subject': self.subject,
            'description': self.description,
            'category': self.category,
            'priority': self.priority,
            'status': self.status,
            'assigned_admin_id': self.assigned_admin_id,
            'resolution': self.resolution,
            'satisfaction_rating': self.satisfaction_rating,
            'satisfaction_feedback': self.satisfaction_feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'closed_at': self.closed_at.isoformat() if self.closed_at else None,
            'assigned_admin': self.assigned_admin.to_dict() if self.assigned_admin else None,
            'user': self.user.to_dict() if self.user else None
        }


class SupportMessage(db.Model):
    __tablename__ = 'support_messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = db.Column(db.String(36), db.ForeignKey('support_tickets.id'), nullable=False)
    
    # Message Details
    sender_type = db.Column(db.String(20), nullable=False)  # user, admin
    sender_id = db.Column(db.String(36), nullable=False)  # user_id or admin_id
    sender_name = db.Column(db.String(100), nullable=False)
    
    content = db.Column(db.Text, nullable=False)
    attachments = db.Column(db.Text, nullable=True)  # JSON string with file URLs
    
    # Status
    is_internal = db.Column(db.Boolean, default=False)  # Internal admin notes
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get_attachments(self):
        if self.attachments:
            return json.loads(self.attachments)
        return []

    def set_attachments(self, attachments):
        self.attachments = json.dumps(attachments)

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'sender_type': self.sender_type,
            'sender_id': self.sender_id,
            'sender_name': self.sender_name,
            'content': self.content,
            'attachments': self.get_attachments(),
            'is_internal': self.is_internal,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class FAQ(db.Model):
    __tablename__ = 'faqs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Content
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # account, premium, safety, technical, general
    
    # Organization
    order_index = db.Column(db.Integer, default=0)
    tags = db.Column(db.Text, nullable=True)  # JSON string
    
    # Status
    is_published = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    
    # Analytics
    view_count = db.Column(db.Integer, default=0)
    helpful_votes = db.Column(db.Integer, default=0)
    not_helpful_votes = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    votes = db.relationship('FAQVote', backref='faq', lazy='dynamic')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get_tags(self):
        if self.tags:
            return json.loads(self.tags)
        return []

    def set_tags(self, tags):
        self.tags = json.dumps(tags)

    def increment_view(self):
        self.view_count += 1
        db.session.commit()

    def calculate_helpfulness_score(self):
        total_votes = self.helpful_votes + self.not_helpful_votes
        if total_votes == 0:
            return 0
        return (self.helpful_votes / total_votes) * 100

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'category': self.category,
            'order_index': self.order_index,
            'tags': self.get_tags(),
            'is_published': self.is_published,
            'is_featured': self.is_featured,
            'view_count': self.view_count,
            'helpful_votes': self.helpful_votes,
            'not_helpful_votes': self.not_helpful_votes,
            'helpfulness_score': self.calculate_helpfulness_score(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class FAQVote(db.Model):
    __tablename__ = 'faq_votes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    faq_id = db.Column(db.String(36), db.ForeignKey('faqs.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    
    # Vote
    is_helpful = db.Column(db.Boolean, nullable=False)
    feedback = db.Column(db.Text, nullable=True)
    
    # Context
    ip_address = db.Column(db.String(45), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='faq_votes')
    
    __table_args__ = (db.UniqueConstraint('faq_id', 'user_id', name='unique_faq_vote'),)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'faq_id': self.faq_id,
            'user_id': self.user_id,
            'is_helpful': self.is_helpful,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SystemSetting(db.Model):
    __tablename__ = 'system_settings'
    
    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.Text, nullable=True)
    description = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    @classmethod
    def get_setting(cls, key, default=None):
        try:
            setting = cls.query.filter_by(key=key).first()
            if setting and setting.value is not None:
                return setting.value
        except Exception:
            pass
        return default

    @classmethod
    def set_setting(cls, key, value, description=None):
        setting = cls.query.filter_by(key=key).first()
        if not setting:
            setting = cls(key=key, value=str(value), description=description)
            db.session.add(setting)
        else:
            setting.value = str(value)
            if description:
                setting.description = description
            setting.updated_at = datetime.utcnow()
        db.session.commit()

    @classmethod
    def get_int(cls, key, default=0):
        val = cls.get_setting(key)
        if val is None:
            return default
        try:
            return int(val)
        except (ValueError, TypeError):
            return default

    @classmethod
    def get_bool(cls, key, default=False):
        val = cls.get_setting(key)
        if val is None:
            return default
        return str(val).lower() in ('true', '1', 'yes', 't')


