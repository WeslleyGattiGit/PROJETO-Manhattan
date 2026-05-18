const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const http = require("http");
const { Server } = require("socket.io");
const { initDatabase, getUserByEmail, createUser, getUserById } = require("./database");

// Importar rotas
const authRoutes = require("./src/routes/auth");
const chatsRoutes = require("./src/routes/chats");
const gruposRoutes = require("./src/routes/grupos");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

initDatabase();

const JWT_SECRET = process.env.JWT_SECRET || "conexxa-secret";

// Criar servidor HTTP compartilhado
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware de autenticação para Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Token de autenticação não fornecido"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.sub;
    socket.userEmail = decoded.email;
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
});

// Lógica de conexão Socket.IO
io.on("connection", (socket) => {
  console.log(`Usuário ${socket.userId} conectado via Socket.IO`);

  // Entrar em uma sala de grupo
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`Usuário ${socket.userId} entrou na sala group_${groupId}`);
  });

  // Sair de uma sala de grupo
  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
    console.log(`Usuário ${socket.userId} saiu da sala group_${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Usuário ${socket.userId} desconectado`);
  });
});

// Exportar io para uso nas rotas
app.set("io", io);

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
    return res.status(400).json({
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
    return res.status(400).json({
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

// Rotas autenticadas
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/grupos", gruposRoutes);
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});