# PROXIMOUS — MOBILE APP FULL MASTER

## MISSÃO

Você é um agente sênior especializado em:

* Mobile Product Design
* React
* Next.js
* TypeScript
* Capacitor
* Android
* iOS
* UI/UX Mobile
* Design Systems
* PWA
* APIs REST
* autenticação
* geolocalização
* notificações
* publicação Google Play
* publicação Apple App Store
* performance mobile
* acessibilidade
* segurança mobile

Sua missão é transformar a pasta existente:

```text
/mobile
```

do projeto **Proximous** no aplicativo mobile oficial da plataforma.

O aplicativo deverá estar preparado para:

```text
Android
iOS
```

e deverá utilizar a aplicação/backend já existentes sempre que possível.

---

# 1. REGRA ABSOLUTA

## NÃO REFAÇA O PROJETO DO ZERO.

Antes de modificar qualquer arquivo:

1. analise toda a pasta `/mobile`;
2. identifique a stack;
3. identifique o framework;
4. identifique o bundler;
5. identifique a configuração Capacitor;
6. identifique Android;
7. identifique iOS;
8. identifique todas as páginas;
9. identifique todos os componentes;
10. identifique hooks;
11. identifique providers;
12. identifique serviços;
13. identifique APIs;
14. identifique autenticação;
15. identifique armazenamento local;
16. identifique navegação;
17. identifique permissões;
18. identifique integrações nativas;
19. identifique dependências;
20. identifique variáveis de ambiente;
21. identifique assets;
22. identifique logo;
23. identifique ícones;
24. identifique splash;
25. identifique funcionalidades já implementadas.

Depois disso, gere:

```text
AUDITORIA_MOBILE.md
```

Não comece o redesign antes da auditoria.

---

# 2. OBJETIVO

Transformar o Proximous em um aplicativo mobile profissional.

O resultado não pode parecer:

* site responsivo;
* WebView genérico;
* dashboard;
* template pronto;
* clone de outra rede social;
* aplicativo antigo;
* aplicação administrativa.

Deve parecer:

> uma rede social mobile moderna, rápida, humana, tecnológica e extremamente bem acabada.

O aplicativo precisa transmitir:

* proximidade;
* descoberta;
* comunidade;
* conexão;
* confiança;
* modernidade;
* simplicidade;
* localização;
* interação social.

---

# 3. IDENTIDADE DO PROXIMOUS

O site oficial atual deve ser utilizado como referência visual:

```text
https://proximous.genioplay.com.br/
```

Utilize o site atual como fonte de verdade para:

* cores;
* logo;
* identidade;
* tipografia;
* elementos visuais;
* linguagem;
* estilo;
* aparência geral.

Não invente uma identidade completamente diferente.

Porém, também não copie literalmente o layout web.

A identidade deve ser reinterpretada para mobile.

---

# 4. REGRA DE CORES

Analise os arquivos existentes e o site oficial antes de definir os tokens.

Não invente cores aleatórias.

Criar:

```text
Primary
Primary Dark
Primary Light
Primary Soft

Background
Surface
Surface Elevated

Text Primary
Text Secondary
Text Muted

Border

Success
Warning
Danger
Info
```

Os valores devem ser derivados da identidade real do Proximous.

Garantir contraste adequado.

Não utilizar excesso de gradientes.

Não transformar toda a interface em uma única cor.

A cor principal deve servir para:

* ações;
* links;
* seleção;
* navegação;
* indicadores;
* estados ativos;
* elementos de destaque.

---

# 5. DESIGN SYSTEM

Criar ou reorganizar um Design System centralizado.

Utilizar tokens.

Evitar:

```text
cores espalhadas pelo código;
valores mágicos;
border-radius aleatório;
font-size aleatório;
spacing inconsistente;
sombras diferentes em cada componente.
```

Criar uma escala consistente:

```text
4
8
12
16
20
24
32
40
48
64
```

Criar hierarquia de radius.

Não deixar todos os componentes excessivamente arredondados.

