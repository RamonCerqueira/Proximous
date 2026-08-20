import os
import sys
from datetime import datetime, timedelta
import json

# Ensure src module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app
from src.models.user import db, User, Like, Match, Message, Achievement, UserAchievement
from src.models.activity import Activity, ActivityParticipant
from src.models.moment import Moment, MomentLike
from src.models.admin import Admin
from src.models.subscription import SubscriptionPlan

def seed_database():
    print("=" * 60)
    print("🚀 INICIANDO POVOAMENTO DO BANCO DE DADOS PROXIMOUS (SALVADOR/BA)")
    print("=" * 60)

    with app.app_context():
        # Clean existing tables and recreate
        print("\n[1/6] Recriando tabelas...")
        db.drop_all()
        db.create_all()

        # 1. ADMINS
        print("[2/6] Criando administradores...")
        ramon_admin = Admin(
            email='ramon@proximous.com',
            name='Ramon Cerqueira',
            role='super_admin'
        )
        ramon_admin.set_password('141120Rj.')
        db.session.add(ramon_admin)

        system_admin = Admin(
            email='admin@proximous.com',
            name='Administrador Master',
            role='super_admin'
        )
        system_admin.set_password('141120Rj.')
        db.session.add(system_admin)

        # 2. ACHIEVEMENTS
        print("[3/6] Criando conquistas e planos...")
        achievements_data = [
            {'name': 'Primeiro Passo', 'description': 'Criou seu perfil VIP no Proximous', 'icon': 'Sparkles', 'category': 'milestone'},
            {'name': 'Empático de Elite', 'description': 'Alcançou 900+ pontos de empatia', 'icon': 'Heart', 'category': 'engagement'},
            {'name': 'Explorador de Salvador', 'description': 'Conectou-se no Rio Vermelho, Barra e Pituba', 'icon': 'MapPin', 'category': 'social'},
            {'name': 'Criador de Rolês', 'description': 'Criou encontros ao vivo no Radar', 'icon': 'Flame', 'category': 'social'},
            {'name': 'Mestre das Conexões', 'description': 'Mais de 10 matches com conversas ativas', 'icon': 'MessageCircle', 'category': 'engagement'}
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
            {'name': 'Proximous Black Mensal', 'price': 39.90, 'plan_type': 'monthly', 'features': ['Radar Ilimitado 25km', 'Ver quem te curtiu', 'Criação ilimitada de Rolês', 'Selo VIP']},
            {'name': 'Proximous Black Anual', 'price': 24.90, 'plan_type': 'annual', 'features': ['Todos os recursos VIP', 'Economia de 45%', 'Destaque prioritário no Radar']}
        ]
        for p in plans_data:
            plan = SubscriptionPlan(
                name=p['name'],
                price=p['price'],
                plan_type=p['plan_type'],
                features=json.dumps(p['features'])
            )
            db.session.add(plan)

        # 4. USERS EM SALVADOR/BA
        print("[4/6] Cadastrando usuários reais de Salvador/BA...")
        users_raw = [
            # USUÁRIO PRINCIPAL COM TODOS OS PRIVILÉGIOS (RAMON CERQUEIRA)
            {
                'email': 'ramon@proximous.com',
                'name': 'Ramon Cerqueira',
                'password': '141120Rj.',
                'age': 33,
                'gender': 'male',
                'looking_for': 'all',
                'social_style': 'extroverted',
                'bio': 'Fundador & Desenvolvedor do Proximous. Apaixonado por tecnologia, bons cafés no Rio Vermelho, negócios e esportes.',
                'city': 'Salvador',
                'lat': -12.9866,
                'lon': -38.4907, # Rio Vermelho
                'empathy_points': 980,
                'is_verified': True,
                'is_premium': True,
                'status_text': 'Tomando um café no Rio Vermelho ☕ • Bora trocar uma ideia!',
                'photos': [
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
                ],
                'interests': ['Tecnologia', 'Café', 'Beach Tennis', 'Negócios', 'Música', 'Viagens'],
                'personality_tags': ['Fundador', 'Criativo', 'Extrovertido', 'Empático', 'Visionário']
            },
            # USUÁRIOS NO RADAR DE SALVADOR
            {
                'email': 'camila@proximous.com',
                'name': 'Camila Rocha',
                'password': 'Password123',
                'age': 26,
                'gender': 'female',
                'looking_for': 'all',
                'social_style': 'ambiverted',
                'bio': 'Designer UX/UI apaixonada por arte moderna, exposições e um café especial no fim de tarde.',
                'city': 'Salvador',
                'lat': -12.9860,
                'lon': -38.4890, # Rio Vermelho (1.2 km)
                'empathy_points': 540,
                'is_verified': True,
                'is_premium': True,
                'status_text': 'Disponível para um café no Rio Vermelho ☕',
                'photos': [
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
                ],
                'interests': ['Café', 'Design', 'Praia', 'Arte', 'Viagens'],
                'personality_tags': ['Criativa', 'Sociável', 'Alegre', 'Inspiradora']
            },
            {
                'email': 'lucas@proximous.com',
                'name': 'Lucas Santos',
                'password': 'Password123',
                'age': 28,
                'gender': 'male',
                'looking_for': 'female',
                'social_style': 'extroverted',
                'bio': 'Fotógrafo e amante da orla de Salvador. Sempre pronto para um pôr do sol na Barra ou drinks descontraídos.',
                'city': 'Salvador',
                'lat': -13.0098,
                'lon': -38.5312, # Barra (2.1 km)
                'empathy_points': 420,
                'is_verified': True,
                'is_premium': True,
                'status_text': 'Passeio e água de coco na Barra 🥥',
                'photos': [
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
                ],
                'interests': ['Fotografia', 'Sunset', 'Corrida', 'Drinks', 'Música'],
                'personality_tags': ['Comunicativo', 'Esportivo', 'Amigável']
            },
            {
                'email': 'beatriz@proximous.com',
                'name': 'Beatriz Costa',
                'password': 'Password123',
                'age': 24,
                'gender': 'female',
                'looking_for': 'all',
                'social_style': 'extroverted',
                'bio': 'Praticante de Beach Tennis e apaixonada pela energia de Salvador. Bora jogar uma partida ou tomar um vinho!',
                'city': 'Salvador',
                'lat': -12.9972,
                'lon': -38.4590, # Pituba (2.5 km)
                'empathy_points': 610,
                'is_verified': True,
                'is_premium': True,
                'status_text': 'Treino de Beach Tennis na orla 🎾',
                'photos': [
                    'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
                ],
                'interests': ['Beach Tennis', 'Crossfit', 'Gastronomia', 'Vinhos'],
                'personality_tags': ['Determinada', 'Extrovertida', 'Fitness']
            },
            {
                'email': 'joao@proximous.com',
                'name': 'João Silva',
                'password': 'Password123',
                'age': 29,
                'gender': 'male',
                'looking_for': 'female',
                'social_style': 'introverted',
                'bio': 'Desenvolvedor mobile, fã de cinema IMAX, games de estratégia e rodízio de sushi.',
                'city': 'Salvador',
                'lat': -12.9877,
                'lon': -38.4722, # Caminho das Árvores (2.8 km)
                'empathy_points': 390,
                'is_verified': True,
                'is_premium': True,
                'status_text': 'Cinema e almoço no Salvador Shopping 🍿',
                'photos': [
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
                ],
                'interests': ['Cinema', 'Tecnologia', 'Games', 'Sushi'],
                'personality_tags': ['Tranquilo', 'Geek', 'Bem-humorado']
            },
            {
                'email': 'ana@proximous.com',
                'name': 'Ana Lima',
                'password': 'Password123',
                'age': 25,
                'gender': 'female',
                'looking_for': 'all',
                'social_style': 'ambiverted',
                'bio': 'Historiadora e amante do Centro Histórico. Adoro bater papo nas escadarias do Santo Antônio ao entardecer.',
                'city': 'Salvador',
                'lat': -12.9667,
                'lon': -38.5042, # Santo Antônio Além do Carmo (3.1 km)
                'empathy_points': 480,
                'is_verified': True,
                'is_premium': True,
                'status_text': 'Sunset no Santo Antônio 🌅',
                'photos': [
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
                ],
                'interests': ['Arte', 'Música ao Vivo', 'Café Especial', 'História'],
                'personality_tags': ['Cultural', 'Autêntica', 'Simpática']
            },
            {
                'email': 'juliana@proximous.com',
                'name': 'Juliana Ramos',
                'password': 'Password123',
                'age': 27,
                'gender': 'female',
                'looking_for': 'all',
                'social_style': 'introverted',
                'bio': 'Bióloga marinha e tutora de golden retriever. Amo praia calma, yoga matinal e café coado.',
                'city': 'Salvador',
                'lat': -13.0065,
                'lon': -38.5100, # Ondina (1.8 km)
                'empathy_points': 520,
                'is_verified': True,
                'is_premium': True,
                'status_text': 'Passeio com pets na praça 🐶',
                'photos': [
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
                ],
                'interests': ['Pets', 'Natureza', 'Yoga', 'Leitura'],
                'personality_tags': ['Carinhosa', 'Empática', 'Zen']
            },
            {
                'email': 'gabriel@proximous.com',
                'name': 'Gabriel Matos',
                'password': 'Password123',
                'age': 30,
                'gender': 'male',
                'looking_for': 'female',
                'social_style': 'extroverted',
                'bio': 'Arquiteto, apaixonado por gastronomia autoral, jazz e drinks bem preparados.',
                'city': 'Salvador',
                'lat': -12.9800,
                'lon': -38.4800, # Horto Florestal (1.5 km)
                'empathy_points': 450,
                'is_verified': True,
                'is_premium': True,
                'status_text': 'Drinks artesanais e jazz 🍸',
                'photos': [
                    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80'
                ],
                'interests': ['Jazz', 'Drinks', 'Culinária', 'Arquitetura'],
                'personality_tags': ['Sofisticado', 'Gourmet', 'Acolhedor']
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
                is_verified=u_data.get('is_verified', True),
                is_premium=u_data.get('is_premium', True),
                status='available',
                available_until=datetime.utcnow() + timedelta(hours=8),
                current_status_text=u_data.get('status_text', 'Disponível no Radar ⚡')
            )
            user.set_password(u_data['password'])
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

        ramon = user_objects['ramon@proximous.com']
        camila = user_objects['camila@proximous.com']
        lucas = user_objects['lucas@proximous.com']
        beatriz = user_objects['beatriz@proximous.com']
        joao = user_objects['joao@proximous.com']
        ana = user_objects['ana@proximous.com']
        juliana = user_objects['juliana@proximous.com']
        gabriel = user_objects['gabriel@proximous.com']

        # 5. ATIVIDADES & ROLÊS EM SALVADOR/BA
        print("[5/6] Criando Rolês & Convites em Salvador/BA...")
        activities_data = [
            {
                'user': camila,
                'category': '☕ Café & Papo',
                'title': 'Café Especial no Cafelier & Bate-Papo',
                'description': 'Bora tomar um expresso artesanal no Santo Antônio com vista para a Baía de Todos os Santos e colocar o papo em dia! ☕✨',
                'location_name': 'Cafelier Santo Antônio • Salvador, BA',
                'scheduled_time': 'Hoje às 16:30',
                'lat': -12.9667,
                'lon': -38.5042,
                'max_participants': 3,
                'photo_url': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
                'duration_hours': 6
            },
            {
                'user': lucas,
                'category': '🍻 Drinks & Bar',
                'title': 'Drinks & Sunset no Farol da Barra',
                'description': 'Música boa, drinks gelados e o melhor pôr do sol de Salvador na orla da Barra! 🍸🌅',
                'location_name': 'Farol da Barra • Salvador, BA',
                'scheduled_time': 'Hoje às 18:00',
                'lat': -13.0098,
                'lon': -38.5312,
                'max_participants': 5,
                'photo_url': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
                'duration_hours': 8
            },
            {
                'user': beatriz,
                'category': '🎾 Beach Tennis',
                'title': 'Partida de Beach Tennis no Porto',
                'description': 'Aluguei a quadra de areia no Porto da Barra para uma partida descontraída em duplas. Falta 1 pessoa!',
                'location_name': 'Porto da Barra • Salvador, BA',
                'scheduled_time': 'Hoje às 17:30',
                'lat': -13.0030,
                'lon': -38.5310,
                'max_participants': 4,
                'photo_url': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
                'duration_hours': 4
            },
            {
                'user': joao,
                'category': '🍿 Cinema & Pipoca',
                'title': 'Sessão Cinema IMAX & Pipoca',
                'description': 'Assistir ao lançamento da semana no cinema IMAX do Salvador Shopping e depois comer algo bacana.',
                'location_name': 'Salvador Shopping • Salvador, BA',
                'scheduled_time': 'Hoje às 20:30',
                'lat': -12.9877,
                'lon': -38.4722,
                'max_participants': 4,
                'photo_url': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
                'duration_hours': 6
            },
            {
                'user': gabriel,
                'category': '🍕 Pizza & Gastro',
                'title': 'Pizzaria Artesanal no Rio Vermelho',
                'description': 'Pizzas de longa fermentação, carta de vinhos e bom papo no coração do Rio Vermelho.',
                'location_name': 'Largo de Santana, Rio Vermelho • Salvador, BA',
                'scheduled_time': 'Hoje às 20:00',
                'lat': -12.9866,
                'lon': -38.4907,
                'max_participants': 4,
                'photo_url': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
                'duration_hours': 6
            }
        ]

        for act_info in activities_data:
            act = Activity(
                user_id=act_info['user'].id,
                category=act_info['category'],
                title=act_info['title'],
                description=act_info['description'],
                location_name=act_info['location_name'],
                scheduled_time=act_info['scheduled_time'],
                latitude=act_info['lat'],
                longitude=act_info['lon'],
                max_participants=act_info['max_participants'],
                photo_url=act_info['photo_url'],
                expires_at=datetime.utcnow() + timedelta(hours=act_info['duration_hours']),
                status='active'
            )
            db.session.add(act)
            db.session.flush()

            # Add creator as approved participant
            part = ActivityParticipant(activity_id=act.id, user_id=act_info['user'].id, status='approved')
            db.session.add(part)

            # Add Ramon as participant in one of them
            if act_info['category'] == '☕ Café & Papo':
                db.session.add(ActivityParticipant(activity_id=act.id, user_id=ramon.id, status='approved'))

        # 6. MATCHES, MENSAGENS & MOMENTOS
        print("[6/6] Gerando conexões, mensagens e momentos reais...")
        
        # Matches com Ramon
        vip_matches = [camila, beatriz, ana]
        for m_user in vip_matches:
            like_sent = Like(sender_id=ramon.id, receiver_id=m_user.id, like_type='like')
            like_recv = Like(sender_id=m_user.id, receiver_id=ramon.id, like_type='like')
            db.session.add(like_sent)
            db.session.add(like_recv)
            db.session.flush()

            match = Match(
                user1_id=min(ramon.id, m_user.id),
                user2_id=max(ramon.id, m_user.id)
            )
            db.session.add(match)
            db.session.flush()

            # Mensagem de boas-vindas
            m = Message(
                sender_id=m_user.id,
                receiver_id=ramon.id,
                match_id=match.id,
                content=f"Oi Ramon! Que massa ver você no Proximous! Vi que você também curte café no Rio Vermelho!",
                is_read=True
            )
            db.session.add(m)

        # Momentos no Feed
        moments = [
            (
                camila.id,
                "Fim de tarde maravilhoso no Largo da Dinha, Rio Vermelho! A energia de Salvador é única ☀️✨",
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
                34
            ),
            (
                lucas.id,
                "Sunset perfeito de hoje no Farol da Barra. Quem aproveitou a orla?",
                "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
                52
            ),
            (
                ramon.id,
                "Lançamento do Proximous a todo vapor em Salvador! Conexões autênticas em tempo real 🚀💜",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800",
                89
            )
        ]

        for u_id, content, photo, likes in moments:
            moment = Moment(
                user_id=u_id,
                content=content,
                photo_url=photo,
                likes_count=likes
            )
            db.session.add(moment)

        db.session.commit()
        print("\n" + "=" * 60)
        print("✅ BANCO DE DADOS PROXIMOUS POPULADO COM SUCESSO!")
        print("👤 Usuário Master: ramon@proximous.com")
        print("🔑 Senha:         141120Rj.")
        print("🛡️ Acesso Admin:   /admin (Admin Master & Ramon)")
        print("📍 Localização:    Salvador/BA (Rio Vermelho, Barra, Pituba)")
        print("=" * 60 + "\n")

if __name__ == '__main__':
    seed_database()
