# Proximous Frontend Web

Interface web responsiva para o aplicativo Proximous, desenvolvida em React com Vite, Tailwind CSS e integração completa com a API backend.

## 🚀 Funcionalidades

- **Interface Responsiva** - Funciona perfeitamente em desktop, tablet e mobile
- **Autenticação Completa** - Login, registro e recuperação de senha
- **Sistema de Matching** - Descobrir usuários próximos com filtros avançados
- **Chat em Tempo Real** - Mensagens instantâneas entre usuários
- **Perfil Personalizável** - Upload de fotos e configurações detalhadas
- **Área Administrativa** - Dashboard completo para administradores
- **Sistema Premium** - Planos de assinatura e pagamentos
- **Plataforma de Publicidade** - Interface para anunciantes

## 🛠️ Tecnologias

- **React 18** - Biblioteca JavaScript moderna
- **Vite** - Build tool rápida e moderna
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento SPA
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos
- **React Hook Form** - Gerenciamento de formulários

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.jsx      # Layout principal
│   └── ProtectedRoute.jsx
├── pages/              # Páginas da aplicação
│   ├── Login.jsx       # Autenticação
│   ├── Register.jsx    # Cadastro
│   ├── Home.jsx        # Dashboard
│   ├── Discover.jsx    # Descobrir usuários
│   ├── Matches.jsx     # Matches
│   ├── Premium.jsx     # Planos premium
│   ├── Help.jsx        # Ajuda e FAQ
│   ├── Contact.jsx     # Contato
│   ├── Advertising.jsx # Publicidade
│   └── admin/          # Área administrativa
├── hooks/              # Custom hooks
│   └── useAuth.jsx     # Hook de autenticação
├── lib/                # Utilitários
│   ├── api.js          # Cliente da API
│   └── auth.js         # Utilitários de auth
└── App.jsx             # Componente principal
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado) ou npm

### Desenvolvimento Local

```bash
# Clonar repositório
git clone <repository-url>
cd proximous-web

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a URL do backend

# Executar em desenvolvimento
pnpm run dev

# Aplicação estará disponível em http://localhost:5173
```

### Build para Produção

```bash
# Gerar build otimizado
pnpm run build

# Preview do build
pnpm run preview

# Arquivos gerados em dist/
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# URL da API backend
VITE_API_URL=http://localhost:5000

# Informações da aplicação
VITE_APP_NAME=Proximous
VITE_APP_VERSION=1.0.0
```

### Configuração da API

O cliente da API está configurado em `src/lib/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## 🎨 Design System

### Cores Principais

```css
/* Paleta de cores Proximous */
--primary: #6A5ACD;      /* Lavanda */
--secondary: #87CEFA;    /* Azul claro */
--accent: #FF8C00;       /* Âmbar */
--background: #FFFFFF;   /* Branco */
--text: #333333;         /* Cinza escuro */
```

### Componentes Reutilizáveis

- **Layout** - Estrutura principal com header e navegação
- **ProtectedRoute** - Proteção de rotas autenticadas
- **Cards** - Componentes de cartão para informações
- **Formulários** - Inputs e validações padronizadas

## 📱 Responsividade

A aplicação é totalmente responsiva com breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Navegação Mobile

- Header compacto com menu hambúrguer
- Bottom navigation para acesso rápido
- Gestos touch otimizados

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```
3. Deploy automático a cada push na branch main

### Netlify

```bash
# Build command
pnpm run build

# Publish directory
dist

# Redirects (_redirects file)
/*    /index.html   200
```

### Servidor Próprio

```bash
# Após o build
pnpm run build

# Servir arquivos estáticos da pasta dist/
# Configurar servidor web (nginx, apache, etc.)
```

## 🔒 Autenticação

### Fluxo de Autenticação

1. **Login** - Usuário insere credenciais
2. **Token JWT** - Backend retorna token de acesso
3. **Armazenamento** - Token salvo no localStorage
4. **Interceptors** - Axios adiciona token automaticamente
5. **Refresh** - Renovação automática de tokens

### Proteção de Rotas

```javascript
// Rotas protegidas
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 📊 Funcionalidades Principais

### Dashboard
- Estatísticas do usuário
- Atividade recente
- Ações rápidas

### Descobrir Usuários
- Sistema de swipe
- Filtros avançados (distância, idade, interesses)
- Visualização em cards

### Sistema de Matches
- Lista de matches
- Curtidas enviadas/recebidas
- Quebra-gelos

### Chat
- Mensagens em tempo real
- Upload de imagens
- Indicadores de leitura

### Área Administrativa
- Dashboard com métricas
- Gestão de usuários
- Moderação de conteúdo
- Relatórios detalhados

## 🧪 Testes

```bash
# Executar testes
pnpm run test

# Testes com coverage
pnpm run test:coverage

# Testes E2E
pnpm run test:e2e
```

## 📈 Performance

### Otimizações Implementadas

- **Code Splitting** - Carregamento sob demanda
- **Lazy Loading** - Componentes e imagens
- **Bundle Optimization** - Vite otimizações
- **Image Optimization** - Compressão automática
- **Caching** - Estratégias de cache

### Métricas de Performance

- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **First Input Delay** < 100ms

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Siga os padrões de código (ESLint + Prettier)
4. Faça commit das mudanças
5. Push para a branch
6. Abra um Pull Request

### Padrões de Código

```bash
# Linting
pnpm run lint

# Formatação
pnpm run format

# Pre-commit hooks configurados
```

## 📄 Licença

Este projeto está sob a licença MIT.

