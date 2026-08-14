# Documentação Técnica Completa - Proximous

**Versão:** 1.0.0  
**Data:** Janeiro 2025  
**Autor:** Manus AI  
**Projeto:** Aplicativo de Rede Social Baseado em Localização

---

## Sumário Executivo

O Proximous é uma plataforma completa de rede social baseada em localização, desenvolvida para conectar pessoas próximas geograficamente através de um sistema de matching inteligente. Este documento apresenta a documentação técnica abrangente do sistema, incluindo arquitetura, implementação, configuração e guias operacionais.

A plataforma foi desenvolvida com foco em escalabilidade, segurança e experiência do usuário, oferecendo funcionalidades completas para web e mobile (iOS/Android), sistema de pagamentos integrado, área administrativa robusta, plataforma de publicidade e suporte técnico abrangente.

## 1. Visão Geral da Arquitetura

### 1.1 Arquitetura Geral do Sistema

O Proximous foi desenvolvido seguindo uma arquitetura moderna de microserviços, com separação clara entre frontend, backend e serviços auxiliares. A arquitetura é composta pelos seguintes componentes principais:

**Backend (API REST):**
- Framework: Flask (Python 3.11)
- Banco de Dados: SQLite (desenvolvimento) / PostgreSQL (produção)
- Autenticação: JWT (JSON Web Tokens)
- Geolocalização: Cálculos de distância com Haversine
- Sistema de Arquivos: Local (desenvolvimento) / AWS S3 (produção)

**Frontend Web:**
- Framework: React 18 com Vite
- Estilização: Tailwind CSS + shadcn/ui
- Roteamento: React Router DOM
- Estado: Context API + Hooks customizados
- Build: Vite para otimização e bundling

**Aplicativo Mobile:**
- Framework: React Native com Expo
- Navegação: React Navigation
- Armazenamento Local: AsyncStorage
- Notificações: Expo Notifications
- Geolocalização: Expo Location

**Infraestrutura:**
- Hospedagem: Serviços de nuvem escaláveis
- CDN: Para entrega de assets estáticos
- Monitoramento: Logs centralizados e métricas
- Backup: Backup automático de dados críticos

### 1.2 Fluxo de Dados e Comunicação

O sistema utiliza uma arquitetura RESTful para comunicação entre componentes, com os seguintes padrões de fluxo de dados:

**Autenticação e Autorização:**
1. Usuário faz login através do frontend
2. Backend valida credenciais e gera JWT
3. Token é armazenado no cliente (localStorage/AsyncStorage)
4. Todas as requisições subsequentes incluem o token no header Authorization
5. Backend valida token em cada requisição protegida

**Geolocalização e Matching:**
1. Cliente solicita permissão de localização
2. Coordenadas são enviadas para o backend
3. Backend calcula distâncias usando fórmula Haversine
4. Algoritmo de matching filtra usuários por proximidade e preferências
5. Resultados são retornados paginados para o cliente

**Sistema de Mensagens:**
1. Mensagens são enviadas via API REST
2. Backend armazena mensagens no banco de dados
3. Sistema de polling ou WebSockets para atualizações em tempo real
4. Notificações push são enviadas para usuários offline

### 1.3 Segurança e Privacidade

A segurança é uma prioridade fundamental no Proximous, implementada através de múltiplas camadas:

**Autenticação e Autorização:**
- Senhas são hasheadas usando bcrypt com salt
- Tokens JWT com expiração configurável
- Refresh tokens para renovação segura
- Rate limiting para prevenir ataques de força bruta

**Proteção de Dados:**
- Validação rigorosa de entrada em todas as APIs
- Sanitização de dados para prevenir XSS
- Proteção CSRF em formulários
- Criptografia de dados sensíveis em repouso

**Privacidade de Localização:**
- Coordenadas exatas nunca são expostas
- Apenas distâncias aproximadas são mostradas
- Usuários podem desabilitar compartilhamento de localização
- Dados de localização são periodicamente limpos

