const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { initDatabase, getUserByEmail, createUser } = require("./database");

// Importar rotas
const authRoutes = require("./src/routes/auth");
const chatsRoutes = require("./src/routes/chats");
const gruposRoutes = require("./src/routes/grupos");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

initDatabase();

const JWT_SECRET = process.env.JWT_SECRET || "conexxa-secret";

app.post("/api/usuarios/register", (req, res) => {
  const { nome, email, senha } = req.body || {};

  if (
    !nome ||
    !email ||
    !senha ||
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    return res
      .status(400)
      .json({
        error: "Requisição malformada. nome, email e senha são obrigatórios.",
      });
  }

  const emailClean = email.trim().toLowerCase();
  const senhaHash = bcrypt.hashSync(senha, 10);

  createUser(nome, emailClean, senhaHash, (err, user) => {
    if (err) {
      console.error("Erro ao criar usuário:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }

    return res
      .status(201)
      .json({ id: user.id, nome: user.nome, email: user.email });
  });
});

app.post("/api/usuarios/login", (req, res) => {
  const { email, senha } = req.body || {};

  if (
    !email ||
    !senha ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    return res
      .status(400)
      .json({
        error: "Requisição malformada. email e senha são obrigatórios.",
      });
  }

  const emailClean = email.trim().toLowerCase();

  getUserByEmail(emailClean, (err, user) => {
    if (err) {
      console.error("Erro ao consultar usuário:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaValida = bcrypt.compareSync(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.status(200).json({ token });
  });
});

/**
 * ========================================
 * REGISTRAR ROTAS PROTEGIDAS
 * ========================================
 * 
 * As rotas abaixo incluem middleware de autenticação
 * que valida o token JWT do usuário
 */

// Rotas de autenticação (verificar sessão)
app.use("/api/auth", authRoutes);

// Rotas de chats (mensagens dos grupos)
app.use("/api/chats", chatsRoutes);

// Rotas de grupos (criar, listar, entrar)
app.use("/api/grupos", gruposRoutes);

/**
 * ========================================
 * HANDLER DE ROTAS NÃO ENCONTRADAS
 * ========================================
 */
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
