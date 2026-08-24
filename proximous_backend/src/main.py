import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import datetime, timedelta


# Import all models to ensure they're registered
from src.models.user import db
from src.models.moment import Moment, MomentLike
from src.models.subscription import Subscription, Payment, SubscriptionPlan, Coupon, CouponUsage
from src.models.advertising import Advertiser, AdCampaign, Advertisement, AdTransaction, AdImpression
from src.models.admin import Admin, AdminAction, SupportTicket, SupportMessage, FAQ, FAQVote
from src.models.activity import Activity, ActivityParticipant

# Import all routes
from src.routes.auth import auth_bp
from src.routes.users import users_bp
from src.routes.matching import matching_bp
from src.routes.messages import messages_bp
from src.routes.moments import moments_bp
from src.routes.subscriptions import subscriptions_bp
from src.routes.advertising import advertising_bp
from src.routes.admin import admin_bp
from src.routes.support import support_bp
from src.routes.activities import activities_bp
from src.routes.notifications import notifications_bp
from src.routes.upload import upload_bp



from dotenv import load_dotenv

# Load environment variables (.env.production or .env)
env_prod_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.production')
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')

if os.path.exists(env_prod_path):
    load_dotenv(env_prod_path)
elif os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuration
DEFAULT_STRONG_JWT_KEY = "c8f93e2b7a41904e5d6c8b1a3f0e7d5c9b2a4f6e8d1c3b5a7e9f0d2c4b6a8e1f"
DEFAULT_STRONG_SECRET_KEY = "e1f3a5b7c9d0e2f4a6b8c1d3e5f7a9b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2"

jwt_key = os.environ.get('JWT_SECRET_KEY')
if not jwt_key or len(jwt_key) < 32:
    jwt_key = DEFAULT_STRONG_JWT_KEY
app.config['JWT_SECRET_KEY'] = jwt_key

secret_key = os.environ.get('SECRET_KEY')
if not secret_key or len(secret_key) < 32:
    secret_key = DEFAULT_STRONG_SECRET_KEY
app.config['SECRET_KEY'] = secret_key

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Optional Sentry initialization
sentry_dsn = os.environ.get('SENTRY_DSN')
if sentry_dsn and not sentry_dsn.startswith('sua_url'):
    try:
        import importlib
        sentry_sdk = importlib.import_module('sentry_sdk')
        flask_integration = importlib.import_module('sentry_sdk.integrations.flask').FlaskIntegration
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[flask_integration()],
            traces_sample_rate=0.2
        )
        print("Sentry error monitoring initialized.")
    except Exception as se:
        print(f"Sentry notice: {se}")

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if database_url:
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    print(f"Connected to Production Database: PostgreSQL (Supabase/Cloud)")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
    print("Connected to Local Database: SQLite")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS configuration
allowed_origins_env = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,http://127.0.0.1:5174')
allowed_origins = [o.strip() for o in allowed_origins_env.split(',') if o.strip()]
CORS(app, origins=allowed_origins, allow_headers=["Content-Type", "Authorization"])

# Rate Limiter configuration
def get_client_ip():
    """Extract real client IP address considering proxy headers (Cloudflare/Nginx/Render)"""
    forwarded = request.headers.get('X-Forwarded-For')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.remote_addr or '127.0.0.1'

try:
    from flask_limiter import Limiter

    redis_url = os.environ.get('REDIS_URL')
    # Default to memory storage unless a remote Redis is reachable
    storage_uri = "memory://"
    if redis_url and not redis_url.startswith('redis://localhost'):
        storage_uri = redis_url

    limiter = Limiter(
        get_client_ip,
        app=app,
        default_limits=["2000 per hour", "200 per minute"],
        storage_uri=storage_uri,
        strategy="moving-window",
        swallow_errors=True,
        in_memory_fallback_enabled=True
    )
    print("Flask-Limiter rate limiting initialized.")
