# AUDITORIA_MOBILE.md — PROXIMOUS MOBILE APP
**Data da Auditoria:** 27 de Agosto de 2026  
**Status:** Concluído (Fase 1 de 20)  
**Projeto:** Proximous Mobile (`/proximous-mobile`)  
**Repositório Base:** Proximous Multi-Repo (Web + Mobile + Backend)

---

## 1. RESUMO EXECUTIVO

A auditoria completa de `/proximous-mobile` foi realizada sem modificar o código-fonte pré-existente.
A base de código atual consiste em uma aplicação móvel construída sobre o ecossistema **React Native (0.79.5)** com **Expo SDK (~53.0.17)**, **React Navigation v7**, e comunicação REST com o backend Flask/SQLAlchemy (`proximous_backend`).

Identificou-se que o projeto possui a fundação funcional dos módulos essenciais (Auth, Home, Descoberta/Swipe, Modo AGORA, Matches, Mensagens e Perfil), porém carece de:
1. **Identidade Visual Sincronizada:** Utilização de tons roxo genéricos sem o refinamento estético de luxo (ouro/âmbar, gradientes ultra-suaves, dark mode sofisticado e tipografia *Plus Jakarta Sans*) presente no `proximous-web`.
2. **Camada de Sockets / Realtime:** O backend suporta Socket.IO (`/socket_events.py`), mas o mobile utiliza polling ou chamadas estáticas com mocks de fallback.
3. **Feed / Momentos:** O backend possui a rota `/api/moments` completa com sistema de curtidas e icebreakers, mas o mobile ainda não implementou a tela/componente de feed de momentos sociais.
4. **Notificações em Tempo Real / Push:** O backend possui modelo `Notification` e eventos socket, mas o mobile não possui central de notificações dedicada nem listeners nativos estruturados com fallback.
5. **Configuração de Build Nativo (Android/iOS):** Necessidade de formalização dos metadados de loja (permissões granulares, ícones adaptativos HD, splash screens, schemes de deep linking `proximous://` e scripts de release AAB/IPA).

---

## 2. AUDITORIA DETALHADA DOS 25 PONTOS OBRIGATÓRIOS

### 2.1. Stack
- **Linguagem Principal:** JavaScript (ES6+ / JSX) com suporte a TypeScript configurável.
- **Runtime:** React Native 0.79.5 / React 19.0.0.
- **Plataformas-Alvo:** Android (SDK 34+) e iOS (iOS 15.1+).

### 2.2. Framework
- **Framework:** **Expo SDK 53** (Managed Workflow com suporte a Prebuild EAS/Bare).
- **Compatibilidade:** Totalmente compatível com exportação nativa Android Studio (Gradle) e Xcode (CocoaPods).

### 2.3. Bundler
- **Bundler:** **Metro Bundler** (`@expo/metro-runtime` ~5.0.4, `@babel/core` ^7.20.0).

### 2.4. Configuração Capacitor / Expo
- **Configuração Atual:** Arquivo `app.json` configurado com `slug: "proximous-mobile"`, `version: "1.0.0"`.
- **Plugins Ativos no app.json:** `expo-location`, `expo-image-picker`, `expo-notifications`.
- **Capacitor vs Expo:** A pasta atual foi originada no ecossistema Expo/React Native (mais performático e nativo para animações de gestos de swipe que uma WebView pura de Capacitor). A estrutura suporta tanto EAS Build quanto geração de diretórios nativos `android/` e `ios/`.

