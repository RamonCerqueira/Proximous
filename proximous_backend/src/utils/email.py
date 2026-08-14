import os
import json
import urllib.request
import urllib.error

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "onboarding@resend.dev")

def send_email(to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
    """
    Envia e-mail transacional via API do Resend.
    """
    if not RESEND_API_KEY:
        print(f"[Email Simulado] Para: {to_email} | Assunto: {subject}")
        return True

    url = "https://api.resend.com/emails"
    payload = {
        "from": DEFAULT_FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    if text_content:
        payload["text"] = text_content

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            print(f"[Resend Success] Email enviado para {to_email}: {res_body}")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[Resend Error] Status {e.code}: {error_body}")
        return False
    except Exception as e:
        print(f"[Resend Exception] Erro inesperado: {str(e)}")
        return False

def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    subject = "Proximous - Recuperação de Senha"
    reset_url = f"http://localhost:5173/reset-password?token={reset_token}"
    html = f"""
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Recuperação de Senha - Proximous</h2>
        <p>Você solicitou a redefinição da sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="{reset_url}" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Redefinir Senha</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">Se você não solicitou esta alteração, desconsidere este e-mail.</p>
    </div>
    """
    return send_email(to_email, subject, html)
