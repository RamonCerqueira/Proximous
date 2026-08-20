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

@activities_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_activity_categories():
    try:
        # Get all distinct categories from active activities in DB
        now = datetime.utcnow()
        active_cats = db.session.query(Activity.category).filter(
            Activity.status == 'active',
            Activity.expires_at > now
        ).distinct().all()
        
        db_categories = [c[0] for c in active_cats if c[0]]
        
        # Popular dynamic defaults / trending suggestions
        popular_defaults = [
            '☕ Café & Papo',
            '🍻 Drinks & Bar',
            '🎾 Beach Tennis',
            '🏃 Corrida & Trilha',
            '🍿 Cinema & Pipoca',
            '🍕 Jantar & Gastro',
            '🎸 Música & Jam',
            '🐶 Passeio com Pets',
            '🎮 Board Games & Jogos',
            '🎨 Museu & Arte',
            '🛹 Skate no Parque',
            '🍣 Rodízio & Sushi',
            '📚 Estudo & Coworking',
            '🧘 Yoga & Bem-Estar',
        ]
        
        # Combine unique categories
        all_unique = list(dict.fromkeys(db_categories + popular_defaults))
        
        return jsonify({'categories': all_unique}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch categories', 'details': str(e)}), 500


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
        
        if category and category.lower() != 'all':
            clean_cat = category.strip()
            query = query.filter(Activity.category.ilike(f"%{clean_cat}%"))
            
        all_activities = query.order_by(Activity.created_at.desc()).all()
        nearby_activities = []
        
        for activity in all_activities:
            act_data = activity.to_dict()
            if current_user.latitude and current_user.longitude and activity.latitude and activity.longitude:
                dist = haversine(current_user.latitude, current_user.longitude, activity.latitude, activity.longitude)
                if dist <= radius:
                    act_data['distance_km'] = round(dist, 1)
                    act_data['distance_range'] = User.format_distance_range(dist)
                    nearby_activities.append(act_data)
            else:
                act_data['distance_km'] = 2.5
                act_data['distance_range'] = "A menos de 5 km"
                nearby_activities.append(act_data)
        
        # If no activities in DB yet, generate contextual nearby activities based on user's location
        if len(nearby_activities) == 0:
            user_city = current_user.location_city or "Sua Região"
            mock_seeds = [
                {
                    'id': 'act_seed_1',
                    'user_id': 'seed_u1',
                    'creator_name': 'Camila Rocha',
                    'creator_photo': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                    'category': '☕ Café & Papo',
                    'title': 'Café Especial & Bate-Papo no Fim de Tarde',
                    'description': 'Procurando alguém para tomar um bom expresso artesanal e conversar sobre viagens, livros ou tecnologia.',
                    'location_name': f'Cafeteria Central • {user_city}',
                    'scheduled_time': 'Hoje às 17:30',
                    'distance_km': 1.2,
                    'distance_range': '1,2 km de você',
                    'max_participants': 2,
                    'participant_count': 1,
                    'participants': [],
                    'created_at': (datetime.utcnow() - timedelta(minutes=25)).isoformat(),
                    'is_active': True,
                    'photo_url': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
                },
                {
                    'id': 'act_seed_2',
                    'user_id': 'seed_u2',
                    'creator_name': 'Gabriel Matos',
                    'creator_photo': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                    'category': '🍻 Drinks & Bar',
                    'title': 'Rooftop Bar & Drinks pós-trabalho',
                    'description': 'Música boa, drinks autorais e clima descontraído para relaxar no início da noite.',
                    'location_name': f'Lounge & Rooftop • {user_city}',
                    'scheduled_time': 'Hoje às 19:45',
                    'distance_km': 2.8,
                    'distance_range': '2,8 km de você',
                    'max_participants': 4,
                    'participant_count': 2,
                    'participants': [],
                    'created_at': (datetime.utcnow() - timedelta(minutes=50)).isoformat(),
                    'is_active': True,
                    'photo_url': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
                },
                {
                    'id': 'act_seed_3',
                    'user_id': 'seed_u3',
                    'creator_name': 'Fernanda Lima',
                    'creator_photo': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
                    'category': '🎾 Beach Tennis',
                    'title': 'Partida de Beach Tennis em Dupla',
                    'description': 'Aluguei a quadra de areia para um jogo descontraído. Falta uma pessoa para fechar a dupla!',
                    'location_name': f'Arena Beach Sports • {user_city}',
                    'scheduled_time': 'Hoje às 18:00',
                    'distance_km': 1.6,
                    'distance_range': '1,6 km de você',
                    'max_participants': 4,
                    'participant_count': 3,
                    'participants': [],
                    'created_at': (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
                    'is_active': True,
                    'photo_url': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80'
                },
                {
                    'id': 'act_seed_4',
                    'user_id': 'seed_u4',
                    'creator_name': 'Lucas Azevedo',
                    'creator_photo': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                    'category': '🍿 Cinema & Pipoca',
                    'title': 'Sessão Cinema IMAX & Pipoca',
                    'description': 'Assistir lançamento no cinema e depois comentar o filme em uma lanchonete bacana.',
                    'location_name': f'Shopping Cinema • {user_city}',
                    'scheduled_time': 'Hoje às 20:30',
                    'distance_km': 4.2,
                    'distance_range': '4,2 km de você',
                    'max_participants': 3,
                    'participant_count': 1,
                    'participants': [],
                    'created_at': (datetime.utcnow() - timedelta(minutes=75)).isoformat(),
                    'is_active': True,
                    'photo_url': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
                },
                {
                    'id': 'act_seed_5',
                    'user_id': 'seed_u5',
                    'creator_name': 'Juliana Ramos',
                    'creator_photo': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
                    'category': '🍕 Jantar & Gastro',
                    'title': 'Pizzaria Artesanal & Vinhos',
                    'description': 'Lugar aconchegante com pizza de fermentação natural e bons vinhos. Venha com boa energia!',
                    'location_name': f'Trattoria & Forno • {user_city}',
                    'scheduled_time': 'Hoje às 20:00',
                    'distance_km': 1.9,
                    'distance_range': '1,9 km de você',
                    'max_participants': 4,
                    'participant_count': 2,
                    'participants': [],
                    'created_at': (datetime.utcnow() - timedelta(minutes=40)).isoformat(),
                    'is_active': True,
                    'photo_url': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'
                },
                {
                    'id': 'act_seed_6',
                    'user_id': 'seed_u6',
                    'creator_name': 'Mateus Silveira',
                    'creator_photo': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
                    'category': '🐶 Passeio com Pets',
                    'title': 'Encontro de Cachorros no Parque Canino',
                    'description': 'Levar os pets para brincar e socializar na praça. Todos os portes são bem-vindos!',
                    'location_name': f'Parcão Municipal • {user_city}',
                    'scheduled_time': 'Hoje às 16:30',
                    'distance_km': 2.1,
                    'distance_range': '2,1 km de você',
                    'max_participants': 5,
                    'participant_count': 2,
                    'participants': [],
                    'created_at': (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                    'is_active': True,
                    'photo_url': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'
                },
                {
                    'id': 'act_seed_7',
                    'user_id': 'seed_u7',
                    'creator_name': 'Amanda Rios',
                    'creator_photo': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
                    'category': '🎸 Música & Jam',
                    'title': 'Jam Acústica / Violão no Parque',
                    'description': 'Leve seu instrumento (violão, cajón, ukelele) ou só venha ouvir um bom som ao ar livre.',
                    'location_name': f'Gramado do Parque • {user_city}',
                    'scheduled_time': 'Hoje às 17:00',
                    'distance_km': 3.3,
                    'distance_range': '3,3 km de você',
                    'max_participants': 6,
                    'participant_count': 3,
                    'participants': [],
                    'created_at': (datetime.utcnow() - timedelta(minutes=60)).isoformat(),
                    'is_active': True,
                    'photo_url': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
                },
                {
                    'id': 'act_seed_8',
                    'user_id': 'seed_u8',
                    'creator_name': 'Diego Ferreira',
                    'creator_photo': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
                    'category': '🎮 Board Games & Jogos',
                    'title': 'Noite de Jogos de Tabuleiro & Hamburguer',
                    'description': 'Catan, Dixit e Exploding Kittens em luderia especializada. Ensino a jogar para quem nunca jogou!',
                    'location_name': f'Luderia & Burgers • {user_city}',
                    'scheduled_time': 'Hoje às 19:00',
                    'distance_km': 2.7,
                    'distance_range': '2,7 km de você',
                    'max_participants': 4,
                    'participant_count': 2,
                    'participants': [],
                    'created_at': (datetime.utcnow() - timedelta(minutes=45)).isoformat(),
                    'is_active': True,
                    'photo_url': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80'
                }
            ]
            
            if category and category.lower() != 'all':
                clean = category.lower().strip()
                mock_seeds = [s for s in mock_seeds if clean in s['category'].lower() or clean in s['title'].lower()]
                
            nearby_activities = [s for s in mock_seeds if s['distance_km'] <= radius]
                
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
            photo_url=data.get('photo_url'),
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
        participated_act_ids = [p.activity_id for p in participations]
        
        # All activities created by the current user
        created_acts = Activity.query.filter_by(user_id=current_user_id).order_by(Activity.created_at.desc()).all()
        created_ids = [a.id for a in created_acts]
        
        all_ids = list(set(participated_act_ids + created_ids))
        all_activities = Activity.query.filter(Activity.id.in_(all_ids)).order_by(Activity.created_at.desc()).all() if all_ids else []
        
        created_list = []
        requested_list = []
        pending_requests_to_me = 0
        
        for act in all_activities:
            act_dict = act.to_dict()
            if act.user_id == current_user_id:
                # Count pending requests from other users
                for p in act.participants:
                    if p.user_id != current_user_id and getattr(p, 'status', 'pending') == 'pending':
                        pending_requests_to_me += 1
                created_list.append(act_dict)
            else:
                # Activity created by someone else that current user requested to join
                my_part = next((p for p in act.participants if p.user_id == current_user_id), None)
                act_dict['my_status'] = getattr(my_part, 'status', 'pending') if my_part else 'pending'
                act_dict['my_joined_at'] = my_part.joined_at.isoformat() if my_part and my_part.joined_at else None
                requested_list.append(act_dict)
                
        return jsonify({
            'created_activities': created_list,
            'requested_activities': requested_list,
            'pending_requests_count': pending_requests_to_me,
            'activities': [a.to_dict() for a in all_activities if a.is_active()]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch my activities', 'details': str(e)}), 500
