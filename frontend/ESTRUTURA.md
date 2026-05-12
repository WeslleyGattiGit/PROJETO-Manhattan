# 📁 Estrutura do Frontend

Organização modular e profissional do projeto frontend da plataforma Conexxa.

## 🗂️ Diretórios

### `pages/` - Páginas HTML

Contém todos os arquivos HTML da aplicação:

- `login.html` - Página de login
- `cadastro.html` - Página de cadastro
- `index.html` - Página inicial
- `test.html` - Página de testes

### `styles/` - Folhas de Estilo

Arquivos CSS da aplicação:

- `styles.css` - Estilos principais e responsividade
- `styles-extra.css` - Estilos adicionais e acessibilidade

### `scripts/` - Scripts da Aplicação

Lógica principal da aplicação:

- `app.js` - Controlador principal de login
- `app-signup.js` - Controlador de cadastro
- `utils.js` - Funções utilitárias

### `services/` - Serviços

Camada de comunicação com backend:

- `auth-service.js` - Serviço de autenticação

### `validators/` - Validadores

Validação de formulários:

- `form-validator.js` - Validador do formulário de login
- `form-validator-signup.js` - Validador do formulário de cadastro

### `docs/` - Documentação

Guias, checklist e exemplos:

- `README.md` - Documentação técnica principal
- `GUIA_INSTALACAO.md` - Guia de instalação
- `RESUMO_IMPLEMENTACAO.md` - Resumo da implementação
- `CHECKLIST_VERIFICACAO.md` - Checklist de verificação
- `EXEMPLOS_REQUISICOES.http` - Exemplos de requisições HTTP

### `setup.sh` - Script de Configuração

Script de configuração do ambiente

## 🚀 Como Começar

1. Leia [docs/GUIA_INSTALACAO.md](docs/GUIA_INSTALACAO.md)
2. Execute `./setup.sh` para configurar o ambiente
3. Consulte [docs/README.md](docs/README.md) para informações técnicas

## 📝 Convenções

- **Arquivos JavaScript**: CamelCase para funções, UPPER_CASE para constantes
- **Arquivos HTML**: nomes descritivos em lowercase
- **Arquivos CSS**: nomes descritivos em lowercase
- **Organização**: Separação clara entre apresentação, lógica e serviços

---

**Última atualização:** Estrutura reorganizada em 2024
