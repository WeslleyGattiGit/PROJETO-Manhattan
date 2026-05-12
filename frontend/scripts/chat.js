const groupNameEl = document.getElementById("groupName");
const groupMetaEl = document.getElementById("groupMeta");
const messagesContainer = document.getElementById("messagesContainer");
const messageCountEl = document.getElementById("messageCount");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const inputHint = document.getElementById("inputHint");

let currentUserId = null;
let currentGroupId = null;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  currentGroupId = params.get("groupId");

  setupSession()
    .then(() => {
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
  messagesContainer.innerHTML = `
    <div class="empty-state">${text}</div>
  `;
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