---

# 6. TIPOGRAFIA

A tipografia deve priorizar:

* legibilidade;
* velocidade;
* acessibilidade;
* aparência moderna.

Criar hierarquia:

```text
Display
Heading 1
Heading 2
Heading 3

Body Large
Body
Body Small

Caption
Label
```

Não utilizar fonte decorativa.

---

# 7. APP SHELL

Criar uma estrutura mobile consistente.

Considerar:

* status bar;
* safe area;
* notch;
* Dynamic Island;
* Android navigation;
* teclado;
* orientação;
* viewport;
* gestos.

O conteúdo nunca deve ficar escondido atrás de:

* status bar;
* notch;
* Dynamic Island;
* bottom navigation.

---

# 8. NAVEGAÇÃO

A navegação deve ser pensada especificamente para smartphone.

Criar uma Bottom Navigation moderna.

Priorizar os recursos mais importantes.

Exemplo conceitual:

```text
Início
Descobrir
Criar
Mensagens
Perfil
```

Não adicionar dezenas de opções na barra inferior.

Recursos secundários devem ficar em:

```text
Mais
Menu
Bottom Sheet
Perfil
Configurações
```

Adaptar a navegação conforme as funcionalidades realmente existentes.

Não criar rotas falsas.

---

# 9. HOME / FEED

A Home é uma das telas mais importantes.

Criar uma experiência social moderna.

Priorizar:

* publicações;
* pessoas;
* interações;
* descoberta;
* proximidade.

O feed deve suportar corretamente:

* texto;
* imagens;
* vídeos, se existentes;
* curtidas;
* comentários;
* compartilhamento, se existente;
* autor;
* data;
* localização, quando disponível;
* ações da publicação.

Não inventar funcionalidades inexistentes no backend.

---

# 10. DESCOBERTA

O grande diferencial do Proximous é a possibilidade de descobrir pessoas próximas.

Criar uma experiência mobile excelente para:

```text
Pessoas próximas
```

Quando a API fornecer localização:

mostrar:

* distância;
* nome;
* avatar;
* informações públicas;
* interesses, quando disponíveis;
* ações sociais existentes.

Nunca expor localização exata de usuários.

Utilizar distância aproximada.

Exemplo:

```text
320 m
1,2 km
3,8 km
```

Nunca mostrar:

```text
Rua X
Número Y
Coordenada exata
```

sem justificativa e autorização.

---

# 11. GEOLOCALIZAÇÃO

Integrar corretamente geolocalização.

Verificar:

* permissão;
* solicitação de permissão;
* negação;
* permissão parcial;
* localização indisponível;
* GPS desligado;
* timeout;
* erro;
* fallback.

Criar estados:

```text
Localização permitida

Localização sendo obtida

Localização negada

Localização indisponível

Ative sua localização
```

Nunca bloquear o aplicativo inteiro simplesmente porque o usuário recusou localização.

---

# 12. PERFIL

O perfil precisa parecer uma página social moderna.

Mostrar somente informações existentes.

Estrutura conceitual:

```text
Avatar

Nome
@username

Bio

Localização aproximada

Amigos
Seguidores
Seguindo

Publicações

Fotos

Grupos
```

Utilizar somente os dados realmente existentes.

---

# 13. AMIZADES

Criar UX clara para:

```text
Adicionar amigo
Solicitação enviada
Solicitação recebida
Aceitar
Recusar
Amigos
Remover amizade
```

Não criar estados artificiais.

---

# 14. MENSAGENS

Se o sistema possuir mensageria, transformar em experiência mobile real.

Criar:

```text
Lista de conversas
Conversa
Campo de mensagem
Enviar
Anexos
Status
Horário
```

Quando existir suporte no backend:

* mensagens em tempo real;
* indicadores;
* notificações;
* contador;
* mensagens não lidas.

Não inventar WebSocket se o backend não possuir essa infraestrutura.

---

# 15. NOTIFICAÇÕES

Criar central de notificações.

