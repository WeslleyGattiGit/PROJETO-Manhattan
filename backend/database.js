const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../database/conexxa.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erro ao abrir banco SQLite:', err.message);
  }
});

const initDatabase = () => {
  const ddl = [
    'CREATE TABLE IF NOT EXISTS usuarios (',
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
    '  nome TEXT,',
    '  email TEXT UNIQUE NOT NULL,',
    '  senha TEXT NOT NULL,',
    '  criado_em TEXT DEFAULT CURRENT_TIMESTAMP',
    ');'
  ].join('\n');

  db.run(ddl, (err) => {
    if (err) {
      console.error('Erro ao criar tabela usuarios:', err.message);
    }
  });
};

const getUserByEmail = (email, callback) => {
  if (!email) {
    return callback(null, null);
  }

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
};

module.exports = {
  initDatabase,
  getUserByEmail,
  db,
};

const createUser = (nome, email, senhaHash, callback) => {
  if (!nome || !email || !senhaHash) {
    return callback(new Error('Nome, email e senha são obrigatórios'));
  }

  db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, senhaHash],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { id: this.lastID, nome, email });
    }
  );
};


module.exports = {
  initDatabase,
  getUserByEmail,
  createUser,
  db,
};
