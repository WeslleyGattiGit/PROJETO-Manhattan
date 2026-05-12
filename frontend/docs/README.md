# Frontend - Conexxa Platform

## 📋 Estrutura do Projeto

Este diretório contém a interface de autenticação da plataforma Conexxa, desenvolvida com HTML, CSS e JavaScript vanilla.

### Arquivos Principais

#### HTML

- **login.html** - Página de login dos usuários
- **cadastro.html** - Página de cadastro de novos usuários

#### CSS

- **styles.css** - Estilos principais (layout, componentes, responsividade)
- **styles-extra.css** - Estilos adicionais (hints, mobile, acessibilidade)

#### JavaScript

**Serviços:**

- **auth-service.js** - Serviço de autenticação que se comunica com o backend
  - Métodos: `login()`, `saveToken()`, `getToken()`, `isAuthenticated()`, `decodeToken()`, `getUserInfo()`
  - Classe: `AuthError` para tratamento de erros

**Validação:**

- **form-validator.js** - Validador para o formulário de login
- **form-validator-signup.js** - Validador para o formulário de cadastro
  - Validações: email, senha, nome, confirmação de senha
  - Validação em tempo real com feedback visual

**Aplicação:**

- **app.js** - Lógica principal da página de login
- **app-signup.js** - Lógica principal da página de cadastro
  - Gerenciamento de estado de carregamento
  - Exibição de mensagens de erro/sucesso
  - Redirecionamento pós-autenticação

## 🎨 Design

### Cores (Identidade Visual)