Separar visualmente:

```text
Curtidas
Comentários
Amizades
Mensagens
Grupos
Sistema
```

Implementar badge quando houver suporte.

---

# 16. PUSH NOTIFICATIONS

Preparar integração nativa para:

```text
Android
iOS
```

Verificar:

* Firebase Cloud Messaging;
* APNs;
* permissões;
* token do dispositivo;
* registro;
* atualização do token;
* logout;
* deep link;
* abertura da tela correta.

Não implementar infraestrutura inexistente sem documentar.

Se o backend ainda não possuir suporte:

criar:

```text
PUSH_NOTIFICATION_REQUIREMENTS.md
```

descrevendo exatamente o que será necessário no backend.

---

# 17. LOGIN

Redesenhar o login para experiência mobile premium.

Preservar:

* autenticação atual;
* validações;
* API;
* tokens;
* regras existentes.

Verificar:

* teclado;
* autofocus;
* validação;
* loading;
* erro;
* sucesso;
* recuperação.

Nunca exibir senha em texto aberto por padrão.

Criar botão:

```text
Mostrar senha
Ocultar senha
```

---

# 18. CADASTRO

O cadastro precisa ser simples e seguro.

Verificar as regras atuais.

Validar:

* nome;
* usuário;
* e-mail;
* telefone;
* senha;
* confirmação;
* campos obrigatórios.

A senha deve possuir:

* força visual;
* requisitos;
* confirmação;
* proteção contra exposição acidental.

Não alterar regras do backend sem necessidade.

---

# 19. RECUPERAÇÃO DE SENHA

Criar fluxo:

```text
Esqueci minha senha

Verificação

Nova senha

Sucesso
```

Se houver código:

usar:

```text
6 dígitos
autofocus
auto avanço
colar código
teclado numérico
contador
reenviar
```

---

# 20. CRIAÇÃO DE PUBLICAÇÃO

Criar UX mobile excelente.

Fluxo:

```text
+
Nova publicação

Texto

Imagem

Localização

Pré-visualização

Publicar
```

Respeitar as funcionalidades existentes.

---

# 21. IMAGENS

Verificar:

* câmera;
* galeria;
* compressão;
* preview;
* crop;
* upload;
* cancelamento;
* erro;
* retry.

Não enviar imagens gigantes sem necessidade.

Otimizar upload.

---

# 22. PERMISSÕES NATIVAS

Auditar todas as permissões necessárias.

Exemplos:

```text
Location
Camera
Photos
Notifications
Microphone
```

Não solicitar permissões que o aplicativo não utiliza.

Solicitar no momento correto.

Nunca pedir todas as permissões no primeiro acesso sem necessidade.

---

# 23. SPLASH SCREEN

Criar splash nativa para:

```text
Android
iOS
```

Utilizar a identidade oficial do Proximous.

A splash deve ser:

* rápida;
* elegante;
* limpa;
* profissional.

Não criar animação pesada que atrase o carregamento.

---

# 24. ÍCONE DO APLICATIVO

Preparar assets oficiais para:

```text
Android
iOS
```

Criar:

```text
app icon
adaptive icon Android
iOS App Icon
splash assets
```

Não utilizar o favicon do site simplesmente como ícone de aplicativo.

---

# 25. CAPACITOR

Se Capacitor já existir:

preservar a integração.

Auditar:

```text
capacitor.config
android/
ios/
plugins
```

Verificar:

* status bar;
* splash;
* keyboard;
* preferences;
* filesystem;
* camera;
* geolocation;
* push;
* haptics;
* browser;
* share.

Não substituir plugins funcionando sem necessidade.

---

# 26. ANDROID

Preparar o projeto para publicação Google Play.

Verificar:

```text
applicationId
versionCode
versionName
minSdk
targetSdk
compileSdk
AndroidManifest
permissions
icons
splash
signing
```

Preparar:

```text
AAB
```

Não utilizar APK como artefato principal da publicação.

---

# 27. IOS

Preparar o projeto para publicação Apple App Store.

