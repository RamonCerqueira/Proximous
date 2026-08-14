# 🚀 Guia de Inicialização do Sistema Proximous

Este documento contém todas as instruções e comandos necessários para executar cada aplicação do ecossistema **Proximous** em ambiente de desenvolvimento local.

---

## 📐 Estrutura do Sistema

| Aplicação | Tecnologia | Diretório | Porta / URL Padrão |
|---|---|---|---|
| **Backend API** | Python (Flask + SQLAlchemy) | `proximous_backend/` | `http://localhost:5000` |
| **Web Frontend** | React 19 + Vite + Tailwind CSS | `proximous-web/` | `http://localhost:5173` |
| **Mobile App** | React Native + Expo | `proximous-mobile/` | Metro Bundler (Expo Go / Emulador) |
| **Apresentação** | HTML / CSS / JS | `proximous_presentation/` | `http://localhost:8000` |

---

## 🛠️ Pré-requisitos Gerais

Antes de iniciar as aplicações, certifique-se de ter instalado:
* **Node.js** (v18.0.0 ou superior) & **npm** / **pnpm**
* **Python** (v3.10 ou superior)
* **Expo Go** instalado no smartphone (opcional, para testar a aplicação móvel via QR Code)

---

## 1. ⚙️ Backend API (`proximous_backend`)

O backend gerencia autenticação, banco de dados PostgreSQL/SQLite, rotas da API REST e WebSockets.

### Comandos de Inicialização (Local):

1. Abra o terminal e acesse a pasta do backend:
   ```bash
   cd proximous_backend
   ```

2. Ative o ambiente virtual Python (`venv`):
   * **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Windows (CMD):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **Linux / macOS:**
     ```bash
     source venv/bin/activate
     ```

3. *(Opcional)* Instale as dependências (caso não tenham sido instaladas):
   ```bash
   pip install -r requirements.txt
   ```

4. Execute o servidor Backend:
   ```bash
   python src/main.py
   ```

> **Servidor Rodando:** A API estará disponível em `http://localhost:5000/api`

### *(Alternativa)* Execução via Docker:
```bash
cd proximous_backend
docker-compose up --build -d
```

---

## 2. 💻 Aplicação Web (`proximous-web`)

O painel web interativo para usuários e administradores da plataforma Proximous.

### Comandos de Inicialização:

1. Abra um **novo terminal** e acesse a pasta da aplicação web:
   ```bash
   cd proximous-web
   ```

2. *(Opcional)* Instale os pacotes `node_modules` (se for a primeira vez):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento (Vite):
   ```bash
   npm run dev
   ```
   *(Ou usando pnpm, se preferir: `pnpm dev`)*

> **Aplicação Web Rodando:** Acesse no navegador em `http://localhost:5173`

---

## 3. 📱 Aplicação Mobile (`proximous-mobile`)

O aplicativo móvel multiplataforma construído com React Native e Expo.

### Comandos de Inicialização:

1. Abra um **novo terminal** e acesse a pasta da aplicação mobile:
   ```bash
   cd proximous-mobile
   ```

2. *(Opcional)* Instale os pacotes `node_modules` (se for a primeira vez):
   ```bash
   npm install
   ```

3. Inicie o Expo Bundler:
   ```bash
   npx expo start
   ```
   *(Ou `npm start`)*

4. **Como visualizar o aplicativo:**
   * **Smartphone Físico:** Abra o app **Expo Go** e escaneie o **QR Code** exibido no terminal.
   * **Emulador Android:** Pressione a tecla `a` no terminal (or `npm run android`).
   * **Emulador iOS (macOS):** Pressione a tecla `i` no terminal (or `npm run ios`).
   * **Versão Web:** Pressione a tecla `w` no terminal (or `npm run web`).

---

## 4. 📊 Apresentação Interativa (`proximous_presentation`)

Painel interativo de apresentação contendo gráficos de mercado, funcionalidades e arquitetura do produto.

### Opção A: Servidor HTTP Local via Python (Recomendado)
```bash
cd proximous_presentation
python -m http.server 8000
```
> Acesse em: `http://localhost:8000/introducao.html`

### Opção B: Servidor Node (`serve`)
```bash
cd proximous_presentation
npx serve .
```

### Opção C: Acesso Direto
Abra o arquivo `introducao.html` localizado na pasta `proximous_presentation` diretamente em qualquer navegador web.

---

## ⚡ Guia Rápido (Cheat Sheet para 3 Terminais simultâneos)

Para rodar todo o ecossistema ao mesmo tempo, abra 3 abas de terminal:

### Terminal 1 - Backend:
```bash
cd proximous_backend
.\venv\Scripts\Activate.ps1
python src/main.py
```

### Terminal 2 - Web:
```bash
cd proximous-web
npm run dev
```

### Terminal 3 - Mobile:
```bash
cd proximous-mobile
npx expo start
```

---

## 🔍 Dicas e Solução de Problemas

* **Erro de política de execução no PowerShell (Windows):**
  Se o comando `Activate.ps1` for bloqueado, execute o PowerShell como Administrador e rode:
  ```powershell
  Set-ExecutionPolicy Unrestricted -Scope Process
  ```
* **Conectar o App Mobile ao Backend Local:**
  Ao testar no celular físico via Expo Go, certifique-se de ajustar a URL base da API no mobile trocando `localhost` pelo endereço **IP Local da sua máquina na rede Wi-Fi** (exemplo: `http://192.168.1.15:5000/api`).
