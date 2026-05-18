/**
 * ========================================
 * GUIA DE INTEGRAÇÃO FRONTEND-BACKEND
 * ========================================
 * 
 * Este arquivo documenta como o frontend deve integrar-se com
 * as rotas de autenticação, chats e grupos já implementadas no backend.
 * 
 * IMPORTANTE: Todas as requisições para rotas protegidas DEVEM incluir
 * o token JWT no header Authorization
 */

/**
 * ========================================
 * 1. VERIFICAR SESSÃO DO USUÁRIO
 * ========================================
 * 
 * QUANDO USAR: No load da página, antes de renderizar dashboard/chats
 * OBJETIVO: Validar se o token armazenado é ainda válido
 */

// Exemplo de implementação:
/*
async function verificarSessao() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // Usuário não está logado
    window.location.href = '/login.html';
    return null;
  }

  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
        return null;
      }
      throw new Error('Erro ao verificar sessão');
    }

    const usuario = await response.json();
    return usuario; // Contém: id, nome, email, foto_url, authenticated
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
    return null;
  }
}

// Chamar no load da página
document.addEventListener('DOMContentLoaded', async () => {
  const usuario = await verificarSessao();
  if (usuario) {
    // Usuário autenticado, pode renderizar o conteúdo
    console.log(`Bem-vindo, ${usuario.nome}!`);
  }
});
*/

/**
 * ========================================
 * 2. OBTER LISTA DE GRUPOS DO USUÁRIO
 * ========================================
 * 
 * QUANDO USAR: Ao abrir a aba de chats
 * OBJETIVO: Mostrar todos os grupos em que o usuário participa
 * ENDPOINT: GET /api/chats
 */

// Exemplo:
/*
async function obterGruposDoUsuario() {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('/api/chats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const dados = await response.json();
    return dados.grupos; // Array de grupos
  } catch (error) {
    console.error('Erro ao obter grupos:', error);
    return [];
  }
}
*/

/**
 * ========================================
 * 3. OBTER MENSAGENS DE UM GRUPO
 * ========================================
 * 
 * QUANDO USAR: Ao selecionar um grupo específico
 * OBJETIVO: Carregar histórico de mensagens do grupo
 * ENDPOINT: GET /api/chats/:groupId
 * 
 * PARÂMETROS:
 * - groupId: ID do grupo (obrigatório)
 * - limit: número máximo de mensagens (opcional, padrão 50, máximo 100)
 */

// Exemplo:
/*
async function obterMensagensDoGrupo(groupId, limit = 50) {
  const token = localStorage.getItem('authToken');
  
  try {
    const url = `/api/chats/${groupId}?limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const dados = await response.json();
    return dados.mensagens; // Array de mensagens
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    return [];
  }
}
*/

/**
 * ========================================
 * 4. ENVIAR MENSAGEM PARA UM GRUPO
 * ========================================
 * 
 * QUANDO USAR: Quando o usuário clica "Enviar" no input de mensagem
 * OBJETIVO: Salvar e propagar a mensagem para o grupo
 * ENDPOINT: POST /api/chats/:groupId/send
 * 
 * VALIDAÇÕES BACKEND:
 * - Conteúdo não pode estar vazio
 * - Conteúdo máximo: 5000 caracteres
 */

// Exemplo:
/*
async function enviarMensagem(groupId, conteudo) {
  const token = localStorage.getItem('authToken');
  
  if (!conteudo.trim()) {
    console.warn('Mensagem vazia');
    return null;
  }

  try {
    const response = await fetch(`/api/chats/${groupId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conteudo })
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || `Erro ${response.status}`);
    }

    const dados = await response.json();
    return dados.mensagem; // Mensagem criada
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return null;
  }
}
*/

/**
 * ========================================
 * 5. LISTAR TODOS OS GRUPOS DISPONÍVEIS
 * ========================================
 * 
 * QUANDO USAR: Em uma aba "Explorar Grupos" ou similar
 * OBJETIVO: Mostrar todos os grupos existentes para que usuário possa entrar
 * ENDPOINT: GET /api/grupos
 * 
 * QUERY PARAMS:
 * - search: filtrar por nome (opcional)
 */

