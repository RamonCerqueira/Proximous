# MOBILE_RELEASE.md — GUIA DE PUBLICAÇÃO (GOOGLE PLAY & APPLE APP STORE)

## 1. Informações Básicas do Aplicativo
- **Nome do App:** Proximous
- **Subtítulo / Descrição Curta:** Conecte-se com pessoas e atividades próximas a você.
- **Categoria:** Redes Sociais / Social Networking
- **Classificação Etária:** 17+ (Interação social e descoberta de pessoas)
- **Bundle ID / Package Name:** `com.proximous.app`
- **Versão:** `1.0.0` (Build 1)
- **Deep Link Scheme:** `proximous://`

---

## 2. Instruções de Build

### 2.1. Android (Google Play Store - Android App Bundle .AAB)
```bash
# Geração via EAS Build (Nuvem / Recomendado)
npx eas-cli build --platform android --profile production

# Ou geração local de projeto nativo Android Studio
npx expo prebuild --platform android
cd android && ./gradlew bundleRelease
```
*O artefato `.aab` resultante estará pronto para upload no Google Play Console.*

### 2.2. iOS (Apple App Store - Archive / IPA)
```bash
# Geração via EAS Build (Nuvem)
npx eas-cli build --platform ios --profile production

# Ou geração local de projeto nativo Xcode
npx expo prebuild --platform ios
# Abrir proximous.xcworkspace no Xcode e executar Product -> Archive
```

---

## 3. Checklist de Submissão

- [x] Ícones adaptativos HD configurados (`assets/adaptive-icon.png` e `assets/icon.png`)
- [x] Splash screen nativa alinhada à cor da marca (`#7C3AED`)
- [x] Strings de descrição de permissões no `Info.plist` (Localização, Câmera, Galeria)
- [x] Variáveis de ambiente de produção configuradas para `https://proximous.genioplay.com.br/api`
- [x] Política de Privacidade e Termos de Uso vinculados à API
- [x] Schemas de deep linking registrados para abertura direta de perfis e mensagens
