const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Caminho do arquivo de banco de dados
const dbPath = path.resolve(__dirname, '../database/conexxa.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erro ao abrir banco SQLite:', err.message);
  }
});

/**
 * INICIALIZAR BANCO DE DADOS
 * 
 * Cria as tabelas necessárias para o sistema se não existirem:
 * - usuarios: dados de login e perfil
 * - grupos: grupos de estudo universitário
 * - mensagens: mensagens dos chats
 * - usuarios_grupos: relacionamento entre usuários e grupos
 */
const initDatabase = () => {
  // Tabela de usuários
  const ddlUsuarios = [
    'CREATE TABLE IF NOT EXISTS usuarios (',
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
    '  nome TEXT NOT NULL,',
    '  email TEXT UNIQUE NOT NULL,',
    '  senha TEXT NOT NULL,',
    '  foto_url TEXT,',
    '  criado_em TEXT DEFAULT CURRENT_TIMESTAMP',
    ');'
  ].join('\n');

  // Tabela de grupos de estudo
  const ddlGrupos = [
    'CREATE TABLE IF NOT EXISTS grupos (',
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
    '  nome TEXT NOT NULL,',
    '  descricao TEXT,',
    '  criador_id INTEGER NOT NULL,',
    '  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,',
    '  FOREIGN KEY (criador_id) REFERENCES usuarios(id)',
    ');'
  ].join('\n');

  // Tabela de mensagens/chats
  const ddlMensagens = [
    'CREATE TABLE IF NOT EXISTS mensagens (',
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
    '  grupo_id INTEGER NOT NULL,',
    '  usuario_id INTEGER NOT NULL,',
    '  conteudo TEXT NOT NULL,',
    '  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,',
    '  FOREIGN KEY (grupo_id) REFERENCES grupos(id),',
    '  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)',
    ');'
  ].join('\n');

  // Tabela de participação (usuário está em qual grupo)
  const ddlUsuariosGrupos = [
    'CREATE TABLE IF NOT EXISTS usuarios_grupos (',
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
    '  usuario_id INTEGER NOT NULL,',
    '  grupo_id INTEGER NOT NULL,',
    '  aderido_em TEXT DEFAULT CURRENT_TIMESTAMP,',
    '  UNIQUE(usuario_id, grupo_id),',
    '  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),',
    '  FOREIGN KEY (grupo_id) REFERENCES grupos(id)',
    ');'
  ].join('\n');

  // Executar criações de tabelas
  db.run(ddlUsuarios, (err) => {
    if (err) {
      console.error('Erro ao criar tabela usuarios:', err.message);
    } else {
      console.log('✓ Tabela usuarios inicializada');
    }
  });

  db.run(ddlGrupos, (err) => {
    if (err) {
      console.error('Erro ao criar tabela grupos:', err.message);
    } else {
      console.log('✓ Tabela grupos inicializada');
    }
  });

  db.run(ddlMensagens, (err) => {
    if (err) {
      console.error('Erro ao criar tabela mensagens:', err.message);
    } else {
      console.log('✓ Tabela mensagens inicializada');
    }
  });

  db.run(ddlUsuariosGrupos, (err) => {
    if (err) {
      console.error('Erro ao criar tabela usuarios_grupos:', err.message);
    } else {
      console.log('✓ Tabela usuarios_grupos inicializada');
    }
  });
};

/**
 * OBTER USUÁRIO POR EMAIL
 * @param {string} email - Email do usuário
 * @param {function} callback - (error, user)
 */
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

/**
 * OBTER USUÁRIO POR ID
 * @param {number} userId - ID do usuário
 * @param {function} callback - (error, user)
 */
const getUserById = (userId, callback) => {
  if (!userId) {
    return callback(null, null);
  }

  // Usar COALESCE para retornar NULL se foto_url não existir
  db.get('SELECT id, nome, email, COALESCE(foto_url, NULL) as foto_url, criado_em FROM usuarios WHERE id = ?', [userId], (err, row) => {
    if (err) {
      // Se coluna não existe, tenta sem ela (retrocompatibilidade)
      if (err.code === 'SQLITE_ERROR' && err.message.includes('foto_url')) {
        db.get('SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?', [userId], (err2, row2) => {
          if (err2) {
            return callback(err2);
          }
          // Adicionar foto_url como null
          if (row2) {
            row2.foto_url = null;
          }
          callback(null, row2);
        });
      } else {
        return callback(err);
      }
    } else {
      callback(null, row);
    }
  });
};

