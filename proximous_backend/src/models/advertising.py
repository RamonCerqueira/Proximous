from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import uuid
import json

from src.models.user import db

class Advertiser(db.Model):
    __tablename__ = 'advertisers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_name = db.Column(db.String(200), nullable=False)
    contact_email = db.Column(db.String(120), nullable=False)
    contact_phone = db.Column(db.String(20), nullable=True)
    
    # Company Details
    website = db.Column(db.String(255), nullable=True)
    industry = db.Column(db.String(100), nullable=True)
    company_size = db.Column(db.String(50), nullable=True)  # startup, small, medium, large
    
    # Billing Information
    billing_address = db.Column(db.Text, nullable=True)
    tax_id = db.Column(db.String(50), nullable=True)  # CNPJ/CPF
    
    # Account Status
    status = db.Column(db.String(20), default='pending')  # pending, approved, suspended, rejected
    is_verified = db.Column(db.Boolean, default=False)
    
    # Spending and Limits
    total_spent = db.Column(db.Float, default=0.0)
    credit_limit = db.Column(db.Float, default=1000.0)
    current_balance = db.Column(db.Float, default=0.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    campaigns = db.relationship('AdCampaign', backref='advertiser', lazy='dynamic')
    transactions = db.relationship('AdTransaction', backref='advertiser', lazy='dynamic')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def add_balance(self, amount):
        self.current_balance += amount
        db.session.commit()

    def deduct_balance(self, amount):
        if self.current_balance >= amount:
            self.current_balance -= amount
            self.total_spent += amount
            db.session.commit()
            return True
        return False

    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'website': self.website,
            'industry': self.industry,
            'company_size': self.company_size,
            'status': self.status,
            'is_verified': self.is_verified,
            'total_spent': self.total_spent,
            'credit_limit': self.credit_limit,
            'current_balance': self.current_balance,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None
        }