// Exemplo:
/*
async function obterTodosGrupos(search = '') {
  const token = localStorage.getItem('authToken');
  
  try {
    let url = '/api/grupos';
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const dados = await response.json();
    return dados.grupos; // Array com todos os grupos
  } catch (error) {
    console.error('Erro ao obter grupos:', error);
    return [];
  }
}
*/

/**
 * ========================================
 * 6. CRIAR NOVO GRUPO
 * ========================================
 * 
 * QUANDO USAR: Ao enviar formulário de criação de grupo
 * OBJETIVO: Criar um novo grupo de estudo
 * ENDPOINT: POST /api/grupos
 * 
 * VALIDAÇÕES BACKEND:
 * - nome: obrigatório, máximo 100 caracteres
 * - descricao: opcional, máximo 500 caracteres
 * O criador é adicionado automaticamente como membro
 */

// Exemplo:
/*
async function criarGrupo(nome, descricao = '') {
  const token = localStorage.getItem('authToken');
  
  if (!nome.trim()) {
    console.warn('Nome do grupo é obrigatório');
    return null;
  }

  try {
    const response = await fetch('/api/grupos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, descricao })
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || `Erro ${response.status}`);
    }

    const dados = await response.json();
    return dados.grupo; // Grupo criado
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    return null;
  }
}
*/

/**
 * ========================================
 * 7. ENTRAR EM UM GRUPO
 * ========================================
 * 
 * QUANDO USAR: Quando usuário clica "Entrar" em um grupo da lista
 * OBJETIVO: Adicionar o usuário como membro do grupo
 * ENDPOINT: POST /api/grupos/:groupId/join
 * 
 * RESPOSTA DE ERRO:
 * - 409: Usuário já está neste grupo
 */

// Exemplo:
/*
async function entrarNoGrupo(groupId) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`/api/grupos/${groupId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || `Erro ${response.status}`);
    }

    return true; // Sucesso
  } catch (error) {
    console.error('Erro ao entrar no grupo:', error);
    return false;
  }
}
*/

/**
 * ========================================
 * TRATAMENTO DE ERROS COMUNS
 * ========================================
 */

/*
// 401 Unauthorized: Token expirado ou inválido
// Ação: Limpar localStorage e redirecionar para login

if (response.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
}

// 400 Bad Request: Parâmetros inválidos
// Ação: Mostrar mensagem de erro ao usuário

if (response.status === 400) {
  const erro = await response.json();
  alert(`Erro: ${erro.error}`);
}

// 409 Conflict: Conflito na operação
// Ação: Mostrar mensagem específica (ex: já está no grupo)

if (response.status === 409) {
  const erro = await response.json();
  alert(`Aviso: ${erro.error}`);
}

// 500 Internal Server Error
// Ação: Mostrar mensagem genérica e logar erro

if (response.status >= 500) {
  alert('Erro interno do servidor. Tente novamente mais tarde.');
  console.error('Erro no servidor:', response);
}
*/

/**
 * ========================================
 * FLUXO DE NAVEGAÇÃO RECOMENDADO
 * ========================================
 * 
 * 1. Usuário acessa URL qualquer
 * 2. JavaScript executa verificarSessao()
 *    - Se token não existe ou inválido → redireciona para login.html
 *    - Se válido → continua
 * 
 * 3. Em dashboard.html:
 *    - Exibir nome do usuário
 *    - Link para explorar grupos
 *    - Link para seus chats
 * 
 * 4. Em chats.html (aba de chats):
 *    - Listar grupos do usuário (obterGruposDoUsuario)
 *    - Ao clicar em grupo → carregar mensagens (obterMensagensDoGrupo)
 *    - Input de mensagem com botão enviar
 *    - Atualização em tempo real (WebSocket ou polling)
 * 
 * 5. Em explorar-grupos.html (opcional):
 *    - Listar todos os grupos (obterTodosGrupos)
 *    - Busca por nome
 *    - Botão "Entrar" em cada grupo (entrarNoGrupo)
 * 
 * 6. Em criar-grupo.html (opcional):
 *    - Formulário com nome e descrição
 *    - Botão "Criar" (criarGrupo)
 *    - Redireção automática para chats do novo grupo
 */

