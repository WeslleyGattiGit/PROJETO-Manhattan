/**
 * Utils
 * Funções utilitárias e helpers
 */

class Utils {
  /**
   * Escapa caracteres HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} - Texto escapado
   */
  static escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Valida se é um email válido
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Remove espaços em branco extras
   * @param {string} text - Texto
   * @returns {string}
   */
  static trim(text) {
    return typeof text === "string" ? text.trim() : "";
  }

  /**
   * Debounce para função
   * @param {Function} func - Função a debounce
   * @param {number} delay - Delay em ms
   * @returns {Function}
   */
  static debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * Throttle para função
   * @param {Function} func - Função a throttle
   * @param {number} limit - Limite em ms
   * @returns {Function}
   */
  static throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Detecta se é mobile
   * @returns {boolean}
   */
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  /**
   * Detecta se está online
   * @returns {boolean}
   */
  static isOnline() {
    return navigator.onLine;
  }

  /**
   * Armazena dados no localStorage
   * @param {string} key - Chave
   * @param {*} value - Valor (será convertido para JSON)
   */
  static setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  }

  /**
   * Recupera dados do localStorage
   * @param {string} key - Chave
   * @returns {*} - Valor ou null
   */
  static getLocalStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Erro ao recuperar do localStorage:", error);
      return null;
    }
  }

  /**
   * Remove dados do localStorage
   * @param {string} key - Chave
   */
  static removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Erro ao remover do localStorage:", error);
    }
  }

  /**
   * Verifica suporte a localStorage
   * @returns {boolean}
   */
  static hasLocalStorage() {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Formata data para padrão brasileiro
   * @param {Date} date - Data
   * @returns {string}
   */
  static formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Converte minutos em horas:minutos
   * @param {number} minutes - Minutos
   * @returns {string}
   */
  static formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${String(mins).padStart(2, "0")}`;
  }

  /**
   * Cria um delay/sleep
   * @param {number} ms - Milissegundos
   * @returns {Promise<void>}
   */
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Copia texto para clipboard
   * @param {string} text - Texto a copiar
   * @returns {Promise<boolean>}
   */
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback para browsers antigos
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const result = document.execCommand("copy");
        document.body.removeChild(textArea);
        return result;
      }
    } catch (error) {
      console.error("Erro ao copiar para clipboard:", error);
      return false;
    }
  }

  /**
   * Obtém parâmetro de query string
   * @param {string} name - Nome do parâmetro
   * @returns {string|null}
   */
  static getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  /**
   * Obtém todos os parâmetros de query string
   * @returns {Object}
   */
  static getAllQueryParams() {
    const params = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Faz scroll para um elemento
   * @param {HTMLElement|string} element - Elemento ou seletor
   * @param {Object} options - Opções de scroll
   */
  static scrollTo(element, options = { behavior: "smooth", block: "start" }) {
    const el =
      typeof element === "string" ? document.querySelector(element) : element;

    if (el) {
      el.scrollIntoView(options);
    }
  }

  /**
   * Verifica se um elemento está visível no viewport
   * @param {HTMLElement} element - Elemento
   * @returns {boolean}
   */
  static isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Adiciona classe com delay
   * @param {HTMLElement} element - Elemento
   * @param {string} className - Classe a adicionar
   * @param {number} delay - Delay em ms
   */
  static addClassAfterDelay(element, className, delay = 0) {
    setTimeout(() => {
      element.classList.add(className);
    }, delay);
  }

  /**
   * Remove classe com delay
   * @param {HTMLElement} element - Elemento
   * @param {string} className - Classe a remover
   * @param {number} delay - Delay em ms
   */
  static removeClassAfterDelay(element, className, delay = 0) {
    setTimeout(() => {
      element.classList.remove(className);
    }, delay);
  }

  /**
   * Loga apenas em desenvolvimento
   * @param {...*} args - Argumentos a logar
   */
  static devLog(...args) {
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      console.log("[DEV]", ...args);
    }
  }

  /**
   * Valida força de senha
   * @param {string} password - Senha
   * @returns {Object} - Objeto com score e feedback
   */
  static validatePasswordStrength(password) {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) score++;
    else feedback.push("Mínimo 8 caracteres");

    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    else feedback.push("Adicione maiúsculas");
    if (/[0-9]/.test(password)) score++;
    else feedback.push("Adicione números");
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push("Adicione caracteres especiais");

    return {
      score,
      strength:
        ["Muito Fraca", "Fraca", "Média", "Forte", "Muito Forte"][score] ||
        "Desconhecida",
      feedback,
    };
  }
}

// Torna Utils disponível globalmente
window.Utils = Utils;
