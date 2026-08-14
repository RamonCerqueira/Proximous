# Proximous Backend API

API REST completa para o aplicativo Proximous, desenvolvida em Flask com autenticação JWT, sistema de matching e integração com pagamentos.

## 🚀 Funcionalidades

- **Autenticação JWT** - Login seguro para usuários e administradores
- **Sistema de Matching** - Algoritmo de compatibilidade baseado em localização e interesses
- **Chat em Tempo Real** - Mensagens entre usuários matched
- **Sistema de Pagamentos** - Assinaturas premium e processamento de pagamentos
- **Área Administrativa** - Dashboard completo para gestão
- **Sistema de Publicidade** - Plataforma para anunciantes
- **Gamificação** - Conquistas e sistema de pontos

## 📋 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/admin/login` - Login administrativo
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/nearby` - Usuários próximos
- `POST /api/users/upload-photo` - Upload de foto

### Matching
- `POST /api/matching/like` - Curtir usuário
- `POST /api/matching/super-like` - Super like
- `GET /api/matching/matches` - Listar matches
- `GET /api/matching/likes-sent` - Curtidas enviadas
- `GET /api/matching/likes-received` - Curtidas recebidas

### Mensagens
- `GET /api/messages/conversations` - Listar conversas
- `GET /api/messages/conversation/<user_id>` - Mensagens de uma conversa
- `POST /api/messages/send` - Enviar mensagem
- `PUT /api/messages/mark-read` - Marcar como lida

### Assinaturas
- `GET /api/subscriptions/plans` - Listar planos
- `POST /api/subscriptions/subscribe` - Assinar plano
- `POST /api/subscriptions/cancel` - Cancelar assinatura
- `GET /api/subscriptions/history` - Histórico de pagamentos

### Administração
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/admin/users` - Listar usuários
- `PUT /api/admin/users/<user_id>` - Atualizar usuário
- `GET /api/admin/reports` - Relatórios

## 🛠️ Instalação

### Desenvolvimento Local

```bash
# Clonar repositório
git clone <repository-url>
cd proximous_backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env

# Executar aplicação
python src/main.py
```

### Docker

```bash
# Build da imagem
docker build -t proximous-backend .

# Executar container
docker run -p 5000:5000 proximous-backend

# Ou usar docker-compose
docker-compose up -d
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Configurações da aplicação
FLASK_ENV=development
JWT_SECRET_KEY=your-super-secret-key
DATABASE_URL=sqlite:///proximous.db

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Configurações de email (opcional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Banco de Dados

O sistema suporta SQLite (desenvolvimento) e PostgreSQL (produção):

```python
# SQLite (padrão)
DATABASE_URL=sqlite:///proximous.db

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/proximous
```

## 🚀 Deploy

### DigitalOcean App Platform

1. Use o arquivo `deploy/digitalocean.yml`
2. Configure as variáveis de ambiente
3. Deploy automático via Git

### Heroku

```bash
# Instalar Heroku CLI
heroku create proximous-backend

# Configurar variáveis
heroku config:set FLASK_ENV=production
heroku config:set JWT_SECRET_KEY=your-secret-key
heroku config:set DATABASE_URL=your-postgres-url

# Deploy
git push heroku main
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Dados dos usuários
- **user_profiles** - Perfis detalhados
- **matches** - Relacionamentos entre usuários
- **messages** - Sistema de mensagens
- **subscriptions** - Assinaturas premium
- **advertisements** - Sistema de publicidade
- **admin_users** - Usuários administrativos

## 🔒 Segurança

- **JWT Authentication** - Tokens seguros com expiração
- **Password Hashing** - Senhas criptografadas com bcrypt
- **CORS Protection** - Controle de origem das requisições
- **Input Validation** - Validação robusta de dados
- **SQL Injection Protection** - Uso de ORM SQLAlchemy

## 📈 Monitoramento

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Logs

Os logs são salvos em `logs/app.log` e incluem:
- Requisições HTTP
- Erros de aplicação
- Ações administrativas
- Tentativas de login

## 🧪 Testes

```bash
# Executar testes
python -m pytest tests/

# Com coverage
python -m pytest --cov=src tests/
```

## 📚 Documentação da API

A documentação completa da API está disponível em:
- Swagger UI: `http://localhost:5000/docs`
- Redoc: `http://localhost:5000/redoc`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