module.exports = {};
/**
 * ========================================
 * 8. IMPLEMENTAÇÃO DA SIDEBAR DE GRUPOS
 * ========================================
 * 
 * LOCALIZAÇÃO: /frontend/chat.html e /frontend/scripts/chat.js
 * 
 * OBJETIVO: Exibir lista de grupos do usuário na lateral esquerda da tela de chat,
 * permitindo alternar entre grupos facilmente
 * 
 * ESTRUTURA HTML:
 * - Elemento <aside class="groups-sidebar">
 * - Lista de grupos em <div class="groups-list" id="groupsList">
 * - Cada grupo é um <div class="group-item">
 * 
 * FUNCIONALIDADES IMPLEMENTADAS:
 * 
 * 1. Carregamento automático de grupos
 *    - Função: loadUserGroups()
 *    - Chamada: No DOMContentLoaded após setupSession()
 *    - Endpoint: GET /api/chats
 *    - Exibe: Todos os grupos em que o usuário é membro
 * 
 * 2. Renderização visual
 *    - Função: renderGroupsList(grupos)
 *    - Cada grupo mostra: nome + descrição
 *    - Destaque visual para grupo ativo
 *    - Hover effect para melhor UX
 * 
 * 3. Alternância entre grupos
 *    - Função: switchToGroup(groupId)
 *    - Comportamento: Navega para URL com ?groupId=X
 *    - Resultado: Página recarrega com novo grupo
 * 
 * 4. Atualização do header
 *    - Função: updateGroupHeader(groupId)
 *    - Atualiza: Nome e descrição no <header>
 *    - Ativa: Campo de input de mensagens
 * 
 * FLUXO DE EXECUÇÃO:
 * 
 * 1. DOMContentLoaded disparado
 * 2. setupSession() valida token e obtém userId
 * 3. loadUserGroups() busca grupos do usuário (GET /api/chats)
 * 4. renderGroupsList() renderiza grupos na sidebar
 * 5. Se URL tem ?groupId=X:
 *    - loadGroupMessages() carrega mensagens
 *    - updateGroupHeader() atualiza header
 * 6. Usuário clica em grupo na sidebar
 * 7. switchToGroup() navega para nova URL
 * 
 * ESTILOS CSS:
 * 
 * Classes disponíveis:
 * - .groups-sidebar: Container da sidebar
 * - .groups-sidebar__header: Cabeçalho com título "Chats"
 * - .groups-list: Container da lista de grupos
 * - .group-item: Item individual de grupo
 * - .group-item--active: Estado ativo (grupo selecionado)
 * - .group-item__name: Nome do grupo
 * - .group-item__meta: Descrição/metadados do grupo
 * 
 * Responsividade:
 * - Desktop (>900px): Sidebar vertical na esquerda
 * - Tablet (900px-700px): Sidebar horizontal acima do chat
 * - Mobile (<700px): Sidebar redimensionada
 * 
 * INTEGRAÇÃO COM BACKEND:
 * 
 * Endpoints necessários:
 * 1. GET /api/chats (listar grupos do usuário)
 *    Retorna: { grupos: [{id, nome, descricao, criador_id, criado_em}] }
 * 
 * 2. GET /api/chats/:groupId (listar mensagens)
 *    Retorna: { mensagens: [...], total: N }
 * 
 * Token JWT:
 * - Obrigatório em header Authorization: Bearer <token>
 * - Validade: 2 horas
 * - Renovação: Ao fazer login novamente
 * 
 * EXEMPLO DE USO COMPLETO:
 * 
 * // Ao abrir chat.html
 * 1. Valida token → setupSession()
 * 2. Carrega grupos → loadUserGroups()
 *    Request: GET /api/chats
 *    Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * 
 * 3. Renderiza na sidebar
 *    [Algoritmos 2024]
 *    [Estrutura de Dados]
 *    [Programação Web]
 * 
 * 4. Usuário clica em grupo
 *    switchToGroup(1) → window.location = ?groupId=1
 * 
 * 5. Página recarrega com novo grupo
 *    loadGroupMessages(1) → GET /api/chats/1?limit=50
 *    updateGroupHeader(1) → Atualiza "Algoritmos 2024" no header
 * 
 * TRATAMENTO DE ERROS:
 * 
 * - Nenhum grupo disponível: Mostra "Nenhum grupo disponível"
 * - Erro ao carregar: Mostra "Erro ao carregar grupos"
 * - Grupo sem descrição: Exibe "Sem descrição" como placeholder
 * - XSS Prevention: Função escapeHtml() para sanitizar nomes
 */

