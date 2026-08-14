from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import uuid
import json

from src.models.user import db

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    plan_type = db.Column(db.String(20), nullable=False)  # monthly, annual
    status = db.Column(db.String(20), default='active')  # active, cancelled, expired, paused
    
    # Pricing
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    
    # Billing
    billing_cycle_start = db.Column(db.DateTime, nullable=False)
    billing_cycle_end = db.Column(db.DateTime, nullable=False)
    next_billing_date = db.Column(db.DateTime, nullable=False)
    
    # Payment Integration
    stripe_subscription_id = db.Column(db.String(255), nullable=True)
    stripe_customer_id = db.Column(db.String(255), nullable=True)
    pagseguro_subscription_id = db.Column(db.String(255), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='subscriptions')
    payments = db.relationship('Payment', backref='subscription', lazy='dynamic')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def is_active(self):
        return self.status == 'active' and self.billing_cycle_end > datetime.utcnow()

    def cancel(self):
        self.status = 'cancelled'
        self.cancelled_at = datetime.utcnow()
        db.session.commit()

    def renew(self):
        if self.plan_type == 'monthly':
            self.billing_cycle_start = self.billing_cycle_end
            self.billing_cycle_end = self.billing_cycle_end + timedelta(days=30)
            self.next_billing_date = self.billing_cycle_end
        elif self.plan_type == 'annual':
            self.billing_cycle_start = self.billing_cycle_end
            self.billing_cycle_end = self.billing_cycle_end + timedelta(days=365)
            self.next_billing_date = self.billing_cycle_end
        
        self.updated_at = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_type': self.plan_type,
            'status': self.status,
            'amount': self.amount,
            'currency': self.currency,
            'billing_cycle_start': self.billing_cycle_start.isoformat() if self.billing_cycle_start else None,
            'billing_cycle_end': self.billing_cycle_end.isoformat() if self.billing_cycle_end else None,
            'next_billing_date': self.next_billing_date.isoformat() if self.next_billing_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'is_active': self.is_active()
        }


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subscription_id = db.Column(db.String(36), db.ForeignKey('subscriptions.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Payment Details
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed, refunded
    payment_method = db.Column(db.String(50), nullable=True)  # credit_card, pix, boleto
    
    # External Payment IDs
    stripe_payment_intent_id = db.Column(db.String(255), nullable=True)
    pagseguro_transaction_id = db.Column(db.String(255), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    failed_at = db.Column(db.DateTime, nullable=True)
    
    # Additional Info
    failure_reason = db.Column(db.Text, nullable=True)
    receipt_url = db.Column(db.String(255), nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='payments')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def mark_completed(self):
        self.status = 'completed'
        self.processed_at = datetime.utcnow()
        db.session.commit()

    def mark_failed(self, reason=None):
        self.status = 'failed'
        self.failed_at = datetime.utcnow()
        if reason:
            self.failure_reason = reason
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'subscription_id': self.subscription_id,
            'user_id': self.user_id,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'payment_method': self.payment_method,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'failed_at': self.failed_at.isoformat() if self.failed_at else None,
            'failure_reason': self.failure_reason,
            'receipt_url': self.receipt_url
        }


class SubscriptionPlan(db.Model):
    __tablename__ = 'subscription_plans'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    plan_type = db.Column(db.String(20), nullable=False)  # monthly, annual
    price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    
    # Features
    features = db.Column(db.Text, nullable=True)  # JSON string
    unlimited_likes = db.Column(db.Boolean, default=True)
    unlimited_messages = db.Column(db.Boolean, default=True)
    no_ads = db.Column(db.Boolean, default=True)
    anonymous_mode = db.Column(db.Boolean, default=True)
    advanced_filters = db.Column(db.Boolean, default=True)
    priority_support = db.Column(db.Boolean, default=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get_features(self):
        if self.features:
            return json.loads(self.features)
        return []

    def set_features(self, features):
        self.features = json.dumps(features)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'plan_type': self.plan_type,
            'price': self.price,
            'currency': self.currency,
            'features': self.get_features(),
            'unlimited_likes': self.unlimited_likes,
            'unlimited_messages': self.unlimited_messages,
            'no_ads': self.no_ads,
            'anonymous_mode': self.anonymous_mode,
            'advanced_filters': self.advanced_filters,
            'priority_support': self.priority_support,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Coupon(db.Model):
    __tablename__ = 'coupons'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_type = db.Column(db.String(20), nullable=False)  # percentage, fixed_amount
    discount_value = db.Column(db.Float, nullable=False)
    
    # Usage Limits
    max_uses = db.Column(db.Integer, nullable=True)
    current_uses = db.Column(db.Integer, default=0)
    max_uses_per_user = db.Column(db.Integer, default=1)
    
    # Validity
    valid_from = db.Column(db.DateTime, default=datetime.utcnow)
    valid_until = db.Column(db.DateTime, nullable=True)
    
    # Restrictions
    minimum_amount = db.Column(db.Float, nullable=True)
    applicable_plans = db.Column(db.Text, nullable=True)  # JSON string
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def is_valid(self):
        now = datetime.utcnow()
        
        if not self.is_active:
            return False
        
        if self.valid_until and now > self.valid_until:
            return False
        
        if now < self.valid_from:
            return False
        
        if self.max_uses and self.current_uses >= self.max_uses:
            return False
        
        return True

    def can_be_used_by_user(self, user_id):
        if not self.is_valid():
            return False
        
        # Check if user has already used this coupon
        usage_count = CouponUsage.query.filter_by(
            coupon_id=self.id,
            user_id=user_id
        ).count()
        
        return usage_count < self.max_uses_per_user

    def apply_discount(self, amount):
        if self.discount_type == 'percentage':
            discount = amount * (self.discount_value / 100)
        else:  # fixed_amount
            discount = self.discount_value
        
        return max(0, amount - discount)

    def use_coupon(self, user_id):
        self.current_uses += 1
        
        # Record usage
        usage = CouponUsage(
            coupon_id=self.id,
            user_id=user_id,
            used_at=datetime.utcnow()
        )
        db.session.add(usage)
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'max_uses': self.max_uses,
            'current_uses': self.current_uses,
            'max_uses_per_user': self.max_uses_per_user,
            'valid_from': self.valid_from.isoformat() if self.valid_from else None,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'minimum_amount': self.minimum_amount,
            'is_active': self.is_active,
            'is_valid': self.is_valid()
        }


class CouponUsage(db.Model):
    __tablename__ = 'coupon_usage'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coupon_id = db.Column(db.String(36), db.ForeignKey('coupons.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    used_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    coupon = db.relationship('Coupon', backref='usage_records')
    user = db.relationship('User', backref='coupon_usage')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'coupon_id': self.coupon_id,
            'user_id': self.user_id,
            'used_at': self.used_at.isoformat() if self.used_at else None
        }

