const groupNameEl = document.getElementById("groupName");
const groupMetaEl = document.getElementById("groupMeta");
const messagesContainer = document.getElementById("messagesContainer");
const messageCountEl = document.getElementById("messageCount");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const inputHint = document.getElementById("inputHint");

// Elementos da sidebar
const groupsListEl = document.getElementById("groupsList");
const groupSearchInput = document.getElementById("groupSearchInput");
const groupSearchStatus = document.getElementById("groupSearchStatus");

let socket = null;
let currentUserId = null;
let currentGroupId = null;
let userGroups = [];
let groupsRefreshTimer = null;
let groupSearchTimer = null;
let lastSearchTerm = "";
let displayedMessageIds = new Set();

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  currentGroupId = params.get("groupId");
  initPage();
});

/**
 * Detecta quando a página é restaurada do back-forward cache
 * (navegação com o botão Voltar/Avançar do navegador).
 * Redireciona para login se o token não existir mais.
 */
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "login.html";
    }
  }
});

function initPage() {
  setupSession()
    .then(() => {
      document.querySelector(".page").style.display = "flex";
      loadUserGroups();
      setupGroupSearch();
      initSocket();

      window.addEventListener("focus", refreshGroupsIfNeeded);
      document.addEventListener("visibilitychange", refreshGroupsIfNeeded);
      groupsRefreshTimer = window.setInterval(loadUserGroups, 30000);

      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
      }

      if (!currentGroupId) {
        showEmptyState("Selecione um grupo para começar a conversar.");
        disableMessageForm("Informe um grupo para enviar mensagens.");
        return;
      }

      loadGroupMessages(currentGroupId);
    })
    .catch(() => {
      showEmptyState("Não foi possível carregar o chat.");
    });
}

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  inputHint.textContent = "";

  const messageText = messageInput.value.trim();
  if (!messageText) {
    inputHint.textContent = "Digite uma mensagem antes de enviar.";
    return;
  }

  sendMessage(currentGroupId, messageText);
});

function setupSession() {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
    return Promise.reject();
  }

  return fetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem("authToken");
          window.location.href = "login.html";
        }
        throw new Error("Sessao invalida");
      }
      return response.json();
    })
    .then((user) => {
      currentUserId = user.id;
      return user;
    });
}

// Inicializar conexão Socket.IO
function initSocket() {
  const token = sessionStorage.getItem("authToken");
  if (!token) return;

  socket = io({
    auth: {
      token: token
    }
  });

  socket.on("connect", () => {
    console.log("Conectado ao Socket.IO");
    if (currentGroupId) {
      socket.emit("joinGroup", currentGroupId);
    }
  });

  socket.on("disconnect", () => {
    console.log("Desconectado do Socket.IO");
  });

  socket.on("newMessage", (message) => {
    if (String(message.grupo_id) === String(currentGroupId)) {
      appendMessage(message);
      updateMessageCount();
    }
  });

  socket.on("connect_error", (err) => {
    console.error("Erro de conexão Socket.IO:", err.message);
  });
}

/**
 * Carrega e renderiza lista de grupos do usuário
 */
function loadUserGroups() {
  const token = sessionStorage.getItem("authToken");

  fetch("/api/chats", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      userGroups = data.grupos || [];
      const searchTerm = getActiveSearchTerm();
      if (searchTerm) {
        searchGroups(searchTerm);
      } else {
        renderGroupsList(userGroups, { mode: "user" });
        updateGroupSearchStatus();
        updateGroupHeader(currentGroupId);
        updateActiveGroup();
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar grupos:", error);
      groupsListEl.innerHTML =
        '<div class="groups-list__empty">Erro ao carregar grupos</div>';
    });
}

/**
 * Renderiza lista de grupos na sidebar
 */
