#!/bin/bash
# ====================================================================
# Script de Atualização Rápida do Proximous na VPS (Sem reinstalação total)
# Uso: bash update_vps.sh
# ====================================================================

set -e

echo "🔄 Iniciando atualização do Proximous na VPS..."

# Garantir diretório raiz do projeto
cd /var/www/proximous 2>/dev/null || cd "$(dirname "$0")"

# 1. Puxar últimas alterações do Git
echo "📥 Puxando código do repositório..."
git checkout -- proximous-web/dist/ 2>/dev/null || true
git fetch origin main
git checkout main 2>/dev/null || true
git reset --hard origin/main
git pull origin main

# 2. Atualizar dependências do Backend se houver novidades
echo "🐍 Atualizando Backend..."
cd proximous_backend
if [ -d "venv" ]; then
    ./venv/bin/pip install -r requirements.txt --break-system-packages 2>/dev/null || ./venv/bin/pip install -r requirements.txt
else
    python3 -m venv venv
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r requirements.txt
fi
cd ..

# 3. Compilar o Frontend Web React
echo "⚛️ Compilando Frontend Web..."
cd proximous-web
pnpm install --no-frozen-lockfile 2>/dev/null || npm install --legacy-peer-deps 2>/dev/null || true
npm run build || pnpm build
cd ..

# 4. Reiniciar serviços no PM2
echo "🚀 Reiniciando aplicações no PM2..."
pm2 reload ecosystem.config.js 2>/dev/null || pm2 restart ecosystem.config.js 2>/dev/null || pm2 restart all
pm2 save

echo ""
echo "============================================================"
echo "✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "🌐 Acesse: https://proximous.genioplay.com.br"
echo "============================================================"
pm2 status
