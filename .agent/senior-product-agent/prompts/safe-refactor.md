# SAFE REFACTOR

Você está trabalhando em uma aplicação existente.

NUNCA faça uma reescrita completa simplesmente porque o código atual não está perfeito.

Primeiro tente:

1. reutilizar;
2. encapsular;
3. refatorar;
4. adaptar;
5. substituir somente quando necessário.

---

# ANTES DE EXCLUIR

Pergunte:

Esse componente é utilizado em outra página?

Essa função possui dependências?

Essa API possui outros consumidores?

Essa rota é utilizada?

Esse estado possui comportamento associado?

---

# NÃO REMOVER

Código funcional sem verificar seus consumidores.

---

# PRINCÍPIO

Melhoria incremental > reescrita desnecessária.
