# MOBILE_QA.md — MATRIZ DE TESTES E GARANTIA DE QUALIDADE

## 1. Cobertura de Fluxos de Teste

| Módulo | Cenário Testado | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- |
| **Auth** | Login com credenciais válidas | Redirecionamento instantâneo para a Home com token persistido | ✅ Aprovado |
| **Auth** | Login com email/senha incorretos | Alerta amigável sem quebra de estado ou crash | ✅ Aprovado |
| **Auth** | Cadastro de novo usuário | Validação inline de campos e criação de conta | ✅ Aprovado |
| **Auth** | Recuperação de senha | Feedback visual de sucesso no envio | ✅ Aprovado |
| **Home / Feed** | Renderização de publicações | Exibição fluida com pull-to-refresh e empty state | ✅ Aprovado |
| **Home / Feed** | Criação de momento com foto | Upload e inclusão instantânea no topo do feed | ✅ Aprovado |
| **Home / Feed** | Curtida e envio de Icebreaker | Atualização otimista de contadores e abertura de conversa | ✅ Aprovado |
| **Descoberta** | Gesto de Swipe (Direita/Esquerda) | Animação suave com registro de like/pass | ✅ Aprovado |
| **Modo AGORA** | Ativação de disponibilidade | Atualização em tempo real do banner e status | ✅ Aprovado |
| **Modo AGORA** | Criação de convite rápido | Listagem de convites e contagem de participantes | ✅ Aprovado |
| **Mensagens** | Listagem de conversas e busca | Filtro dinâmico por nome e indicadores de não lidas | ✅ Aprovado |
| **Chat** | Envio de mensagens em tempo real | Balões estilizados, teclado responsivo e scroll automático | ✅ Aprovado |
| **Notificações** | Central com filtros | Filtro por tipo e marcação em lote como lidas | ✅ Aprovado |
| **Perfil** | Atualização de foto e biografia | Persistência no backend e atualização imediata na UI | ✅ Aprovado |

---

## 2. Testes de Responsividade e Plataforma
- **iOS:** Validado para safe areas em iPhones com notch e Dynamic Island.
- **Android:** Validado para barra de status translúcida e navegação por gestos/três botões.
- **Modo Offline:** Tratamento de timeout e indisponibilidade de rede com feedback amigável.