Verificar:

```text
Bundle Identifier
Version
Build
Deployment Target
Info.plist
permissions
icons
launch screen
signing
capabilities
```

Preparar projeto para:

```text
Archive
TestFlight
App Store
```

---

# 28. IDENTIDADE DA LOJA

Preparar:

```text
Nome do aplicativo

Proximous
```

Verificar necessidade de:

```text
App name
Short description
Full description
Keywords
Category
Age rating
Privacy
Support URL
Marketing URL
```

Não inventar informações jurídicas ou comerciais.

---

# 29. PRIVACIDADE

Como o Proximous trabalha com dados de usuários e localização, revisar cuidadosamente:

* localização;
* perfil;
* fotos;
* mensagens;
* contatos;
* notificações;
* analytics;
* armazenamento local;
* tokens.

Nunca armazenar informações sensíveis desnecessariamente.

Não colocar:

```text
tokens
senhas
segredos
API keys privadas
```

no frontend.

---

# 30. SEGURANÇA MOBILE

Auditar:

* armazenamento de token;
* logs;
* console;
* informações sensíveis;
* endpoints;
* CORS;
* exposição de IDs;
* dados de usuários;
* localização;
* screenshots, quando aplicável;
* clipboard;
* deep links.

Não confiar exclusivamente em validação frontend.

A API continua sendo a autoridade.

---

# 31. OFFLINE

Criar experiência para:

```text
Sem conexão
Conexão instável
Servidor indisponível
Timeout
```

Exemplo:

```text
Você está offline.

Algumas informações podem não estar disponíveis.

Tentar novamente
```

Não afirmar que informações estão atualizadas sem sincronização.

---

# 32. LOADING

Evitar:

```text
Carregando...
```

em toda tela.

Criar:

```text
Skeleton
Spinner contextual
Loading button
Pull-to-refresh
```

---

# 33. EMPTY STATES

Toda lista precisa possuir estado vazio.

Exemplos:

```text
Nenhuma pessoa próxima encontrada.

Nenhuma conversa ainda.

Você ainda não possui notificações.

Nenhuma publicação encontrada.
```

Sempre oferecer ação quando fizer sentido.

---

# 34. ERROR STATES

Não exibir erros técnicos para usuários.

Nunca mostrar:

```text
500 Internal Server Error
TypeError
AxiosError
Prisma Error
```

para o usuário.

Criar mensagens amigáveis e manter o erro técnico nos logs.

---

# 35. MICROINTERAÇÕES

Utilizar animações discretas para:

* curtida;
* criação;
* navegação;
* abertura de modal;
* bottom sheet;
* loading;
* confirmação;
* envio;
* atualização.

Não transformar a rede social em uma interface cheia de animações.

---

# 36. HAPTIC FEEDBACK

Quando tecnicamente apropriado:

* curtida;
* confirmação;
* ações importantes;
* seleção;
* sucesso.

Não exagerar.

---

# 37. PERFORMANCE

Prioridade:

```text
Performance > efeitos visuais
```

Auditar:

* bundle;
* imagens;
* lazy loading;
* listas;
* memória;
* renderizações;
* chamadas duplicadas;
* cache;
* animações;
* network requests.

Feed grande deve utilizar paginação/infinite scroll conforme o backend existente.

---

# 38. ACESSIBILIDADE

Garantir:

* contraste;
* labels;
* leitor de tela;
* touch targets;
* foco;
* tamanho de fonte;
* feedback não baseado somente em cor;
* reduced motion.

---

# 39. RESPONSIVIDADE

Testar pelo menos:

```text
iPhone pequeno
iPhone grande
iPhone com Dynamic Island
Android pequeno
Android grande
Android com navigation bar
Tablet
```

Nunca assumir apenas uma resolução.

---

# 40. BACK BUTTON ANDROID

Implementar corretamente:

* voltar;
* modal;
* bottom sheet;
* teclado;
* navegação;
* saída do aplicativo.

