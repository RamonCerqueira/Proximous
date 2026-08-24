import sys
import os
import json
import uuid
from datetime import datetime, timedelta

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Force SQLite and test keys BEFORE importing main
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['SECRET_KEY'] = 'test-secret-key-proximous-super-safe-32'
os.environ['JWT_SECRET_KEY'] = 'test-jwt-secret-key-proximous-super-safe-32'
os.environ['FLASK_DEBUG'] = 'False'

from src.main import app, db
from src.models.user import User, Like, Match, Achievement, UserAchievement, EmpathyTransaction, Message
from src.models.admin import Admin, SystemSetting, SupportTicket, SupportMessage, FAQ, FAQVote, AdminAction
from src.models.moment import Moment, MomentLike
from src.models.subscription import Subscription, SubscriptionPlan, Coupon, Payment, CouponUsage
from src.models.advertising import Advertiser, AdCampaign, Advertisement, AdImpression, AdTransaction
from src.models.activity import Activity, ActivityParticipant

def run_backend_audit():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SECRET_KEY'] = 'test-secret-key-proximous-super-safe-32'
    app.config['JWT_SECRET_KEY'] = 'test-jwt-secret-key-proximous-super-safe-32'
    
    results = {
        'total': 0,
        'passed': 0,
        'failed': 0,
        'not_tested': 0,
        'details': []
    }

    def log_test(category, endpoint, method, scenario, expected_status, actual_status, status, details=""):
        results['total'] += 1
        if status == 'PASSOU':
            results['passed'] += 1
        elif status == 'FALHOU':
            results['failed'] += 1
        else:
            results['not_tested'] += 1
            
        entry = {
            'category': category,
            'endpoint': endpoint,
            'method': method,
            'scenario': scenario,
            'expected_status': expected_status,
            'actual_status': actual_status,
            'status': status,
            'details': str(details)
        }
        results['details'].append(entry)
        symbol = "[OK]" if status == "PASSOU" else ("[FAIL]" if status == "FALHOU" else "[SKIP]")
        try:
            print(f"{symbol} [{status}] {method} {endpoint} - {scenario} (Exp: {expected_status}, Got: {actual_status})")
        except Exception:
            print(f"{symbol} [{status}] {method} {endpoint} - Status: {actual_status}")

    with app.app_context():
        db.drop_all()
        db.create_all()

        # Seed default Subscription Plans
        monthly_plan = SubscriptionPlan(
            name='Proximous VIP Mensal',
            plan_type='monthly',
            price=29.90,
            currency='BRL',
            is_active=True
        )
        annual_plan = SubscriptionPlan(
            name='Proximous VIP Anual',
            plan_type='annual',
            price=19.90,
            currency='BRL',
            is_active=True
        )
        db.session.add_all([monthly_plan, annual_plan])

        # Seed default FAQs
        faq1 = FAQ(
            question='Como funciona o Modo Agora?',
            answer='Permite avisar conexões próximas que você está disponível para um café ou rolê.',
            category='general',
            is_published=True
        )
        db.session.add(faq1)
        db.session.commit()

        client = app.test_client()

        # =========================================================================
        # 1. HEALTH CHECK
        # =========================================================================
        res = client.get('/api/health')
        log_test('System', '/api/health', 'GET', 'Health check da API', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # =========================================================================
        # 2. AUTHENTICATION & REGISTRATION
        # =========================================================================
        
        # Test 2.1: Register valid user
        user_data = {
            'name': 'João Silva',
            'email': 'joao@example.com',
            'password': 'Password123',
            'age': 28,
            'social_style': 'introverted',
            'personality_tags': ['Música', 'Café'],
            'interests': ['Rock', 'Tecnologia']
        }
        res = client.post('/api/auth/register', json=user_data)
        data = res.get_json() or {}
        if res.status_code == 201 and 'access_token' in data and 'user' in data:
            log_test('Auth', '/api/auth/register', 'POST', 'Registro válido de novo usuário', 201, res.status_code, 'PASSOU')
            user_token = data['access_token']
            user_id = data['user']['id']
            refresh_token = data.get('refresh_token')
        else:
            log_test('Auth', '/api/auth/register', 'POST', 'Registro válido de novo usuário', 201, res.status_code, 'FALHOU', str(data))
            user_token = None
            user_id = None
            refresh_token = None

        headers = {'Authorization': f'Bearer {user_token}'} if user_token else {}

        # Test 2.2: Register duplicate email
        res = client.post('/api/auth/register', json=user_data)
        log_test('Auth', '/api/auth/register', 'POST', 'Registro com e-mail duplicado (deve retornar 409)', 409, res.status_code, 'PASSOU' if res.status_code == 409 else 'FALHOU', res.get_data(as_text=True))

        # Test 2.3: Register missing fields
        res = client.post('/api/auth/register', json={'email': 'incomplete@example.com'})
        log_test('Auth', '/api/auth/register', 'POST', 'Registro com campos obrigatórios ausentes', 400, res.status_code, 'PASSOU' if res.status_code == 400 else 'FALHOU')

        # Test 2.4: Register weak password
        res = client.post('/api/auth/register', json={'name': 'Test', 'email': 'testweak@example.com', 'password': 'weak'})
        log_test('Auth', '/api/auth/register', 'POST', 'Registro com senha fraca', 400, res.status_code, 'PASSOU' if res.status_code == 400 else 'FALHOU')

        # Test 2.5: Register invalid email format
        res = client.post('/api/auth/register', json={'name': 'Test', 'email': 'not-an-email', 'password': 'Password123'})
        log_test('Auth', '/api/auth/register', 'POST', 'Registro com formato de e-mail inválido', 400, res.status_code, 'PASSOU' if res.status_code == 400 else 'FALHOU')

        # Test 2.6: Login valid credentials
        res = client.post('/api/auth/login', json={'email': 'joao@example.com', 'password': 'Password123'})
        data = res.get_json() or {}
        log_test('Auth', '/api/auth/login', 'POST', 'Login com credenciais válidas', 200, res.status_code, 'PASSOU' if res.status_code == 200 and 'access_token' in data else 'FALHOU')

        # Test 2.7: Login invalid password
        res = client.post('/api/auth/login', json={'email': 'joao@example.com', 'password': 'WrongPassword999'})
        log_test('Auth', '/api/auth/login', 'POST', 'Login com senha incorreta (deve retornar 401)', 401, res.status_code, 'PASSOU' if res.status_code == 401 else 'FALHOU')

        # Test 2.8: Login non-existent email
        res = client.post('/api/auth/login', json={'email': 'nonexistent@example.com', 'password': 'Password123'})
        log_test('Auth', '/api/auth/login', 'POST', 'Login com e-mail inexistente (deve retornar 401)', 401, res.status_code, 'PASSOU' if res.status_code == 401 else 'FALHOU')

        # Test 2.9: Auth /me protected route with token
        res = client.get('/api/auth/me', headers=headers)
        log_test('Auth', '/api/auth/me', 'GET', 'Obter dados do usuário autenticado (/me)', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 2.10: Auth /me without token (unauthenticated)
        res = client.get('/api/auth/me')
        log_test('Auth', '/api/auth/me', 'GET', 'Acesso sem token em rota protegida (deve retornar 401)', 401, res.status_code, 'PASSOU' if res.status_code == 401 else 'FALHOU')

        # Test 2.11: Auth /refresh with valid refresh token
        ref_headers = {'Authorization': f'Bearer {refresh_token}'} if refresh_token else {}
        res = client.post('/api/auth/refresh', headers=ref_headers)
        data = res.get_json() or {}
        log_test('Auth', '/api/auth/refresh', 'POST', 'Renovação de access token via refresh token', 200, res.status_code, 'PASSOU' if res.status_code == 200 and 'access_token' in data else 'FALHOU')

        # Test 2.12: Auth /verify-token
        res = client.post('/api/auth/verify-token', headers=headers)
        log_test('Auth', '/api/auth/verify-token', 'POST', 'Validação de token JWT ativo', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 2.13: Forgot password for existing email
        res = client.post('/api/auth/forgot-password', json={'email': 'joao@example.com'})
        log_test('Auth', '/api/auth/forgot-password', 'POST', 'Solicitação de recuperação de senha', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 2.14: Change password
        change_pass_data = {
            'current_password': 'Password123',
            'new_password': 'NewPassword456'
        }
        res = client.post('/api/auth/change-password', headers=headers, json=change_pass_data)
        log_test('Auth', '/api/auth/change-password', 'POST', 'Alteração de senha autenticada', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Restore password for future tests
        client.post('/api/auth/change-password', headers=headers, json={'current_password': 'NewPassword456', 'new_password': 'Password123'})

        # Register User 2 and User 3 for matching & interactions
        u2_res = client.post('/api/auth/register', json={
            'name': 'Maria Santos',
            'email': 'maria@example.com',
            'password': 'Password123',
            'age': 25,
            'social_style': 'extroverted'
        })
        u2_data = u2_res.get_json() or {}
        user2_token = u2_data.get('access_token')
        user2_id = u2_data.get('user', {}).get('id')
        user2_headers = {'Authorization': f'Bearer {user2_token}'}

        # Set required photos for test users
        u1 = User.query.get(user_id)
        u2 = User.query.get(user2_id)
        if u1:
            u1.set_photos(['https://images.unsplash.com/photo-1', 'https://images.unsplash.com/photo-2'])
        if u2:
            u2.set_photos(['https://images.unsplash.com/photo-1', 'https://images.unsplash.com/photo-2'])
        db.session.commit()

        u3_res = client.post('/api/auth/register', json={
            'name': 'Carlos Lima',
            'email': 'carlos@example.com',
            'password': 'Password123',
            'age': 30,
            'social_style': 'ambiverted'
        })
        u3_data = u3_res.get_json() or {}
        user3_token = u3_data.get('access_token')
        user3_id = u3_data.get('user', {}).get('id')
        user3_headers = {'Authorization': f'Bearer {user3_token}'}

        # Setup Admin User
        admin = Admin(
            name='Administrador Master',
            email='admin@proximous.com',
            role='super_admin',
            is_active=True
        )
        admin.set_password('AdminMaster123')
        db.session.add(admin)
        db.session.commit()

        # Test 2.15: Admin Login
        admin_login_res = client.post('/api/auth/admin/login', json={'email': 'admin@proximous.com', 'password': 'AdminMaster123'})
        admin_login_data = admin_login_res.get_json() or {}
        admin_token = admin_login_data.get('access_token')
        admin_headers = {'Authorization': f'Bearer {admin_token}'}
        log_test('Auth', '/api/auth/admin/login', 'POST', 'Login administrativo com credenciais válidas', 200, admin_login_res.status_code, 'PASSOU' if admin_login_res.status_code == 200 and 'access_token' in admin_login_data else 'FALHOU')


        # =========================================================================
        # 3. USERS & PROFILE MANAGEMENT
        # =========================================================================

        # Test 3.1: Get profile
        res = client.get('/api/users/profile', headers=headers)
        log_test('Users', '/api/users/profile', 'GET', 'Obter perfil completo do usuário', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 3.2: Update profile
        update_data = {
            'bio': 'Desenvolvedor e entusiasta de café especial',
            'location_city': 'Salvador',
            'latitude': -12.9714,
            'longitude': -38.5014,
            'photos': ['https://example.com/p1.jpg', 'https://example.com/p2.jpg'],
            'interests': ['Café', 'Música', 'Trilhas']
        }
        res = client.put('/api/users/profile', headers=headers, json=update_data)
        log_test('Users', '/api/users/profile', 'PUT', 'Atualizar dados de perfil, localização e fotos', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Set location for user2 and user3
        client.put('/api/users/profile', headers=user2_headers, json={'latitude': -12.9720, 'longitude': -38.5020, 'location_city': 'Salvador', 'is_visible': True, 'status': 'available'})
        client.put('/api/users/profile', headers=user3_headers, json={'latitude': -12.9750, 'longitude': -38.5050, 'location_city': 'Salvador', 'is_visible': True, 'status': 'available'})

        # Test 3.3: Add Photo
        res = client.post('/api/users/photos', headers=headers, json={'photo_url': 'https://example.com/p3.jpg'})
        log_test('Users', '/api/users/photos', 'POST', 'Adicionar nova foto à galeria', 200, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 3.4: Delete Photo
        res = client.delete('/api/users/photos', headers=headers, json={'photo_url': 'https://example.com/p3.jpg'})
        log_test('Users', '/api/users/photos', 'DELETE', 'Remover foto da galeria', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 3.5: Update availability (Modo Agora)
        res = client.put('/api/users/availability', headers=headers, json={'hours': 3, 'status_text': 'Tomando café no Pelourinho'})
        log_test('Users', '/api/users/availability', 'PUT', 'Definir disponibilidade em tempo real (Modo Agora)', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 3.6: Discover users nearby
        res = client.get('/api/users/discover?radius=25&latitude=-12.9714&longitude=-38.5014', headers=headers)
        data = res.get_json() or {}
        users_list = data.get('users', [])
        log_test('Users', '/api/users/discover', 'GET', 'Descoberta de perfis próximos por raio geográfico', 200, res.status_code, 'PASSOU' if res.status_code == 200 and isinstance(users_list, list) else 'FALHOU')

        # Test 3.7: Get public user profile by ID
        res = client.get(f'/api/users/{user2_id}', headers=headers)
        log_test('Users', '/api/users/<user_id>', 'GET', 'Visualizar perfil público de outro usuário', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 3.8: Search users
        res = client.get('/api/users/search?q=Maria', headers=headers)
        log_test('Users', '/api/users/search', 'GET', 'Busca de usuários por texto/termo', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 3.9: Get user stats
        res = client.get('/api/users/stats', headers=headers)
        log_test('Users', '/api/users/stats', 'GET', 'Estatísticas de interações do usuário', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 3.10: Get achievements
        res = client.get('/api/users/achievements', headers=headers)
        log_test('Users', '/api/users/achievements', 'GET', 'Listagem de conquistas e progresso do usuário', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 3.11: Get empathy points history
        res = client.get('/api/users/empathy-history', headers=headers)
        log_test('Users', '/api/users/empathy-history', 'GET', 'Histórico e extrato de pontos de empatia', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 3.12: Update privacy settings
        res = client.put('/api/users/privacy-settings', headers=headers, json={'hide_distance': False, 'hide_online': False, 'incognito': False})
        log_test('Users', '/api/users/privacy-settings', 'PUT', 'Atualizar configurações de privacidade', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 4. MATCHING & LIKES
        # =========================================================================

        # Test 4.1: Send like (User 1 likes User 2)
        res = client.post('/api/matching/like', headers=headers, json={'receiver_id': user2_id, 'like_type': 'like'})
        data = res.get_json() or {}
        log_test('Matching', '/api/matching/like', 'POST', 'Enviar curtida para outro usuário', 201, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 4.2: Get Sent Likes
        res = client.get('/api/matching/likes/sent', headers=headers)
        log_test('Matching', '/api/matching/likes/sent', 'GET', 'Listar solicitações/curtidas enviadas', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 4.3: Get Received Likes (User 2 checks received)
        res = client.get('/api/matching/likes/received', headers=user2_headers)
        log_test('Matching', '/api/matching/likes/received', 'GET', 'Listar curtidas recebidas', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 4.4: Match creation (User 2 likes User 1 back)
        res = client.post('/api/matching/like', headers=user2_headers, json={'receiver_id': user_id, 'like_type': 'like'})
        data = res.get_json() or {}
        is_match = data.get('match') or data.get('is_match')
        log_test('Matching', '/api/matching/like', 'POST', 'Match mútuo em tempo real', 201, res.status_code, 'PASSOU' if res.status_code in [200, 201] and is_match else 'FALHOU')

        # Test 4.5: Get Matches list
        res = client.get('/api/matching/matches', headers=headers)
        data = res.get_json() or {}
        matches_list = data.get('matches', [])
        match_id = matches_list[0]['id'] if matches_list else None
        log_test('Matching', '/api/matching/matches', 'GET', 'Listar matches confirmados', 200, res.status_code, 'PASSOU' if res.status_code == 200 and len(matches_list) > 0 else 'FALHOU')

        # Test 4.6: Get icebreakers and compliments suggestions
        res = client.get('/api/matching/icebreakers', headers=headers)
        log_test('Matching', '/api/matching/icebreakers', 'GET', 'Sugestões de quebra-gelo para conexões', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        res = client.get('/api/matching/compliments', headers=headers)
        log_test('Matching', '/api/matching/compliments', 'GET', 'Sugestões de elogios gentis para perfil', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 4.7: Matching Stats
        res = client.get('/api/matching/stats', headers=headers)
        log_test('Matching', '/api/matching/stats', 'GET', 'Estatísticas de matches e curtidas', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 5. MESSAGES & CHAT
        # =========================================================================

        # Test 5.1: Send message from User 1 to User 2
        msg_payload = {
            'receiver_id': user2_id,
            'content': 'Olá Maria! Que bom que demos match, tudo bem?',
            'match_id': match_id
        }
        res = client.post('/api/messages/send', headers=headers, json=msg_payload)
        data = res.get_json() or {}
        msg_id = data.get('message_data', {}).get('id') or data.get('message', {}).get('id')
        log_test('Messages', '/api/messages/send', 'POST', 'Enviar mensagem no chat para conexão', 201, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 5.2: Get conversation list
        res = client.get('/api/messages/conversations', headers=headers)
        log_test('Messages', '/api/messages/conversations', 'GET', 'Listar conversas ativas', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 5.3: Get conversation messages
        res = client.get(f'/api/messages/conversation/{user2_id}', headers=headers)
        log_test('Messages', '/api/messages/conversation/<user_id>', 'GET', 'Obter histórico de mensagens da conversa', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 5.4: Mark message as read
        if msg_id:
            res = client.post(f'/api/messages/{msg_id}/read', headers=user2_headers)
            log_test('Messages', '/api/messages/<id>/read', 'POST', 'Marcar mensagem individual como lida', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 5.5: Mark all read from user
        res = client.post(f'/api/messages/mark-all-read/{user_id}', headers=user2_headers)
        log_test('Messages', '/api/messages/mark-all-read/<user_id>', 'POST', 'Marcar todas mensagens de um usuário como lidas', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 5.6: Get unread count
        res = client.get('/api/messages/unread-count', headers=headers)
        log_test('Messages', '/api/messages/unread-count', 'GET', 'Contador de mensagens não lidas', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 5.7: Search messages
        res = client.get('/api/messages/search?q=Maria', headers=headers)
        log_test('Messages', '/api/messages/search', 'GET', 'Buscar termos nas mensagens de chat', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 6. ACTIVITIES & MODO AGORA
        # =========================================================================

        # Test 6.1: Create Activity
        act_payload = {
            'title': 'Café e Conversa no Farol',
            'category': 'coffee',
            'location_name': 'Farol da Barra',
            'scheduled_time': 'Hoje às 18:00',
            'max_participants': 4,
            'description': 'Bora tomar um café gelado e bater papo?',
            'duration_hours': 3,
            'latitude': -12.9714,
            'longitude': -38.5014
        }
        res = client.post('/api/activities', headers=headers, json=act_payload)
        data = res.get_json() or {}
        act_id = data.get('activity', {}).get('id')
        log_test('Activities', '/api/activities', 'POST', 'Criar atividade espontânea (Modo Agora)', 201, res.status_code, 'PASSOU' if res.status_code == 201 and act_id else 'FALHOU')

        # Test 6.2: Get Nearby Activities
        res = client.get('/api/activities/nearby?radius=25', headers=headers)
        log_test('Activities', '/api/activities/nearby', 'GET', 'Listar atividades próximas no radar', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 6.3: Get Categories
        res = client.get('/api/activities/categories', headers=headers)
        log_test('Activities', '/api/activities/categories', 'GET', 'Listar categorias de atividades', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 6.4: Join Activity (User 2 joins User 1's activity)
        if act_id:
            res = client.post(f'/api/activities/{act_id}/join', headers=user2_headers)
            log_test('Activities', '/api/activities/<id>/join', 'POST', 'Solicitar participação em atividade', 200, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 6.5: Approve Participant
        if act_id:
            res = client.post(f'/api/activities/{act_id}/participants/{user2_id}/approve', headers=headers)
            log_test('Activities', '/api/activities/<id>/participants/<user_id>/approve', 'POST', 'Aprovar participante na atividade pelo anfitrião', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 6.6: Get My Activities
        res = client.get('/api/activities/my', headers=headers)
        log_test('Activities', '/api/activities/my', 'GET', 'Listar minhas atividades criadas e participações', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 7. MOMENTS & FEED
        # =========================================================================

        # Test 7.1: Create Moment
        moment_payload = {
            'content': 'Fim de tarde incrível na praia! 🌅',
            'photo_url': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb'
        }
        res = client.post('/api/moments', headers=headers, json=moment_payload)
        data = res.get_json() or {}
        moment_id = data.get('moment', {}).get('id')
        log_test('Moments', '/api/moments', 'POST', 'Publicar novo momento no feed', 201, res.status_code, 'PASSOU' if res.status_code in [200, 201] and moment_id else 'FALHOU')

        # Test 7.2: Get Moments Feed
        res = client.get('/api/moments?page=1&per_page=10', headers=headers)
        log_test('Moments', '/api/moments', 'GET', 'Listar feed de momentos com paginação', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 7.3: Toggle Like on Moment
        if moment_id:
            res = client.post(f'/api/moments/{moment_id}/like', headers=user2_headers)
            log_test('Moments', '/api/moments/<id>/like', 'POST', 'Curtir momento publicado', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 7.4: Send Icebreaker from Moment
        if moment_id:
            res = client.post(f'/api/moments/{moment_id}/icebreaker', headers=user2_headers, json={'text': 'Que foto linda! Qual o nome dessa praia?'})
            log_test('Moments', '/api/moments/<id>/icebreaker', 'POST', 'Enviar Icebreaker contextual a partir de um momento', 200, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')


        # =========================================================================
        # 8. NOTIFICATIONS
        # =========================================================================

        # Test 8.1: Get notifications
        res = client.get('/api/notifications', headers=headers)
        log_test('Notifications', '/api/notifications', 'GET', 'Listar notificações do usuário', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 8.2: Mark all read
        res = client.post('/api/notifications/read-all', headers=headers)
        log_test('Notifications', '/api/notifications/read-all', 'POST', 'Marcar todas notificações como lidas', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 9. SUBSCRIPTIONS & PAYMENTS
        # =========================================================================

        # Test 9.1: Get Plans
        res = client.get('/api/subscriptions/plans')
        log_test('Subscriptions', '/api/subscriptions/plans', 'GET', 'Listar planos de assinatura VIP disponíveis', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 9.2: Get Current Subscription
        res = client.get('/api/subscriptions/current', headers=headers)
        log_test('Subscriptions', '/api/subscriptions/current', 'GET', 'Obter status da assinatura do usuário atual', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 9.3: Subscribe / Create VIP Order
        res = client.post('/api/subscriptions/subscribe', headers=headers, json={'plan_type': 'monthly', 'payment_method': 'pix'})
        log_test('Subscriptions', '/api/subscriptions/subscribe', 'POST', 'Criar pedido de assinatura VIP via PIX', 200, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 9.4: Validate Coupon
        coupon = Coupon(
            code='PROMOVIP50',
            discount_type='percentage',
            discount_value=50.0,
            is_active=True,
            valid_until=datetime.utcnow() + timedelta(days=30)
        )
        db.session.add(coupon)
        db.session.commit()

        res = client.post('/api/subscriptions/validate-coupon', headers=headers, json={'coupon_code': 'PROMOVIP50'})
        log_test('Subscriptions', '/api/subscriptions/validate-coupon', 'POST', 'Validar cupom de desconto VIP válido', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 9.5: Validate Invalid Coupon
        res = client.post('/api/subscriptions/validate-coupon', headers=headers, json={'coupon_code': 'INVALID999'})
        log_test('Subscriptions', '/api/subscriptions/validate-coupon', 'POST', 'Validação de cupom inexistente/inválido', 404, res.status_code, 'PASSOU' if res.status_code in [400, 404] else 'FALHOU')

        # Test 9.6: Get Payment History
        res = client.get('/api/subscriptions/payment-history', headers=headers)
        log_test('Subscriptions', '/api/subscriptions/payment-history', 'GET', 'Histórico de faturas e pagamentos', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 9.7: Get Usage Stats
        res = client.get('/api/subscriptions/usage-stats', headers=headers)
        log_test('Subscriptions', '/api/subscriptions/usage-stats', 'GET', 'Estatísticas de uso e limites diários', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 10. SUPPORT & FAQS
        # =========================================================================

        # Test 10.1: Create Ticket
        ticket_payload = {
            'user_name': 'João Silva',
            'user_email': 'joao@example.com',
            'subject': 'Dúvida sobre renovação VIP',
            'category': 'billing',
            'priority': 'medium',
            'description': 'Gostaria de saber se o VIP renova automaticamente via PIX.'
        }
        res = client.post('/api/support/tickets', headers=headers, json=ticket_payload)
        data = res.get_json() or {}
        ticket_id = data.get('ticket', {}).get('id')
        log_test('Support', '/api/support/tickets', 'POST', 'Abertura de novo chamado de suporte', 201, res.status_code, 'PASSOU' if res.status_code in [200, 201] and ticket_id else 'FALHOU')

        # Test 10.2: Get My Tickets
        res = client.get('/api/support/tickets/my', headers=headers)
        log_test('Support', '/api/support/tickets/my', 'GET', 'Listar chamados do usuário autenticado', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 10.3: Add Message to Ticket
        if ticket_id:
            res = client.post(f'/api/support/tickets/{ticket_id}/messages', headers=headers, json={'content': 'Obrigado, já recebi a confirmação!'})
            log_test('Support', '/api/support/tickets/<id>/messages', 'POST', 'Adicionar mensagem a chamado aberto', 200, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 10.4: Get FAQs
        res = client.get('/api/support/faq')
        log_test('Support', '/api/support/faq', 'GET', 'Consulta pública à base de conhecimento e FAQs', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 11. ADVERTISING
        # =========================================================================

        # Seed Advertiser, Campaign, and Ad
        advertiser = Advertiser(
            company_name='Café Especial Salvador',
            contact_email='anuncios@cafesalvador.com',
            status='approved',
            current_balance=200.0,
            is_verified=True
        )
        db.session.add(advertiser)
        db.session.flush()

        ad_campaign = AdCampaign(
            advertiser_id=advertiser.id,
            name='Campanha Verão 2026',
            objective='traffic',
            budget_type='daily',
            budget_amount=50.0,
            status='active',
            approval_status='approved',
            start_date=datetime.utcnow() - timedelta(days=1),
            end_date=datetime.utcnow() + timedelta(days=30)
        )
        db.session.add(ad_campaign)
        db.session.flush()

        advertisement = Advertisement(
            campaign_id=ad_campaign.id,
            title='O Melhor Café da Cidade',
            description='Venha conhecer nosso espaço no Pelourinho!',
            cta_text='Saiba Mais',
            cta_url='https://cafesalvador.com',
            ad_format='banner',
            placement='feed',
            status='active',
            approval_status='approved'
        )
        db.session.add(advertisement)
        db.session.commit()

        # Test 11.1: Premium user does NOT see ads (Business Rule)
        res = client.get('/api/advertising/ads/serve?placement=feed', headers=headers)
        data = res.get_json() or {}
        log_test('Advertising', '/api/advertising/ads/serve', 'GET', 'Regra de Negócio: Usuário Premium não recebe anúncios', 200, res.status_code, 'PASSOU' if res.status_code == 200 and data.get('ad') is None else 'FALHOU')

        # Test 11.2: Free User receives ad when global promotional trial is disabled
        SystemSetting.set_setting('global_free_premium_enabled', 'false')
        u3 = User.query.get(user3_id)
        u3.is_premium = False
        u3.premium_expires_at = None
        db.session.commit()

        res = client.get('/api/advertising/ads/serve?placement=feed', headers=user3_headers)
        data = res.get_json() or {}
        ad_obj = data.get('ad') or {}
        imp_id = ad_obj.get('impression_id')
        log_test('Advertising', '/api/advertising/ads/serve', 'GET', 'Entrega de anúncio patrocinado para usuário Free', 200, res.status_code, 'PASSOU' if res.status_code == 200 and imp_id else 'FALHOU')

        # Test 11.3: Record Ad Click
        if imp_id:
            res = client.post('/api/advertising/ads/click', headers=user3_headers, json={'impression_id': imp_id})
            log_test('Advertising', '/api/advertising/ads/click', 'POST', 'Registro de métrica de clique em anúncio', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Restore global trial setting
        SystemSetting.set_setting('global_free_premium_enabled', 'true')


        # =========================================================================
        # 12. ADMIN & MODERATION (ADMIN PRIVILEGES)
        # =========================================================================

        # Test 12.1: Admin Dashboard
        res = client.get('/api/admin/dashboard', headers=admin_headers)
        log_test('Admin', '/api/admin/dashboard', 'GET', 'Dashboard de métricas e estatísticas administrativas', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 12.2: Regular User accessing Admin Dashboard (RBAC check - should fail with 403)
        res = client.get('/api/admin/dashboard', headers=headers)
        log_test('Admin', '/api/admin/dashboard', 'GET', 'Controle de Acesso RBAC: Usuário comum tentando acessar Admin (deve retornar 403)', 403, res.status_code, 'PASSOU' if res.status_code == 403 else 'FALHOU')

        # Test 12.3: Admin Get Users List
        res = client.get('/api/admin/users?page=1&limit=10', headers=admin_headers)
        log_test('Admin', '/api/admin/users', 'GET', 'Gestão de usuários da plataforma pelo admin', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 12.4: Admin Get User Detail
        res = client.get(f'/api/admin/users/{user2_id}', headers=admin_headers)
        log_test('Admin', '/api/admin/users/<id>', 'GET', 'Obter detalhes completos de usuário na administração', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 12.5: Admin Get Settings
        res = client.get('/api/admin/settings', headers=admin_headers)
        log_test('Admin', '/api/admin/settings', 'GET', 'Visualizar configurações globais do sistema', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 12.6: Admin Update Settings
        res = client.put('/api/admin/settings', headers=admin_headers, json={'global_free_premium_days': 90})
        log_test('Admin', '/api/admin/settings', 'PUT', 'Atualizar período de teste VIP global', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 12.7: Admin Actions Log
        res = client.get('/api/admin/actions', headers=admin_headers)
        log_test('Admin', '/api/admin/actions', 'GET', 'Auditoria de logs de ações de administradores', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 12.8: Admin Analytics
        res = client.get('/api/admin/analytics/users', headers=admin_headers)
        log_test('Admin', '/api/admin/analytics/users', 'GET', 'Métricas analíticas de usuários', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 12.9: Admin Ban User
        res = client.post(f'/api/admin/users/{user3_id}/ban', headers=admin_headers, json={'reason': 'Violação dos termos de conduta'})
        log_test('Admin', '/api/admin/users/<id>/ban', 'POST', 'Bloqueio/Banimento de usuário infrator', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 12.10: Admin Unban User
        res = client.post(f'/api/admin/users/{user3_id}/unban', headers=admin_headers)
        log_test('Admin', '/api/admin/users/<id>/unban', 'POST', 'Desbloqueio de usuário após revisão', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 13. ADDITIONAL ADVANCED ENDPOINTS & LIFECYCLES
        # =========================================================================

        # Test 13.1: Upload photo
        import io
        fake_image = io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x03\x00\x08\xfc\x02\xfe\xa7\x9a\xa0\xa0\x00\x00\x00\x00IEND\xaeB`\x82')
        upload_data = {
            'file': (fake_image, 'avatar.png')
        }
        res = client.post('/api/upload/photo', headers=headers, data=upload_data, content_type='multipart/form-data')
        upload_resp = res.get_json() or {}
        filename = upload_resp.get('filename')
        log_test('Upload', '/api/upload/photo', 'POST', 'Upload de imagem para galeria/perfil', 201, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 13.2: Serve uploaded photo
        if filename:
            res = client.get(f'/api/upload/files/{filename}')
            log_test('Upload', '/api/upload/files/<filename>', 'GET', 'Servir arquivo de imagem estática carregada', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.3: Message stats
        res = client.get('/api/messages/stats', headers=headers)
        log_test('Messages', '/api/messages/stats', 'GET', 'Estatísticas de mensagens do usuário', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.4: Delete message
        if msg_id:
            res = client.delete(f'/api/messages/{msg_id}', headers=headers)
            log_test('Messages', '/api/messages/<id>', 'DELETE', 'Excluir mensagem enviada', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.5: Support FAQ Categories
        res = client.get('/api/support/faq/categories')
        log_test('Support', '/api/support/faq/categories', 'GET', 'Listar categorias da base de conhecimento', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.6: Support FAQ Vote
        if faq1:
            res = client.post(f'/api/support/faq/{faq1.id}/vote', headers=headers, json={'is_helpful': True, 'feedback': 'Muito útil!'})
            log_test('Support', '/api/support/faq/<id>/vote', 'POST', 'Votar na utilidade de artigo da FAQ', 200, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 13.7: Support Contact Form
        contact_payload = {
            'name': 'Visitante Anônimo',
            'email': 'visitante@example.com',
            'subject': 'Parceria comercial',
            'message': 'Gostaria de falar sobre anúncio corporativo.'
        }
        res = client.post('/api/support/contact', json=contact_payload)
        log_test('Support', '/api/support/contact', 'POST', 'Envio de mensagem via formulário público de contato', 200, res.status_code, 'PASSOU' if res.status_code in [200, 201] else 'FALHOU')

        # Test 13.8: Close Support Ticket
        if ticket_id:
            res = client.post(f'/api/support/tickets/{ticket_id}/close', headers=headers, json={'reason': 'Resolvido pelo usuário'})
            log_test('Support', '/api/support/tickets/<id>/close', 'POST', 'Encerramento de chamado de suporte', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.9: Support Ticket Satisfaction on Resolved Ticket
        if ticket_id:
            t = SupportTicket.query.get(ticket_id)
            t.status = 'resolved'
            db.session.commit()
            res = client.post(f'/api/support/tickets/{ticket_id}/satisfaction', headers=headers, json={'rating': 5, 'feedback': 'Excelente suporte!'})
            log_test('Support', '/api/support/tickets/<id>/satisfaction', 'POST', 'Avaliação de satisfação do atendimento', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.10: Subscription Change Plan
        res = client.post('/api/subscriptions/change-plan', headers=headers, json={'new_plan_type': 'annual'})
        log_test('Subscriptions', '/api/subscriptions/change-plan', 'POST', 'Migração de plano de assinatura VIP (Mensal -> Anual)', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.11: Subscription Cancel
        res = client.post('/api/subscriptions/cancel', headers=headers, json={'reason': 'Teste de cancelamento', 'immediate': False})
        log_test('Subscriptions', '/api/subscriptions/cancel', 'POST', 'Cancelamento programado de assinatura VIP', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.12: Subscription Reactivate
        res = client.post('/api/subscriptions/reactivate', headers=headers)
        log_test('Subscriptions', '/api/subscriptions/reactivate', 'POST', 'Reativação de assinatura VIP cancelada', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.13: Unlike / Desfazer curtida
        res = client.post('/api/matching/unlike', headers=headers, json={'receiver_id': user2_id})
        log_test('Matching', '/api/matching/unlike', 'POST', 'Desfazer curtida enviada', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.14: Unmatch on active match
        new_match = Match(user1_id=user_id, user2_id=user3_id, is_active=True)
        db.session.add(new_match)
        db.session.commit()
        res = client.post(f'/api/matching/matches/{new_match.id}/unmatch', headers=headers, json={'reason': 'Incompatibilidade'})
        log_test('Matching', '/api/matching/matches/<id>/unmatch', 'POST', 'Desfazer match com conexão', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.15: User Deactivation
        res = client.post('/api/users/deactivate', headers=user3_headers, json={'reason': 'Conta de teste'})
        log_test('Users', '/api/users/deactivate', 'POST', 'Desativação voluntária de conta de usuário', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 13.16: Logout
        res = client.post('/api/auth/logout', headers=headers)
        log_test('Auth', '/api/auth/logout', 'POST', 'Logout e revogação de token JWT', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')


        # =========================================================================
        # 14. SECURITY & INJECTION SAFETY
        # =========================================================================

        # Test 14.1: SQL Injection Attempt in Search Query
        sqli_payload = "' OR '1'='1"
        res = client.get(f'/api/users/search?q={sqli_payload}', headers=user2_headers)
        log_test('Security', '/api/users/search?q=SQLi', 'GET', 'Resistência a SQL Injection em consultas de busca', 200, res.status_code, 'PASSOU' if res.status_code == 200 else 'FALHOU')

        # Test 14.2: IDOR test - User trying to delete someone else's activity
        if act_id:
            res = client.delete(f'/api/activities/{act_id}', headers=user2_headers)
            log_test('Security', '/api/activities/<id>', 'DELETE', 'Proteção IDOR: Exclusão de atividade por usuário não proprietário (deve retornar 403/404)', 403, res.status_code, 'PASSOU' if res.status_code in [403, 404] else 'FALHOU')

        # Test 14.3: Password Hashing Verification
        u = User.query.filter_by(email='joao@example.com').first()
        is_bcrypt = u.password_hash.startswith('$2b$') or u.password_hash.startswith('$2a$') or u.password_hash.startswith('scrypt:')
        log_test('Security', 'Database: User.password_hash', 'INTERNAL', 'Criptografia robusta de senhas (Bcrypt / Argon2)', 'Encrypted', 'Encrypted' if is_bcrypt else 'Plaintext', 'PASSOU' if is_bcrypt else 'FALHOU')

    return results

if __name__ == '__main__':
    res = run_backend_audit()
    print("\n" + "="*60)
    print(f"RESULTADO GERAL DO BACKEND: {res['passed']} PASSOU | {res['failed']} FALHOU | {res['not_tested']} NÃO TESTADO")
    print("="*60)
