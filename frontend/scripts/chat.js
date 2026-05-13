const groupNameEl = document.getElementById("groupName");
const groupMetaEl = document.getElementById("groupMeta");
const messagesContainer = document.getElementById("messagesContainer");
const messageCountEl = document.getElementById("messageCount");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const inputHint = document.getElementById("inputHint");

// Elementos da sidebar
const groupsListEl = document.getElementById("groupsList");

let currentUserId = null;
let currentGroupId = null;
let userGroups = [];
let groupsRefreshTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  currentGroupId = params.get("groupId");

  setupSession()
    .then(() => {
      loadUserGroups();

      window.addEventListener("focus", refreshGroupsIfNeeded);
      document.addEventListener("visibilitychange", refreshGroupsIfNeeded);
      groupsRefreshTimer = window.setInterval(loadUserGroups, 30000);

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
});

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
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/login.html";
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
          localStorage.removeItem("authToken");
          window.location.href = "/login.html";
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

/**
 * Carrega e renderiza lista de grupos do usuário
 */
function loadUserGroups() {
  const token = localStorage.getItem("authToken");

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
      renderGroupsList(userGroups);
      updateGroupHeader(currentGroupId);
      updateActiveGroup();
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
function renderGroupsList(grupos) {
  if (!grupos.length) {
    groupsListEl.innerHTML =
      '<div class="groups-list__empty">Nenhum grupo disponível</div>';
    return;
  }

  groupsListEl.innerHTML = "";

  grupos.forEach((grupo) => {
    const groupItem = document.createElement("div");
    groupItem.className = "group-item";
    groupItem.dataset.groupId = grupo.id;

    if (grupo.id == currentGroupId) {
      groupItem.classList.add("group-item--active");
    }

    groupItem.innerHTML = `
      <div class="group-item__name">${escapeHtml(grupo.nome)}</div>
      <div class="group-item__meta">${escapeHtml(
        grupo.descricao || "Sem descrição",
      )}</div>
    `;

    groupItem.addEventListener("click", () => {
      switchToGroup(grupo.id);
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

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function loadGroupMessages(groupId) {
  const token = localStorage.getItem("authToken");

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

  const token = localStorage.getItem("authToken");
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
        appendMessage(data.mensagem);
        updateMessageCount();
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

window.addEventListener("beforeunload", () => {
  if (groupsRefreshTimer) {
    window.clearInterval(groupsRefreshTimer);
  }
});
