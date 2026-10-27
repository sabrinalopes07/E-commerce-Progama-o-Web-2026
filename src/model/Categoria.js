const pool = require('./db');

class Categoria {
  static async listar() {
    const [rows] = await pool.query('SELECT id, nome FROM categoria ORDER BY nome');
    return rows;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query('SELECT id, nome FROM categoria WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async criar({ nome }) {
    const [res] = await pool.query('INSERT INTO categoria (nome) VALUES (?)', [nome]);
    return res.insertId;
  }

  static async atualizar(id, { nome }) {
    const [res] = await pool.query('UPDATE categoria SET nome = ? WHERE id = ?', [nome, id]);
    return res.affectedRows > 0;
  }

  // Falha (ER_ROW_IS_REFERENCED_2) se houver produtos nessa categoria
  static async excluir(id) {
    const [res] = await pool.query('DELETE FROM categoria WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}

module.exports = Categoria;
