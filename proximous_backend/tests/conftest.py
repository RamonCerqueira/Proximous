import pytest
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app as flask_app
from src.models.user import db as _db, User

@pytest.fixture
def app():
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'JWT_SECRET_KEY': 'test-secret-key',
    })

    with flask_app.app_context():
        _db.create_all()
        yield flask_app
        _db.session.remove()
        _db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def test_user(app):
    user = User(
        email='testuser@proximous.com',
        name='Test User',
        age=25,
        social_style='introverted'
    )
    user.set_password('Password123')
    user.set_interests(['Café', 'Música'])
    user.set_personality_tags(['Gentil', 'Calmo'])
    _db.session.add(user)
    _db.session.commit()
    return user