## 2. Estrutura do Banco de Dados

### 2.1 Modelo de Dados Principal

O banco de dados foi projetado para suportar todas as funcionalidades do Proximous de forma eficiente e escalável:

**Tabela Users:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20),
    bio TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    last_seen TIMESTAMP,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabela Matches:**
```sql
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id),
    UNIQUE(user1_id, user2_id)
);
```

**Tabela Messages:**
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

### 2.2 Tabelas de Negócio e Monetização

**Tabela Subscriptions:**
```sql
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Tabela Advertising_Campaigns:**
```sql
CREATE TABLE advertising_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    advertiser_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    spent DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    target_age_min INTEGER,
    target_age_max INTEGER,
    target_gender VARCHAR(20),
    target_location TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advertiser_id) REFERENCES users(id)
);
```

### 2.3 Índices e Otimizações

Para garantir performance adequada, foram criados índices estratégicos:

```sql
-- Índices para geolocalização
CREATE INDEX idx_users_location ON users(location_lat, location_lng);
CREATE INDEX idx_users_last_seen ON users(last_seen);

-- Índices para matching
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_active ON matches(is_active);

-- Índices para mensagens
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- Índices para assinaturas
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

## 3. APIs e Endpoints

### 3.1 Autenticação e Usuários

A API de autenticação fornece endpoints seguros para gerenciamento de contas:

**POST /api/auth/register**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "birth_date": "1990-05-15",
  "gender": "male"
}
```

**POST /api/auth/login**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta de Login:**
```json
{
  "success": true,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "is_premium": false
  }
}
```

### 3.2 Sistema de Matching

**GET /api/users/discover**
```
Parâmetros:
- max_distance: distância máxima em km (padrão: 50)
- min_age: idade mínima (padrão: 18)
- max_age: idade máxima (padrão: 100)
- gender: gênero preferido (opcional)
- limit: número de resultados (padrão: 10)
```

**POST /api/matching/like**
```json
{
  "target_user_id": 123,
  "type": "like" // ou "super_like"
}
```

### 3.3 Sistema de Mensagens

**GET /api/messages/conversations**
```
Retorna lista de conversas do usuário com preview da última mensagem
```

**POST /api/messages/send**
```json
{
  "receiver_id": 123,
  "content": "Olá! Como você está?"
}
```

### 3.4 Sistema de Assinaturas

**GET /api/subscriptions/plans**
```json
{
  "plans": [
    {
      "id": "premium_monthly",
      "name": "Premium Mensal",
      "price": 19.90,
      "interval": "monthly",
      "features": [
        "Curtidas ilimitadas",
        "5 Super Likes por dia",
        "Ver quem curtiu você"
      ]
    }
  ]
}
```

**POST /api/subscriptions/subscribe**
```json
{
  "plan_id": "premium_monthly",
  "payment_method": "credit_card",
  "coupon_code": "DESCONTO10"
}
```

## 4. Configuração e Instalação

### 4.1 Requisitos do Sistema

**Desenvolvimento:**
- Python 3.11+
- Node.js 20+
- npm ou pnpm
- Git

**Produção:**
- Servidor Linux (Ubuntu 22.04 recomendado)
- PostgreSQL 14+
- Redis (para cache e sessões)
- Nginx (proxy reverso)
- SSL/TLS certificado

### 4.2 Instalação do Backend

```bash
# Clone o repositório
git clone https://github.com/proximous/backend.git
cd proximous_backend

# Crie ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Instale dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Execute migrações
python src/main.py migrate

# Inicie o servidor
python src/main.py
```

### 4.3 Instalação do Frontend Web

```bash
# Clone o repositório
git clone https://github.com/proximous/frontend-web.git
cd proximous-web

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com a URL da API

