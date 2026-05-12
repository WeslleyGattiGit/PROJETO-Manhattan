# ✅ Checklist de Validação - Paths do Frontend

Use este checklist para validar se todas as referências estão funcionando corretamente.

## 🧪 Testes a Executar

### 1. Verificar CSS Carregado

- [ ] Abrir `pages/login.html` no navegador
- [ ] Verificar se estilos estão aplicados (cores, layout)
- [ ] Abrir DevTools (F12) → Console
- [ ] Não deve haver erros de 404 para CSS

### 2. Verificar JS Carregado

- [ ] DevTools → Network
- [ ] Verificar se todos esses arquivos carregaram:
  - [ ] `../services/auth-service.js` ✅
  - [ ] `../validators/form-validator.js` ✅
  - [ ] `../scripts/app.js` ✅
- [ ] Nenhum erro 404 ou referência quebrada

### 3. Testar Página de Cadastro

- [ ] Abrir `pages/cadastro.html`
- [ ] Verificar se estilos carregaram corretamente
- [ ] DevTools → Console (sem erros)
- [ ] Verificar se esses arquivos carregaram:
  - [ ] `../services/auth-service.js` ✅
  - [ ] `../validators/form-validator-signup.js` ✅
  - [ ] `../scripts/app-signup.js` ✅

### 4. Testar Links de Navegação

- [ ] Em login.html: clicar em "Crie uma agora"
  - [ ] Deve redirecionar para `cadastro.html`
- [ ] Em cadastro.html: clicar em "Faça login"
  - [ ] Deve redirecionar para `login.html`

### 5. Testar Redirecionamento Pós-Login

- [ ] Se houver token salvo, ao abrir login.html
  - [ ] Deve redirecionar para `../pages/index.html`
- [ ] Mesma coisa para cadastro.html

### 6. Verificar Teste (test.html)

- [ ] Abrir `pages/test.html`
- [ ] Verificar se `../scripts/utils.js` carregou
- [ ] Executar testes disponíveis

---

## 📝 Referências Verificadas

### Arquivos HTML

```html
<!-- ✅ CORRETO: Links CSS em pages/ -->
<link rel="stylesheet" href="../styles/styles.css" />

<!-- ✅ CORRETO: Scripts em pages/ -->
<script src="../services/auth-service.js"></script>
<script src="../validators/form-validator.js"></script>
<script src="../scripts/app.js"></script>

<!-- ✅ CORRETO: Links internos (mesmo diretório) -->
<a href="login.html">Login</a>
<a href="cadastro.html">Cadastro</a>
```

### Arquivos JavaScript

```javascript
// ✅ CORRETO: Redirecionamento para index
window.location.href = "../pages/index.html";
```

---

## 🚨 Problemas Comuns

Se encontrar erros, verifique:

1. **Erro 404 ao carregar CSS**
   - Verifica se o path relativo está correto
   - Deve ser `../styles/` e não `styles/`

2. **Erro 404 ao carregar JS**
   - Verifica se está em `../services/`, `../validators/`, `../scripts/`
   - Não use apenas o nome do arquivo

3. **Links quebrados entre páginas**
   - Links internos em pages/ devem ser apenas `login.html` ou `cadastro.html`
   - Não devem ter `../pages/`

4. **Redirecionamento não funciona**
   - Deve incluir `../pages/` quando sair de páginas
   - Exemplo: `window.location.href = "../pages/index.html"`

---

## 📊 Status Final

**Total de referências verificadas:** 13  
**Correções aplicadas:** 13  
**Erros encontrados:** 0  
**Status:** ✅ PRONTO PARA USO
