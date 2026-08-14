from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
from sqlalchemy import and_, or_

from src.models.user import db, User
from src.models.advertising import Advertiser, AdCampaign, Advertisement, AdTransaction, AdImpression

advertising_bp = Blueprint('advertising', __name__)

def require_admin_access():
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

@advertising_bp.route('/advertiser/register', methods=['POST'])
def register_advertiser():
    try:
        data = request.get_json()
        
        required_fields = ['company_name', 'contact_email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if advertiser already exists
        existing = Advertiser.query.filter_by(contact_email=data['contact_email']).first()
        if existing:
            return jsonify({'error': 'Advertiser with this email already exists'}), 409
        
        # Create advertiser
        advertiser = Advertiser(
            company_name=data['company_name'],
            contact_email=data['contact_email'],
            contact_phone=data.get('contact_phone'),
            website=data.get('website'),
            industry=data.get('industry'),
            company_size=data.get('company_size'),
            billing_address=data.get('billing_address'),
            tax_id=data.get('tax_id')
        )
        
        db.session.add(advertiser)
        db.session.commit()
        
        return jsonify({
            'message': 'Advertiser registered successfully. Awaiting approval.',
            'advertiser': advertiser.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to register advertiser', 'details': str(e)}), 500

@advertising_bp.route('/advertiser/login', methods=['POST'])
def advertiser_login():
    try:
        data = request.get_json()
        
        if not data.get('contact_email'):
            return jsonify({'error': 'Email is required'}), 400
        
        advertiser = Advertiser.query.filter_by(
            contact_email=data['contact_email']
        ).first()
        
        if not advertiser:
            return jsonify({'error': 'Advertiser not found'}), 404
        
        if advertiser.status != 'approved':
            return jsonify({'error': 'Advertiser account not approved yet'}), 403
        
        # In production, implement proper authentication
        # For now, return advertiser info
        return jsonify({
            'message': 'Login successful',
            'advertiser': advertiser.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@advertising_bp.route('/advertiser/<advertiser_id>/campaigns', methods=['GET'])
def get_advertiser_campaigns(advertiser_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        status = request.args.get('status')
        
        query = AdCampaign.query.filter_by(advertiser_id=advertiser_id)
        
        if status:
            query = query.filter_by(status=status)
        
        campaigns = query.order_by(AdCampaign.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        campaigns_data = [campaign.to_dict() for campaign in campaigns.items]
        
        return jsonify({
            'campaigns': campaigns_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': campaigns.total,
                'pages': campaigns.pages,
                'has_next': campaigns.has_next,
                'has_prev': campaigns.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get campaigns', 'details': str(e)}), 500

@advertising_bp.route('/advertiser/<advertiser_id>/campaigns', methods=['POST'])
def create_campaign(advertiser_id):
    try:
        advertiser = Advertiser.query.get(advertiser_id)
        if not advertiser or advertiser.status != 'approved':
            return jsonify({'error': 'Advertiser not found or not approved'}), 404
        
        data = request.get_json()
        
        required_fields = ['name', 'objective', 'budget_type', 'budget_amount', 'start_date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate budget
        if data['budget_amount'] <= 0:
            return jsonify({'error': 'Budget amount must be positive'}), 400
        
        # Check advertiser balance
        if advertiser.current_balance < data['budget_amount']:
            return jsonify({'error': 'Insufficient balance'}), 400
        
        # Parse dates
        start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        end_date = None
        if data.get('end_date'):
            end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        
        # Create campaign
        campaign = AdCampaign(
            advertiser_id=advertiser_id,
            name=data['name'],
            description=data.get('description'),
            objective=data['objective'],
            budget_type=data['budget_type'],
            budget_amount=data['budget_amount'],
            bid_strategy=data.get('bid_strategy', 'automatic'),
            max_bid=data.get('max_bid'),
            target_age_min=data.get('target_age_min'),
            target_age_max=data.get('target_age_max'),
            start_date=start_date,
            end_date=end_date
        )
        
        # Set targeting
        if data.get('target_locations'):
            campaign.set_target_locations(data['target_locations'])
        if data.get('target_interests'):
            campaign.set_target_interests(data['target_interests'])
        if data.get('target_personality_tags'):
            campaign.set_target_personality_tags(data['target_personality_tags'])
        
        db.session.add(campaign)
        db.session.commit()
        
        return jsonify({
            'message': 'Campaign created successfully',
            'campaign': campaign.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create campaign', 'details': str(e)}), 500

@advertising_bp.route('/campaigns/<campaign_id>/ads', methods=['POST'])
def create_advertisement(campaign_id):
    try:
        campaign = AdCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        data = request.get_json()
        
        required_fields = ['title', 'description', 'cta_text', 'cta_url', 'ad_format', 'placement']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create advertisement
        ad = Advertisement(
            campaign_id=campaign_id,
            title=data['title'],
            description=data['description'],
            image_url=data.get('image_url'),
            video_url=data.get('video_url'),
            cta_text=data['cta_text'],
            cta_url=data['cta_url'],
            ad_format=data['ad_format'],
            placement=data['placement']
        )
        
        db.session.add(ad)
        db.session.commit()
        
        return jsonify({
            'message': 'Advertisement created successfully',
            'advertisement': ad.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create advertisement', 'details': str(e)}), 500

@advertising_bp.route('/campaigns/<campaign_id>/start', methods=['POST'])
def start_campaign(campaign_id):
    try:
        campaign = AdCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        if campaign.status != 'draft':
            return jsonify({'error': 'Campaign is not in draft status'}), 400
        
        # Check if campaign has ads
        ads_count = Advertisement.query.filter_by(campaign_id=campaign_id).count()
        if ads_count == 0:
            return jsonify({'error': 'Campaign must have at least one advertisement'}), 400
        
        # Update campaign status
        campaign.status = 'pending_review'
        db.session.commit()
        
        return jsonify({
            'message': 'Campaign submitted for review',
            'campaign': campaign.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to start campaign', 'details': str(e)}), 500

@advertising_bp.route('/campaigns/<campaign_id>/pause', methods=['POST'])
def pause_campaign(campaign_id):
    try:
        campaign = AdCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        if campaign.status != 'active':
            return jsonify({'error': 'Campaign is not active'}), 400
        
        campaign.status = 'paused'
        db.session.commit()
        
        return jsonify({
            'message': 'Campaign paused successfully',
            'campaign': campaign.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to pause campaign', 'details': str(e)}), 500

@advertising_bp.route('/campaigns/<campaign_id>/resume', methods=['POST'])
def resume_campaign(campaign_id):
    try:
        campaign = AdCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        if campaign.status != 'paused':
            return jsonify({'error': 'Campaign is not paused'}), 400
        
        campaign.status = 'active'
        db.session.commit()
        
        return jsonify({
            'message': 'Campaign resumed successfully',
            'campaign': campaign.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to resume campaign', 'details': str(e)}), 500

@advertising_bp.route('/advertiser/<advertiser_id>/balance', methods=['GET'])
def get_advertiser_balance(advertiser_id):
    try:
        advertiser = Advertiser.query.get(advertiser_id)
        if not advertiser:
            return jsonify({'error': 'Advertiser not found'}), 404
        
        return jsonify({
            'current_balance': advertiser.current_balance,
            'total_spent': advertiser.total_spent,
            'credit_limit': advertiser.credit_limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get balance', 'details': str(e)}), 500

@advertising_bp.route('/advertiser/<advertiser_id>/add-funds', methods=['POST'])
def add_funds(advertiser_id):
    try:
        advertiser = Advertiser.query.get(advertiser_id)
        if not advertiser:
            return jsonify({'error': 'Advertiser not found'}), 404
        
        data = request.get_json()
        amount = data.get('amount')
        payment_method = data.get('payment_method')
        
        if not amount or amount <= 0:
            return jsonify({'error': 'Valid amount is required'}), 400
        
        # Create transaction record
        transaction = AdTransaction(
            advertiser_id=advertiser_id,
            transaction_type='deposit',
            amount=amount,
            payment_method=payment_method,
            description=f'Funds added: {amount} BRL',
            status='completed'  # Simplified for demo
        )
        db.session.add(transaction)
        
        # Add to advertiser balance
        advertiser.add_balance(amount)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Funds added successfully',
            'new_balance': advertiser.current_balance,
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add funds', 'details': str(e)}), 500

@advertising_bp.route('/advertiser/<advertiser_id>/transactions', methods=['GET'])
def get_advertiser_transactions(advertiser_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        transactions = AdTransaction.query.filter_by(
            advertiser_id=advertiser_id
        ).order_by(AdTransaction.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        transactions_data = [transaction.to_dict() for transaction in transactions.items]
        
        return jsonify({
            'transactions': transactions_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': transactions.total,
                'pages': transactions.pages,
                'has_next': transactions.has_next,
                'has_prev': transactions.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get transactions', 'details': str(e)}), 500

@advertising_bp.route('/ads/serve', methods=['GET'])
@jwt_required()
def serve_ad():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Premium users don't see ads
        if user.is_premium_active():
            return jsonify({'ad': None, 'message': 'Premium user - no ads'}), 200
        
        placement = request.args.get('placement', 'feed')
        
        # Find suitable ads based on user profile
        query = Advertisement.query.join(AdCampaign).filter(
            AdCampaign.status == 'active',
            Advertisement.status == 'active',
            Advertisement.approval_status == 'approved',
            Advertisement.placement == placement,
            AdCampaign.start_date <= datetime.utcnow()
        )
        
        # Filter by end date if set
        query = query.filter(
            or_(
                AdCampaign.end_date.is_(None),
                AdCampaign.end_date >= datetime.utcnow()
            )
        )
        
        # Apply targeting filters
        if user.age:
            query = query.filter(
                or_(
                    AdCampaign.target_age_min.is_(None),
                    AdCampaign.target_age_min <= user.age
                ),
                or_(
                    AdCampaign.target_age_max.is_(None),
                    AdCampaign.target_age_max >= user.age
                )
            )
        
        # Get all matching ads
        ads = query.all()
        
        if not ads:
            return jsonify({'ad': None, 'message': 'No ads available'}), 200
        
        # Simple selection algorithm (in production, use more sophisticated bidding)
        import random
        selected_ad = random.choice(ads)
        
        # Record impression
        impression = AdImpression(
            advertisement_id=selected_ad.id,
            user_id=current_user_id,
            placement=placement,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(impression)
        
        # Update ad metrics
        selected_ad.record_impression()
        
        # Charge advertiser (simplified)
        campaign = selected_ad.campaign
        cost_per_impression = 0.01  # R$ 0.01 per impression
        
        if campaign.advertiser.current_balance >= cost_per_impression:
            campaign.advertiser.deduct_balance(cost_per_impression)
            campaign.spent_amount += cost_per_impression
            
            # Record transaction
            transaction = AdTransaction(
                advertiser_id=campaign.advertiser_id,
                campaign_id=campaign.id,
                transaction_type='ad_spend',
                amount=cost_per_impression,
                description=f'Impression cost for ad {selected_ad.id}'
            )
            db.session.add(transaction)
        
        db.session.commit()
        
        ad_data = selected_ad.to_dict()
        ad_data['impression_id'] = impression.id
        
        return jsonify({'ad': ad_data}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to serve ad', 'details': str(e)}), 500

@advertising_bp.route('/ads/click', methods=['POST'])
@jwt_required()
def record_ad_click():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        impression_id = data.get('impression_id')
        
        if not impression_id:
            return jsonify({'error': 'impression_id is required'}), 400
        
        impression = AdImpression.query.filter_by(
            id=impression_id,
            user_id=current_user_id
        ).first()
        
        if not impression:
            return jsonify({'error': 'Impression not found'}), 404
        
        # Record click
        impression.record_click()
        
        # Charge advertiser for click (simplified)
        campaign = impression.advertisement.campaign
        cost_per_click = 0.50  # R$ 0.50 per click
        
        if campaign.advertiser.current_balance >= cost_per_click:
            campaign.advertiser.deduct_balance(cost_per_click)
            campaign.spent_amount += cost_per_click
            
            # Record transaction
            transaction = AdTransaction(
                advertiser_id=campaign.advertiser_id,
                campaign_id=campaign.id,
                transaction_type='ad_spend',
                amount=cost_per_click,
                description=f'Click cost for ad {impression.advertisement_id}'
            )
            db.session.add(transaction)
        
        db.session.commit()
        
        return jsonify({'message': 'Click recorded successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to record click', 'details': str(e)}), 500

@advertising_bp.route('/campaigns/<campaign_id>/stats', methods=['GET'])
def get_campaign_stats(campaign_id):
    try:
        campaign = AdCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        # Get date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start_date = campaign.start_date
        
        if end_date:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        else:
            end_date = datetime.utcnow()
        
        # Get impressions in date range
        impressions_query = AdImpression.query.join(Advertisement).filter(
            Advertisement.campaign_id == campaign_id,
            AdImpression.created_at >= start_date,
            AdImpression.created_at <= end_date
        )
        
        total_impressions = impressions_query.count()
        total_clicks = impressions_query.filter(AdImpression.clicked == True).count()
        total_conversions = impressions_query.filter(AdImpression.converted == True).count()
        
        # Calculate metrics
        ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
        cpc = (campaign.spent_amount / total_clicks) if total_clicks > 0 else 0
        
        stats = {
            'campaign_id': campaign_id,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'metrics': {
                'impressions': total_impressions,
                'clicks': total_clicks,
                'conversions': total_conversions,
                'ctr': round(ctr, 2),
                'conversion_rate': round(conversion_rate, 2),
                'cpc': round(cpc, 2),
                'spent_amount': campaign.spent_amount,
                'remaining_budget': campaign.budget_amount - campaign.spent_amount
            }
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get campaign stats', 'details': str(e)}), 500

# Admin endpoints for managing advertising
@advertising_bp.route('/admin/advertisers', methods=['GET'])
@jwt_required()
@require_admin_access()
def admin_get_advertisers():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        status = request.args.get('status')
        
        query = Advertiser.query
        
        if status:
            query = query.filter_by(status=status)
        
        advertisers = query.order_by(Advertiser.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        advertisers_data = [advertiser.to_dict() for advertiser in advertisers.items]
        
        return jsonify({
            'advertisers': advertisers_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': advertisers.total,
                'pages': advertisers.pages,
                'has_next': advertisers.has_next,
                'has_prev': advertisers.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get advertisers', 'details': str(e)}), 500

@advertising_bp.route('/admin/advertisers/<advertiser_id>/approve', methods=['POST'])
@jwt_required()
@require_admin_access()
def admin_approve_advertiser(advertiser_id):
    try:
        advertiser = Advertiser.query.get(advertiser_id)
        if not advertiser:
            return jsonify({'error': 'Advertiser not found'}), 404
        
        advertiser.status = 'approved'
        advertiser.is_verified = True
        advertiser.approved_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Advertiser approved successfully',
            'advertiser': advertiser.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to approve advertiser', 'details': str(e)}), 500

@advertising_bp.route('/admin/campaigns/<campaign_id>/approve', methods=['POST'])
@jwt_required()
@require_admin_access()
def admin_approve_campaign(campaign_id):
    try:
        campaign = AdCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        campaign.approval_status = 'approved'
        campaign.status = 'active'
        campaign.approved_at = datetime.utcnow()
        
        # Approve all ads in the campaign
        ads = Advertisement.query.filter_by(campaign_id=campaign_id).all()
        for ad in ads:
            ad.approval_status = 'approved'
            ad.approved_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Campaign approved successfully',
            'campaign': campaign.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to approve campaign', 'details': str(e)}), 500

@advertising_bp.route('/admin/campaigns/<campaign_id>/reject', methods=['POST'])
@jwt_required()
@require_admin_access()
def admin_reject_campaign(campaign_id):
    try:
        campaign = AdCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        data = request.get_json()
        reason = data.get('reason', 'Campaign rejected by admin')
        
        campaign.approval_status = 'rejected'
        campaign.status = 'rejected'
        
        # Reject all ads in the campaign
        ads = Advertisement.query.filter_by(campaign_id=campaign_id).all()
        for ad in ads:
            ad.approval_status = 'rejected'
            ad.rejection_reason = reason
        
        db.session.commit()
        
        return jsonify({
            'message': 'Campaign rejected successfully',
            'campaign': campaign.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reject campaign', 'details': str(e)}), 500

