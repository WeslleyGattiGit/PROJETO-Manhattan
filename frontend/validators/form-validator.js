/**
 * Form Validator
 * Responsável pela validação em tempo real dos campos do formulário
 */

class FormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.errors = {};
    this.init();
  }

  init() {
    if (!this.form) {
      console.error("Formulário não encontrado");
      return;
    }

    this.attachListeners();
  }

  attachListeners() {
    // Validação em tempo real para cada campo
    const inputs = this.form.querySelectorAll(".form-input");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.validateField(input));
    });
  }

  /**
   * Valida um campo específico
   * @param {HTMLInputElement} field - Campo a validar
   * @returns {boolean} - True se válido
   */
  validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();
    let errorMessage = "";

    switch (fieldName) {
      case "email":
        errorMessage = this.validateEmail(fieldValue);
        break;
      case "senha":
        errorMessage = this.validateSenha(fieldValue);
        break;
    }

    this.setFieldError(field, errorMessage);
    return !errorMessage;
  }

  /**
   * Valida formato de email
   * @param {string} email - Email a validar
   * @returns {string} - Mensagem de erro ou string vazia
   */
  validateEmail(email) {
    if (!email) {
      return "E-mail é obrigatório";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "E-mail inválido";
    }

    if (email.length > 254) {
      return "E-mail muito longo";
    }

    return "";
  }

  /**
   * Valida senha
   * @param {string} senha - Senha a validar
   * @returns {string} - Mensagem de erro ou string vazia
   */
  validateSenha(senha) {
    if (!senha) {
      return "Senha é obrigatória";
    }

    if (senha.length < 6) {
      return "Senha deve ter no mínimo 6 caracteres";
    }

    if (senha.length > 128) {
      return "Senha muito longa";
    }

    return "";
  }

  /**
   * Exibe ou limpa erro de um campo
   * @param {HTMLInputElement} field - Campo
   * @param {string} errorMessage - Mensagem de erro
   */
  setFieldError(field, errorMessage) {
    const errorElement = document.getElementById(`${field.name}Error`);

    if (!errorElement) return;

    if (errorMessage) {
      this.errors[field.name] = errorMessage;
      errorElement.textContent = errorMessage;
      errorElement.classList.add("show");
      field.setAttribute("aria-invalid", "true");
    } else {
      delete this.errors[field.name];
      errorElement.textContent = "";
      errorElement.classList.remove("show");
      field.setAttribute("aria-invalid", "false");
    }
  }

  /**
   * Valida todo o formulário
   * @returns {boolean} - True se válido
   */
  validateForm() {
    const inputs = this.form.querySelectorAll(".form-input");
    let isValid = true;

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Limpa todos os erros
   */
  clearErrors() {
    this.errors = {};
    const errorElements = this.form.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
      element.textContent = "";
      element.classList.remove("show");
    });

    const inputs = this.form.querySelectorAll(".form-input");
    inputs.forEach((input) => {
      input.setAttribute("aria-invalid", "false");
    });
  }

  /**
   * Obtém dados do formulário
   * @returns {Object} - Dados do formulário
   */
  getFormData() {
    const formData = new FormData(this.form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value.trim();
    }

    return data;
  }
}

// Instancia o validador quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.formValidator = new FormValidator("loginForm");
});
