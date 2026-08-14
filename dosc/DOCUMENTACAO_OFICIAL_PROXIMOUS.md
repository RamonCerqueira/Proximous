# 📱 DOCUMENTAÇÃO OFICIAL DO PROJETO PROXIMOUS

> **Plataforma de Relacionamento e Rede Social por Proximidade dedicada a Pessoas Tímidas e Introvertidas.**

---

## 🎯 1. Visão Geral do Produto

O **Proximous** é uma rede social e plataforma de relacionamentos inovadora desenvolvida especialmente para **pessoas tímidas e introvertidas**. 

### 🌟 Diferencial Competitivo
* **Geolocalização de Precisão (Raio de 5km):** Conecta pessoas que compartilham os mesmos espaços do dia a dia (bairros, faculdades, cafés, parques).
* **Foco na Empatia e Sem Pressão:** Recursos projetados para diminuir a ansiedade social, como *Icebreakers* (quebra-gelos automáticos), *Elogios diretos*, *Sistema de Pontos de Empatia* e *Status de Disponibilidade*.
* **Monetização Sustentável e Acessível:** Plano Premium com valor altamente inclusivo no mercado brasileiro (**R$ 2,99/mês**) e plataforma integrada para anunciantes locais.

---

## 🏗️ 2. Arquitetura do Sistema

O sistema é construído sobre uma arquitetura **Client-Server RESTful**, composta por 3 pilares principais:

```
                          ┌────────────────────────┐
                          │   PROXIMOUS SYSTEM     │
                          └───────────┬────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  Proximous Web   │        │ Proximous Mobile │        │Proximous Backend │
│  (React 19 +     │        │  (React Native / │        │ (Flask REST API  │
│   Tailwind CSS)  │        │   Expo SDK 53)   │        │   + SQLAlchemy)  │
└────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
                        ┌────────────────────────┐
                        │   Banco de Dados       │
                        │ (PostgreSQL / SQLite)  │
                        └────────────────────────┘
```

---

## 💻 3. Detalhamento dos Componentes

### 3.1. Backend API (`proximous_backend`)
* **Linguagem & Framework:** Python 3.11+ / Flask 2.3.3
* **Banco de Dados:** SQLite (Desenvolvimento) / PostgreSQL (Produção) via SQLAlchemy 2.0
* **Autenticação:** JSON Web Tokens (JWT via `Flask-JWT-Extended`) com Tokens de Acesso (24h) e Refresh Tokens (30d)
* **Endpoints Principais:**
  * `/api/auth`: Registro, Login, Admin Login, Refresh Token, Alteração de Senha.
  * `/api/users`: Gerenciamento de Perfil, Algoritmo de Descoberta por Raio (Haversine 5km), Configurações de Privacidade (Modo Anônimo, Visibilidade, Status), Conquistas e Estatísticas.
  * `/api/matching`: Envio de Curtidas, Elogios, Quebra-Gelos, Listagem de Matches Mútuos e Sugestões Personalizadas.
  * `/api/messages`: Chat entre usuários pareados, Contagem de não lidas e expiração automática de mensagens inativas (7 dias).
  * `/api/subscriptions`: Gestão de Planos Premium (Mensal R$ 2,99 / Anual R$ 30,00), Cupons de Desconto e Processamento de Assinaturas.
  * `/api/advertising`: Painel de Anunciantes, Campanhas Locais, Impressões e Cliques.
  * `/api/admin`: Dashboard Administrativo, Moderação de Denúncias e Banimento de Usuários.
  * `/api/support`: Tickets de Suporte e FAQ Dinâmico.

### 3.2. Frontend Web (`proximous-web`)
* **Tecnologias:** React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React, Radix UI.
* **Recursos:** Interface ultramoderna com Glassmorphism, suporte completo a telas responsivas, animações suaves e painel de administração integrado.

### 3.3. Aplicativo Mobile (`proximous-mobile`)
* **Tecnologias:** React Native, Expo SDK 53, React Navigation v7, Expo Location, Async Storage.
* **Recursos:** Captura de GPS em tempo real, telas intuitivas otimizadas para uso com uma mão e baixo consumo de bateria.

---

## 📊 4. Análise Crítica: Pontos Fortes e Pontos Fracos

### ✅ Pontos Positivos (Fortes)

1. **Alinhamento Perfeito com a Persona do Usuário:**
   - Recursos como *Icebreakers* automáticos e *Elogios* eliminam o travamento inicial do "o que falar?".
   - O indicador de **Status de Disponibilidade** (*Disponível*, *Ocupado*, *Apenas Observando*) tira a pressão da resposta imediata.