/**
 * CRIAR NOVO USUÁRIO
 * @param {string} nome - Nome completo do usuário
 * @param {string} email - Email do usuário
 * @param {string} senhaHash - Senha já criptografada (bcryptjs)
 * @param {function} callback - (error, user)
 */
const createUser = (nome, email, senhaHash, callback) => {
  if (!nome || !email || !senhaHash) {
    return callback(new Error('Nome, email e senha são obrigatórios'));
  }

  db.run(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, senhaHash],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { id: this.lastID, nome, email });
    }
  );
};

/**
 * OBTER TODOS OS GRUPOS DO USUÁRIO
 * Retorna grupos em que o usuário está participando
 * @param {number} userId - ID do usuário
 * @param {function} callback - (error, grupos)
 */
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

/**
 * CRIAR NOVO GRUPO
 * @param {string} nome - Nome do grupo
 * @param {string} descricao - Descrição do grupo
 * @param {number} criadoId - ID do criador
 * @param {function} callback - (error, grupo)
 */
const createGroup = (nome, descricao, criadoId, callback) => {
  if (!nome || !criadoId) {
    return callback(new Error('Nome e criador são obrigatórios'));
  }

  db.run(
    'INSERT INTO grupos (nome, descricao, criador_id) VALUES (?, ?, ?)',
    [nome, descricao || '', criadoId],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { id: this.lastID, nome, descricao, criador_id: criadoId });
    }
  );
};

/**
 * ADICIONAR USUÁRIO A UM GRUPO
 * @param {number} userId - ID do usuário
 * @param {number} groupId - ID do grupo
 * @param {function} callback - (error)
 */
const addUserToGroup = (userId, groupId, callback) => {
  if (!userId || !groupId) {
    return callback(new Error('userId e groupId são obrigatórios'));
  }

  db.run(
    'INSERT OR IGNORE INTO usuarios_grupos (usuario_id, grupo_id) VALUES (?, ?)',
    [userId, groupId],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null);
    }
  );
};

/**
 * OBTER MENSAGENS DE UM GRUPO
 * Retorna as mensagens ordenadas por data, com dados do usuário
 * @param {number} groupId - ID do grupo
 * @param {number} limit - Número máximo de mensagens (padrão: 50)
 * @param {function} callback - (error, mensagens)
 */
const getGroupMessages = (groupId, limit = 50, callback) => {
  const query = `
    SELECT 
      m.id,
      m.grupo_id,
      m.usuario_id,
      m.conteudo,
      m.criado_em,
      u.nome as usuario_nome,
      u.email as usuario_email,
      COALESCE(u.foto_url, NULL) as usuario_foto
    FROM mensagens m
    INNER JOIN usuarios u ON m.usuario_id = u.id
    WHERE m.grupo_id = ?
    ORDER BY m.criado_em DESC
    LIMIT ?
  `;

  db.all(query, [groupId, limit], (err, rows) => {
    if (err) {
      // Se coluna foto_url não existe, tenta sem ela
      if (err.code === 'SQLITE_ERROR' && err.message.includes('foto_url')) {
        const queryFallback = `
          SELECT 
            m.id,
            m.grupo_id,
            m.usuario_id,
            m.conteudo,
            m.criado_em,
            u.nome as usuario_nome,
            u.email as usuario_email,
            NULL as usuario_foto
          FROM mensagens m
          INNER JOIN usuarios u ON m.usuario_id = u.id
          WHERE m.grupo_id = ?
          ORDER BY m.criado_em DESC
          LIMIT ?
        `;
        
        db.all(queryFallback, [groupId, limit], (err2, rows2) => {
          if (err2) {
            return callback(err2);
          }
          callback(null, rows2 ? rows2.reverse() : []);
        });
      } else {
        return callback(err);
      }
    } else {
      callback(null, rows ? rows.reverse() : []);
    }
  });
};

/**
 * SALVAR MENSAGEM NO CHAT
 * @param {number} groupId - ID do grupo
 * @param {number} userId - ID do usuário que enviou
 * @param {string} conteudo - Conteúdo da mensagem
 * @param {function} callback - (error, mensagem)
 */
const saveMessage = (groupId, userId, conteudo, callback) => {
  if (!groupId || !userId || !conteudo) {
    return callback(new Error('groupId, userId e conteudo são obrigatórios'));
  }

  db.run(
    'INSERT INTO mensagens (grupo_id, usuario_id, conteudo) VALUES (?, ?, ?)',
    [groupId, userId, conteudo],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { id: this.lastID, grupo_id: groupId, usuario_id: userId, conteudo });
    }
  );
};

// Exportar funções para uso em outras partes da aplicação
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