class AdCampaign(db.Model):
    __tablename__ = 'ad_campaigns'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    advertiser_id = db.Column(db.String(36), db.ForeignKey('advertisers.id'), nullable=False)
    
    # Campaign Details
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    objective = db.Column(db.String(50), nullable=False)  # awareness, traffic, conversions
    
    # Budget and Bidding
    budget_type = db.Column(db.String(20), nullable=False)  # daily, total
    budget_amount = db.Column(db.Float, nullable=False)
    bid_strategy = db.Column(db.String(30), default='automatic')  # automatic, manual_cpc
    max_bid = db.Column(db.Float, nullable=True)
    
    # Targeting
    target_age_min = db.Column(db.Integer, nullable=True)
    target_age_max = db.Column(db.Integer, nullable=True)
    target_locations = db.Column(db.Text, nullable=True)  # JSON string
    target_interests = db.Column(db.Text, nullable=True)  # JSON string
    target_personality_tags = db.Column(db.Text, nullable=True)  # JSON string
    
    # Schedule
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=True)
    schedule_timezone = db.Column(db.String(50), default='America/Sao_Paulo')
    
    # Status and Performance
    status = db.Column(db.String(20), default='draft')  # draft, pending_review, active, paused, completed, rejected
    approval_status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    
    # Metrics
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    spent_amount = db.Column(db.Float, default=0.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    ads = db.relationship('Advertisement', backref='campaign', lazy='dynamic')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get_target_locations(self):
        if self.target_locations:
            return json.loads(self.target_locations)
        return []

    def set_target_locations(self, locations):
        self.target_locations = json.dumps(locations)

    def get_target_interests(self):
        if self.target_interests:
            return json.loads(self.target_interests)
        return []

    def set_target_interests(self, interests):
        self.target_interests = json.dumps(interests)

    def get_target_personality_tags(self):
        if self.target_personality_tags:
            return json.loads(self.target_personality_tags)
        return []

    def set_target_personality_tags(self, tags):
        self.target_personality_tags = json.dumps(tags)

    def is_active(self):
        now = datetime.utcnow()
        return (self.status == 'active' and 
                self.start_date <= now and 
                (self.end_date is None or self.end_date >= now))

    def calculate_ctr(self):
        if self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return 0

    def calculate_cpc(self):
        if self.clicks > 0:
            return self.spent_amount / self.clicks
        return 0

    def calculate_conversion_rate(self):
        if self.clicks > 0:
            return (self.conversions / self.clicks) * 100
        return 0

    def to_dict(self):
        return {
            'id': self.id,
            'advertiser_id': self.advertiser_id,
            'name': self.name,
            'description': self.description,
            'objective': self.objective,
            'budget_type': self.budget_type,
            'budget_amount': self.budget_amount,
            'bid_strategy': self.bid_strategy,
            'max_bid': self.max_bid,
            'target_age_min': self.target_age_min,
            'target_age_max': self.target_age_max,
            'target_locations': self.get_target_locations(),
            'target_interests': self.get_target_interests(),
            'target_personality_tags': self.get_target_personality_tags(),
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'approval_status': self.approval_status,
            'impressions': self.impressions,
            'clicks': self.clicks,
            'conversions': self.conversions,
            'spent_amount': self.spent_amount,
            'ctr': self.calculate_ctr(),
            'cpc': self.calculate_cpc(),
            'conversion_rate': self.calculate_conversion_rate(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'is_active': self.is_active()
        }


class Advertisement(db.Model):
    __tablename__ = 'advertisements'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = db.Column(db.String(36), db.ForeignKey('ad_campaigns.id'), nullable=False)
    
    # Ad Content
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    video_url = db.Column(db.String(255), nullable=True)
    
    # Call to Action
    cta_text = db.Column(db.String(50), nullable=False)
    cta_url = db.Column(db.String(255), nullable=False)
    
    # Ad Format and Placement
    ad_format = db.Column(db.String(30), nullable=False)  # banner, native, interstitial
    placement = db.Column(db.String(30), nullable=False)  # feed, profile, messages
    
    # Status
    status = db.Column(db.String(20), default='active')  # active, paused, rejected
    approval_status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    rejection_reason = db.Column(db.Text, nullable=True)
    
    # Performance Metrics
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def record_impression(self):
        self.impressions += 1
        # Also update campaign metrics
        if self.campaign:
            self.campaign.impressions += 1
        db.session.commit()

    def record_click(self):
        self.clicks += 1
        # Also update campaign metrics
        if self.campaign:
            self.campaign.clicks += 1
        db.session.commit()

    def record_conversion(self):
        self.conversions += 1
        # Also update campaign metrics
        if self.campaign:
            self.campaign.conversions += 1
        db.session.commit()

    def calculate_ctr(self):
        if self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return 0

    def to_dict(self):
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'video_url': self.video_url,
            'cta_text': self.cta_text,
            'cta_url': self.cta_url,
            'ad_format': self.ad_format,
            'placement': self.placement,
            'status': self.status,
            'approval_status': self.approval_status,
            'rejection_reason': self.rejection_reason,
            'impressions': self.impressions,
            'clicks': self.clicks,
            'conversions': self.conversions,
            'ctr': self.calculate_ctr(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None
        }


class AdTransaction(db.Model):
    __tablename__ = 'ad_transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    advertiser_id = db.Column(db.String(36), db.ForeignKey('advertisers.id'), nullable=False)
    campaign_id = db.Column(db.String(36), db.ForeignKey('ad_campaigns.id'), nullable=True)
    
    # Transaction Details
    transaction_type = db.Column(db.String(30), nullable=False)  # deposit, ad_spend, refund
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    description = db.Column(db.Text, nullable=True)
    
    # Payment Information
    payment_method = db.Column(db.String(50), nullable=True)
    payment_reference = db.Column(db.String(255), nullable=True)
    
    # Status
    status = db.Column(db.String(20), default='completed')  # pending, completed, failed, refunded
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'advertiser_id': self.advertiser_id,
            'campaign_id': self.campaign_id,
            'transaction_type': self.transaction_type,
            'amount': self.amount,
            'currency': self.currency,
            'description': self.description,
            'payment_method': self.payment_method,
            'payment_reference': self.payment_reference,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }


class AdImpression(db.Model):
    __tablename__ = 'ad_impressions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    advertisement_id = db.Column(db.String(36), db.ForeignKey('advertisements.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    
    # Context
    placement = db.Column(db.String(30), nullable=False)
    user_agent = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    
    # Interaction
    clicked = db.Column(db.Boolean, default=False)
    clicked_at = db.Column(db.DateTime, nullable=True)
    converted = db.Column(db.Boolean, default=False)
    converted_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    advertisement = db.relationship('Advertisement', backref='impression_records')
    user = db.relationship('User', backref='ad_impressions')

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def record_click(self):
        if not self.clicked:
            self.clicked = True
            self.clicked_at = datetime.utcnow()
            self.advertisement.record_click()
            db.session.commit()

    def record_conversion(self):
        if not self.converted:
            self.converted = True
            self.converted_at = datetime.utcnow()
            self.advertisement.record_conversion()
            db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'advertisement_id': self.advertisement_id,
            'user_id': self.user_id,
            'placement': self.placement,
            'clicked': self.clicked,
            'clicked_at': self.clicked_at.isoformat() if self.clicked_at else None,
            'converted': self.converted,
            'converted_at': self.converted_at.isoformat() if self.converted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

