import os

class TokenBlacklist:
    """
    Blacklist manager for JWT tokens using Redis if available,
    with an in-memory set fallback for development.
    """
    def __init__(self):
        self._memory_set = set()
        self._redis_client = None
        
        redis_url = os.environ.get('REDIS_URL')
        if redis_url:
            try:
                import redis
                self._redis_client = redis.from_url(redis_url)
                print("Redis token blacklist connected successfully.")
            except Exception as e:
                print(f"Failed to connect to Redis ({e}), falling back to in-memory blacklist.")

    def add(self, jti: str, expires_in_seconds: int = 86400):
        if self._redis_client:
            try:
                self._redis_client.setex(f"blacklist:{jti}", expires_in_seconds, "revoked")
                return
            except Exception as e:
                print(f"Redis add error ({e}), storing in memory.")
        self._memory_set.add(jti)

    def is_blacklisted(self, jti: str) -> bool:
        if self._redis_client:
            try:
                return bool(self._redis_client.exists(f"blacklist:{jti}"))
            except Exception as e:
                print(f"Redis check error ({e}), checking memory.")
        return jti in self._memory_set

token_blacklist = TokenBlacklist()
