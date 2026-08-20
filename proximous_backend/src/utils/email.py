import os
import json
import urllib.request
import urllib.error

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

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
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    html = f"""
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Proximous 💜</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937;">Recuperação de Senha</h2>
            <p style="color: #6b7280;">Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px;">Redefinir Senha</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px;">Este link expira em <strong>1 hora</strong>. Se você não solicitou esta alteração, desconsidere este e-mail.</p>
        </div>
    </div>
    """
    return send_email(to_email, subject, html)


def send_welcome_email(to_email: str, name: str) -> bool:
    subject = "Bem-vindo(a) ao Proximous! 💜"
    html = f"""
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Proximous 💜</h1>
            <p style="color: #e9d5ff; margin: 8px 0 0;">Sua rede social para conexões autênticas</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937;">Olá, {name}! 👋</h2>
            <p style="color: #6b7280;">Seja muito bem-vindo(a) ao Proximous — o lugar onde pessoas tímidas e introvertidas se conectam de forma respeitosa e segura.</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #7c3aed; margin-top: 0;">🚀 Por onde começar?</h3>
                <ul style="color: #6b7280; line-height: 1.8;">
                    <li><strong>Complete seu perfil</strong> — adicione fotos e interesses</li>
                    <li><strong>Descubra pessoas próximas</strong> — veja quem está perto de você</li>
                    <li><strong>Publique um Momento</strong> — compartilhe como está seu dia</li>
                    <li><strong>Explore o Modo AGORA</strong> — encontre quem está disponível agora</li>
                </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{FRONTEND_URL}" style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px;">Acessar o Proximous</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Com carinho, equipe Proximous 💜</p>
        </div>
    </div>
    """
    return send_email(to_email, subject, html)