# Inicie o servidor de desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
```

### 4.4 Instalação do App Mobile

```bash
# Clone o repositório
git clone https://github.com/proximous/mobile.git
cd proximous-mobile

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com configurações

# Inicie o Expo
npx expo start

# Build para produção
npx expo build:android
npx expo build:ios
```

## 5. Variáveis de Ambiente

### 5.1 Backend (.env)

```env
# Configurações básicas
FLASK_ENV=development
SECRET_KEY=sua_chave_secreta_muito_forte
DEBUG=True

# Banco de dados
DATABASE_URL=sqlite:///proximous.db
# Para produção: postgresql://user:pass@localhost/proximous

# JWT
JWT_SECRET_KEY=sua_chave_jwt_secreta
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# Armazenamento
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# APIs externas
GOOGLE_MAPS_API_KEY=sua_chave_google_maps
STRIPE_SECRET_KEY=sua_chave_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret

# Redis (produção)
REDIS_URL=redis://localhost:6379/0
```

### 5.2 Frontend Web (.env.local)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Proximous
VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
VITE_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_stripe
```

### 5.3 Mobile (.env)

```env
API_BASE_URL=http://localhost:5000/api
GOOGLE_MAPS_API_KEY=sua_chave_google_maps
STRIPE_PUBLISHABLE_KEY=sua_chave_publica_stripe
SENTRY_DSN=sua_url_sentry
```

## 6. Deploy e Produção

### 6.1 Configuração do Servidor

**Instalação de Dependências:**
```bash
# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale Python e dependências
sudo apt install python3.11 python3.11-venv python3-pip -y

# Instale PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instale Redis
sudo apt install redis-server -y

# Instale Nginx
sudo apt install nginx -y

# Instale Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

**Configuração do PostgreSQL:**
```bash
# Acesse o PostgreSQL
sudo -u postgres psql

# Crie banco e usuário
CREATE DATABASE proximous;
CREATE USER proximous_user WITH PASSWORD 'senha_forte';
GRANT ALL PRIVILEGES ON DATABASE proximous TO proximous_user;
\q
```

### 6.2 Deploy do Backend

```bash
# Clone e configure o backend
git clone https://github.com/proximous/backend.git /var/www/proximous-backend
cd /var/www/proximous-backend

# Configure ambiente virtual
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure variáveis de ambiente para produção
sudo nano .env
# Defina DATABASE_URL, SECRET_KEY, etc.

# Execute migrações
python src/main.py migrate

# Configure systemd service
sudo nano /etc/systemd/system/proximous-backend.service
```

**Arquivo de Serviço (proximous-backend.service):**
```ini
[Unit]
Description=Proximous Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/proximous-backend
Environment=PATH=/var/www/proximous-backend/venv/bin
ExecStart=/var/www/proximous-backend/venv/bin/python src/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### 6.3 Configuração do Nginx

```nginx
# /etc/nginx/sites-available/proximous
server {
    listen 80;
    server_name api.proximous.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name proximous.com www.proximous.com;
    root /var/www/proximous-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 6.4 SSL/TLS com Let's Encrypt

```bash
# Instale Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenha certificados
sudo certbot --nginx -d proximous.com -d www.proximous.com -d api.proximous.com

# Configure renovação automática
sudo crontab -e
# Adicione: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 7. Monitoramento e Logs

### 7.1 Configuração de Logs

**Backend (Python logging):**
```python
import logging
from logging.handlers import RotatingFileHandler

# Configuração de logs
if not app.debug:
    file_handler = RotatingFileHandler(
        'logs/proximous.log', 
        maxBytes=10240000, 
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

### 7.2 Métricas e Monitoramento

**Métricas Importantes:**
- Tempo de resposta das APIs
- Taxa de erro (4xx, 5xx)
- Número de usuários ativos
- Taxa de conversão premium
- Performance do banco de dados
- Uso de memória e CPU

**Ferramentas Recomendadas:**
- Prometheus + Grafana para métricas
- ELK Stack para logs centralizados
- Sentry para tracking de erros
- New Relic ou DataDog para APM

## 8. Segurança e Backup

### 8.1 Medidas de Segurança

**Firewall e Rede:**
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

**Backup Automático:**
```bash
#!/bin/bash
# /usr/local/bin/backup-proximous.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/proximous"