Não fechar o aplicativo inesperadamente.

---

# 41. DEEP LINKS

Preparar estrutura para links como:

```text
proximous://profile/123
proximous://post/456
proximous://group/789
proximous://message/123
```

e Universal Links / App Links quando aplicável.

Se o backend/site ainda não possuir infraestrutura:

documentar a necessidade.

---

# 42. COMPARTILHAMENTO

Quando houver suporte:

permitir compartilhar:

* perfil;
* publicação;
* grupo;
* conteúdo público.

Usar APIs nativas quando possível.

---

# 43. TESTES

Executar:

```text
npm run lint
npm run build
```

ou os comandos equivalentes encontrados durante a auditoria.

Também testar:

```text
login
logout
cadastro
recuperação
feed
publicação
curtida
comentário
perfil
amizade
busca
pessoas próximas
mensagens
notificações
geolocalização
upload
permissões
offline
```

---

# 44. TESTE NATIVO

Testar no mínimo:

## Android

```text
emulador
dispositivo físico
```

## iOS

```text
simulador
dispositivo físico
```

Quando possível.

---

# 45. QA VISUAL

Após implementar:

faça uma segunda análise visual completa.

Pergunte:

> Isso realmente parece um aplicativo oficial de uma grande rede social?

Se não:

melhore.

Analise:

* espaçamento;
* hierarquia;
* tipografia;
* cores;
* navegação;
* touch;
* ícones;
* animações;
* estados;
* consistência;
* performance;
* percepção de qualidade.

---

# 46. REGRA CONTRA PLACEHOLDER

Não utilizar:

```text
Lorem ipsum
Usuário Teste
Pessoa Fake
Foto genérica
Dados inventados
Publicação fictícia
Mensagem fictícia
```

Utilizar dados reais da API.

Quando não houver dados:

usar Empty State.

---

# 47. REGRA CONTRA OVERDESIGN

Não adicionar:

* excesso de gradiente;
* excesso de sombra;
* glassmorphism em tudo;
* cards para tudo;
* animações excessivas;
* gráficos desnecessários;
* elementos decorativos sem função.

Premium significa:

```text
clareza
consistência
velocidade
hierarquia
acabamento
```

---

# 48. ARQUITETURA

Separar adequadamente:

```text
UI
Components
Hooks
Services
API
Types
Utils
Stores
Native
```

Não colocar toda a lógica dentro das páginas.

Criar componentes reutilizáveis.

Evitar duplicação.

---

# 49. TYPESCRIPT

Manter TypeScript rigoroso.

Evitar:

```text
any
```

quando houver alternativa.

Não esconder erros com:

```text
as any
@ts-ignore
@ts-expect-error
```

sem justificativa real.

---

# 50. DEPENDÊNCIAS

Antes de instalar qualquer biblioteca:

verifique se a funcionalidade pode ser implementada utilizando:

* React;
* TypeScript;
* Capacitor;
* APIs nativas;
* bibliotecas já instaladas.

Não adicionar dependências pesadas sem necessidade.

---

# 51. NÃO ALTERAR BACKEND POR CONVENIÊNCIA

Não modificar:

* banco;
* API;
* autenticação;
* regras;
* contratos;
* endpoints;

somente porque o mobile deseja uma estrutura diferente.

Se uma funcionalidade realmente exigir backend:

criar:

```text
BACKEND_REQUIREMENTS.md
```

com:

```text
Endpoint necessário
Método
Request
Response
Motivo
Impacto
Segurança
```

---

# 52. PUBLICAÇÃO

O projeto deve terminar preparado para:

```text
Google Play Console
Apple App Store Connect
```

Gerar documentação:

```text
MOBILE_RELEASE.md
```

contendo:

* versão;
* build;
* comandos;
* Android;
* iOS;
* assinatura;
* variáveis;
* permissões;
* assets;
* checklist;
* problemas conhecidos.

---

# 53. ARTEFATOS OBRIGATÓRIOS

Ao finalizar, gerar:

```text
AUDITORIA_MOBILE.md

DESIGN_SYSTEM_MOBILE.md

MOBILE_ARCHITECTURE.md

MOBILE_SECURITY.md

MOBILE_QA.md

MOBILE_RELEASE.md

REDESIGN_MOBILE.md
```

---

# 54. RELATÓRIO FINAL

O arquivo:

```text
REDESIGN_MOBILE.md
```

deve conter:

## 1. Resumo

## 2. Estado inicial

## 3. Arquitetura encontrada

## 4. Stack

## 5. Telas analisadas

## 6. Telas modificadas

## 7. Componentes criados

## 8. Design System

## 9. Melhorias de UX

## 10. Melhorias de acessibilidade

## 11. Melhorias de performance

## 12. Recursos nativos

## 13. Android

## 14. iOS

## 15. Segurança

## 16. APIs utilizadas

## 17. APIs que precisam de evolução

## 18. Testes executados

## 19. Resultado do build

## 20. Pendências

## 21. Checklist de publicação

---

# 55. ORDEM OBRIGATÓRIA DE EXECUÇÃO

Executar exatamente nesta ordem:

```text
FASE 1
AUDITORIA

↓

FASE 2
ARQUITETURA

↓

FASE 3
DESIGN SYSTEM

↓

FASE 4
APP SHELL

↓

FASE 5
AUTENTICAÇÃO

↓

FASE 6
HOME / FEED

↓

FASE 7
DESCOBERTA / GEOLOCALIZAÇÃO

↓

FASE 8
PERFIS

↓

FASE 9
SOCIAL / AMIZADES

↓

FASE 10
MENSAGENS

↓

FASE 11
NOTIFICAÇÕES

↓

FASE 12
CONFIGURAÇÕES

↓

FASE 13
PERMISSÕES NATIVAS

↓

FASE 14
ANDROID

↓

FASE 15
IOS

↓

FASE 16
PERFORMANCE

↓

FASE 17
SEGURANÇA

↓

FASE 18
QA

↓

FASE 19
SEGUNDA ANÁLISE VISUAL

↓

FASE 20
RELEASE
```

---

# 56. REGRA MAIS IMPORTANTE

Não pare quando o projeto:

```text
compilar.
```

Não pare quando:

```text
npm run build
```

funcionar.

Não pare quando:

```text
Android abrir.
```

Não pare quando:

```text
iOS abrir.
```

O objetivo é entregar:

> um aplicativo mobile realmente pronto para produção.

---

# 57. CRITÉRIO FINAL

O Proximous Mobile somente deve ser considerado concluído quando estiver:

```text
FUNCIONAL
+
VISUALMENTE EXCELENTE
+
MOBILE FIRST
+
RÁPIDO
+
SEGURO
+
ACESSÍVEL
+
ESTÁVEL
+
COMPATÍVEL COM ANDROID
+
COMPATÍVEL COM IOS
+
PREPARADO PARA GOOGLE PLAY
+
PREPARADO PARA APP STORE
```

Prioridade:

```text
USABILIDADE
↓
PERFORMANCE
↓
SEGURANÇA
↓
CLAREZA
↓
IDENTIDADE
↓
SOFISTICAÇÃO
```

Nunca sacrificar:

```text
segurança por conveniência;

performance por animação;

funcionalidade por estética;

privacidade por crescimento;

estabilidade por novidade.
```

## RESULTADO ESPERADO

Transformar:

```text
/mobile
```

de uma pasta mobile existente em:

> **PROXIMOUS — aplicativo oficial mobile para Android e iOS, com experiência social moderna, geolocalização, descoberta de pessoas próximas, identidade visual própria, arquitetura sólida, integração nativa e preparação completa para publicação nas lojas.**

Antes de modificar o código:

**AUDITE.**

Depois:

**PLANEJE.**

Depois:

**IMPLEMENTE.**

Depois:

**TESTE.**

Depois:

**REFINE.**

E somente então:

**PREPARE PARA RELEASE.**
