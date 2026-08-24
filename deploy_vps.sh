#!/bin/bash
# Script de Deploy 100% Autônomo e Automatizado para Proximous VPS (PM2 + Nginx)
# Domínio: proximous.genioplay.com.br | IP: 153.75.244.238
# Uso: bash deploy_vps.sh

set -e

echo "🚀 Iniciando Deploy Automatizado do Proximous na VPS..."

# ---------------------------------------------------------
# 1. Gerar Arquivos de Configuração (.env e PM2 / Nginx)
# ---------------------------------------------------------
echo "📝 Criando arquivos de ambiente e configuração automaticamente..."

# Backend .env.production
cat << 'EOF' > proximous_backend/.env.production
# Configurações de Produção - Proximous Backend
FLASK_DEBUG=False
PORT=8700
HOST=0.0.0.0
SECRET_KEY=e1f3a5b7c9d0e2f4a6b8c1d3e5f7a9b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2

# Banco de dados Supabase (PostgreSQL)
DATABASE_URL=postgresql://postgres.zmozsnolufcqiwqxamhi:Ramondev123Proximous@aws-0-us-east-2.pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET_KEY=c8f93e2b7a41904e5d6c8b1a3f0e7d5c9b2a4f6e8d1c3b5a7e9f0d2c4b6a8e1f
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# Armazenamento & Cloudinary
UPLOAD_FOLDER=/var/www/proximous/uploads
MAX_CONTENT_LENGTH=16777216
CLOUDINARY_CLOUD_NAME=vpoy3eep
CLOUDINARY_API_KEY=936437946999226
CLOUDINARY_API_SECRET=dv8zIK1LfJtsIu6BuyyPwC65bJM
CLOUDINARY_URL=cloudinary://936437946999226:dv8zIK1LfJtsIu6BuyyPwC65bJM@vpoy3eep

# Resend & PIX
RESEND_API_KEY=re_123456789_sua_chave_resend
DEFAULT_FROM_EMAIL=onboarding@resend.dev
PIX_KEY=03207834566

# Redis (Docker já ativo na VPS)
REDIS_URL=redis://localhost:6379/0

# Segurança e CORS
CORS_ORIGINS=http://proximous.genioplay.com.br,https://proximous.genioplay.com.br,http://153.75.244.238:8700,http://153.75.244.238:8701,http://153.75.244.238:8702,http://localhost:8701,http://localhost:5173
RATE_LIMIT_ENABLED=True
RATE_LIMIT_PER_MINUTE=60
EOF

# Frontend Web .env.production
cat << 'EOF' > proximous-web/.env.production
VITE_API_URL=/api
VITE_APP_NAME=Proximous
VITE_APP_VERSION=1.0.0
EOF

# PM2 ecosystem.config.js
cat << 'EOF' > ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'proximous-backend',
      script: 'src/main.py',
      interpreter: '/var/www/proximous/proximous_backend/venv/bin/python3',
      cwd: '/var/www/proximous/proximous_backend',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8700,
        HOST: '0.0.0.0',
        FLASK_DEBUG: 'False'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'proximous-web',
      script: 'node_modules/serve/build/main.js',
      args: '-s dist -l 8701',
      cwd: '/var/www/proximous/proximous-web',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8701
      },
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
EOF

# Nginx Configuration
cat << 'EOF' > nginx_proximous.conf
# Configuração Nginx para Proximous (VPS Linux)
# Domínio: proximous.genioplay.com.br | IP: 153.75.244.238

server {
    listen 80;
    server_name proximous.genioplay.com.br 153.75.244.238;

    client_max_body_size 25M;

    # Frontend Web App (Proxy para PM2 / Serve na porta 8701)
    location / {
        proxy_pass http://127.0.0.1:8701;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API Flask (Proxy para PM2 Flask na porta 8700)
    location /api/ {
        proxy_pass http://127.0.0.1:8700/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSockets / Socket.io para Realtime Messaging
    location /socket.io/ {
        proxy_pass http://127.0.0.1:8700/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# ---------------------------------------------------------
# 2. Instalar Pacote Serve para PM2 se necessário
# ---------------------------------------------------------
if ! command -v serve &> /dev/null; then
    echo "📦 Instalando pacote 'serve' globalmente..."
    npm install -g serve
fi

# ---------------------------------------------------------
# 3. Configurar Ambiente Python do Backend
# ---------------------------------------------------------
echo "🐍 Configurando venv e dependências do Backend (Porta 8700)..."
cd proximous_backend
if [ ! -f "venv/bin/python3" ] || [ ! -x "venv/bin/python3" ]; then
    rm -rf venv
    python3 -m venv venv
fi
chmod -R 755 venv 2>/dev/null || true
ln -sf python3 venv/bin/python 2>/dev/null || true
./venv/bin/python3 -m pip install --upgrade pip --break-system-packages || true
./venv/bin/python3 -m pip install -r requirements.txt --break-system-packages || ./venv/bin/python3 -m pip install -r requirements.txt
./venv/bin/python3 -m pip install gunicorn gevent eventlet --break-system-packages || ./venv/bin/python3 -m pip install gunicorn gevent eventlet
cd ..

# ---------------------------------------------------------
# 4. Instalar e Compilar o Frontend Web React
# ---------------------------------------------------------
echo "🎨 Compilando o Frontend Web (Porta 8701)..."
cd proximous-web
rm -rf node_modules
npm install --legacy-peer-deps
chmod -R +x node_modules/.bin || true
npm run build
cd ..

# ---------------------------------------------------------
# 5. Inicializar / Recarregar Aplicações no PM2
# ---------------------------------------------------------
echo "🔄 Recarregando serviços no PM2..."
pm2 delete proximous-backend proximous-web 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# ---------------------------------------------------------
# 6. Atualizar e Recarregar Nginx
# ---------------------------------------------------------
echo "🌐 Atualizando bloco de servidor do Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/00-proximous.conf
sudo cp nginx_proximous.conf /etc/nginx/sites-available/proximous.conf
sudo ln -sf /etc/nginx/sites-available/proximous.conf /etc/nginx/sites-enabled/proximous.conf
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✨ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "--------------------------------------------------------"
echo "🌐 Web App (Domínio): https://proximous.genioplay.com.br"
echo "🖥️ Web App (Porta 8701): http://153.75.244.238:8701"
echo "⚙️ Backend API (Porta 8700): http://153.75.244.238:8700"
echo "--------------------------------------------------------"
