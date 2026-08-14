# Proximous - Conectando Pessoas Próximas

Uma plataforma completa de rede social baseada em localização, desenvolvida para conectar pessoas próximas geograficamente através de um sistema de matching inteligente.

## 🚀 Visão Geral

O Proximous é uma aplicação completa que inclui:

- **Backend API** (Flask) - Sistema robusto com autenticação, matching e pagamentos
- **Frontend Web** (React) - Interface responsiva para desktop e mobile
- **Aplicativo Mobile** (React Native/Expo) - App nativo para iOS e Android
- **Área Administrativa** - Dashboard completo para gestão
- **Sistema de Pagamentos** - Integração com processadores de pagamento
- **Plataforma de Publicidade** - Sistema completo para anunciantes

## 📁 Estrutura do Projeto

```
proximous/
├── proximous_backend/          # API Backend (Flask)
│   ├── src/                   # Código fonte
│   ├── Dockerfile             # Container Docker
│   ├── docker-compose.yml     # Orquestração local
│   └── deploy/                # Configurações de deploy
├── proximous-web/             # Frontend Web (React)
│   ├── src/                   # Código fonte React
│   ├── vercel.json            # Configuração Vercel
│   └── .env.example           # Variáveis de ambiente
├── proximous-mobile/          # App Mobile (React Native)
│   ├── src/                   # Código fonte mobile
│   └── app.json               # Configuração Expo
└── docs/                      # Documentação completa
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **JWT** - Autenticação segura
- **PostgreSQL** - Banco de dados (produção)
- **SQLite** - Banco de dados (desenvolvimento)

### Frontend Web
- **React** - Biblioteca JavaScript
- **Vite** - Build tool moderna
- **Tailwind CSS** - Framework CSS
- **Axios** - Cliente HTTP

### Mobile
- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **AsyncStorage** - Armazenamento local

### Deploy e Infraestrutura
- **Docker** - Containerização
- **Vercel** - Deploy frontend
- **DigitalOcean** - Deploy backend
- **GitHub Actions** - CI/CD

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- Docker (opcional)
- Git

### 1. Backend (Flask)

```bash
cd proximous_backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Inicializar banco de dados
python src/main.py

# Executar servidor
python src/main.py
```

### 2. Frontend Web (React)

```bash
cd proximous-web

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a URL do backend

# Executar em desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
```

### 3. Mobile (React Native)

```bash
cd proximous-mobile

# Instalar dependências
npm install

# Executar no simulador web
npx expo start --web

# Executar no dispositivo
npx expo start
```

## 🐳 Deploy com Docker

### Backend

```bash
cd proximous_backend

# Build da imagem
docker build -t proximous-backend .

# Executar com docker-compose
docker-compose up -d
```

## ☁️ Deploy em Produção

### Frontend (Vercel)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_API_URL`: URL do backend
3. Deploy automático a cada push

### Backend (DigitalOcean)

1. Use o arquivo `deploy/digitalocean.yml`
2. Configure as variáveis de ambiente
3. Deploy via DigitalOcean App Platform

### Mobile (Expo)

```bash
# Build para produção
npx expo build:android
npx expo build:ios

# Publicar na store
npx expo submit
```

## 📊 Funcionalidades Principais

### Para Usuários
- ✅ Descoberta de pessoas próximas
- ✅ Sistema de matching inteligente
- ✅ Chat em tempo real
- ✅ Perfil personalizável
- ✅ Configurações de privacidade
- ✅ Gamificação e conquistas

### Para Administradores
- ✅ Dashboard administrativo
- ✅ Gestão de usuários
- ✅ Moderação de conteúdo
- ✅ Analytics e relatórios
- ✅ Sistema de suporte

### Para Anunciantes
- ✅ Criação de campanhas
- ✅ Segmentação avançada
- ✅ Analytics de performance
- ✅ Múltiplos formatos de anúncios

## 💰 Monetização

- **Planos Premium** - Recursos exclusivos para usuários pagantes
- **Sistema de Publicidade** - Plataforma completa para anunciantes
- **Comissões** - Taxas em transações e eventos

## 🔒 Segurança

- Autenticação JWT
- Criptografia de dados sensíveis
- Proteção contra CSRF/XSS
- Validação robusta de entradas
- Controle de acesso baseado em roles

## 📱 Compatibilidade

- **Web**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS 12+, Android 8+
- **Responsivo**: Desktop, tablet e mobile

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@proximous.com
- **Documentação**: [docs/](docs/)
- **FAQ**: Disponível na aplicação

## 🗺️ Roadmap

- [ ] Integração com redes sociais
- [ ] Sistema de eventos locais
- [ ] Chamadas de vídeo
- [ ] Tradução automática
- [ ] IA para matching avançado

---

**Desenvolvido com ❤️ pela equipe Proximous**

