# MOBILE_ARCHITECTURE.md — PROXIMOUS MOBILE APP

## 1. Visão Geral da Arquitetura

O aplicativo **Proximous Mobile** adota uma arquitetura modular orientada a domínios (Domain-Driven Mobile Architecture) construída sobre **React Native + Expo SDK**, priorizando performance nativa, previsibilidade de estado, isolamento de responsabilidades e desacoplamento entre UI, regras de negócio e camada de rede.

```
┌─────────────────────────────────────────────────────────────┐
│                      PROXIMOUS APP                          │
├─────────────────────────────────────────────────────────────┤
│                    Navigation Layer                         │
│     (AppNavigator -> AuthStack / MainTabNavigator)         │
├─────────────────────────────────────────────────────────────┤
│                       Screens & UI                          │
│   (Feed, Discover, Modo Agora, Messages, Matches, Profile)  │
├─────────────────────────────────────────────────────────────┤
│                Design System & Components                   │
│   (Buttons, Inputs, MomentCards, Avatars, Badges, Modals)   │
├─────────────────────────────────────────────────────────────┤
│                      Contexts & Hooks                       │
│    (AuthContext, LocationContext, RealtimeNotification)     │
├─────────────────────────────────────────────────────────────┤
│                       Services & API                        │
│   (Axios Client, Interceptors, Bearer Tokens, Socket.IO)    │
├─────────────────────────────────────────────────────────────┤
│                   Native Platform Adapters                  │
│ (Expo Location, Image Picker, Notifications, AsyncStorage)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Diretórios

```text
proximous-mobile/
├── assets/                  # Ícones HD, splash screens e assets visuais
├── src/
│   ├── components/          # Componentes reutilizáveis do Design System
│   │   ├── common/          # Button, Input, Card, Badge, EmptyState, Skeleton
│   │   ├── feed/            # MomentCard, CreateMomentModal, IcebreakerModal
│   │   ├── discovery/       # SwipeCard, DiscoveryFilterModal
│   │   └── chat/            # ChatBubble, MessageInput, TypingIndicator
│   ├── config/              # Configurações de API, endpoints e constantes globais
│   ├── contexts/            # React Contexts (AuthContext, ThemeContext)
│   ├── navigation/          # React Navigation Stacks & Bottom Tabs
│   ├── screens/             # Telas da aplicação
│   │   ├── auth/            # LoginScreen, RegisterScreen, ForgotPasswordScreen
│   │   └── main/            # HomeScreen (Feed), DiscoverScreen, NowScreen,
│   │                        # MatchesScreen, MessagesScreen, ChatScreen,
│   │                        # NotificationsScreen, ProfileScreen
│   ├── styles/              # Design Tokens (colors, typography, spacing, shadows)
│   └── utils/               # Formatadores, validadores, geolocalização e helpers
├── App.js                   # Entry point com Providers e Navigators
├── app.json                 # Configuração de build Expo/Android/iOS
└── package.json             # Dependências e scripts
```

---

## 3. Padrões de Comunicação de Dados & Ciclo de Vida

1. **Camada de Rede Unificada:**
   - Instância centralizada do `axios` com interceptor de autenticação injetando `Authorization: Bearer <token>`.
   - Interceptor de resposta para detecção automática de `401 Unauthorized` e rotação de `refreshToken`.
   - Fallback gracioso com Empty States e mensagens de erro amigáveis sem exposição técnica.

2. **Gerenciamento de Estado:**
   - **Estado Global:** `AuthContext` mantém `user`, `isAuthenticated`, e tokens persistidos no `AsyncStorage`.
   - **Estado Local / Telas:** Gerenciado por hooks `useState`, `useEffect` e `useCallback` para evitar re-renderizações desnecessárias em listas de feed e cartões de swipe.

3. **Geolocalização & Privacidade:**
   - Obtenção de coordenadas apenas quando consentido pelo usuário via `expo-location`.
   - Coordenadas enviadas ao backend para cálculo de raio (`/users/discover` e `/activities/nearby`).
   - Apresentação na interface estritamente como distância aproximada (ex: `350 m`, `1.4 km`), protegendo a localização exata do usuário.

4. **Sincronização em Tempo Real:**
   - Suporte a listeners WebSocket (Socket.IO) integrados aos canais de mensagens e notificações.
