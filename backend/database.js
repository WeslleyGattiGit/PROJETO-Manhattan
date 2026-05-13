const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Caminho do arquivo de banco de dados
const dbPath = path.resolve(__dirname, "../database/conexxa.db");
const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Erro ao abrir banco SQLite:", err.message);
    }
  },
);

/**
 * Inicializa banco de dados - cria tabelas se não existirem
 */
const initDatabase = () => {
  const ddlUsuarios = [
    "CREATE TABLE IF NOT EXISTS usuarios (",
    "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
    "  nome TEXT NOT NULL,",
    "  email TEXT UNIQUE NOT NULL,",
    "  senha TEXT NOT NULL,",
    "  foto_url TEXT,",
    "  criado_em TEXT DEFAULT CURRENT_TIMESTAMP",
    ");",
  ].join("\n");

  const ddlGrupos = [
    "CREATE TABLE IF NOT EXISTS grupos (",
    "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
    "  nome TEXT NOT NULL,",
    "  descricao TEXT,",
    "  criador_id INTEGER NOT NULL,",
    "  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,",
    "  FOREIGN KEY (criador_id) REFERENCES usuarios(id)",
    ");",
  ].join("\n");

  const ddlMensagens = [
    "CREATE TABLE IF NOT EXISTS mensagens (",
    "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
    "  grupo_id INTEGER NOT NULL,",
    "  usuario_id INTEGER NOT NULL,",
    "  conteudo TEXT NOT NULL,",
    "  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,",
    "  FOREIGN KEY (grupo_id) REFERENCES grupos(id),",
    "  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)",
    ");",
  ].join("\n");

  const ddlUsuariosGrupos = [
    "CREATE TABLE IF NOT EXISTS usuarios_grupos (",
    "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
    "  usuario_id INTEGER NOT NULL,",
    "  grupo_id INTEGER NOT NULL,",
    "  aderido_em TEXT DEFAULT CURRENT_TIMESTAMP,",
    "  UNIQUE(usuario_id, grupo_id),",
    "  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),",
    "  FOREIGN KEY (grupo_id) REFERENCES grupos(id)",
    ");",
  ].join("\n");

  db.run(ddlUsuarios, (err) => {
    if (err) {
      console.error("Erro ao criar tabela usuarios:", err.message);
    } else {
      console.log("✓ Tabela usuarios inicializada");
    }
  });

  db.run(ddlGrupos, (err) => {
    if (err) {
      console.error("Erro ao criar tabela grupos:", err.message);
    } else {
      console.log("✓ Tabela grupos inicializada");
    }
  });

  db.run(ddlMensagens, (err) => {
    if (err) {
      console.error("Erro ao criar tabela mensagens:", err.message);
    } else {
      console.log("✓ Tabela mensagens inicializada");
    }
  });

  db.run(ddlUsuariosGrupos, (err) => {
    if (err) {
      console.error("Erro ao criar tabela usuarios_grupos:", err.message);
    } else {
      console.log("✓ Tabela usuarios_grupos inicializada");
    }
  });

  // Migração: adicionar coluna foto_url se não existir
  db.all("PRAGMA table_info(usuarios)", [], (err, columns) => {
    if (!err && columns && !columns.find((c) => c.name === "foto_url")) {
      db.run("ALTER TABLE usuarios ADD COLUMN foto_url TEXT", (err) => {
        if (!err) console.log("✓ Coluna foto_url adicionada");
      });
    }
  });
};

const getUserByEmail = (email, callback) => {
  if (!email) {
    return callback(null, null);
  }

  db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
};

const getUserById = (userId, callback) => {
  if (!userId) {
    return callback(null, null);
  }

  const query = "SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?";
  db.get(query, [userId], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
};

const createUser = (nome, email, senhaHash, callback) => {
  if (!nome || !email || !senhaHash) {
    return callback(new Error("Nome, email e senha são obrigatórios"));
  }

  db.run(
    "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, senhaHash],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, { id: this.lastID, nome, email });
    },
  );
};

const getUserGroups = (userId, callback) => {
  const query = `
    SELECT g.id, g.nome, g.descricao, g.criador_id, g.criado_em
    FROM grupos g
    INNER JOIN usuarios_grupos ug ON g.id = ug.grupo_id
    WHERE ug.usuario_id = ?
    ORDER BY g.criado_em DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows || []);
  });
};

const createGroup = (nome, descricao, criadoId, callback) => {
  if (!nome || !criadoId) {
    return callback(new Error("Nome e criador são obrigatórios"));
  }

  db.run(
    "INSERT INTO grupos (nome, descricao, criador_id) VALUES (?, ?, ?)",
    [nome, descricao || "", criadoId],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, {
        id: this.lastID,
        nome,
        descricao,
        criador_id: criadoId,
      });
    },
  );
};

const addUserToGroup = (userId, groupId, callback) => {
  if (!userId || !groupId) {
    return callback(new Error("userId e groupId são obrigatórios"));
  }

  db.run(
    "INSERT OR IGNORE INTO usuarios_grupos (usuario_id, grupo_id) VALUES (?, ?)",
    [userId, groupId],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null);
    },
  );
};

const getGroupMessages = (groupId, limit = 50, callback) => {
  const query = `
    SELECT 
      m.id, m.grupo_id, m.usuario_id, m.conteudo, m.criado_em,
      u.nome as usuario_nome, u.email as usuario_email
    FROM mensagens m
    INNER JOIN usuarios u ON m.usuario_id = u.id
    WHERE m.grupo_id = ?
    ORDER BY m.criado_em DESC
    LIMIT ?
  `;

  db.all(query, [groupId, limit], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows ? rows.reverse() : []);
  });
};

const saveMessage = (groupId, userId, conteudo, callback) => {
  if (!groupId || !userId || !conteudo) {
    return callback(new Error("groupId, userId e conteudo são obrigatórios"));
  }

  db.run(
    "INSERT INTO mensagens (grupo_id, usuario_id, conteudo) VALUES (?, ?, ?)",
    [groupId, userId, conteudo],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, {
        id: this.lastID,
        grupo_id: groupId,
        usuario_id: userId,
        conteudo,
      });
    },
  );
};

module.exports = {
  initDatabase,
  getUserByEmail,
  getUserById,
  createUser,
  getUserGroups,
  createGroup,
  addUserToGroup,
  getGroupMessages,
  saveMessage,
  db,
};