function renderGroupsList(grupos, options = {}) {
  const mode = options.mode || "user";
  const list = Array.isArray(grupos) ? grupos : [];
  const emptyMessage =
    mode === "search" ? "Nenhum grupo encontrado" : "Nenhum grupo disponível";

  if (!list.length) {
    groupsListEl.innerHTML = `<div class="groups-list__empty">${emptyMessage}</div>`;
    return;
  }

  groupsListEl.innerHTML = "";

  list.forEach((grupo) => {
    const groupItem = document.createElement("div");
    groupItem.className = "group-item";
    groupItem.dataset.groupId = grupo.id;

    const isMember = isUserMember(grupo.id);

    if (grupo.id == currentGroupId) {
      groupItem.classList.add("group-item--active");
    }

    const nameEl = document.createElement("div");
    nameEl.className = "group-item__name";
    nameEl.textContent = grupo.nome;

    const metaEl = document.createElement("div");
    metaEl.className = "group-item__meta";
    metaEl.textContent = grupo.descricao || "Sem descrição";

    const footerEl = document.createElement("div");
    footerEl.className = "group-item__footer";

    const tagEl = document.createElement("span");
    tagEl.className = "group-item__tag";
    tagEl.textContent = isMember ? "Você participa" : "Não participa";

    footerEl.appendChild(tagEl);

    if (mode === "search" && !isMember) {
      const joinButton = document.createElement("button");
      joinButton.type = "button";
      joinButton.className = "group-item__action";
      joinButton.textContent = "Entrar";
      joinButton.addEventListener("click", (event) => {
        event.stopPropagation();
        joinGroup(grupo.id);
      });
      footerEl.appendChild(joinButton);
    }

    groupItem.append(nameEl, metaEl, footerEl);

    groupItem.addEventListener("click", () => {
      if (isMember) {
        switchToGroup(grupo.id);
      }
    });

    groupsListEl.appendChild(groupItem);
  });
}

/**
 * Alterna para grupo selecionado
 */
function switchToGroup(groupId) {
  const url = new URL(window.location);
  url.searchParams.set("groupId", groupId);
  window.location.href = url.toString();
}

/**
 * Marca o grupo ativo com classe CSS
 */
function updateActiveGroup() {
  document.querySelectorAll(".group-item").forEach((item) => {
    item.classList.remove("group-item--active");
  });

  if (currentGroupId) {
    const activeItem = document.querySelector(
      `[data-group-id="${currentGroupId}"]`,
    );
    if (activeItem) {
      activeItem.classList.add("group-item--active");
    }
  }
}

function setupGroupSearch() {
  if (!groupSearchInput) {
    return;
  }

  groupSearchInput.addEventListener("input", () => {
    const term = getActiveSearchTerm();

    if (groupSearchTimer) {
      clearTimeout(groupSearchTimer);
    }

    groupSearchTimer = window.setTimeout(() => {
      if (term === lastSearchTerm) {
        return;
      }

      lastSearchTerm = term;

      if (!term) {
        renderGroupsList(userGroups, { mode: "user" });
        updateGroupSearchStatus();
        updateGroupHeader(currentGroupId);
        updateActiveGroup();
        return;
      }

      searchGroups(term);
    }, 350);
  });
}

function getActiveSearchTerm() {
  if (!groupSearchInput) {
    return "";
  }

  return groupSearchInput.value.trim();
}

function updateGroupSearchStatus(text) {
  if (!groupSearchStatus) {
    return;
  }

  groupSearchStatus.textContent = text || "Mostrando seus grupos";
}

function searchGroups(term) {
  const token = sessionStorage.getItem("authToken");

  updateGroupSearchStatus("Buscando...");

  fetch(`/api/grupos?search=${encodeURIComponent(term)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const grupos = data.grupos || [];
      renderGroupsList(grupos, { mode: "search" });
      updateGroupSearchStatus(
        grupos.length === 1
          ? "1 grupo encontrado"
          : `${grupos.length} grupos encontrados`,
      );
    })
    .catch(() => {
      groupsListEl.innerHTML =
        '<div class="groups-list__empty">Erro ao buscar grupos</div>';
      updateGroupSearchStatus("Erro na busca");
    });
}

function isUserMember(groupId) {
  return userGroups.some((grupo) => String(grupo.id) === String(groupId));
}

function joinGroup(groupId) {
  const token = sessionStorage.getItem("authToken");

  updateGroupSearchStatus("Entrando no grupo...");

  fetch(`/api/grupos/${groupId}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        updateGroupSearchStatus(data.error);
        return;
      }

      loadUserGroups();
      updateGroupSearchStatus("Grupo adicionado aos seus chats");
    })
    .catch(() => {
      updateGroupSearchStatus("Erro ao entrar no grupo");
    });
}

function refreshGroupsIfNeeded() {
  if (document.visibilityState === "visible") {
    loadUserGroups();
  }
}

