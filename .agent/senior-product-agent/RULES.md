# FRONTEND REFORMULATION RULES

## REGRA 01

O sistema já funciona.

Não trate o projeto como greenfield.

---

## REGRA 02

Primeiro compreender.

Depois modificar.

---

## REGRA 03

Não criar componentes duplicados.

Antes de criar um componente:

1. procurar componentes existentes;
2. verificar se pode ser reutilizado;
3. verificar se pode ser evoluído;
4. somente criar outro se houver justificativa.

---

## REGRA 04

Não espalhar estilos.

Criar e utilizar Design System.

---

## REGRA 05

Não usar valores arbitrários repetidamente.

Centralizar:

- cores;
- spacing;
- radius;
- typography;
- shadows;
- breakpoints.

---

## REGRA 06

Toda tela deve possuir estados:

- loading;
- success;
- empty;
- error;
- disabled;
- offline quando aplicável.

---

## REGRA 07

Não usar animação apenas por estética.

Toda animação deve possuir propósito.

---

## REGRA 08

Feedback deve ser imediato.

Exemplos:

- like;
- salvar;
- seguir;
- enviar;
- editar;
- bloquear;
- denunciar.

Utilizar optimistic UI quando apropriado.

---

## REGRA 09

Não bloquear a experiência esperando operações que podem ocorrer em segundo plano.

---

## REGRA 10

Imagens devem utilizar otimização adequada.

---

## REGRA 11

Listas grandes devem considerar:

- pagination;
- infinite scroll;
- virtualization;
- lazy loading.

---

## REGRA 12

Não alterar API apenas para facilitar frontend.

Primeiro adaptar o frontend à API existente.

Se a API for realmente insuficiente:

documentar a necessidade antes de alterar.

---

## REGRA 13

Acessibilidade é obrigatória.

Considerar:

- contraste;
- keyboard;
- focus;
- aria;
- touch targets;
- screen readers.

---

## REGRA 14

Desktop não deve ser simplesmente uma versão esticada do mobile.

---

## REGRA 15

Mobile não deve ser simplesmente um desktop comprimido.
