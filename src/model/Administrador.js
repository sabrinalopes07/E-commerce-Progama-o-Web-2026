const pool = require('./db');
const Usuario = require('./Usuario');

class Administrador {
  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.nome, u.endereco, u.email, u.telefone, u.login
         FROM adm a JOIN usuario u ON u.id = a.id
        WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async ehAdministrador(id) {
    const [rows] = await pool.query('SELECT 1 FROM adm WHERE id = ?', [id]);
    return rows.length > 0;
  }

  static async atualizar(id, dados) {
    return Usuario.atualizar(id, dados);
  }

  static async excluir(id) {
    return Usuario.excluir(id);
  }
}

module.exports = Administrador;
