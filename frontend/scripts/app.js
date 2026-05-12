/**
 * App.js - Lógica principal da aplicação
 * Orquestra o formulário, validação e autenticação
 */

class LoginApp {
  constructor() {
    this.form = document.getElementById("loginForm");
    this.submitBtn = document.getElementById("submitBtn");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.generalError = document.getElementById("generalError");
    this.successMessage = document.getElementById("successMessage");
    this.emailInput = document.getElementById("email");
    this.senhaInput = document.getElementById("senha");
    this.togglePasswordBtn = document.getElementById("togglePassword");

    this.init();
  }

  init() {
    if (!this.form) {
      console.error("Formulário de login não encontrado");
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
    this.togglePasswordBtn.addEventListener("click", () =>
      this.togglePasswordVisibility(),
    );

    // Limpa erro geral quando o usuário começa a digitar
    [this.emailInput, this.senhaInput].forEach((input) => {
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
   */
  togglePasswordVisibility() {
    const isPassword = this.senhaInput.type === "password";
    this.senhaInput.type = isPassword ? "text" : "password";

    // Atualiza o emoji do botão
    const icon = this.togglePasswordBtn.querySelector(".icon");
    icon.textContent = isPassword ? "🙈" : "👁️";

    // Muda o aria-label
    this.togglePasswordBtn.setAttribute(
      "aria-label",
      isPassword ? "Ocultar senha" : "Mostrar senha",
    );
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
      this.submitBtn.textContent = "Carregando...";
    } else {
      this.submitBtn.disabled = false;
      this.loadingSpinner.classList.remove("show");
      this.submitBtn.textContent = "Entrar";
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

    // Realiza o login
    await this.performLogin(formData);
  }

  /**
   * Realiza o login
   * @param {Object} formData - Dados do formulário
   */
  async performLogin(formData) {
    this.setLoading(true);
    this.clearGeneralError();

    try {
      const result = await window.authService.login(
        formData.email,
        formData.senha,
      );

      // Login bem-sucedido
      this.showSuccessMessage(
        "✓ Login realizado com sucesso! Redirecionando...",
      );

      // Aguarda um pouco antes de redirecionar
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redireciona para a página principal
      window.location.href = "../pages/index.html";
    } catch (error) {
      this.setLoading(false);
      this.handleLoginError(error);
    }
  }

  /**
   * Trata erros de login
   * @param {Error} error - Erro capturado
   */
  handleLoginError(error) {
    let errorMessage = "Erro ao fazer login. Tente novamente.";

    if (error instanceof AuthError) {
      // Erros conhecidos de autenticação
      switch (error.statusCode) {
        case 400:
          errorMessage = "E-mail ou senha inválidos.";
          break;
        case 401:
          errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
          break;
        case 500:
          errorMessage = "Erro no servidor. Tente novamente mais tarde.";
          break;
        case 0:
          errorMessage = error.message; // Mensagem customizada
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
  window.loginApp = new LoginApp();
});

// Tratamento de erros não capturados
window.addEventListener("error", (event) => {
  console.error("Erro não capturado:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Promise rejeitada não tratada:", event.reason);
});
