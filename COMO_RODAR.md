# 🚀 Como Rodar o Projeto Conexxa

## 📋 Opções de Execução

### ✅ Opção 1: Simples (Recomendado para Testes)

**Abrir HTML direto no navegador - sem servidor**

1. Navegue até a pasta `frontend/pages/`
2. Clique com botão direito em `login.html`
3. Selecione "Abrir com" → Navegador de sua escolha

**Limitações:**

- Validação básica funciona
- Requisições HTTP para backend **não funcionarão** (CORS)
- Ideal para testes visuais/layout

---

### ✅ Opção 2: Com Servidor Local (Melhor Prática)

**Usar http-server no Windows**

#### Passo 1: Abrir o Terminal PowerShell

- Pressione `Win + X`
- Escolha "Terminal Windows"

#### Passo 2: Navegar até o projeto

```powershell
cd "c:\Users\Lenovo\Desktop\FATEC\4º Semestre\Eng.Soft.3\PROJETO-Manhattan\PROJETO-Manhattan"
```

#### Passo 3: Instalar servidor HTTP (primeira vez)

```powershell
npm install -g http-server
```

#### Passo 4: Rodar o servidor

```powershell
cd frontend
http-server -p 8080 -c-1
```

Você verá:

```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://[SEU-IP]:8080
Hit CTRL-C to stop the server
```

#### Passo 5: Abrir no Navegador

- Abra seu navegador
- Navegue para: `http://localhost:8080/pages/login.html`

---

### ✅ Opção 3: Usar Script Batch (Automático)

**Execute os scripts criados**

#### Primeira vez:

1. Navegue até a pasta raiz do projeto
2. Clique em `run-frontend.bat`
3. Aguarde a instalação de dependências
4. O navegador abrirá automaticamente

#### Vezes seguintes:

1. Clique em `run-frontend.bat`
2. O servidor iniciará
3. Clique em `open-browser.bat` em outra janela

---

### ✅ Opção 4: Com Backend (Completo)

**Se o backend fosse implementado**

```powershell
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
npm install -g http-server
http-server -p 8080

# Navegador: http://localhost:8080/pages/login.html
```

⚠️ **Nota:** O backend (`server.js`) está vazio no seu projeto atualmente.

---

## 🔍 Testando o Projeto

### Teste 1: Validação de Formulário

1. Abra a página de login
2. Digite um email inválido → Deve aparecer erro
3. Digite uma senha vazia → Deve aparecer erro
4. Digite valores válidos → Botão deve ficar ativo

### Teste 2: Visual e Responsividade

1. Redimensione a janela do navegador
2. Pressione `F12` para abrir DevTools
3. Selecione "Modo de Dispositivo"
4. Teste em diferentes tamanhos de tela

### Teste 3: Navegação

1. Em login.html: Clique em "Crie uma agora"
   - Deve ir para cadastro.html
2. Em cadastro.html: Clique em "Faça login"
   - Deve voltar para login.html

### Teste 4: Console (DevTools)

1. Pressione `F12`
2. Vá para "Console"
3. Não deve haver erros em vermelho
4. Se houver requisições HTTP, observe o status

---

## 🐛 Solução de Problemas

### Problema: "Porta 8080 já está em uso"

**Solução:**

```powershell
# Use uma porta diferente
http-server -p 8888 -c-1
# Depois acesse: http://localhost:8888/pages/login.html
```

### Problema: Arquivo não encontrado

**Solução:**

- Verifique se está acessando: `/pages/login.html`
- Não: `/login.html` ou `/frontend/login.html`

### Problema: CSS não carrega

**Solução:**

- Abra DevTools (F12) → Network
- Procure por `../styles/styles.css`
- Se estiver 404, significa que o path está errado
- Verifique se está dentro de `pages/`

### Problema: Requisição HTTP falha

**Solução:**

- Isso é **normal** se o backend não está rodando
- A validação do formulário ainda funciona
- Para testar requisições, você precisa:
  1. Implementar o backend
  2. Rodar o backend na porta 3000
  3. Fazer requisição para `http://localhost:3000/api/usuarios/login`

---

## 📚 Estrutura de URLs

Quando acessar com servidor local:

```
http://localhost:8080/pages/login.html     → Página de Login
http://localhost:8080/pages/cadastro.html  → Página de Cadastro
http://localhost:8080/pages/index.html     → Página Principal
http://localhost:8080/pages/test.html      → Página de Testes

Frontend será servido de:
http://localhost:8080/
```

---

## 🎯 Próximas Etapas

1. **Depois de testar o frontend:**
   - Implementar o backend em `backend/server.js`
   - Criar rotas de autenticação

2. **Testar integração:**
   - Frontend comunicando com backend
   - Salvar token JWT
   - Redirecionar após login bem-sucedido

3. **Deploy:**
   - Fazer build do frontend
   - Fazer deploy no servidor
   - Configurar variáveis de ambiente

---

## ✅ Checklist Rápido

Antes de usar o projeto, certifique-se de:

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Arquivos HTML não estão corrompidos
- [ ] Paths estão corretos (verificado ✓)
- [ ] Navegador moderno instalado

---

**Pronto para rodar!** Escolha a opção que preferir e aproveite! 🎉
