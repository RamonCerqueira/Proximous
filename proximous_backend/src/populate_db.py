import os
import sys

# DON'T CHANGE THIS: ensure src module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta
import json
from src.main import app
from src.models.user import db, User, Like, Match, Message, Achievement, UserAchievement
from src.models.moment import Moment, MomentLike
from src.models.admin import Admin
from src.models.subscription import SubscriptionPlan

def seed_database():
    print("[1/5] Iniciando o povoamento do Banco de Dados Proximous...")

    with app.app_context():
        # Clean existing tables
        print("[2/5] Limpando e recriando tabelas...")
        db.drop_all()
        db.create_all()

        # 1. ADMIN USER
        admin = Admin(
            email='admin@proximous.com',
            name='Administrador Principal',
            role='super_admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)

        # 2. ACHIEVEMENTS
        achievements_data = [
            {'name': 'Primeiro Passo', 'description': 'Criou seu perfil no Proximous', 'icon': 'Sparkles', 'category': 'milestone'},
            {'name': 'Empático', 'description': 'Alcançou 300+ pontos de empatia', 'icon': 'Heart', 'category': 'engagement'},
            {'name': 'Explorador Urbano', 'description': 'Conectou-se em 3 bairros diferentes', 'icon': 'MapPin', 'category': 'social'},
            {'name': 'Construtor de Pontes', 'description': 'Enviou mais de 5 mensagens em conexões reais', 'icon': 'MessageCircle', 'category': 'engagement'}
        ]
        
        created_achievements = {}
        for a_data in achievements_data:
            ach = Achievement(
                name=a_data['name'],
                description=a_data['description'],
                icon=a_data['icon'],
                category=a_data['category']
            )
            db.session.add(ach)
            db.session.flush()
            created_achievements[a_data['name']] = ach

        # 3. SUBSCRIPTION PLANS
        plans_data = [
            {'name': 'Proximous Mensal', 'price': 29.90, 'plan_type': 'monthly', 'features': ['Curtidas ilimitadas', 'Ver quem te curtiu', 'Filtros avançados']},
            {'name': 'Proximous Anual', 'price': 19.90, 'plan_type': 'annual', 'features': ['Todos os recursos Pro', 'Economia de 40%', 'Destaque no algoritmo']}
        ]
        for p in plans_data:
            plan = SubscriptionPlan(
                name=p['name'],
                price=p['price'],
                plan_type=p['plan_type'],
                features=json.dumps(p['features'])
            )
            db.session.add(plan)

        # 4. USERS
        print("[3/5] Cadastrando usuarios reais no banco...")
        users_raw = [
            {
                'email': 'teste@test.com',
                'name': 'Ramon Teste',
                'age': 32,
                'gender': 'male',
                'looking_for': 'all',
                'social_style': 'extroverted',
                'bio': 'Desenvolvedor apaixonado por café, boas conversas e tecnologias que conectam pessoas reais.',
                'city': 'São Paulo',
                'lat': -23.5505,
                'lon': -46.6333,
                'empathy_points': 340,
                'photos': [
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500'
                ],
                'interests': ['Música', 'Cinema', 'Tecnologia', 'Viagens', 'Gastronomia'],
                'personality_tags': ['Extrovertido', 'Criativo', 'Empático', 'Comunicativo']
            },
            {
                'email': 'mariana@proximous.com',
                'name': 'Mariana Silva',
                'age': 25,
                'gender': 'female',
                'looking_for': 'male',
                'social_style': 'introverted',
                'bio': 'Adoro música MPB, café especial e caminhadas tranquilas no parque no fim de semana.',
                'city': 'São Paulo',
                'lat': -23.5512,
                'lon': -46.6342,
                'empathy_points': 420,
                'photos': [
                    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
                ],
                'interests': ['Café', 'Música', 'Livros', 'Fotografia', 'Yoga'],
                'personality_tags': ['Gentil', 'Calma', 'Atenciosa', 'Criativa']
            },
            {
                'email': 'lucas@proximous.com',
                'name': 'Lucas Santos',
                'age': 28,
                'gender': 'male',
                'looking_for': 'female',
                'social_style': 'extroverted',
                'bio': 'Fotógrafo urbano, praticante de corrida e amante de culinária italiana.',
                'city': 'São Paulo',
                'lat': -23.5545,
                'lon': -46.6385,
                'empathy_points': 280,
                'photos': [
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500'
                ],
                'interests': ['Fotografia', 'Corrida', 'Gastronomia', 'Cinema', 'Tecnologia'],
                'personality_tags': ['Extrovertido', 'Energético', 'Curioso']
            },
            {
                'email': 'camila@proximous.com',
                'name': 'Camila Rocha',
                'age': 24,
                'gender': 'female',
                'looking_for': 'all',
                'social_style': 'ambiverted',
                'bio': 'Designer UX/UI apaixonada por arte moderna, exposições e viagens de mochila.',
                'city': 'São Paulo',
                'lat': -23.5605,
                'lon': -46.6455,
                'empathy_points': 510,
                'photos': [
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500'
                ],
                'interests': ['Design', 'Arte', 'Viagens', 'Música', 'Tecnologia'],
                'personality_tags': ['Criativa', 'Observadora', 'Empática', 'Inspiradora']
            },
            {
                'email': 'beatriz@proximous.com',
                'name': 'Beatriz Oliveira',
                'age': 27,
                'gender': 'female',
                'looking_for': 'all',
                'social_style': 'introverted',
                'bio': 'Desenvolvedora de jogos, entusiasta de ficção científica e tutora de dois gatos fofos.',
                'city': 'São Paulo',
                'lat': -23.5855,
                'lon': -46.6705,
                'empathy_points': 390,
                'photos': [
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
                    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500'
                ],
                'interests': ['Gaming', 'Sci-Fi', 'Programação', 'Animes', 'Café'],
                'personality_tags': ['Inteligente', 'Tímida', 'Focada', 'Empática']
            },
            {
                'email': 'gabriel@proximous.com',
                'name': 'Gabriel Lima',
                'age': 30,
                'gender': 'male',
                'looking_for': 'female',
                'social_style': 'extroverted',
                'bio': 'Arquiteto, aficionado por música ao vivo, festivais de jazz e passeios de bicicleta.',
                'city': 'São Paulo',
                'lat': -23.5705,
                'lon': -46.6555,
                'empathy_points': 310,
                'photos': [
                    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'
                ],
                'interests': ['Arquitetura', 'Jazz', 'Ciclismo', 'Cerveja Artesanal', 'Viagens'],
                'personality_tags': ['Sociável', 'Aventureiro', 'Alegre']
            }
        ]

        user_objects = {}
        for u_data in users_raw:
            user = User(
                email=u_data['email'],
                name=u_data['name'],
                age=u_data['age'],
                gender=u_data['gender'],
                looking_for=u_data['looking_for'],
                social_style=u_data['social_style'],
                bio=u_data['bio'],
                location_city=u_data['city'],
                latitude=u_data['lat'],
                longitude=u_data['lon'],
                empathy_points=u_data['empathy_points'],
                profile_photo_url=u_data['photos'][0],
                is_premium=True,
                status='available'
            )
            user.set_password('Password123')
            user.set_photos(u_data['photos'])
            user.set_interests(u_data['interests'])
            user.set_personality_tags(u_data['personality_tags'])
            db.session.add(user)
            db.session.flush()
            user_objects[u_data['email']] = user

            # Award default achievement
            if 'Primeiro Passo' in created_achievements:
                ua = UserAchievement(user_id=user.id, achievement_id=created_achievements['Primeiro Passo'].id)
                db.session.add(ua)

        main_user = user_objects['teste@test.com']
        mariana = user_objects['mariana@proximous.com']
        camila = user_objects['camila@proximous.com']
        beatriz = user_objects['beatriz@proximous.com']
        lucas = user_objects['lucas@proximous.com']
        gabriel = user_objects['gabriel@proximous.com']

        # 5. LIKES & MATCHES
        print("[4/5] Gerando matches e curtidas mútua entre perfis...")
        match_targets = [mariana, camila, beatriz]
        for target in match_targets:
            like1 = Like(sender_id=main_user.id, receiver_id=target.id, like_type='like')
            like2 = Like(sender_id=target.id, receiver_id=main_user.id, like_type='like')
            db.session.add(like1)
            db.session.add(like2)
            db.session.flush()

            match = Match(
                user1_id=min(main_user.id, target.id),
                user2_id=max(main_user.id, target.id)
            )
            db.session.add(match)
            db.session.flush()

            # 6. MESSAGES FOR MATCHES
            msgs = [
                (target.id, main_user.id, f"Oi {main_user.name}! Que legal nos conectarmos por aqui!"),
                (main_user.id, target.id, f"Ola {target.name}! Tudo otimo por aqui. Vi que voce tambem gosta de cafe!"),
                (target.id, main_user.id, "Sim! Adoro cafes especiais no centro. Qual o seu lugar favorito?")
            ]
            for s_id, r_id, content in msgs:
                m = Message(
                    sender_id=s_id,
                    receiver_id=r_id,
                    match_id=match.id,
                    content=content,
                    is_read=True
                )
                db.session.add(m)

        # Pending Received Likes (Lucas & Gabriel liked main_user)
        db.session.add(Like(sender_id=lucas.id, receiver_id=main_user.id, like_type='compliment', message="Adorei o seu perfil!"))
        db.session.add(Like(sender_id=gabriel.id, receiver_id=main_user.id, like_type='icebreaker'))

        # 7. MOMENTS (FEED POSTS)
        print("[5/5] Publicando momentos reais no feed...")
        moments_data = [
            (
                mariana.id,
                "Domingo ensolarado no Parque do Ibirapuera! Quem mais aproveitou o dia para ler ao ar livre?",
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600",
                14
            ),
            (
                camila.id,
                "Exposicao nova de arte contemporanea imperdivel no MASP. Recomendo demais a visita!",
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600",
                22
            ),
            (
                main_user.id,
                "Cafe coado de grao especial para comecar o projeto da semana com energia total!",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
                18
            )
        ]

        for u_id, content, photo, likes in moments_data:
            moment = Moment(
                user_id=u_id,
                content=content,
                photo_url=photo,
                likes_count=likes
            )
            db.session.add(moment)

        db.session.commit()
        print("[SUCESSO] Banco de dados populado com sucesso com dados reais do Proximous!")

if __name__ == '__main__':
    seed_database()
