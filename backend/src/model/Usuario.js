const pool = require('./db');

// Operações comuns a qualquer usuário (cliente ou administrador)
class Usuario {
  // Retorna o usuário + perfil ('ADMIN' | 'CLIENTE'). Usado no login.
  // Inclui o hash da senha: NÃO envie esse objeto inteiro ao front-end.
  static async buscarPorLogin(login) {
    const [rows] = await pool.query(
      `SELECT u.*,
              CASE WHEN a.id IS NOT NULL THEN 'ADMIN' ELSE 'CLIENTE' END AS perfil
         FROM usuario u
         LEFT JOIN adm a ON a.id = u.id
        WHERE u.login = ?`,
      [login]
    );
    return rows[0] || null;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.nome, u.endereco, u.email, u.telefone, u.login,
              CASE WHEN a.id IS NOT NULL THEN 'ADMIN' ELSE 'CLIENTE' END AS perfil
         FROM usuario u
         LEFT JOIN adm a ON a.id = u.id
        WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async loginExiste(login) {
    const [rows] = await pool.query('SELECT 1 FROM usuario WHERE login = ?', [login]);
    return rows.length > 0;
  }

  // Atualiza só os campos enviados. `senhaHash` é opcional.
  // `conn` permite participar de uma transação já aberta.
  static async atualizar(id, { nome, endereco, email, telefone, login, senhaHash }, conn = pool) {
    const campos = { nome, endereco, email, telefone, login, senha: senhaHash };
    const sets = [];
    const valores = [];
    for (const [coluna, valor] of Object.entries(campos)) {
      if (valor !== undefined) {
        sets.push(`${coluna} = ?`);
        valores.push(valor);
      }
    }
    if (sets.length === 0) return false;
    const [res] = await conn.query(`UPDATE usuario SET ${sets.join(', ')} WHERE id = ?`, [...valores, id]);
    return res.affectedRows > 0;
  }

  // Remove o usuário; adm/cliente (e vendas do cliente) saem por ON DELETE CASCADE
  static async excluir(id) {
    const [res] = await pool.query('DELETE FROM usuario WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}

module.exports = Usuario;
