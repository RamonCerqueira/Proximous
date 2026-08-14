import requests
from src.models.user import User

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

def send_expo_push_notification(user_id, title, body, data=None):
    """
    Sends an Expo Push Notification to a user given their user_id if they have a valid push_token.
    """
    try:
        user = User.query.get(user_id)
        if not user or not user.push_token:
            return False, "User has no push token registered"
        
        token = user.push_token.strip()
        if not (token.startswith("ExponentPushToken[") or token.startswith("ExpoPushToken[")):
            # Basic validation
            pass

        payload = {
            "to": token,
            "sound": "default",
            "title": title,
            "body": body,
            "data": data or {}
        }

        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json"
        }

        response = requests.post(EXPO_PUSH_URL, json=payload, headers=headers, timeout=5)
        response_json = response.json()
        
        return True, response_json
    except Exception as e:
        print(f"Error sending push notification to user {user_id}: {e}")
        return False, str(e)
