# FRONTEND ARCHITECTURE

## STACK

Priorizar quando já existente:

- React
- Next.js
- TypeScript
- Tailwind CSS

Não trocar stack apenas por preferência.

---

# PRINCÍPIO

Reutilização.

---

# ORGANIZAÇÃO

Priorizar:

features
components
hooks
services
lib
types

---

# COMPONENTES

Componentes devem ser:

- pequenos;
- previsíveis;
- reutilizáveis;
- acessíveis.

---

# LÓGICA

Não colocar toda lógica dentro da página.

Separar:

UI
↓
hooks
↓
services
↓
API

---

# ESTADOS

Considerar:

loading
success
error
empty
disabled

---

# PERFORMANCE

Priorizar:

- dynamic imports;
- lazy loading;
- image optimization;
- caching;
- memoização quando necessária;
- virtualização;
- redução de JavaScript.

---

# SERVER/CLIENT

Utilizar Server Components quando fizer sentido.

Client Components somente quando houver necessidade de:

- interação;
- estado;
- browser APIs;
- eventos.

---

# NÃO FAZER

Não transformar tudo em Client Component.

---

# RESPONSIVIDADE

Breakpoints devem refletir comportamento real.

Não projetar somente:

mobile / desktop.

Considerar:

small mobile
mobile
tablet
desktop
large desktop.

---

# REGRA

Frontend novo deve continuar compatível com backend existente.
