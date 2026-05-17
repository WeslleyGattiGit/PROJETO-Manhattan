// Validação de requisitos de senha em tempo real
const passwordInput = document.getElementById("passwordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");

const requirements = {
  length: document.getElementById("req-length"),
  uppercase: document.getElementById("req-uppercase"),
  number: document.getElementById("req-number"),
};

function validatePasswordRequirements(password) {
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  // Atualizar requisitos
  updateRequirement(requirements.length, hasMinLength);
  updateRequirement(requirements.uppercase, hasUppercase);
  updateRequirement(requirements.number, hasNumber);

  return hasMinLength && hasUppercase && hasNumber;
}

function updateRequirement(element, isMet) {
  if (isMet) {
    element.classList.add("met");
    element.querySelector(".requirement-icon").textContent = "✓";
  } else {
    element.classList.remove("met");
    element.querySelector(".requirement-icon").textContent = "○";
  }
}

// Event listener para validação em tempo real
passwordInput.addEventListener("input", function () {
  validatePasswordRequirements(this.value);
});

// Validação ao enviar formulário
document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const senha = passwordInput.value;
    const confirmarSenha = confirmPasswordInput.value;

    // Validação básica
    if (!nome || !email || !senha || !confirmarSenha) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Validar comprimento mínimo do nome
    if (nome.length < 3) {
      showError("Nome deve ter pelo menos 3 caracteres.");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Por favor, digite um email válido.");
      return;
    }

    // Validar requisitos de senha
    if (!validatePasswordRequirements(senha)) {
      showError(
        "Senha deve ter mínimo 6 caracteres, uma letra maiúscula e um número."
      );
      return;
    }

    // Validar confirmação de senha
    if (senha !== confirmarSenha) {
      showError("As senhas não coincidem.");
      return;
    }

    // Enviar para o backend
    registerUser({
      nome,
      email,
      senha,
    });
  });

function showError(message) {
  let errorDiv = document.querySelector(".error-message");

  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    const form = document.querySelector(".signup-form");
    form.parentNode.insertBefore(errorDiv, form);
  }

  errorDiv.textContent = message;
  errorDiv.classList.add("show");

  // Remover mensagem de erro após 5 segundos
  setTimeout(() => {
    errorDiv.classList.remove("show");
  }, 5000);
}

function registerUser(userData) {
  fetch("/api/usuarios/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.id) {
        // Cadastro bem-sucedido
        alert("Cadastro realizado com sucesso! Faça login para continuar.");
        window.location.href = window.location.origin + "/frontend/models/login.html";
      } else if (data.error) {
        showError(data.error);
      } else {
        showError("Erro ao criar conta. Tente novamente.");
      }
    })
    .catch((error) => {
      console.error("Erro:", error);
      showError("Erro de conexão. Tente novamente mais tarde.");
    });
}
