const pool = require('./db');

class Produto {
  static async listar() {
    const [rows] = await pool.query(
      `SELECT p.*, c.nome AS categoria
         FROM produto p JOIN categoria c ON c.id = p.id_categoria
        ORDER BY p.descricao`
    );
    return rows;
  }

  // Página inicial: só produtos com estoque > 0
  static async listarEmEstoque() {
    const [rows] = await pool.query(
      `SELECT p.id, p.descricao, p.preco, p.foto, p.quantidade, c.nome AS categoria
         FROM produto p JOIN categoria c ON c.id = p.id_categoria
        WHERE p.quantidade > 0
        ORDER BY p.descricao`
    );
    return rows;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query('SELECT * FROM produto WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async criar({ descricao, preco, foto = null, quantidade, idCategoria }) {
    const [res] = await pool.query(
      `INSERT INTO produto (descricao, preco, foto, quantidade, id_categoria)
       VALUES (?, ?, ?, ?, ?)`,
      [descricao, preco, foto, quantidade, idCategoria]
    );
    return res.insertId;
  }

  static async atualizar(id, { descricao, preco, foto, quantidade, idCategoria }) {
    const [res] = await pool.query(
      `UPDATE produto
          SET descricao = ?, preco = ?, foto = ?, quantidade = ?, id_categoria = ?
        WHERE id = ?`,
      [descricao, preco, foto ?? null, quantidade, idCategoria, id]
    );
    return res.affectedRows > 0;
  }

  static async excluir(id) {
    const [res] = await pool.query('DELETE FROM produto WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}

module.exports = Produto;
