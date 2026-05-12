/**
 * Módulo de autenticação - Tela de Login
 * Responsável pela validação e envio do formulário de login
 */

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }
});

/**
 * Manipula o envio do formulário de login
 * @param {Event} event - Evento de submit do formulário
 */
function handleLoginSubmit(event) {
  event.preventDefault();

  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validação básica no cliente
  if (!email || !password) {
    alert("Por favor, preencha todos os campos");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Por favor, insira um email válido");
    emailInput.focus();
    return;
  }

  if (password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres");
    passwordInput.focus();
    return;
  }

  // Enviar requisição de login para o backend
  submitLogin(email, password);
}

/**
 * Valida o formato do email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - True se o email é válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Envia os dados de login para o servidor
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 */
function submitLogin(email, password) {
  const loginButton = document.querySelector(".login-button");
  const originalButtonText = loginButton.textContent;

  // Desabilitar o botão durante a requisição
  loginButton.disabled = true;
  loginButton.textContent = "Entrando...";

  fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Erro ao fazer login");
        });
      }
      return response.json();
    })
    .then((data) => {
      // Salvar token (se aplicável)
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // Redirecionar para o painel principal
      window.location.href = "/dashboard";
    })
    .catch((error) => {
      console.error("Erro:", error);
      alert("Erro ao fazer login: " + error.message);

      // Reabilitar o botão em caso de erro
      loginButton.disabled = false;
      loginButton.textContent = originalButtonText;
    });
}
