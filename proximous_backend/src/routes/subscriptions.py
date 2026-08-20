from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import uuid

from src.models.user import db, User
from src.models.subscription import Subscription, Payment, SubscriptionPlan, Coupon, CouponUsage

subscriptions_bp = Blueprint('subscriptions', __name__)

@subscriptions_bp.route('/plans', methods=['GET'])
def get_subscription_plans():
    try:
        plans = SubscriptionPlan.query.filter_by(is_active=True).all()
        plans_data = [plan.to_dict() for plan in plans]
        
        return jsonify({'plans': plans_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get subscription plans', 'details': str(e)}), 500

@subscriptions_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_subscription():
    try:
        current_user_id = get_jwt_identity()
        
        current_user = User.query.get(current_user_id)
        
        # Check active subscription object
        subscription = Subscription.query.filter_by(
            user_id=current_user_id,
            status='active'
        ).first()
        
        is_user_premium = current_user.is_premium_active() if current_user else False
        
        days_remaining = 0
        if current_user and current_user.premium_expires_at and current_user.premium_expires_at > datetime.utcnow():
            days_remaining = (current_user.premium_expires_at - datetime.utcnow()).days
        
        return jsonify({
            'subscription': subscription.to_dict() if subscription else None,
            'is_premium': is_user_premium,
            'is_promotional_trial': True,
            'trial_days_remaining': days_remaining,
            'message': f"🎉 Oferta de Lançamento Ativa! Você possui {days_remaining} dias grátis de Acesso Premium Total." if is_user_premium else "Período gratuito encerrado."
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get current subscription', 'details': str(e)}), 500

@subscriptions_bp.route('/subscribe', methods=['POST'])
@jwt_required()
def create_subscription():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        plan_type = data.get('plan_type')  # monthly or annual
        payment_method = data.get('payment_method')  # credit_card, pix, boleto
        coupon_code = data.get('coupon_code')
        
        if not plan_type or not payment_method:
            return jsonify({'error': 'plan_type and payment_method are required'}), 400
        
        # Check if user already has an active subscription
        existing_subscription = Subscription.query.filter_by(
            user_id=current_user_id,
            status='active'
        ).first()
        
        if existing_subscription and existing_subscription.is_active():
            return jsonify({'error': 'User already has an active subscription'}), 409
        
        # Get subscription plan
        plan = SubscriptionPlan.query.filter_by(
            plan_type=plan_type,
            is_active=True
        ).first()
        
        if not plan:
            return jsonify({'error': 'Subscription plan not found'}), 404
        
        # Calculate pricing
        amount = plan.price
        
        # Apply coupon if provided
        if coupon_code:
            coupon = Coupon.query.filter_by(code=coupon_code.upper()).first()
            if not coupon or not coupon.can_be_used_by_user(current_user_id):
                return jsonify({'error': 'Invalid or expired coupon'}), 400
            
            amount = coupon.apply_discount(amount)
        
        # Calculate billing dates
        start_date = datetime.utcnow()
        if plan_type == 'monthly':
            end_date = start_date + timedelta(days=30)
        else:  # annual
            end_date = start_date + timedelta(days=365)
        
        # Create subscription
        subscription = Subscription(
            user_id=current_user_id,
            plan_type=plan_type,
            amount=amount,
            billing_cycle_start=start_date,
            billing_cycle_end=end_date,
            next_billing_date=end_date
        )
        db.session.add(subscription)
        
        # Create payment record
        payment = Payment(
            subscription_id=subscription.id,
            user_id=current_user_id,
            amount=amount,
            payment_method=payment_method,
            status='pending'
        )
        db.session.add(payment)
        
        # Update user premium status
        user.is_premium = True
        user.premium_expires_at = end_date
        
        db.session.commit()
        
        # Use coupon if provided
        if coupon_code and coupon:
            coupon.use_coupon(current_user_id)
        
        # Mercado Pago integration
        checkout_url = None
        preference_id = None
        mp_access_token = os.environ.get('MP_ACCESS_TOKEN')

        if mp_access_token:
            try:
                import urllib.request
                import json
                frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
                backend_url = os.environ.get('BACKEND_PUBLIC_URL', 'http://localhost:5001')

                mp_url = "https://api.mercadopago.com/checkout/preferences"
                mp_payload = {
                    "items": [
                        {
                            "title": f"Proximous VIP - {plan.name}",
                            "quantity": 1,
                            "currency_id": "BRL",
                            "unit_price": float(amount)
                        }
                    ],
                    "payer": {
                        "email": user.email,
                        "name": user.name
                    },
                    "back_urls": {
                        "success": f"{frontend_url}/premium?status=success",
                        "failure": f"{frontend_url}/premium?status=failure",
                        "pending": f"{frontend_url}/premium?status=pending"
                    },
                    "auto_return": "approved",
                    "notification_url": f"{backend_url}/api/subscriptions/webhook",
                    "external_reference": f"{subscription.id}"
                }

                req = urllib.request.Request(
                    mp_url,
                    data=json.dumps(mp_payload).encode('utf-8'),
                    headers={
                        "Authorization": f"Bearer {mp_access_token}",
                        "Content-Type": "application/json"
                    },
                    method="POST"
                )

                with urllib.request.urlopen(req) as resp:
                    resp_data = json.loads(resp.read().decode('utf-8'))
                    checkout_url = resp_data.get('init_point')
                    preference_id = resp_data.get('id')
                    payment.transaction_id = preference_id
                    db.session.commit()
            except Exception as mpe:
                print(f"Mercado Pago preference error ({mpe}), proceeding in fallback mode.")
        else:
            # Fallback simulator mode when no MP_ACCESS_TOKEN is set
            payment.mark_completed()

        return jsonify({
            'message': 'Subscription created successfully',
            'subscription': subscription.to_dict(),
            'payment': payment.to_dict(),
            'checkout_url': checkout_url,
            'preference_id': preference_id,
            'pix_key': '03207834566'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create subscription', 'details': str(e)}), 500


@subscriptions_bp.route('/webhook', methods=['POST'])
def mercadopago_webhook():
    """
    Webhook handler for Mercado Pago payment status updates.
    """
    try:
        data = request.get_json() or {}
        topic = request.args.get('topic') or data.get('type')
        payment_id = request.args.get('id') or data.get('data', {}).get('id')

        if topic == 'payment' and payment_id:
            mp_access_token = os.environ.get('MP_ACCESS_TOKEN')
            if mp_access_token:
                import urllib.request
                import json
                req = urllib.request.Request(
                    f"https://api.mercadopago.com/v1/payments/{payment_id}",
                    headers={"Authorization": f"Bearer {mp_access_token}"}
                )
                with urllib.request.urlopen(req) as resp:
                    payment_info = json.loads(resp.read().decode('utf-8'))
                    status = payment_info.get('status')
                    sub_id = payment_info.get('external_reference')

                    if sub_id:
                        sub = Subscription.query.get(sub_id)
                        if sub and status == 'approved':
                            sub.status = 'active'
                            user = User.query.get(sub.user_id)
                            if user:
                                user.is_premium = True
                                user.premium_expires_at = sub.billing_cycle_end
                            db.session.commit()

        return jsonify({'status': 'ok'}), 200
    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'status': 'error', 'details': str(e)}), 200

@subscriptions_bp.route('/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription():
    try:
        current_user_id = get_jwt_identity()
        
        # Get active subscription
        subscription = Subscription.query.filter_by(
            user_id=current_user_id,
            status='active'
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
        
        data = request.get_json()
        reason = data.get('reason', 'User requested cancellation')
        immediate = data.get('immediate', False)
        
        if immediate:
            # Cancel immediately
            subscription.cancel()
            
            # Update user premium status
            user = User.query.get(current_user_id)
            if user:
                user.is_premium = False
                user.premium_expires_at = datetime.utcnow()
            
            message = 'Subscription cancelled immediately'
        else:
            # Cancel at end of billing period
            subscription.status = 'cancelled'
            subscription.cancelled_at = datetime.utcnow()
            
            message = f'Subscription will be cancelled on {subscription.billing_cycle_end.strftime("%Y-%m-%d")}'
        
        db.session.commit()
        
        return jsonify({
            'message': message,
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to cancel subscription', 'details': str(e)}), 500

@subscriptions_bp.route('/reactivate', methods=['POST'])
@jwt_required()
def reactivate_subscription():
    try:
        current_user_id = get_jwt_identity()
        
        # Get cancelled subscription
        subscription = Subscription.query.filter_by(
            user_id=current_user_id,
            status='cancelled'
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No cancelled subscription found'}), 404
        
        # Check if still within billing period
        if datetime.utcnow() > subscription.billing_cycle_end:
            return jsonify({'error': 'Subscription period has expired. Please create a new subscription.'}), 400
        
        # Reactivate subscription
        subscription.status = 'active'
        subscription.cancelled_at = None
        
        # Update user premium status
        user = User.query.get(current_user_id)
        if user:
            user.is_premium = True
            user.premium_expires_at = subscription.billing_cycle_end
        
        db.session.commit()
        
        return jsonify({
            'message': 'Subscription reactivated successfully',
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reactivate subscription', 'details': str(e)}), 500

@subscriptions_bp.route('/change-plan', methods=['POST'])
@jwt_required()
def change_subscription_plan():
    try:
        current_user_id = get_jwt_identity()
        
        # Get active subscription
        subscription = Subscription.query.filter_by(
            user_id=current_user_id,
            status='active'
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
        
        data = request.get_json()
        new_plan_type = data.get('new_plan_type')
        
        if not new_plan_type:
            return jsonify({'error': 'new_plan_type is required'}), 400
        
        if new_plan_type == subscription.plan_type:
            return jsonify({'error': 'Already on this plan'}), 400
        
        # Get new plan
        new_plan = SubscriptionPlan.query.filter_by(
            plan_type=new_plan_type,
            is_active=True
        ).first()
        
        if not new_plan:
            return jsonify({'error': 'New subscription plan not found'}), 404
        
        # Calculate prorated amount
        days_remaining = (subscription.billing_cycle_end - datetime.utcnow()).days
        
        if new_plan_type == 'annual' and subscription.plan_type == 'monthly':
            # Upgrade to annual
            credit = (subscription.amount / 30) * days_remaining
            new_amount = new_plan.price - credit
        else:
            # Downgrade or other changes
            new_amount = new_plan.price
        
        # Update subscription
        subscription.plan_type = new_plan_type
        subscription.amount = new_amount
        
        # Create payment for difference if needed
        if new_amount > 0:
            payment = Payment(
                subscription_id=subscription.id,
                user_id=current_user_id,
                amount=new_amount,
                payment_method='credit_card',  # Default, should be from user preference
                status='completed'  # Simplified for demo
            )
            db.session.add(payment)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Subscription plan changed successfully',
            'subscription': subscription.to_dict(),
            'amount_charged': new_amount if new_amount > 0 else 0
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change subscription plan', 'details': str(e)}), 500

@subscriptions_bp.route('/payment-history', methods=['GET'])
@jwt_required()
def get_payment_history():
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        payments_query = Payment.query.filter_by(
            user_id=current_user_id
        ).order_by(Payment.created_at.desc())
        
        payments = payments_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        payments_data = [payment.to_dict() for payment in payments.items]
        
        return jsonify({
            'payments': payments_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': payments.total,
                'pages': payments.pages,
                'has_next': payments.has_next,
                'has_prev': payments.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get payment history', 'details': str(e)}), 500

@subscriptions_bp.route('/validate-coupon', methods=['POST'])
@jwt_required()
def validate_coupon():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        coupon_code = data.get('coupon_code')
        
        if not coupon_code:
            return jsonify({'error': 'coupon_code is required'}), 400
        
        coupon = Coupon.query.filter_by(code=coupon_code.upper()).first()
        
        if not coupon:
            return jsonify({'error': 'Coupon not found', 'valid': False}), 404
        
        if not coupon.can_be_used_by_user(current_user_id):
            return jsonify({'error': 'Coupon cannot be used', 'valid': False}), 400
        
        return jsonify({
            'valid': True,
            'coupon': coupon.to_dict(),
            'message': f'Coupon valid! {coupon.discount_value}{"%" if coupon.discount_type == "percentage" else " BRL"} discount'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to validate coupon', 'details': str(e)}), 500

@subscriptions_bp.route('/usage-stats', methods=['GET'])
@jwt_required()
def get_usage_stats():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate usage statistics
        today = datetime.utcnow().date()
        
        # Reset daily counters if needed
        if user.last_activity_reset != today:
            user.daily_likes_used = 0
            user.daily_messages_sent = 0
            user.last_activity_reset = today
            db.session.commit()
        
        is_premium = user.is_premium_active()
        
        stats = {
            'is_premium': is_premium,
            'daily_limits': {
                'likes': {
                    'used': user.daily_likes_used,
                    'limit': 'unlimited' if is_premium else 10,
                    'remaining': 'unlimited' if is_premium else max(0, 10 - user.daily_likes_used)
                },
                'messages': {
                    'used': user.daily_messages_sent,
                    'limit': 'unlimited' if is_premium else 10,
                    'remaining': 'unlimited' if is_premium else max(0, 10 - user.daily_messages_sent)
                }
            },
            'premium_features': {
                'no_ads': is_premium,
                'anonymous_mode': is_premium,
                'advanced_filters': is_premium,
                'priority_support': is_premium
            }
        }
        
        if is_premium and user.premium_expires_at:
            stats['premium_expires_at'] = user.premium_expires_at.isoformat()
            stats['days_remaining'] = (user.premium_expires_at - datetime.utcnow()).days
        
        return jsonify({'usage_stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get usage stats', 'details': str(e)}), 500

@subscriptions_bp.route('/webhook/payment', methods=['POST'])
def payment_webhook():
    try:
        # This endpoint would handle webhooks from payment processors
        # like Stripe, PagSeguro, etc.
        
        data = request.get_json()
        event_type = data.get('type')
        payment_id = data.get('payment_id')
        
        if event_type == 'payment.succeeded':
            payment = Payment.query.filter_by(
                stripe_payment_intent_id=payment_id
            ).first()
            
            if payment:
                payment.mark_completed()
                
                # Update user premium status
                user = User.query.get(payment.user_id)
                subscription = Subscription.query.get(payment.subscription_id)
                
                if user and subscription:
                    user.is_premium = True
                    user.premium_expires_at = subscription.billing_cycle_end
                    db.session.commit()
        
        elif event_type == 'payment.failed':
            payment = Payment.query.filter_by(
                stripe_payment_intent_id=payment_id
            ).first()
            
            if payment:
                payment.mark_failed(data.get('failure_reason'))
        
        return jsonify({'status': 'received'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Webhook processing failed', 'details': str(e)}), 500

@subscriptions_bp.route('/renew', methods=['POST'])
@jwt_required()
def renew_subscription():
    try:
        current_user_id = get_jwt_identity()
        
        # Get active subscription
        subscription = Subscription.query.filter_by(
            user_id=current_user_id,
            status='active'
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
        
        # Check if renewal is needed
        if subscription.billing_cycle_end > datetime.utcnow() + timedelta(days=7):
            return jsonify({'error': 'Subscription does not need renewal yet'}), 400
        
        # Create payment for renewal
        payment = Payment(
            subscription_id=subscription.id,
            user_id=current_user_id,
            amount=subscription.amount,
            payment_method='credit_card',  # Should be from user preference
            status='completed'  # Simplified for demo
        )
        db.session.add(payment)
        
        # Renew subscription
        subscription.renew()
        
        # Update user premium status
        user = User.query.get(current_user_id)
        if user:
            user.premium_expires_at = subscription.billing_cycle_end
        
        db.session.commit()
        
        return jsonify({
            'message': 'Subscription renewed successfully',
            'subscription': subscription.to_dict(),
            'payment': payment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to renew subscription', 'details': str(e)}), 500