function updateGroupHeader(groupId) {
  const grupo = userGroups.find((g) => String(g.id) === String(groupId));

  if (grupo) {
    groupNameEl.textContent = grupo.nome;
    groupMetaEl.textContent = grupo.descricao || "Sala de chat do grupo";
    messageInput.disabled = false;
    messageForm.querySelector("button").disabled = false;
    return;
  }

  if (!groupId) {
    groupNameEl.textContent = "Grupo de Estudo";
    groupMetaEl.textContent = "Sala de chat do grupo";
    return;
  }

  groupNameEl.textContent = "Grupo indisponível";
  groupMetaEl.textContent = "Você não faz mais parte deste grupo";
  disableMessageForm("Você não faz mais parte deste grupo.");
  showEmptyState("Você não faz mais parte deste grupo.");
}

function loadGroupMessages(groupId) {
  displayedMessageIds.clear();

  const token = sessionStorage.getItem("authToken");

  fetch(`/api/chats/${groupId}?limit=50`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showEmptyState(data.error);
        return;
      }

      renderMessages(data.mensagens || []);
      updateMessageCount(data.total || 0);
      updateGroupHeader(groupId);
    })
    .catch(() => {
      showEmptyState("Nao foi possivel carregar as mensagens.");
    });
}

function sendMessage(groupId, conteudo) {
  if (!groupId) {
    return;
  }

  const token = sessionStorage.getItem("authToken");
  const submitButton = messageForm.querySelector("button");
  submitButton.disabled = true;

  fetch(`/api/chats/${groupId}/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ conteudo }),
  })
    .then((response) => response.json())
    .then((data) => {
      submitButton.disabled = false;

      if (data.error) {
        inputHint.textContent = data.error;
        return;
      }

      if (data.mensagem) {
        messageInput.value = "";
        messageInput.focus();
      }
    })
    .catch(() => {
      submitButton.disabled = false;
      inputHint.textContent = "Erro ao enviar mensagem.";
    });
}

function renderMessages(messages) {
  messagesContainer.innerHTML = "";

  if (!messages.length) {
    showEmptyState("Ainda nao ha mensagens neste grupo.");
    return;
  }

  messages.forEach((message) => appendMessage(message));
  scrollToBottom();
}

function appendMessage(message) {
  // Evita duplicação: verifica se mensagem já foi exibida
  if (displayedMessageIds.has(message.id)) {
    return;
  }
  displayedMessageIds.add(message.id);

  clearEmptyState();

  const messageEl = document.createElement("div");
  messageEl.className = "message";

  if (message.usuario_id === currentUserId) {
    messageEl.classList.add("message--me");
  }

  const author = document.createElement("span");
  author.className = "message__author";
  author.textContent = message.usuario_nome || "Participante";

  const text = document.createElement("p");
  text.className = "message__text";
  text.textContent = message.conteudo;

  const time = document.createElement("span");
  time.className = "message__time";
  time.textContent = formatTime(message.criado_em);

  messageEl.append(author, text, time);
  messagesContainer.appendChild(messageEl);
  scrollToBottom();
}

function formatTime(isoDate) {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateMessageCount(total) {
  if (typeof total === "number") {
    messageCountEl.textContent = `${total} mensagens`;
    return;
  }

  const count = messagesContainer.querySelectorAll(".message").length;
  messageCountEl.textContent = `${count} mensagens`;
}

function showEmptyState(text) {
  messagesContainer.innerHTML = "";
  const emptyDiv = document.createElement("div");
  emptyDiv.className = "empty-state";
  emptyDiv.textContent = text;
  messagesContainer.appendChild(emptyDiv);
}

function clearEmptyState() {
  const emptyState = messagesContainer.querySelector(".empty-state");
  if (emptyState) {
    emptyState.remove();
  }
}

function disableMessageForm(text) {
  messageInput.disabled = true;
  messageForm.querySelector("button").disabled = true;
  inputHint.textContent = text;
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Faz logout: invalida o token no servidor, remove da sessionStorage e redireciona
 */
async function handleLogout() {
  const token = sessionStorage.getItem("authToken");

  try {
    // Requisição assíncrona não aguarda resposta para não bloquear a navegação
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).catch(() => {
      // Silencioso — mesmo se falhar, removemos o token localmente
    });
  } catch {
    // Ignora erros de fetch
  }

  // Remove token da sessionStorage imediatamente
  sessionStorage.removeItem("authToken");

  // Redireciona para o login
  window.location.href = "login.html";
}

window.addEventListener("beforeunload", () => {
  if (groupsRefreshTimer) {
    window.clearInterval(groupsRefreshTimer);
  }
});
