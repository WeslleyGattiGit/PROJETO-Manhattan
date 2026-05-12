# Guia de Instalação e Execução

## 📋 Pré-requisitos

### Backend

- Node.js 14+ instalado
- npm ou yarn
- Git (opcional)

### Frontend

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, mas recomendado)

## 🚀 Setup Backend

### 1. Instalar Dependências

```bash
cd backend/
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
PORT=3000
JWT_SECRET=sua-chave-secreta-muito-longa-e-aleatoria
NODE_ENV=development
```

### 3. Inicializar Banco de Dados

```bash
npm run init-db
# ou execute diretamente
node backend/database.js
```

### 4. Iniciar Servidor

```bash
npm start
# ou
node backend/server.js
```

O servidor estará rodando em `http://localhost:3000`

## 🖥️ Setup Frontend

### Opção 1: Servidor Local com Python

```bash
cd frontend/

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Acesse: `http://localhost:8000/login.html`

### Opção 2: Servidor Local com Node.js

```bash
# Instalar http-server globalmente
npm install -g http-server

cd frontend/
http-server

# Ou com npx (sem instalar)
npx http-server
```

Acesse: `http://localhost:8080/login.html`

### Opção 3: Abrir Arquivo Diretamente

Você pode abrir `login.html` diretamente no navegador:

```bash
# No Linux/Mac
open frontend/login.html

# No Windows
start frontend\login.html
```

⚠️ **Nota:** Alguns recursos podem não funcionar totalmente quando aberto como arquivo local (por exemplo, requisições XHR podem ser bloqueadas).

## 🧪 Testar Autenticação

### 1. Criar um Usuário (Simular)

Como o endpoint de signup não está implementado no backend, você pode:

**Opção A:** Criar usuário diretamente no SQLite

```bash
sqlite3 database/conexxa.db
INSERT INTO usuarios (nome, email, senha) VALUES (
  'João Silva',
  'joao@example.com',
  '$2a$10$...' -- bcrypt hash de uma senha
);
```

**Opção B:** Usar um cliente HTTP para fazer login com um usuário pré-criado

### 2. Fazer Login

1. Acesse `http://localhost:8000/login.html` (ou a porta do seu servidor)
2. Preencha email: `joao@example.com`
3. Preencha senha: `senha123`
4. Clique em "Entrar"
5. Você deve ser redirecionado para `index.html`

### 3. Verificar Token

Abra o DevTools (F12) → Console e digite:

```javascript
console.log(localStorage.getItem("token"));
```

Você deve ver um token JWT.

## 📁 Estrutura de Pastas Esperada

```
PROJETO-Manhattan/
├── backend/
│   ├── database.js
│   ├── server.js
│   └── package.json
├── database/
│   └── conexxa.db (criado automaticamente)
├── frontend/
│   ├── login.html
│   ├── cadastro.html
│   ├── index.html (página principal)
│   ├── styles.css
│   ├── styles-extra.css
│   ├── auth-service.js
│   ├── form-validator.js
│   ├── form-validator-signup.js
│   ├── app.js
│   ├── app-signup.js
│   ├── utils.js
│   └── README.md
└── package.json
```

## 🔍 Troubleshooting

### Erro: "Cannot POST /api/usuarios/login"

**Solução:**

- Verifique se o servidor backend está rodando
- Verifique a porta (padrão 3000)
- Verifique se CORS está habilitado no backend

### Erro: "TypeError: authService is not defined"

**Solução:**

- Certifique-se de que `auth-service.js` está sendo carregado antes de `app.js` no HTML
- Verifique a ordem dos scripts no arquivo HTML

### Validação não funciona

**Solução:**

- Abra DevTools → Console e verifique se há erros
- Verifique se `form-validator.js` está sendo carregado
- Verifique se os IDs dos elementos correspondem aos esperados

### localStorage não funciona

**Solução:**

- Em HTTP local, localStorage pode ter restrições
- Use `http://localhost:8000` em vez de `file://`
- Verifique as permissões do navegador

### CORS Error

**Solução no backend (express):**

```javascript
const cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:8000", "http://localhost:3000"],
    credentials: true,
  }),
);
```

## 📊 Verificar Requisições HTTP

No DevTools:

1. Abra Console
2. Clique em Network
3. Faça login
4. Você deve ver uma requisição `POST /api/usuarios/login`
5. Verifique Response (deve conter o token)

## 🔐 Segurança em Produção

Antes de deployar para produção:

1. **HTTPS Obrigatório**

   ```javascript
   // Redirecionar HTTP para HTTPS
   app.use((req, res, next) => {
     if (process.env.NODE_ENV === "production" && !req.secure) {
       res.redirect("https://" + req.headers.host + req.url);
     }
     next();
   });
   ```

2. **Variáveis de Ambiente**

   ```bash
   JWT_SECRET=chave-super-secreta-aleatorio-longa
   DB_PATH=/path/para/database/seguro
   CORS_ORIGIN=https://seu-dominio.com
   ```

3. **CORS Restrito**

   ```javascript
   app.use(
     cors({
       origin: process.env.CORS_ORIGIN,
       credentials: true,
     }),
   );
   ```

4. **Helmet.js (Segurança Headers)**

   ```javascript
   const helmet = require("helmet");
   app.use(helmet());
   ```

5. **Rate Limiting**
   ```javascript
   const rateLimit = require("express-rate-limit");
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100,
   });
   app.use("/api/", limiter);
   ```

## 📝 Próximas Etapas

1. Implementar endpoint de cadastro no backend
2. Implementar refresh token
3. Adicionar persistência de sessão
4. Implementar página de recuperação de senha
5. Adicionar autenticação de dois fatores
6. Implementar social login (Google, GitHub)

## 📞 Suporte

Para problemas, verifique:

- Console do navegador (F12)
- Network tab para requisições HTTP
- Backend logs no terminal

---

**Última atualização:** 2026-05-11
