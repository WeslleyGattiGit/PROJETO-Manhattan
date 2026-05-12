# 🚀 GUIA RÁPIDO - Projeto Conexxa

## 🎯 Acesso Imediato

### ✨ Seu Projeto Está Rodando Agora em:

```
🌐 http://localhost:8080/frontend/pages/login.html
```

**👉 Clique ou copie a URL acima para abrir no navegador**

---

## 📍 Outras Páginas

| Página    | URL                                                |
| --------- | -------------------------------------------------- |
| Cadastro  | http://localhost:8080/frontend/pages/cadastro.html |
| Principal | http://localhost:8080/frontend/pages/index.html    |
| Testes    | http://localhost:8080/frontend/pages/test.html     |

---

## 🛑 Quando Quiser Parar

Vá ao terminal onde o servidor está rodando e pressione:

```
Ctrl + C
```

---

## 🔄 Para Reiniciar

1. Feche o terminal (Ctrl + C)
2. Abra um novo terminal PowerShell
3. Execute:

```powershell
cd "c:\Users\Lenovo\Desktop\FATEC\4º Semestre\Eng.Soft.3\PROJETO-Manhattan\PROJETO-Manhattan"
cd frontend
npx http-server -p 8080 -c-1
```

---

## 🧪 Testes Rápidos Que Pode Fazer

### 1️⃣ Validação de Email

- [ ] Digite um email inválido (ex: `teste@`)
- [ ] Deve aparecer mensagem de erro

### 2️⃣ Toggle de Senha

- [ ] Clique no ícone 👁️
- [ ] Senha deve ficar visível
- [ ] Clique novamente
- [ ] Senha deve ficar oculta

### 3️⃣ Navegação

- [ ] Clique em "Crie uma agora"
- [ ] Deve ir para cadastro.html
- [ ] Clique em "Faça login"
- [ ] Deve voltar para login.html

### 4️⃣ Responsividade

- [ ] Pressione F12 (DevTools)
- [ ] Clique em 📱 (modo mobile)
- [ ] Redimensione a janela
- [ ] Deve se adaptar

---

## 📊 O Que Está Funcionando

✅ **Página de Login** com validação  
✅ **Página de Cadastro** com validação  
✅ **Design Responsivo** (mobile, tablet, desktop)  
✅ **Navegação** entre páginas  
✅ **Estilos CSS** completos  
✅ **Validação** em tempo real

---

## ⚠️ O Que NÃO Está Funcionando (Normal)

❌ Requisições HTTP para backend (backend não implementado)  
ℹ️ Mas a validação de formulário funciona perfeitamente!

---

## 📚 Documentação

Se precisar de mais detalhes, leia:

1. [COMO_RODAR.md](COMO_RODAR.md) - 4 opções diferentes
2. [SERVIDOR_RODANDO.md](SERVIDOR_RODANDO.md) - URLs e acesso
3. [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) - Status completo
4. [ESTRUTURA.md](frontend/ESTRUTURA.md) - Organização de pastas

---

## 🆘 Problemas?

### Porta 8080 ocupada?

```powershell
npx http-server -p 8888 -c-1
# Depois acesse: http://localhost:8888/frontend/pages/login.html
```

### Servidor não inicia?

1. Verifique se Node.js está instalado: `node --version`
2. Tente novamente com `npx http-server -p 8080 -c-1`

### Página não carrega?

1. Pressione F12 (DevTools)
2. Vá para aba \"Console\"
3. Procure por erros vermelhos
4. Verifique aba \"Network\" para 404

---

## 📌 Importante

🔴 **O terminal com o servidor DEVE estar aberto e rodando**  
🔴 **Se fechar, o servidor para de responder**  
🔴 **Para usar novamente, execute os comandos de novo**

---

## ✅ Checklist Rápido

- [x] Servidor rodando
- [x] Frontend carregando
- [x] Estilos aplicados
- [x] Formulários funcionando
- [x] Navegação OK
- [x] Validação OK
- [ ] Backend (próximo)

---

## 🎉 Você Está Pronto!

**Basta abrir seu navegador em:**

```
http://localhost:8080/frontend/pages/login.html
```

**E começar a testar o projeto!** 🚀

---

_Gerado em: 11 de maio de 2026_
