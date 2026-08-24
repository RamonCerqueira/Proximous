from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import or_, and_

from src.models.user import db, User, Like, Match, Message, Achievement, UserAchievement, record_empathy_points

matching_bp = Blueprint('matching', __name__)

def check_and_award_achievement(user_id, achievement_name):
    """Check if user should receive an achievement and award it"""
    try:
        # Check if user already has this achievement
        achievement = Achievement.query.filter_by(name=achievement_name).first()
        if not achievement:
            return
        
        existing = UserAchievement.query.filter_by(
            user_id=user_id,
            achievement_id=achievement.id
        ).first()
        
        if existing:
            return
        
        # Award the achievement
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement.id
        )
        db.session.add(user_achievement)
        
        # Add empathy points
        record_empathy_points(user_id, 10, 'achievement', f"Conquistou '{achievement.name}'")
        
        db.session.commit()
        return achievement
        
    except Exception as e:
        print(f"Error awarding achievement: {e}")
        return None

@matching_bp.route('/like', methods=['POST'])
@jwt_required()
def send_like():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        receiver_id = data.get('receiver_id')
        like_type = data.get('like_type', 'like')  # like, compliment, icebreaker
        message = data.get('message')
        
        if not receiver_id:
            return jsonify({'error': 'receiver_id is required'}), 400
        
        if receiver_id == current_user_id:
            return jsonify({'error': 'Cannot like yourself'}), 400
        
        # Check if user has at least 2 photos
        if not current_user.has_required_photos():
            return jsonify({
                'error': 'Você precisa ter pelo menos 2 fotos no seu perfil para curtir e dar match.',
                'code': 'PROFILE_PHOTOS_REQUIRED'
            }), 403
        
        # Check if receiver exists and is active
        receiver = User.query.get(receiver_id)
        if not receiver or not receiver.is_active or not receiver.is_visible:
            return jsonify({'error': 'User not found or not available'}), 404
        
        # Check if user can send likes (daily limit for free users)
        if not current_user.can_send_like():
            return jsonify({
                'error': 'Daily like limit reached',
                'message': 'Upgrade to Premium for unlimited likes'
            }), 429
        
        # Check if already liked
        existing_like = Like.query.filter_by(
            sender_id=current_user_id,
            receiver_id=receiver_id
        ).first()
        
        if existing_like:
            return jsonify({'error': 'User already liked'}), 409
        
        # Create the like
        like = Like(
            sender_id=current_user_id,
            receiver_id=receiver_id,
            like_type=like_type,
            message=message
        )
        db.session.add(like)
        
        # Use daily like
        current_user.use_daily_like()
        
        # Check for mutual like (match)
        mutual_like = Like.query.filter_by(
            sender_id=receiver_id,
            receiver_id=current_user_id
        ).first()
        
        is_match = False
        match = None
        
        if mutual_like:
            # Create match
            match = Match(
                user1_id=min(current_user_id, receiver_id),
                user2_id=max(current_user_id, receiver_id)
            )
            db.session.add(match)
            is_match = True
        
        db.session.commit()
        
        # Dispatch Push Notifications and Database Notifications
        from src.utils.push_notifications import send_expo_push_notification
        from src.routes.notifications import create_notification

        if is_match:
            is_super_match = (like_type == 'superlike') or (mutual_like and mutual_like.like_type == 'superlike')
            match_title = "⭐ É UM SUPER MATCH no Proximous!" if is_super_match else "É um Match no Proximous! 🎉"
            
            create_notification(
                user_id=receiver_id,
                title=match_title,
                message=f"Você e {current_user.name} se conectaram!",
                notif_type="super_match" if is_super_match else "match",
                actor_id=current_user_id
            )
            create_notification(
                user_id=current_user_id,
                title=match_title,
                message=f"Você e {receiver.name} se conectaram!",
                notif_type="super_match" if is_super_match else "match",
                actor_id=receiver_id
            )
            send_expo_push_notification(
                receiver_id,
                match_title,
                f"Você e {current_user.name} se conectaram! Mandem um oi agora.",
                {"type": "match", "match_id": match.id}
            )
            # Emit Real-time Socket.IO new_match celebration to both users
            try:
                from src.main import socketio
                if socketio:
                    socketio.emit(
                        'new_match',
                        {
                            'match_id': match.id,
                            'other_user': current_user.to_dict()
                        },
                        to=f"user_{receiver_id}"
                    )
                    socketio.emit(
                        'new_match',
                        {
                            'match_id': match.id,
                            'other_user': receiver.to_dict()
                        },
                        to=f"user_{current_user_id}"
                    )
            except Exception as se:
                print(f"Socket new_match emit error: {se}")
        else:
            if like_type == 'superlike':
                notif_title = "⭐ SUPER LIKE RECEBIDO!"
                msg_body = f"Uau! {current_user.name} te enviou um Super Like no Proximous! ⭐"
            elif like_type == 'compliment':
                notif_title = "Elogio Recebido! 💙"
                msg_body = f"{current_user.name} te enviou um elogio 💙"
            else:
                notif_title = "Nova Curtida Recebida! ❤️"
                msg_body = f"{current_user.name} curtiu seu perfil no Proximous!"

            create_notification(
                user_id=receiver_id,
                title=notif_title,
                message=msg_body,
                notif_type=like_type,
                actor_id=current_user_id
            )
            send_expo_push_notification(
                receiver_id,
                notif_title,
                msg_body,
                {"type": "like", "sender_id": current_user_id}
            )



        # Award achievements
        like_count = Like.query.filter_by(sender_id=current_user_id).count()
        if like_count == 1:
            check_and_award_achievement(current_user_id, 'Primeiro Passo Corajoso')
        
        if like_type == 'compliment':
            compliment_count = Like.query.filter_by(
                sender_id=current_user_id,
                like_type='compliment'
            ).count()
            if compliment_count >= 10:
                check_and_award_achievement(current_user_id, 'Coração Gentil')
        
        response_data = {
            'message': 'Like sent successfully',
            'like': like.to_dict(),
            'is_match': is_match
        }
        
        if is_match:
            response_data['match'] = match.to_dict()
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to send like', 'details': str(e)}), 500