- **Primário:** #007bff (Azul)
- **Primário Escuro:** #0056b3
- **Sucesso:** #10b981 (Verde)
- **Erro:** #ef4444 (Vermelho)
- **Fundo:** Gradiente roxo (#667eea para #764ba2)
- **Branco:** #ffffff

### Tipografia

- Font Family: Sistema padrão (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, etc.)
- Responsiva com media queries

### Layout

- **Desktop:** Grid com 2 colunas (formulário + informações)
- **Tablet:** Grid com 1 coluna, responsivo
- **Mobile:** Otimizado com espaçamentos menores

## ✨ Funcionalidades

### Login

- [x] Campos de email e senha
- [x] Botão "Entrar"
- [x] Link para tela de cadastro
- [x] Validação em tempo real
- [x] Mostrar/ocultar senha
- [x] Feedback visual (spinner de carregamento)
- [x] Mensagens de erro/sucesso
- [x] Layout responsivo
- [x] Acessibilidade (ARIA labels, roles)

### Cadastro

- [x] Campo de nome completo
- [x] Campo de email
- [x] Campo de senha com confirmação
- [x] Validações customizadas
- [x] Mostrar/ocultar senhas
- [x] Link para login
- [x] Acessibilidade completa

## 🔒 Segurança

### Implementadas

- ✅ Validação de entrada em tempo real
- ✅ Sanitização de dados
- ✅ Proteção contra XSS (escape de HTML)
- ✅ HTTPS obrigatório (em produção)
- ✅ CORS configurado no backend
- ✅ Tokens JWT armazenados com segurança
- ✅ Senha não é armazenada localmente
- ✅ Validação de email formato
- ✅ Limite de comprimento de entrada

### Boas Práticas

- Sem uso de `eval()` ou `innerHTML` sem escape
- CSP headers (configurar no backend)
- Proteção contra CSRF (tokens CSRF no backend)
- Rate limiting (implementar no backend)

## 📱 Responsividade

- **Desktop:** 1200px+
- **Tablet:** 768px - 1199px
- **Mobile:** até 767px
- **Small Mobile:** até 480px

## ♿ Acessibilidade

- ARIA labels para campos de entrada
- ARIA roles para elementos interativos
- Focus states visíveis
- Suporte a leitores de tela
- Cores com bom contraste
- Resposta a `prefers-reduced-motion`

## 🚀 Como Usar

### Inicialização

1. Certifique-se de que o backend está rodando em `http://localhost:3000`
2. Abra `login.html` no navegador
3. Ou configure um servidor web local

```bash
# Exemplo com Python 3
python -m http.server 8000

# Ou com Node.js (http-server)
npx http-server
```

### Fluxo de Usuário

**Novo Usuário:**

1. Acessa `cadastro.html`
2. Preenche: Nome, Email, Senha e Confirma Senha
3. Valida em tempo real
4. Envia para o backend
5. Login automático após cadastro bem-sucedido
6. Redireciona para `index.html`

**Usuário Existente:**

1. Acessa `login.html`
2. Preenche: Email e Senha
3. Valida em tempo real
4. Envia credenciais ao backend
5. Recebe token JWT
6. Armazena token localmente
7. Redireciona para `index.html`

## 📡 Integração com Backend

### Endpoint de Login

```
POST /api/usuarios/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "senha": "senha123"
}

Resposta (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Resposta (401):
{
  "error": "Credenciais inválidas"
}
```

### Endpoint de Cadastro (Não implementado no backend)

```
POST /api/usuarios/signup
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}

Resposta (201):
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com"
}
```

## 🛠️ Desenvolvimento

### Estrutura de Classes

**FormValidator**

```javascript
new FormValidator('formId')
- validateForm() → boolean
- validateField(field) → boolean
- getFormData() → Object
- clearErrors() → void
```

**SignupFormValidator**

```javascript
extends FormValidator
- validateNome(nome) → string
- validateConfirmaSenha(confirmarSenha) → string
```

**AuthService**

```javascript
new AuthService(baseUrl)
- login(email, senha) → Promise<Object>
- saveToken(token) → void
- getToken() → string|null
- isAuthenticated() → boolean
- getUserInfo() → Object|null
```

**LoginApp / SignupApp**

```javascript
- handleSubmit(event) → Promise<void>
- performLogin/Signup(formData) → Promise<void>
- togglePasswordVisibility() → void
- showGeneralError(message) → void
```

### Variáveis de Ambiente

Configure no arquivo respectivo:

```javascript
// auth-service.js
const baseUrl = "http://localhost:3000"; // Pode ser variável de ambiente
```

## 🧪 Testes Manuais

### Cenários de Teste

1. **Validação de Email**
   - Email vazio → Mensagem de erro
   - Email sem @ → Mensagem de erro
   - Email válido → Sem erro

2. **Validação de Senha**
   - Senha vazia → Mensagem de erro
   - Senha < 6 caracteres → Mensagem de erro
   - Senha válida → Sem erro

3. **Login Bem-sucedido**
   - Credenciais corretas → Token salvo, redirecionamento
   - Spinner visível durante requisição

4. **Login Falhado**
   - Credenciais incorretas → Mensagem de erro vermelha
   - Conexão falha → Mensagem de timeout

5. **Responsividade**
   - Desktop → Layout 2 colunas
   - Tablet → Layout 1 coluna
   - Mobile → Otimizado com touch

6. **Acessibilidade**
   - Navegação por teclado (Tab)
   - Focus visível em todos os botões
   - Leitura de erros por leitores de tela

## 📚 Dependências

**Frontend (Não há dependências externas - vanilla JS)**

- HTML5
- CSS3
- JavaScript ES6+

**Backend Requerido**

- Node.js
- Express
- SQLite
- bcryptjs
- jsonwebtoken

## 🔄 Fluxo de Autenticação

```
Usuario tenta fazer login
    ↓
Validação local (FormValidator)
    ↓
Requisição POST para backend
    ↓
Backend valida credenciais
    ↓
Backend gera JWT
    ↓
Frontend recebe token
    ↓
Frontend armazena em localStorage
    ↓
Frontend redireciona para dashboard
    ↓
Proximas requisições incluem token no header
```

## 📝 Notas de Implementação

1. **Token Storage:** Atualmente em localStorage. Considere usar sessionStorage ou cookies com HttpOnly em produção.

2. **CORS:** O backend deve configurar CORS para aceitar requisições do frontend.

3. **HTTPS:** Em produção, sempre use HTTPS.

4. **Rate Limiting:** Implemente no backend para prevenir brute force.

5. **Refresh Token:** Considere implementar um refresh token para sessões longas.

## 🐛 Troubleshooting

### CORS Error

- Verifique se o backend tem CORS habilitado
- Certifique-se da porta correta (padrão 3000)

### Token não persiste

- Verifique localStorage no DevTools
- Certifique-se que o navegador permite localStorage

### Validação não funciona

- Verifique console por erros JavaScript
- Certifique-se que os IDs dos elementos correspondem

## 📞 Suporte

Para dúvidas ou problemas, consulte:

- Backend: `../backend/server.js`
- Database: `../database/`

---

**Última atualização:** 2026-05-11
**Versão:** 1.0.0