except Exception as le:
    limiter = None
    print(f"Limiter notice: {le}")

# SocketIO configuration
try:
    from flask_socketio import SocketIO
    from src.routes.socket_events import register_socket_events
    socketio = SocketIO(app, cors_allowed_origins="*")
    register_socket_events(socketio)
    print("WebSocket service initialized with Flask-SocketIO.")
except Exception as e:
    socketio = None
    print(f"SocketIO fallback notice: {e}")

# JWT configuration
jwt = JWTManager(app)

# Initialize database
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(matching_bp, url_prefix='/api/matching')
app.register_blueprint(messages_bp, url_prefix='/api/messages')
app.register_blueprint(moments_bp, url_prefix='/api/moments')
app.register_blueprint(subscriptions_bp, url_prefix='/api/subscriptions')
app.register_blueprint(advertising_bp, url_prefix='/api/advertising')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(support_bp, url_prefix='/api/support')
app.register_blueprint(activities_bp, url_prefix='/api/activities')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(upload_bp, url_prefix='/api/upload')

# Security Headers Middleware
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(self), camera=(), microphone=()'
    return response



from sqlalchemy import text, inspect

def sync_database_schema():
    """Ensure existing tables have all newly added columns dynamically"""
    try:
        inspector = inspect(db.engine)
        table_names = inspector.get_table_names()
        
        # 1. Users table
        if 'users' in table_names:
            existing_columns = [c['name'] for c in inspector.get_columns('users')]
            
            queries = []
            if 'intent_mode' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN intent_mode VARCHAR(30) DEFAULT 'all'")
            if 'available_until' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN available_until TIMESTAMP")
            if 'current_status_text' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN current_status_text VARCHAR(120)")
            if 'profile_prompts' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN profile_prompts TEXT")
            if 'push_token' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN push_token VARCHAR(255)")
            if 'status' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'available'")
            if 'anonymous_mode' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN anonymous_mode BOOLEAN DEFAULT FALSE")
            if 'is_visible' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN is_visible BOOLEAN DEFAULT TRUE")
            if 'empathy_points' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN empathy_points INTEGER DEFAULT 0")
            if 'achievements' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN achievements TEXT")
            if 'daily_likes_used' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN daily_likes_used INTEGER DEFAULT 0")
            if 'daily_messages_sent' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN daily_messages_sent INTEGER DEFAULT 0")
            if 'last_activity_reset' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN last_activity_reset DATE")
            if 'password_reset_token' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(36)")
            if 'password_reset_expires_at' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN password_reset_expires_at TIMESTAMP")
            if 'theme_preference' not in existing_columns:
                queries.append("ALTER TABLE users ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'dark'")

            for query in queries:
                try:
                    db.session.execute(text(query))
                    db.session.commit()
                    print(f"Schema Sync (users): Added column via '{query}'")
                except Exception as q_err:
                    db.session.rollback()
                    print(f"Schema Sync notice: {q_err}")

        # 2. Activities table
        if 'activities' in table_names:
            act_cols = [c['name'] for c in inspector.get_columns('activities')]
            if 'scheduled_time' not in act_cols:
                try:
                    db.session.execute(text("ALTER TABLE activities ADD COLUMN scheduled_time VARCHAR(100)"))
                    db.session.commit()
                    print("Schema Sync (activities): Added scheduled_time column")
                except Exception as q_err:
                    db.session.rollback()
            if 'photo_url' not in act_cols:
                try:
                    db.session.execute(text("ALTER TABLE activities ADD COLUMN photo_url TEXT"))
                    db.session.commit()
                    print("Schema Sync (activities): Added photo_url column")
                except Exception as q_err:
                    db.session.rollback()

        # 3. Activity_participants table
        if 'activity_participants' in table_names:
            part_cols = [c['name'] for c in inspector.get_columns('activity_participants')]
            if 'status' not in part_cols:
                try:
                    db.session.execute(text("ALTER TABLE activity_participants ADD COLUMN status VARCHAR(20) DEFAULT 'approved'"))
                    db.session.commit()
                    print("Schema Sync (activity_participants): Added status column")
                except Exception as q_err:
                    db.session.rollback()

        # 4. Moments table
        if 'moments' in table_names:
            try:
                db.session.execute(text("ALTER TABLE moments ALTER COLUMN photo_url TYPE TEXT"))
                db.session.commit()
            except Exception as q_err:
                db.session.rollback()

    except Exception as e:
        print(f"Schema Sync error: {e}")

