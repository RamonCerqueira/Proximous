import json

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_register_user(client):
    payload = {
        'email': 'newuser@proximous.com',
        'password': 'SecurePassword123',
        'name': 'Novo Usuário',
        'age': 26,
        'social_style': 'shy',
        'interests': ['Música', 'Livros'],
        'personality_tags': ['Calmo']
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['user']['email'] == 'newuser@proximous.com'

def test_login_user(client, test_user):
    payload = {
        'email': 'testuser@proximous.com',
        'password': 'Password123'
    }
    response = client.post('/api/auth/login', json=payload)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert 'refresh_token' in data

def test_forgot_and_reset_password_flow(client, test_user):
    # 1. Request forgot password
    res = client.post('/api/auth/forgot-password', json={'email': 'testuser@proximous.com'})
    assert res.status_code == 200

    # 2. Verify token was created
    assert test_user.password_reset_token is not None

    # 3. Reset password with token
    reset_payload = {
        'token': test_user.password_reset_token,
        'new_password': 'BrandNewPassword123'
    }
    reset_res = client.post('/api/auth/reset-password', json=reset_payload)
    assert reset_res.status_code == 200

    # 4. Login with new password
    login_res = client.post('/api/auth/login', json={
        'email': 'testuser@proximous.com',
        'password': 'BrandNewPassword123'
    })
    assert login_res.status_code == 200
