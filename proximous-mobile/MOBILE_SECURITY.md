# MOBILE_SECURITY.md — DIRETRIZES DE SEGURANÇA E PRIVACIDADE

## 1. Gestão de Tokens de Autenticação
- Os tokens JWT (`authToken` e `refreshToken`) são armazenados de forma isolada via `@react-native-async-storage/async-storage`.
- Em ambiente de produção avançado, tokens podem ser migrados para `expo-secure-store` para proteção baseada em Keychain (iOS) e Keystore/EncryptedSharedPreferences (Android).
- O cliente HTTP intercepta erros `401 Unauthorized` de forma transparente, solicitando rotação de token via `/auth/refresh`. Em caso de falha irreversível, a sessão local é completamente expurgada.

---

## 2. Privacidade de Geolocalização
- **Anonimização no Cliente:** Coordenadas GPS puras (latitude/longitude) são utilizadas exclusivamente para o cálculo geoespacial de proximidade no backend (`/users/discover` e `/activities/nearby`).
- **Nenhuma Exposição de Endereço Exato:** A interface do usuário exibe estritamente valores relativos formatados (ex: `320 m`, `1,2 km`, `3,8 km`). Jamais são renderizados logradouros, números residenciais ou coordenadas brutas de outros usuários sem consentimento explícito.
- **Graceful Fallback:** O aplicativo opera plenamente mesmo caso o usuário opte por negar a permissão de geolocalização, exibindo a comunidade global/regional por ordem cronológica.

---

## 3. Sanitização e Proteção de Dados
- **Proteção contra Exposição de Senhas:** Campos de senha contam com mascaramento padrão e toggle explícito de visualização com ícones intuitivos.
- **Segurança nas Requisições:** Todas as chamadas de rede utilizam HTTPS com TLS 1.3 em produção (`https://proximous.genioplay.com.br/api`).
- **Tratamento Seguro de Erros:** Exceções de banco de dados (ex: Prisma/SQLAlchemy/Axios) não são expostas aos usuários finais na UI, sendo substituídas por mensagens amigáveis em português enquanto os detalhes técnicos permanecem apenas nos logs de diagnóstico.
