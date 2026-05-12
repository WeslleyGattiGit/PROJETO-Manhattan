/**
 * Authentication Service
 * Responsável pela comunicação com o backend para autenticação
 */

class AuthService {
  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
    this.timeout = 10000; // 10 segundos
  }

  /**
   * Faz login com email e senha
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} - Resposta do servidor
   */
  async login(email, senha) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/usuarios/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, senha }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new AuthError(
          data.error || "Erro ao fazer login",
          response.status,
        );
      }

      // Armazena o token de forma segura
      if (data.token) {
        this.saveToken(data.token);
      }

      return data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Erro de conexão. Verifique sua internet.", 0);
    }
  }

  /**
   * Fetch com timeout
   * @param {string} url - URL
   * @param {Object} options - Opções do fetch
   * @returns {Promise<Response>}
   */
  fetchWithTimeout(url, options = {}) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), this.timeout),
      ),
    ]);
  }

  /**
   * Salva o token no localStorage
   * @param {string} token - Token JWT
   */
  saveToken(token) {
    if (!token || typeof token !== "string") {
      console.error("Token inválido");
      return;
    }
    localStorage.setItem("token", token);
  }

  /**
   * Recupera o token do localStorage
   * @returns {string|null} - Token ou null
   */
  getToken() {
    return localStorage.getItem("token");
  }

  /**
   * Remove o token do localStorage (logout)
   */
  removeToken() {
    localStorage.removeItem("token");
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  /**
   * Valida se o token é um JWT válido
   * @param {string} token - Token JWT
   * @returns {boolean}
   */
  isTokenValid(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return false;
      }

      // Decodifica o payload (parte do meio)
      const payload = JSON.parse(atob(parts[1]));

      // Verifica se o token expirou
      if (payload.exp) {
        const expirationTime = payload.exp * 1000; // Converte para ms
        return Date.now() < expirationTime;
      }

      return true;
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return false;
    }
  }

  /**
   * Decodifica o JWT (sem validar assinatura)
   * @param {string} token - Token JWT
   * @returns {Object|null}
   */
  decodeToken(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }
      return JSON.parse(atob(parts[1]));
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  }

  /**
   * Obtém informações do usuário do token
   * @returns {Object|null}
   */
  getUserInfo() {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }
}

/**
 * Classe de erro customizada para autenticação
 */
class AuthError extends Error {
  constructor(message, statusCode = 0) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

// Instancia o serviço globalmente
window.authService = new AuthService("http://localhost:3000");