@matching_bp.route('/unlike', methods=['POST'])
@jwt_required()
def unlike():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        receiver_id = data.get('receiver_id')
        
        if not receiver_id:
            return jsonify({'error': 'receiver_id is required'}), 400
        
        # Find the like
        like = Like.query.filter_by(
            sender_id=current_user_id,
            receiver_id=receiver_id
        ).first()
        
        if not like:
            return jsonify({'error': 'Like not found'}), 404
        
        # Check if there's a match and remove it
        match = Match.query.filter(
            or_(
                and_(Match.user1_id == current_user_id, Match.user2_id == receiver_id),
                and_(Match.user1_id == receiver_id, Match.user2_id == current_user_id)
            )
        ).first()
        
        if match:
            db.session.delete(match)
        
        # Remove the like
        db.session.delete(like)
        db.session.commit()
        
        return jsonify({'message': 'Like removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to remove like', 'details': str(e)}), 500

@matching_bp.route('/likes/sent', methods=['GET'])
@jwt_required()
def get_sent_likes():
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        # Get sent likes with pagination
        likes_query = Like.query.filter_by(sender_id=current_user_id).order_by(
            Like.created_at.desc()
        )
        
        likes = likes_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Get receiver information for each like
        likes_data = []
        for like in likes.items:
            like_dict = like.to_dict()
            receiver = User.query.get(like.receiver_id)
            if receiver:
                like_dict['receiver'] = receiver.to_dict()
                
                # Check if it's a match
                mutual_like = Like.query.filter_by(
                    sender_id=like.receiver_id,
                    receiver_id=current_user_id
                ).first()
                like_dict['is_match'] = mutual_like is not None
            
            likes_data.append(like_dict)
        
        return jsonify({
            'likes': likes_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': likes.total,
                'pages': likes.pages,
                'has_next': likes.has_next,
                'has_prev': likes.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get sent likes', 'details': str(e)}), 500

@matching_bp.route('/likes/received', methods=['GET'])
@jwt_required()
def get_received_likes():
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        # Get received likes with pagination
        likes_query = Like.query.filter_by(receiver_id=current_user_id).order_by(
            Like.created_at.desc()
        )
        
        likes = likes_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Get sender information for each like
        likes_data = []
        for like in likes.items:
            like_dict = like.to_dict()
            sender = User.query.get(like.sender_id)
            if sender and sender.is_active and sender.is_visible:
                like_dict['sender'] = sender.to_dict()
                
                # Check if current user has liked back
                mutual_like = Like.query.filter_by(
                    sender_id=current_user_id,
                    receiver_id=like.sender_id
                ).first()
                like_dict['liked_back'] = mutual_like is not None
                like_dict['is_match'] = mutual_like is not None
            
            likes_data.append(like_dict)
        
        return jsonify({
            'likes': likes_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': likes.total,
                'pages': likes.pages,
                'has_next': likes.has_next,
                'has_prev': likes.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get received likes', 'details': str(e)}), 500

@matching_bp.route('/matches', methods=['GET'])
@jwt_required()
def get_matches():
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        # Get matches where current user is involved
        matches_query = Match.query.filter(
            or_(
                Match.user1_id == current_user_id,
                Match.user2_id == current_user_id
            ),
            Match.is_active == True
        ).order_by(Match.created_at.desc())
        
        matches = matches_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Get match information with other user details
        matches_data = []
        for match in matches.items:
            match_dict = match.to_dict()
            
            # Get the other user
            other_user_id = match.user2_id if match.user1_id == current_user_id else match.user1_id
            other_user = User.query.get(other_user_id)
            
            if other_user and other_user.is_active:
                other_dict = other_user.to_dict()
                current_user = User.query.get(current_user_id)
                if current_user and current_user.latitude and current_user.longitude and other_user.latitude and other_user.longitude:
                    from src.routes.users import calculate_distance
                    dist = calculate_distance(current_user.latitude, current_user.longitude, other_user.latitude, other_user.longitude)
                    dist_val = round(dist, 1)
                    other_dict['distance'] = dist_val
                    other_dict['distance_km'] = dist_val
                    other_dict['distance_range'] = User.format_distance_range(dist_val)
                    other_dict['distance_formatted'] = User.format_distance_range(dist_val)
                else:
                    pseudo_offset = (abs(hash(str(other_user.id) + str(current_user_id))) % 40 + 8) / 10.0
                    other_dict['distance'] = pseudo_offset
                    other_dict['distance_km'] = pseudo_offset
                    other_dict['distance_range'] = User.format_distance_range(pseudo_offset)
                    other_dict['distance_formatted'] = User.format_distance_range(pseudo_offset)

                match_dict['other_user'] = other_dict
                
                # Check if this match originated from a Super Like
                superlike = Like.query.filter(
                    or_(
                        and_(Like.sender_id == current_user_id, Like.receiver_id == other_user_id, Like.like_type == 'superlike'),
                        and_(Like.sender_id == other_user_id, Like.receiver_id == current_user_id, Like.like_type == 'superlike')
                    )
                ).first()
                match_dict['is_super_match'] = superlike is not None

                
                # Get last message in this match
                last_message = Message.query.filter_by(match_id=match.id).order_by(
                    Message.created_at.desc()
                ).first()
                
                if last_message:
                    match_dict['last_message'] = last_message.to_dict()
                
                # Count unread messages
                unread_count = Message.query.filter_by(
                    match_id=match.id,
                    receiver_id=current_user_id,
                    is_read=False
                ).count()
                match_dict['unread_messages'] = unread_count
            
            matches_data.append(match_dict)
        
        return jsonify({
            'matches': matches_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': matches.total,
                'pages': matches.pages,
                'has_next': matches.has_next,
                'has_prev': matches.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get matches', 'details': str(e)}), 500

@matching_bp.route('/matches/<match_id>/seen', methods=['POST'])
@jwt_required()
def mark_match_seen(match_id):
    try:
        current_user_id = get_jwt_identity()
        match = Match.query.filter(
            Match.id == match_id,
            or_(
                Match.user1_id == current_user_id,
                Match.user2_id == current_user_id
            )
        ).first()
        
        if not match:
            return jsonify({'error': 'Match not found'}), 404
            
        return jsonify({'message': 'Match marked as seen', 'match_id': match_id}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to mark match as seen', 'details': str(e)}), 500


@matching_bp.route('/matches/<match_id>/unmatch', methods=['POST'])
@jwt_required()
def unmatch(match_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Find the match
        match = Match.query.filter(
            Match.id == match_id,
            or_(
                Match.user1_id == current_user_id,
                Match.user2_id == current_user_id
            )
        ).first()
        
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        # Deactivate the match instead of deleting (for audit purposes)
        match.is_active = False
        
        # Optionally, you might want to delete the mutual likes as well
        # or keep them for potential re-matching
        
        db.session.commit()
        
        return jsonify({'message': 'Unmatched successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to unmatch', 'details': str(e)}), 500

@matching_bp.route('/icebreakers', methods=['GET'])
@jwt_required()
def get_icebreakers():
    try:
        # Get icebreaker suggestions based on user interests and personality
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Default icebreakers
        general_icebreakers = [
            "Oi! Vi que temos interesses em comum. Como foi seu dia?",
            "Olá! Seu perfil me chamou atenção. Que tipo de música você gosta?",
            "Oi! Parece que somos vizinhos. Conhece algum lugar legal por aqui?",
            "Olá! Vi que você gosta de livros. Qual foi o último que te marcou?",
            "Oi! Seu perfil parece muito interessante. O que você gosta de fazer no tempo livre?",
            "Olá! Vi que somos parecidos em algumas coisas. Como você descobriu o Proximous?",
            "Oi! Que coincidência estarmos na mesma região. Tem algum café favorito por aqui?",
            "Olá! Seu perfil me deu uma boa impressão. Qual é sua forma favorita de relaxar?"
        ]
        
        # Personality-based icebreakers
        personality_icebreakers = {
            'shy': [
                "Oi! Também sou meio tímido(a). Como você se sente usando o app?",
                "Olá! Vi que você é tímido(a) como eu. Quer conversar sem pressa?",
                "Oi! Que bom encontrar alguém que me entende. Como foi seu dia?"
            ],
            'introverted': [
                "Oi! Também valorizo conversas mais profundas. O que você anda pensando ultimamente?",
                "Olá! Vi que você é introvertido(a). Prefere lugares calmos também?",
                "Oi! Que legal encontrar alguém que entende a importância do silêncio."
            ],
            'extroverted': [
                "Oi! Vi que você é mais extrovertido(a). Que tipo de atividades você gosta?",
                "Olá! Parece que você gosta de conhecer pessoas. Como tem sido sua experiência aqui?",
                "Oi! Você parece ser uma pessoa interessante. Quer me contar sobre você?"
            ]
        }
        
        # Interest-based icebreakers
        interest_icebreakers = {
            'livros': "Vi que você gosta de livros! Qual gênero você prefere?",
            'música': "Que legal que você gosta de música! Qual estilo você mais escuta?",
            'filmes': "Vi que curte filmes! Qual foi o último que você assistiu?",
            'viagem': "Que incrível que você gosta de viajar! Qual foi seu destino favorito?",
            'culinária': "Vi que você gosta de culinária! Sabe cozinhar alguma coisa especial?",
            'esportes': "Legal que você gosta de esportes! Qual você pratica ou acompanha?",
            'arte': "Que interessante que você gosta de arte! Qual tipo mais te atrai?",
            'natureza': "Vi que você ama a natureza! Tem algum lugar especial que gosta de ir?"
        }
        
        icebreakers = general_icebreakers.copy()
        
        # Add personality-based icebreakers
        if current_user.social_style in personality_icebreakers:
            icebreakers.extend(personality_icebreakers[current_user.social_style])
        
        # Add interest-based icebreakers
        user_interests = current_user.get_interests()
        for interest in user_interests:
            if interest.lower() in interest_icebreakers:
                icebreakers.append(interest_icebreakers[interest.lower()])
        
        return jsonify({'icebreakers': icebreakers}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get icebreakers', 'details': str(e)}), 500

@matching_bp.route('/compliments', methods=['GET'])
@jwt_required()
def get_compliments():
    try:
        # Get compliment suggestions
        compliments = [
            "Seu perfil transmite uma energia muito positiva!",
            "Você parece ser uma pessoa muito interessante.",
            "Gostei muito da sua descrição, muito autêntica!",
            "Seu sorriso é muito cativante!",
            "Você tem um olhar muito expressivo.",
            "Parece ser uma pessoa muito gentil.",
            "Seu perfil mostra que você é uma pessoa única.",
            "Você transmite muita sinceridade.",
            "Gostei da sua forma de se expressar.",
            "Você parece ter uma personalidade muito especial.",
            "Seu perfil me chamou atenção pela autenticidade.",
            "Você tem uma vibe muito acolhedora.",
            "Parece ser uma pessoa muito empática.",
            "Gostei muito dos seus interesses!",
            "Você transmite muita paz e tranquilidade."
        ]
        
        return jsonify({'compliments': compliments}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get compliments', 'details': str(e)}), 500

@matching_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_matching_stats():
    try:
        current_user_id = get_jwt_identity()
        
        # Calculate matching statistics
        likes_sent = Like.query.filter_by(sender_id=current_user_id).count()
        likes_received = Like.query.filter_by(receiver_id=current_user_id).count()
        
        # Count matches
        matches_count = Match.query.filter(
            or_(
                Match.user1_id == current_user_id,
                Match.user2_id == current_user_id
            ),
            Match.is_active == True
        ).count()
        
        # Calculate match rate
        match_rate = 0
        if likes_sent > 0:
            match_rate = round((matches_count / likes_sent) * 100, 1)
        
        # Count compliments sent and received
        compliments_sent = Like.query.filter_by(
            sender_id=current_user_id,
            like_type='compliment'
        ).count()
        
        compliments_received = Like.query.filter_by(
            receiver_id=current_user_id,
            like_type='compliment'
        ).count()
        
        stats = {
            'likes_sent': likes_sent,
            'likes_received': likes_received,
            'matches': matches_count,
            'match_rate': match_rate,
            'compliments_sent': compliments_sent,
            'compliments_received': compliments_received
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get matching stats', 'details': str(e)}), 500