# Background Worker for Expired Messages Cleanup (Runs every 12 hours)
def start_expired_messages_cleaner(app_instance):
    import time
    import threading
    def worker():
        while True:
            try:
                time.sleep(43200) # 12 hours
                with app_instance.app_context():
                    from src.models.user import Message
                    expired = Message.query.filter(Message.expires_at <= datetime.utcnow()).all()
                    if expired:
                        for m in expired:
                            db.session.delete(m)
                        db.session.commit()
                        print(f"🧹 Cleaner: Removidas {len(expired)} mensagens expiradas.")
            except Exception as e:
                print(f"Cleaner worker error: {e}")
    threading.Thread(target=worker, daemon=True).start()

# Create database tables
with app.app_context():
    from src.models.user import User, EmpathyTransaction
    db.create_all()
    sync_database_schema()
    
    # Create default admin user if it doesn't exist
    from src.models.admin import Admin
    admin = Admin.query.filter_by(email='admin@proximous.com').first()
    if not admin:
        import secrets
        default_password = os.environ.get('ADMIN_DEFAULT_PASSWORD', secrets.token_urlsafe(16))
        admin = Admin(
            email='admin@proximous.com',
            name='Administrador Principal',
            role='super_admin'
        )
        admin.set_password(default_password)
        db.session.add(admin)
        db.session.commit()
        if os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1'):
            print(f"Default admin created: admin@proximous.com / {default_password}")
        else:
            print("Default admin user created. Password set from ADMIN_DEFAULT_PASSWORD env var.")
    
    # Initialize / sync default promotional VIP days setting (7 days)
    from src.models.admin import SystemSetting
    current_free_days = SystemSetting.get_setting('global_free_premium_days')
    if current_free_days is None or current_free_days == '120':
        SystemSetting.set_setting('global_free_premium_days', 7, 'Período de Premium gratuito para todos os usuários (dias)')
    
    # Create default test users if they don't exist
    from src.models.user import User
    test_users = [
        {'email': 'teste@test.com', 'name': 'Usuário Teste', 'age': 25, 'gender': 'male', 'social_style': 'shy', 'bio': 'Usuário de testes da plataforma', 'city': 'São Paulo', 'lat': -23.5505, 'lon': -46.6333, 'photo': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'},
        {'email': 'user1@test.com', 'name': 'Mariana Silva', 'age': 24, 'gender': 'female', 'social_style': 'introverted', 'bio': 'Adoro música, café e conversas tranquilas.', 'city': 'São Paulo', 'lat': -23.5510, 'lon': -46.6340, 'photo': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'},
        {'email': 'user2@test.com', 'name': 'Lucas Santos', 'age': 27, 'gender': 'male', 'social_style': 'shy', 'bio': 'Gosto de tecnologia, filmes e caminhadas no parque.', 'city': 'São Paulo', 'lat': -23.5540, 'lon': -46.6380, 'photo': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'},
        {'email': 'user3@test.com', 'name': 'Camila Rocha', 'age': 23, 'gender': 'female', 'social_style': 'introverted', 'bio': 'Artista plástica e apaixonada por livros antigos.', 'city': 'São Paulo', 'lat': -23.5600, 'lon': -46.6450, 'photo': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'},
        {'email': 'user4@test.com', 'name': 'Gabriel Lima', 'age': 29, 'gender': 'male', 'social_style': 'extroverted', 'bio': 'Amante de fotografia urbana e culinária.', 'city': 'São Paulo', 'lat': -23.5700, 'lon': -46.6550, 'photo': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'},
        {'email': 'user5@test.com', 'name': 'Beatriz Oliveira', 'age': 26, 'gender': 'female', 'social_style': 'shy', 'bio': 'Desenvolvedora de jogos e amante de gatos.', 'city': 'São Paulo', 'lat': -23.5850, 'lon': -46.6700, 'photo': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'}
    ]
    for u_data in test_users:
        existing_user = User.query.filter_by(email=u_data['email']).first()
        if not existing_user:
            u = User(
                email=u_data['email'],
                name=u_data['name'],
                age=u_data['age'],
                gender=u_data.get('gender', 'female'),
                social_style=u_data['social_style'],
                bio=u_data['bio'],
                location_city=u_data.get('city', 'São Paulo'),
                latitude=u_data.get('lat'),
                longitude=u_data.get('lon'),
                profile_photo_url=u_data.get('photo'),
                is_premium=True,
                premium_expires_at=datetime.utcnow() + timedelta(days=7)
            )
            u.set_password('Password123')
            u.set_personality_tags(['Gentil', 'Criativo(a)', 'Calmo(a)'])
            u.set_interests(['Café', 'Música', 'Livros'])
            db.session.add(u)
        else:
            # Update gender and photo if missing
            if not existing_user.gender:
                existing_user.gender = u_data.get('gender', 'female')
            if not existing_user.profile_photo_url:
                existing_user.profile_photo_url = u_data.get('photo')
            if not existing_user.latitude:
                existing_user.latitude = u_data.get('lat')
                existing_user.longitude = u_data.get('lon')
    db.session.commit()
    print("Default test users created/updated")

    # Create default moments if none exist
    from src.models.moment import Moment
    if Moment.query.count() == 0:
        mariana = User.query.filter_by(email='user1@test.com').first()
        lucas = User.query.filter_by(email='user2@test.com').first()
        camila = User.query.filter_by(email='user3@test.com').first()
        
        default_moments = [
            {
                'user_id': mariana.id if mariana else None,
                'content': 'Domingo perfeito lendo um bom livro num café calmo. Alguém indica novidades de ficção científica? ☕📚',
                'photo_url': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&h=1080&fit=crop',
                'likes_count': 14
            },
            {
                'user_id': lucas.id if lucas else None,
                'content': 'Trilha matinal no fim de semana para recarregar as energias. Lugares silenciosos são os melhores. 🌿⛰️',
                'photo_url': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1080&fit=crop',
                'likes_count': 22
            },
            {
                'user_id': camila.id if camila else None,
                'content': 'Minha nova pintura a óleo concluída hoje. A arte é a forma mais pura de conversa. 🎨',
                'photo_url': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&h=1080&fit=crop',
                'likes_count': 31
            }
        ]
        for m_data in default_moments:
            if m_data['user_id']:
                m = Moment(**m_data)
                db.session.add(m)
        db.session.commit()
        print("Default 1080x1080 moments created")

    
    # Create default subscription plans

    from src.models.subscription import SubscriptionPlan
    monthly_plan = SubscriptionPlan.query.filter_by(plan_type='monthly').first()
    if not monthly_plan:
        monthly_plan = SubscriptionPlan(
            name='Proximous Premium Mensal',
            plan_type='monthly',
            price=2.99,
            currency='BRL'
        )
        db.session.add(monthly_plan)
    
    annual_plan = SubscriptionPlan.query.filter_by(plan_type='annual').first()
    if not annual_plan:
        annual_plan = SubscriptionPlan(
            name='Proximous Premium Anual',
            plan_type='annual',
            price=30.00,
            currency='BRL'
        )
        db.session.add(annual_plan)
    
    db.session.commit()
    print("Default subscription plans created")
    
    # Create default achievements
    from src.models.user import Achievement
    achievements_data = [
        {
            'name': 'Primeiro Passo Corajoso',
            'description': 'Enviou sua primeira curtida',
            'category': 'social',
            'points_required': 0
        },
        {
            'name': 'Construtor de Pontes',
            'description': 'Iniciou 5 conversas',
            'category': 'social',
            'points_required': 0
        },
        {
            'name': 'Ouvinte Atento',
            'description': 'Respondeu a 10 mensagens',
            'category': 'engagement',
            'points_required': 0
        },
        {
            'name': 'Semana de Conexões',
            'description': 'Usou o app por 7 dias consecutivos',
            'category': 'milestone',
            'points_required': 0
        },
        {
            'name': 'Coração Gentil',
            'description': 'Enviou 10 elogios',
            'category': 'social',
            'points_required': 0
        }
    ]
    
    for achievement_data in achievements_data:
        existing = Achievement.query.filter_by(name=achievement_data['name']).first()
        if not existing:
            achievement = Achievement(**achievement_data)
            db.session.add(achievement)
    
    db.session.commit()
    print("Default achievements created")
    
    # Create default FAQs
    from src.models.admin import FAQ
    faqs_data = [
        {
            'question': 'Como funciona o Proximous?',
            'answer': 'O Proximous é um aplicativo que conecta pessoas tímidas e introvertidas de forma segura e respeitosa. Você pode descobrir pessoas próximas, enviar curtidas e elogios, e iniciar conversas em um ambiente acolhedor.',
            'category': 'general',
            'order_index': 1,
            'is_featured': True
        },
        {
            'question': 'O que está incluído no plano Premium?',
            'answer': 'O plano Premium inclui curtidas e mensagens ilimitadas, experiência sem anúncios, modo anônimo, controles avançados de localização, filtros de compatibilidade e suporte prioritário.',
            'category': 'premium',
            'order_index': 2,
            'is_featured': True
        },
        {
            'question': 'Como posso cancelar minha assinatura?',
            'answer': 'Você pode cancelar sua assinatura a qualquer momento através das configurações do seu perfil. Sua assinatura permanecerá ativa até o final do período pago.',
            'category': 'premium',
            'order_index': 3
        },
        {
            'question': 'Como reportar um usuário inadequado?',
            'answer': 'Se você encontrar comportamento inadequado, toque no perfil do usuário e selecione "Reportar". Nossa equipe de moderação revisará o caso em até 24 horas.',
            'category': 'safety',
            'order_index': 4
        },
        {
            'question': 'Meus dados estão seguros?',
            'answer': 'Sim, levamos sua privacidade muito a sério. Todos os dados são criptografados e nunca compartilhamos informações pessoais com terceiros sem seu consentimento.',
            'category': 'safety',
            'order_index': 5
        }
    ]
    
    for faq_data in faqs_data:
        existing = FAQ.query.filter_by(question=faq_data['question']).first()
        if not existing:
            faq = FAQ(**faq_data)
            db.session.add(faq)
    
    db.session.commit()
    print("Default FAQs created")
    
    # Start cleaner thread
    start_expired_messages_cleaner(app)


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return {'error': 'Endpoint not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Internal server error'}, 500

# Health check endpoint
@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'service': 'proximous-backend'}

# Serve frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "Frontend not found. Please build and deploy the frontend first.", 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1')

    host = os.environ.get('HOST', '127.0.0.1')
    
    try:
        if socketio:
            socketio.run(app, host=host, port=port, debug=debug, allow_unsafe_werkzeug=True)
        else:
            app.run(host=host, port=port, debug=debug)
    except OSError as err:
        print(f"\n⚠️ Porta {port} bloqueada no Windows ({err}). Tentando porta 5005...")
        port = 5005
        if socketio:
            socketio.run(app, host=host, port=port, debug=debug, allow_unsafe_werkzeug=True)
        else:
            app.run(host=host, port=port, debug=debug)