/*
 * ========================================
 * FLUXO DE NAVEGAÇÃO RECOMENDADO
 * ========================================
 */

/**
 * ========================================
 * 9. COMUNICAÇÃO EM TEMPO REAL COM SOCKET.IO
 * ========================================
 * 
 * OBJETIVO: Receber mensagens novas instantaneamente sem atualizar a página
 * TECNOLOGIA: Socket.IO (WebSocket com fallback automático)
 * 
 * COMPONENTES:
 * - Backend: server.js (configuração do Socket.IO)
 * - Frontend: chat.html (script socket.io), chat.js (lógica de conexão)
 * - Rotas: chats.js (emissão de eventos após envio)
 */

/**
 * CONFIGURAÇÃO DO SOCKET.IO NO FRONTEND
 * =====================================
 * 
 * 1. Incluir script no HTML (chat.html):
 *    <script src="/socket.io/socket.io.js"></script>
 * 
 * 2. Conectar ao servidor (chat.js):
 *    const socket = io({
 *      auth: { token: sessionStorage.getItem('authToken') }
 *    });
 * 
 * 3. Entrar na sala do grupo:
 *    socket.emit('joinGroup', groupId);
 * 
 * 4. Escutar mensagens novas:
 *    socket.on('newMessage', (message) => {
 *      if (message.grupo_id === currentGroupId) {
 *        appendMessage(message);
 *      }
 *    });
 */

/**
 * EVENTOS SOCKET.IO
 * ================
 * 
 * DO CLIENTE PARA O SERVIDOR:
 * - joinGroup(groupId): Entrar na sala de um grupo
 * - leaveGroup(groupId): Sair da sala de um grupo
 * 
 * DO SERVIDOR PARA O CLIENTE:
 * - newMessage(message): Nova mensagem enviada para o grupo
 *   Payload: { id, grupo_id, usuario_id, conteudo, criado_em, usuario_nome, ... }
 */

/**
 * INTEGRAÇÃO COM O FLUXO DE ENVIO
 * ==============================
 * 
 * Quando sendMessage() é chamado:
 * 1. Frontend faz POST /api/chats/:groupId/send
 * 2. Backend salva no banco e retorna a mensagem
 * 3. Backend emite io.to(`group_${groupId}`).emit('newMessage', mensagem)
 * 4. Todos os clientes na sala recebem o evento
 * 5. Frontend adiciona a mensagem ao DOM via appendMessage()
 * 
 * IMPORTANTE: O remetente também recebe a mensagem via Socket.IO,
 * então não é necessário adicionar manualmente após o POST.
 */

/**
 * TRATAMENTO DE ERRO
 * =================
 * 
 * socket.on('connect_error', (err) => {
 *   console.error('Erro de conexão:', err.message);
 *   // O chat continua funcionando via polling (refresh manual)
 * });
 * 
 * socket.on('disconnect', () => {
 *   console.log('Conexão perdida');
 *   // Tentativa de reconexão automática do Socket.IO
 * });
 */
