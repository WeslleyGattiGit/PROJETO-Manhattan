/**
 * Form Validator - Signup
 * Responsável pela validação em tempo real dos campos do formulário de cadastro
 */

class SignupFormValidator {
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
      case "nome":
        errorMessage = this.validateNome(fieldValue);
        break;
      case "email":
        errorMessage = this.validateEmail(fieldValue);
        break;
      case "senha":
        errorMessage = this.validateSenha(fieldValue);
        // Se confirmaSenha já foi preenchida, revalida
        this.revalidateConfirmaSenha();
        break;
      case "confirmarSenha":
        errorMessage = this.validateConfirmaSenha(fieldValue);
        break;
    }

    this.setFieldError(field, errorMessage);
    return !errorMessage;
  }

  /**
   * Valida nome
   * @param {string} nome - Nome a validar
   * @returns {string} - Mensagem de erro ou string vazia
   */
  validateNome(nome) {
    if (!nome) {
      return "Nome é obrigatório";
    }

    if (nome.length < 3) {
      return "Nome deve ter no mínimo 3 caracteres";
    }

    if (nome.length > 100) {
      return "Nome muito longo";
    }

    // Verifica se contém apenas letras e espaços
    const nomeRegex = /^[a-záéíóúâêôãõç\s]+$/i;
    if (!nomeRegex.test(nome)) {
      return "Nome deve conter apenas letras";
    }

    return "";
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
   * Valida confirmação de senha
   * @param {string} confirmarSenha - Confirmação de senha a validar
   * @returns {string} - Mensagem de erro ou string vazia
   */
  validateConfirmaSenha(confirmarSenha) {
    const senhaInput = document.getElementById("senha");
    const senha = senhaInput ? senhaInput.value.trim() : "";

    if (!confirmarSenha) {
      return "Confirmação de senha é obrigatória";
    }

    if (confirmarSenha !== senha) {
      return "As senhas não correspondem";
    }

    return "";
  }

  /**
   * Revalida campo de confirmação de senha
   */
  revalidateConfirmaSenha() {
    const confirmarSenhaInput = document.getElementById("confirmarSenha");
    if (confirmarSenhaInput && confirmarSenhaInput.value) {
      this.validateField(confirmarSenhaInput);
    }
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

    // Remove a confirmação de senha do objeto (não precisa enviar)
    delete data.confirmarSenha;

    return data;
  }
}

// Instancia o validador quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.formValidator = new SignupFormValidator("signupForm");
});