2. **Geolocalização de Alta Precisão (Raio de 5km):**
   - Garante que as conexões sejam reais e viáveis geograficamente, incentivando encontros no mundo real sem longas distâncias.

3. **Multiplataforma Pronta para Produção:**
   - Presença simultânea em Web Desktop, Web Mobile e Apps Nativos (iOS/Android).

4. **Monetização Equilibrada (Freemium + B2B Ads):**
   - Preço acessível para o usuário final (R$ 2,99/mês), maximizando a conversão.
   - Modelo B2B nativo permitindo que comércios locais do bairro anunciem na plataforma.

5. **Gamificação Empática:**
   - Sistema de *Pontos de Empatia* e conquistas que premiam interações gentis e atitudes respeitosas na plataforma.

---

### ✅ Solução e Status dos 6 Pontos de Atenção (Zerados)

1. **Privacidade Física de Localização (Fuzzing Anti-Trilateração):**
   - *Status:* **IMPLEMENTADO / RESOLVIDO** 🟢
   - *Solução:* Adicionada a formatação `User.format_distance_range` que exibe a distância em faixas aproximação (ex: *"A menos de 1 km"*, *"A 2 km"*) e remove a exposição das coordenadas GPS exatas nos perfis públicos.

2. **Densidade Inicial de Usuários (Expansão Dinâmica de Raio Auto-ajustável):**
   - *Status:* **IMPLEMENTADO / RESOLVIDO** 🟢
   - *Solução:* O algoritmo no endpoint `/discover` detecta se há menos de 5 conexões locais e expande o raio automaticamente (5km → 10km → 20km → 50km), retornando `is_expanded_radius` e aviso amigável.

3. **Gerenciamento de Sessão / Blacklist de JWT Distribuída:**
   - *Status:* **IMPLEMENTADO / RESOLVIDO** 🟢
   - *Solução:* Implementado o módulo `TokenBlacklist` em `src/utils/redis_client.py` com integração Redis e fallback seguro para garantir a revogação de tokens entre múltiplos servidores.

4. **Mensageria em Tempo Real via WebSockets:**
   - *Status:* **IMPLEMENTADO / RESOLVIDO** 🟢
   - *Solução:* Integrado o `Flask-SocketIO` e a gestão de salas dinâmicas `match_<match_id>` com indicadores de digitação e entrega de mensagens ao vivo.

5. **Notificações Push Nativas (Expo Push Service):**
   - *Status:* **IMPLEMENTADO / RESOLVIDO** 🟢
   - *Solução:* Criado o serviço `send_expo_push_notification` em `src/utils/push_notifications.py` que notifica o usuário instantaneamente sobre curtidas, elogios, novos matches e mensagens no celular.

6. **Webhooks, Processamento de Pagamentos & 120 Dias Grátis:**
   - *Status:* **IMPLEMENTADO / RESOLVIDO** 🟢
   - *Solução:* Configurada a concessão automática de **120 dias grátis de Acesso Premium Total** para todos os novos usuários durante a fase de lançamento. A estrutura de Webhooks (PIX / Stripe / PagSeguro) permanece pronta no backend para o modelo pós-degustação.

---

## 🚀 5. Status de Prontidão do Sistema

| Ponto de Atenção | Status Anterior | Status Atual | Ação Executada |
| :--- | :---: | :---: | :--- |
| **Privacidade de Localização** | ⚠️ Exato (0.3km) | ✅ **Protegido** | Fuzzing & Faixas de Distância ("A menos de 1km") |
| **Densidade de Usuários** | ⚠️ Raio Fixo 5km | ✅ **Divertido** | Expansão Dinâmica Auto-ajustável de Raio |
| **Blacklist JWT** | ⚠️ Em Memória | ✅ **Distribuído** | Módulo Redis + DB Fallback |
| **Chat em Tempo Real** | ⚠️ Polling HTTP | ✅ **WebSockets** | Flask-SocketIO & Eventos de Sala ao Vivo |
| **Notificações Push** | ⚠️ Inexistente | ✅ **Ativo** | Worker Expo Push Notifications API |
| **Cobranças & Oferta** | ⚠️ Mock Pago | ✅ **120d Grátis** | Degustação Grátis de 120 Dias + Webhooks Prontos |

---
*Documentação atualizada e validada para o projeto Proximous.*
