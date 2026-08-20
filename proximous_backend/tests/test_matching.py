import json
from src.models.user import db, User

def test_mutual_match_and_compatibility(client, app, test_user):
    with app.app_context():
        # Create second user
        user2 = User(
            email='user2@proximous.com',
            name='User Two',
            age=24,
            social_style='introverted'
        )
        user2.set_password('Password123')
        user2.set_interests(['Café', 'Música', 'Cinema'])
        user2.set_personality_tags(['Gentil', 'Criativo'])
        db.session.add(user2)
        db.session.commit()

        # Login as test_user
        login1 = client.post('/api/auth/login', json={'email': 'testuser@proximous.com', 'password': 'Password123'})
        token1 = json.loads(login1.data)['access_token']

        # Login as user2
        login2 = client.post('/api/auth/login', json={'email': 'user2@proximous.com', 'password': 'Password123'})
        token2 = json.loads(login2.data)['access_token']

        # 1. test_user likes user2
        like1 = client.post('/api/matching/like', json={'receiver_id': user2.id, 'like_type': 'like'}, headers={'Authorization': f"Bearer {token1}"})
        assert like1.status_code == 201

        # 2. user2 likes test_user -> Mutual match!
        like2 = client.post('/api/matching/like', json={'receiver_id': test_user.id, 'like_type': 'like'}, headers={'Authorization': f"Bearer {token2}"})
        assert like2.status_code == 201
        data2 = json.loads(like2.data)
        assert data2.get('is_match') is True

        # 3. Check matches list for test_user
        matches_res = client.get('/api/matching/matches', headers={'Authorization': f"Bearer {token1}"})
        assert matches_res.status_code == 200
        matches_data = json.loads(matches_res.data)
        assert len(matches_data.get('matches', [])) >= 1
