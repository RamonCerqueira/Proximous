# DESIGN_SYSTEM_MOBILE.md — PROXIMOUS DESIGN SYSTEM

## 1. Princípios de Design

1. **Humanidade & Proximidade:** Tons quentes e acolhedores combinados com a sofisticação da paleta Violeta & Ouro do Proximous.
2. **Clareza & Velocidade:** Touch targets ergonômicos (mínimo de 48px), contrastes em conformidade com WCAG AA/AAA e hierarquia tipográfica precisa.
3. **Fluidez & Microinterações:** Animações sutis para curtidas, transições de abas, pull-to-refresh e estados de carregamento em skeleton.

---

## 2. Tokens de Cor (Color Palette)

| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| **`primary`** | `#7C3AED` | Ações principais, destaques, botões CTA |
| **`primaryLight`** | `#A855F7` | Gradientes, estados hover/active, badges |
| **`primaryDark`** | `#5B21B6` | Bordas ativas, textos em destaque |
| **`primarySoft`** | `#F5EEFF` | Fundo de badges, chips de interesse, seleções |
| **`gold`** | `#D97706` | Destaques premium, super-likes, conquistas |
| **`goldLight`** | `#FBBF24` | Gradientes dourados, estrelas de avaliação |
| **`background`** | `#FBF9F6` | Fundo principal da aplicação (modo claro) |
| **`surface`** | `#FFFFFF` | Cartões de conteúdo, headers, bottom sheets |
| **`surfaceElevated`**| `#F3EDE4` | Superfícies secundárias elevadas |
| **`textPrimary`** | `#181324` | Títulos, textos principais, cabeçalhos |
| **`textSecondary`** | `#716880` | Subtítulos, metadados, timestamps |
| **`textMuted`** | `#A098AE` | Placeholders, legendas secundárias |
| **`border`** | `#E8E1D5` | Divisores, bordas de cartões e inputs |
| **`success`** | `#10B981` | Ações confirmadas, status online |
| **`warning`** | `#F59E0B` | Alertas de sistema, Modo Agora |
| **`danger`** | `#EF4444` | Exclusões, erros, deslikes, reportar |
| **`info`** | `#3B82F6` | Informações de suporte, links externos |

---

## 3. Escala de Espaçamento (Spacing Scale)

```text
xs:  4px   (Microespaçamentos, ícone + texto)
sm:  8px   (Paddings internos pequenos, gaps de chips)
md:  16px  (Padding padrão de telas, margins de cartões)
lg:  24px  (Separação de seções)
xl:  32px  (Espaçamento entre blocos de formulário)
xxl: 48px  (Top padding de headers e telas de onboarding)
```

---

## 4. Escala de Arredondamento (Border Radius)

```text
sm:   6px   (Badges pequenos, inputs compactos)
md:   12px  (Botões padrão, inputs de formulário)
lg:   16px  (Cartões do feed, cartões do Modo AGORA)
xl:   24px  (Cartões de Swipe na Descoberta, Bottom Sheets)
full: 9999px (Avatares circulares, pills de status)
```

---

## 5. Hierarquia Tipográfica

- **Display (28px - Bold - Letter Spacing: -0.5px):** Títulos de boas-vindas e números de impacto.
- **Heading 1 (22px - Bold):** Títulos de telas principais (Início, Descobrir, Perfil).
- **Heading 2 (18px - SemiBold):** Nomes de usuários em cartões, títulos de seções.
- **Heading 3 (16px - SemiBold):** Subtítulos e títulos de modais.
- **Body Large (15px - Regular):** Conteúdo textual de publicações e mensagens de chat.
- **Body (14px - Regular):** Textos gerais, biografias, descrições.
- **Body Small (13px - Medium):** Metadados, distância aproximada, timestamps.
- **Caption (11px - Medium):** Legendas de abas inferiores, contadores de badges.
