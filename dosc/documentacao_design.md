# Documentação de Design - Proximous

## Decisões de Design

### Filosofia de Design

O design do Proximous foi desenvolvido com base na filosofia de "Design Empático", priorizando o conforto emocional dos usuários tímidos e introvertidos. Cada elemento visual foi cuidadosamente escolhido para reduzir a ansiedade e promover um ambiente acolhedor.

### Principais Decisões

#### 1. Paleta de Cores Suaves
**Decisão:** Utilizar cores pastéis e suaves (lavanda, azul claro, bege)
**Justificativa:** Cores vibrantes podem causar ansiedade em pessoas tímidas. As cores suaves transmitem calma e segurança.
**Impacto:** Reduz o estresse visual e cria um ambiente mais confortável para interações sociais.

#### 2. Tipografia Amigável
**Decisão:** Escolher fontes arredondadas e legíveis (Inter/Poppins)
**Justificativa:** Fontes muito formais podem parecer intimidantes, enquanto fontes muito casuais podem parecer pouco profissionais.
**Impacto:** Equilibra profissionalismo com acessibilidade emocional.

#### 3. Espaçamento Generoso
**Decisão:** Usar espaçamento amplo entre elementos (grid de 8px)
**Justificativa:** Interfaces congestionadas podem causar sobrecarga sensorial em pessoas sensíveis.
**Impacto:** Facilita a navegação e reduz a fadiga visual.

#### 4. Animações Sutis
**Decisão:** Implementar animações suaves e não intrusivas
**Justificativa:** Movimentos bruscos podem ser desconfortáveis para usuários ansiosos.
**Impacto:** Melhora a experiência sem causar distração ou desconforto.

## Diretrizes de Implementação

### Componentes Principais

#### Botões
- **Primário:** Fundo azul claro (#87CEEB), texto branco, border-radius 16px
- **Secundário:** Fundo transparente, borda azul claro, texto azul claro
- **Área de toque:** Mínimo 44px de altura
- **Estados:** Hover com opacidade 0.8, active com scale 0.98

#### Cards
- **Fundo:** Branco com sombra sutil (0 2px 8px rgba(0,0,0,0.1))
- **Border-radius:** 12px
- **Padding:** 16px
- **Espaçamento:** 16px entre cards

#### Formulários
- **Input fields:** Fundo branco, borda cinza clara, border-radius 8px
- **Labels:** Texto cinza escuro, 14px, peso 500
- **Validação:** Verde menta para sucesso, laranja suave para avisos

### Iconografia

#### Estilo
- Ícones outline com 2px de espessura
- Tamanho padrão: 24px
- Cores: Cinza escuro (#333) para neutros, azul claro para ativos

#### Ícones Específicos
- **Curtida:** Coração outline/filled
- **Mensagem:** Balão de fala
- **Localização:** Pin de mapa
- **Filtros:** Funil
- **Configurações:** Engrenagem

### Responsividade

#### Breakpoints
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

#### Adaptações
- **Mobile:** Interface otimizada para toque, navegação por abas
- **Tablet:** Layout expandido, mais informações visíveis
- **Desktop:** Interface web adaptada, mantendo a essência mobile

### Acessibilidade

#### Contraste
- **Texto principal:** Razão mínima 4.5:1
- **Texto secundário:** Razão mínima 3:1
- **Elementos interativos:** Razão mínima 3:1

#### Navegação
- **Foco visível:** Outline azul claro 2px
- **Área de toque:** Mínimo 44x44px
- **Navegação por teclado:** Suporte completo

#### Movimento
- **Respeitar prefers-reduced-motion**
- **Animações opcionais:** Configuração para desabilitar
- **Feedback tátil:** Vibração sutil em dispositivos móveis

### Temas e Variações

#### Modo Escuro (Futuro)
- **Fundo:** Cinza escuro (#1a1a1a)
- **Cards:** Cinza médio (#2a2a2a)
- **Texto:** Branco/cinza claro
- **Cores de destaque:** Mantém a paleta original com ajustes de saturação

#### Personalização
- **Tamanho da fonte:** 3 opções (pequeno, médio, grande)
- **Densidade:** Compacto ou confortável
- **Cores de destaque:** Opções limitadas mantendo a harmonia

## Fluxo de Usuário

### Onboarding
1. **Tela de boas-vindas:** Logo + mensagem acolhedora
2. **Seleção de personalidade:** Tags visuais claras
3. **Criação de perfil:** Formulário guiado passo a passo
4. **Configuração de localização:** Explicação clara dos benefícios
5. **Tutorial interativo:** Demonstração das principais funcionalidades

### Navegação Principal
- **Feed principal:** Descoberta de pessoas próximas
- **Mensagens:** Conversas ativas e históricas
- **Perfil:** Configurações e informações pessoais

### Interações
- **Curtir:** Animação de coração com feedback visual
- **Mensagem:** Transição suave para tela de conversa
- **Filtros:** Modal overlay com opções organizadas

## Métricas de Sucesso do Design

### Usabilidade
- **Taxa de conclusão do onboarding:** >85%
- **Tempo médio para primeira interação:** <2 minutos
- **Taxa de abandono na criação de perfil:** <20%

### Engajamento
- **Sessões por usuário por dia:** >3
- **Tempo médio de sessão:** >5 minutos
- **Taxa de retorno D1:** >60%

### Satisfação
- **NPS (Net Promoter Score):** >50
- **Avaliação na loja de apps:** >4.5 estrelas
- **Feedback sobre design:** >80% positivo