# Backup do banco de dados
pg_dump proximous > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de arquivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/proximous-backend/uploads

# Remover backups antigos (manter 30 dias)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### 8.2 Atualizações e Manutenção

**Script de Deploy Automatizado:**
```bash
#!/bin/bash
# deploy.sh

echo "Iniciando deploy do Proximous..."

# Backup antes do deploy
/usr/local/bin/backup-proximous.sh

# Atualizar backend
cd /var/www/proximous-backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python src/main.py migrate

# Atualizar frontend
cd /var/www/proximous-frontend
git pull origin main
npm install
npm run build

# Reiniciar serviços
sudo systemctl restart proximous-backend
sudo systemctl reload nginx

echo "Deploy concluído com sucesso!"
```

## 9. Troubleshooting

### 9.1 Problemas Comuns

**Backend não inicia:**
```bash
# Verificar logs
sudo journalctl -u proximous-backend -f

# Verificar status
sudo systemctl status proximous-backend

# Testar manualmente
cd /var/www/proximous-backend
source venv/bin/activate
python src/main.py
```

**Problemas de CORS:**
```python
# Verificar configuração CORS no backend
from flask_cors import CORS
CORS(app, origins=['https://proximous.com', 'https://www.proximous.com'])
```

**Banco de dados lento:**
```sql
-- Verificar queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Analisar índices
EXPLAIN ANALYZE SELECT * FROM users WHERE location_lat BETWEEN -23.5 AND -23.6;
```

### 9.2 Comandos Úteis

**Monitoramento em tempo real:**
```bash
# CPU e memória
htop

# Conexões de rede
netstat -tulpn

# Espaço em disco
df -h

# Logs em tempo real
tail -f /var/log/nginx/access.log
tail -f logs/proximous.log
```

**Backup e restauração:**
```bash
# Backup manual
pg_dump proximous > backup.sql

# Restauração
psql proximous < backup.sql

# Verificar integridade
psql proximous -c "SELECT COUNT(*) FROM users;"
```

## 10. Roadmap e Melhorias Futuras

### 10.1 Funcionalidades Planejadas

**Curto Prazo (3 meses):**
- Videochamadas integradas
- Stories temporários
- Sistema de verificação de perfil
- Chat por voz
- Integração com redes sociais

**Médio Prazo (6 meses):**
- Inteligência artificial para matching
- Eventos e encontros locais
- Sistema de recompensas
- Modo escuro
- Suporte a múltiplos idiomas

**Longo Prazo (12 meses):**
- Realidade aumentada
- Integração com wearables
- Marketplace interno
- Sistema de mentoria
- Expansão internacional

### 10.2 Otimizações Técnicas

**Performance:**
- Implementação de cache Redis
- CDN para assets estáticos
- Otimização de queries
- Lazy loading de imagens
- Compressão de dados

**Escalabilidade:**
- Microserviços
- Load balancing
- Database sharding
- Message queues
- Auto-scaling

**Segurança:**
- Two-factor authentication
- Biometria no mobile
- Audit logs
- Penetration testing
- GDPR compliance

---

## Conclusão

Esta documentação técnica fornece uma visão abrangente do sistema Proximous, desde sua arquitetura até procedimentos operacionais. O sistema foi desenvolvido com foco em escalabilidade, segurança e experiência do usuário, utilizando tecnologias modernas e melhores práticas da indústria.

Para suporte técnico ou dúvidas sobre implementação, entre em contato com a equipe de desenvolvimento através do email: dev@proximous.com

**Última atualização:** Janeiro 2025  
**Versão do documento:** 1.0.0