### 2.5. Configuração Android
- **Package Name:** `com.proximous.app`
- **Adaptive Icon:** Configurado com background `#FF8C00` e foreground `./assets/adaptive-icon.png`.
- **Permissões Requeridas:** `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `CAMERA`, `READ_MEDIA_IMAGES`, `POST_NOTIFICATIONS`.

### 2.6. Configuração iOS
- **Bundle Identifier:** `com.proximous.app`
- **Tablet Support:** Habilitado (`supportsTablet: true`).
- **Permissões Info.plist:** `NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`.

### 2.7. Telas Identificadas (`src/screens`)
1. `LoadingScreen.js`: Tela de splash animada com gradiente e logo.
2. `auth/LoginScreen.js`: Login com email, senha, validações e links de recuperação/cadastro.
3. `main/HomeScreen.js`: Dashboard social com métricas (matches, curtidas, mensagens), atalhos rápidos e conquistas.
4. `main/DiscoverScreen.js`: Interface de descoberta estilo cartões de swipe (PanGesture + Animated) com filtros de distância e idade.
5. `main/NowScreen.js`: Interface do **Modo AGORA** (disponibilidade em tempo real para cafés, conversas e encontros espontâneos).
6. `main/MatchesScreen.js`: Gestão de matches ativos, curtidas enviadas e curtidas recebidas com filtros em abas.
7. `main/MessagesScreen.js`: Lista de conversas com busca, status online e contadores de não lidas.
8. `main/ChatScreen.js`: Tela de bate-papo individual com envio de mensagens e cabeçalho dinâmico.
9. `main/ProfileScreen.js`: Perfil do usuário com galeria de fotos, interesses, estatísticas e configurações.

### 2.8. Componentes Reutilizáveis (`src/components`)
1. `Button.js`: Botão reutilizável com variantes (`primary`, `secondary`, `outline`, `ghost`), estados de loading, gradiente e tamanhos (`sm`, `md`, `lg`).
2. `Input.js`: Campo de texto com suporte a ícones esquerdo/direito, toggle de visualização de senha e feedback de erro inline.

### 2.9. Hooks
- `useAuth()`: Hook customizado do `AuthContext` para acesso ao estado de autenticação, usuário logado, login, registro e logout.

### 2.10. Providers
- `AuthProvider`: Provider centralizado em `src/contexts/AuthContext.js` que gerencia persistência de sessão e lifecycle do token JWT.

### 2.11. Serviços
- `api.js`: Cliente HTTP Axios centralizado com interceptors para injeção automática de `Bearer Token` e tratamento de `401 Unauthorized`.

### 2.12. Mapeamento de APIs Backend
- **Auth:** `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`.
- **Users:** `/users/profile`, `/users/upload-photo`, `/users/discover`, `/users/availability`, `/users/stats`, `/users/achievements`, `/users/location`.
- **Activities (Modo AGORA):** `/activities/nearby`, `/activities`, `/activities/:id/join`, `/activities/:id/leave`, `/activities/my`.
- **Matching:** `/matching/like`, `/matching/matches`, `/matching/sent-likes`, `/matching/received-likes`, `/matching/matches/:id`, `/matching/icebreakers`, `/matching/compliments`.
- **Messages:** `/messages/conversations`, `/messages/conversations/:id`, `/messages/send`, `/messages/conversations/:id/read`.
- **Moments (Feed Backend):** `/moments`, `/moments/:id/like`, `/moments/:id/icebreaker`.
- **Notifications:** `/notifications`, `/notifications/read-all`, `/notifications/:id/read`.
- **Subscriptions & Support:** `/subscriptions/plans`, `/support/faq`, `/support/tickets`.

### 2.13. Autenticação
- Token Bearer JWT no header HTTP.
- Refresh token rotation implementado no backend e mapeado no `AuthContext`.
- Validação automática na inicialização (`checkAuthState`).

### 2.14. Armazenamento Local
- `@react-native-async-storage/async-storage` (v2.1.2).
- Chaves armazenadas: `authToken`, `refreshToken`, `user`.

### 2.15. Navegação
- `@react-navigation/native` (v7.1.14), `@react-navigation/stack` (v7.4.2), `@react-navigation/bottom-tabs` (v7.4.2).
- Estrutura: `AppNavigator` chaveia entre `AuthNavigator` e `MainTabNavigator`.
- Abas inferiores atuais: Início, Descobrir, Modo AGORA, Matches, Mensagens, Perfil.

### 2.16. Permissões
- Geolocalização (`expo-location`): Coordenadas para cálculo de distância aproximada.
- Câmera e Galeria (`expo-image-picker`): Upload de fotos de perfil e momentos.
- Notificações (`expo-notifications`): Alertas locais e push.

### 2.17. Integrações Nativas
- `react-native-screens` e `react-native-safe-area-context` para safe areas completas em iPhones com notch/Dynamic Island e barras de navegação Android.
- `expo-linear-gradient` para renderização nativa de gradientes com aceleração por GPU.

### 2.18. Dependências
- Todas as dependências em `package.json` estão alinhadas com o ecossistema Expo SDK 53 / React 19 / RN 0.79.5.

### 2.19. Variáveis de Ambiente
- `extra.apiUrl` em `app.json` e fallback `http://localhost:5000/api` em `api.js`.
- Necessidade de configuração dinâmica para URLs de staging e produção (`https://proximous.genioplay.com.br/api`).

### 2.20. Assets
- `./assets/icon.png` (Ícone padrão)
- `./assets/adaptive-icon.png` (Ícone adaptativo Android)
- `./assets/splash-icon.png` / `./assets/splash.png` (Splash screen)
- `./assets/favicon.png` (Favicon web)

### 2.21. Identidade Visual e Logo
- Marca: Proximous.
- Elemento central: Ícone de conexão/coração estilizado com gradiente roxo/rosa/dourado.

### 2.22. Ícones
- `@expo/vector-icons` (Ionicons / MaterialCommunityIcons / Feather).

### 2.23. Splash Screen
- Configurada no `app.json` com `resizeMode: "contain"` e cor de fundo coordenada.

### 2.24. Funcionalidades Já Implementadas
- Login com persistência de token;
- Modo AGORA com filtros de disponibilidade e convites de atividades;
- Descoberta com animações de gesto de swipe e like/super-like;
- Gestão de matches e curtidas recebidas;
- Listagem e envio de mensagens com suporte a chat individual;
- Perfil com edição de campos e upload de fotos da galeria.

### 2.25. Gaps e Oportunidades de Redesign (Roadmap)
1. **Feed de Momentos:** Implementação da tela/aba de Feed social com publicações de texto/foto, curtidas e comentários/icebreakers em tempo real.
2. **Central de Notificações:** Criação da interface com badges e filtros de tipo (curtida, match, mensagem, sistema).
3. **Design System Alinhado à Web:** Tokens compartilhados de cores (*Luxury Purple* `#7C3AED`, *Proximous Gold* `#D97706`/`#FBBF24`, *Dark Surface* `#090712`), tipografia e microinterações táteis (*Haptics*).
4. **Segurança e Privacidade:** Sanitização de dados de localização (exibição apenas de distância formatada aproximada, ex: `320 m`, `1,2 km`).

---

**Auditoria concluída com sucesso.** Pronta para a Fase 2 (Arquitetura e Design System).
