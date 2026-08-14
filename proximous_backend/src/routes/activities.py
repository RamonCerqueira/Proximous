from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import math

from src.models.user import db, User
from src.models.activity import Activity, ActivityParticipant

activities_bp = Blueprint('activities', __name__)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@activities_bp.route('/nearby', methods=['GET'])
@jwt_required()
def get_nearby_activities():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        category = request.args.get('category')
        radius = float(request.args.get('radius', 25.0))
        
        now = datetime.utcnow()
        query = Activity.query.filter(
            Activity.status == 'active',
            Activity.expires_at > now
        )
        
        if category and category != 'all':
            query = query.filter_by(category=category)
            
        all_activities = query.order_by(Activity.created_at.desc()).all()
        nearby_activities = []
        
        for activity in all_activities:
            act_data = activity.to_dict()
            if current_user.latitude and current_user.longitude and activity.latitude and activity.longitude:
                dist = haversine(current_user.latitude, current_user.longitude, activity.latitude, activity.longitude)
                if dist <= radius:
                    act_data['distance_range'] = User.format_distance_range(dist)
                    nearby_activities.append(act_data)
            else:
                act_data['distance_range'] = "A menos de 5 km"
                nearby_activities.append(act_data)
                
        return jsonify({
            'activities': nearby_activities,
            'count': len(nearby_activities)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch nearby activities', 'details': str(e)}), 500


@activities_bp.route('', methods=['POST'])
@jwt_required()
def create_activity():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        if not data or not data.get('title') or not data.get('category'):
            return jsonify({'error': 'Title and category are required'}), 400
            
        lat = data.get('latitude', current_user.latitude or -23.5505)
        lng = data.get('longitude', current_user.longitude or -46.6333)
        
        duration_hours = int(data.get('duration_hours', 8))
        expires_at = datetime.utcnow() + timedelta(hours=duration_hours)
        
        activity = Activity(
            user_id=current_user_id,
            category=data.get('category'),
            title=data.get('title'),
            description=data.get('description', ''),
            location_name=data.get('location_name', current_user.location_city or 'São Paulo, SP'),
            scheduled_time=data.get('scheduled_time', 'Hoje mais tarde'),
            latitude=lat,
            longitude=lng,
            max_participants=int(data.get('max_participants', 2)),
            expires_at=expires_at
        )
        
        db.session.add(activity)
        db.session.commit()
        
        # Add creator as approved participant
        participant = ActivityParticipant(activity_id=activity.id, user_id=current_user_id, status='approved')
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'message': 'Activity created successfully',
            'activity': activity.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create activity', 'details': str(e)}), 500


@activities_bp.route('/<activity_id>/join', methods=['POST'])
@jwt_required()
def join_activity(activity_id):
    try:
        current_user_id = get_jwt_identity()
        activity = Activity.query.get(activity_id)
        
        if not activity or not activity.is_active():
            return jsonify({'error': 'Activity not found or expired'}), 404
            
        existing = ActivityParticipant.query.filter_by(activity_id=activity_id, user_id=current_user_id).first()
        if existing:
            return jsonify({'message': 'Candidatura já enviada!', 'activity': activity.to_dict()}), 200
            
        # Create candidate application with status 'pending'
        participant = ActivityParticipant(activity_id=activity_id, user_id=current_user_id, status='pending')
        db.session.add(participant)
        db.session.commit()
        
        # Notify activity creator
        from src.routes.notifications import create_notification
        user = User.query.get(current_user_id)
        create_notification(
            user_id=activity.user_id,
            title="Nova Candidatura no seu Convite! 🙋‍♂️",
            message=f"{user.name if user else 'Alguém'} se candidatou ao convite '{activity.title}'.",
            notif_type="activity",
            actor_id=current_user_id
        )
        
        return jsonify({
            'message': 'Candidatura enviada com sucesso! Aguarde a aprovação do organizador.',
            'activity': activity.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to apply for activity', 'details': str(e)}), 500


@activities_bp.route('/<activity_id>/participants/<user_id>/approve', methods=['POST'])
@jwt_required()
def approve_participant(activity_id, user_id):
    try:
        current_user_id = get_jwt_identity()
        activity = Activity.query.get(activity_id)
        
        if not activity or activity.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized to approve participants'}), 403
            
        participant = ActivityParticipant.query.filter_by(activity_id=activity_id, user_id=user_id).first()
        if not participant:
            return jsonify({'error': 'Candidate not found'}), 404
            
        participant.status = 'approved'
        db.session.commit()
        
        # Send notification to applicant
        from src.routes.notifications import create_notification
        create_notification(
            user_id=user_id,
            title="Candidatura Aceita! 🎉",
            message=f"Seu pedido para o convite '{activity.title}' foi aceito!",
            notif_type="activity",
            actor_id=current_user_id
        )
        
        return jsonify({'message': 'Candidato aprovado com sucesso!', 'activity': activity.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to approve candidate', 'details': str(e)}), 500


@activities_bp.route('/<activity_id>/participants/<user_id>/reject', methods=['POST'])
@jwt_required()
def reject_participant(activity_id, user_id):
    try:
        current_user_id = get_jwt_identity()
        activity = Activity.query.get(activity_id)
        
        if not activity or activity.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized to reject participants'}), 403
            
        participant = ActivityParticipant.query.filter_by(activity_id=activity_id, user_id=user_id).first()
        if participant:
            participant.status = 'rejected'
            db.session.commit()
            
        return jsonify({'message': 'Candidato recusado', 'activity': activity.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reject candidate', 'details': str(e)}), 500


@activities_bp.route('/<activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    try:
        current_user_id = get_jwt_identity()
        activity = Activity.query.get(activity_id)
        
        if not activity:
            return jsonify({'error': 'Activity not found'}), 404
            
        if activity.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized to cancel this activity'}), 403
            
        activity.status = 'cancelled'
        db.session.commit()
        
        return jsonify({'message': 'Activity cancelled successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to cancel activity', 'details': str(e)}), 500


@activities_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_activities():
    try:
        current_user_id = get_jwt_identity()
        participations = ActivityParticipant.query.filter_by(user_id=current_user_id).all()
        activity_ids = [p.activity_id for p in participations]
        
        activities = Activity.query.filter(Activity.id.in_(activity_ids)).all()
        return jsonify({
            'activities': [a.to_dict() for a in activities if a.is_active()]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch my activities', 'details': str(e)}), 500
