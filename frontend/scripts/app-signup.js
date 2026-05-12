/**
 * App-Signup.js - Lógica para a página de cadastro
 */

class SignupApp {
  constructor() {
    this.form = document.getElementById("signupForm");
    this.submitBtn = document.getElementById("submitBtn");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.generalError = document.getElementById("generalError");
    this.successMessage = document.getElementById("successMessage");
    this.togglePasswordBtns = document.querySelectorAll(".toggle-password");

    this.init();
  }

  init() {
    if (!this.form) {
      console.error("Formulário de cadastro não encontrado");
      return;
    }

    this.attachEventListeners();
    this.checkIfAlreadyAuthenticated();
  }

  /**
   * Anexa listeners aos elementos
   */
  attachEventListeners() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Listeners para toggle de visibilidade de senha
    this.togglePasswordBtns.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        if (index === 0) {
          this.togglePasswordVisibility("senha");
        } else {
          this.togglePasswordVisibility("confirmarSenha");
        }
      });
    });

    // Limpa erro geral quando o usuário começa a digitar
    const inputs = this.form.querySelectorAll(".form-input");
    inputs.forEach((input) => {
      input.addEventListener("input", () => this.clearGeneralError());
    });
  }

  /**
   * Verifica se o usuário já está autenticado
   */
  checkIfAlreadyAuthenticated() {
    if (window.authService && window.authService.isAuthenticated()) {
      // Redireciona para a página principal
      setTimeout(() => {
        window.location.href = "../pages/index.html";
      }, 1000);
    }
  }

  /**
   * Alterna visibilidade da senha
   * @param {string} fieldId - ID do campo de senha
   */
  togglePasswordVisibility(fieldId) {
    const input = document.getElementById(fieldId);
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    // Encontra o botão correspondente
    const btn = input.nextElementSibling;
    if (btn && btn.classList.contains("toggle-password")) {
      const icon = btn.querySelector(".icon");
      icon.textContent = isPassword ? "🙈" : "👁️";

      // Muda o aria-label
      btn.setAttribute(
        "aria-label",
        isPassword
          ? "Ocultar " + (fieldId === "senha" ? "senha" : "confirmação")
          : "Mostrar " + (fieldId === "senha" ? "senha" : "confirmação"),
      );
    }
  }

  /**
   * Limpa mensagem de erro geral
   */
  clearGeneralError() {
    this.generalError.classList.remove("show");
    this.generalError.textContent = "";
  }

  /**
   * Exibe mensagem de erro geral
   * @param {string} message - Mensagem de erro
   */
  showGeneralError(message) {
    this.generalError.textContent = message;
    this.generalError.classList.add("show");
    // Scroll para o erro
    this.generalError.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /**
   * Exibe mensagem de sucesso
   * @param {string} message - Mensagem de sucesso
   */
  showSuccessMessage(message) {
    this.successMessage.textContent = message;
    this.successMessage.classList.add("show");
    // Scroll para o sucesso
    this.successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /**
   * Define estado de carregamento
   * @param {boolean} isLoading - True se carregando
   */
  setLoading(isLoading) {
    if (isLoading) {
      this.submitBtn.disabled = true;
      this.loadingSpinner.classList.add("show");
      this.submitBtn.textContent = "Criando conta...";
    } else {
      this.submitBtn.disabled = false;
      this.loadingSpinner.classList.remove("show");
      this.submitBtn.textContent = "Criar Conta";
    }
  }

  /**
   * Trata o envio do formulário
   * @param {Event} event - Evento do submit
   */
  async handleSubmit(event) {
    event.preventDefault();

    // Valida o formulário
    if (!window.formValidator.validateForm()) {
      this.showGeneralError("Por favor, corrija os erros no formulário.");
      return;
    }

    // Obtém dados do formulário
    const formData = window.formValidator.getFormData();

    // Realiza o cadastro
    await this.performSignup(formData);
  }

  /**
   * Realiza o cadastro
   * @param {Object} formData - Dados do formulário
   */
  async performSignup(formData) {
    this.setLoading(true);
    this.clearGeneralError();

    try {
      // Aqui você faria a chamada para a API de signup
      // Por enquanto, simulamos um delay e depois fazemos login
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Faz login automático após o cadastro
      const result = await window.authService.login(
        formData.email,
        formData.senha,
      );

      // Cadastro e login bem-sucedidos
      this.showSuccessMessage("✓ Conta criada com sucesso! Entrando...");

      // Aguarda um pouco antes de redirecionar
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redireciona para a página principal
      window.location.href = "../pages/index.html";
    } catch (error) {
      this.setLoading(false);
      this.handleSignupError(error);
    }
  }

  /**
   * Trata erros de cadastro
   * @param {Error} error - Erro capturado
   */
  handleSignupError(error) {
    let errorMessage = "Erro ao criar conta. Tente novamente.";

    if (error instanceof AuthError) {
      switch (error.statusCode) {
        case 400:
          errorMessage = "Dados inválidos. Verifique os campos.";
          break;
        case 409:
          errorMessage = "E-mail já cadastrado. Use outro e-mail.";
          break;
        case 500:
          errorMessage = "Erro no servidor. Tente novamente mais tarde.";
          break;
        case 0:
          errorMessage = error.message;
          break;
        default:
          errorMessage = error.message;
      }
    } else {
      errorMessage = "Erro inesperado. Tente novamente.";
      console.error("Erro desconhecido:", error);
    }

    this.showGeneralError(errorMessage);
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.signupApp = new SignupApp();
});

// Tratamento de erros não capturados
window.addEventListener("error", (event) => {
  console.error("Erro não capturado:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Promise rejeitada não tratada:", event.reason);
});
