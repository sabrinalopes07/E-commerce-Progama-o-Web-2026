const pool = require('./db');

class Venda {
  // itens: [{ idProduto, quantidade }]
  // Valida estoque, grava venda + itens e baixa o estoque, tudo em uma transação.
  static async criar(idCliente, itens) {
    if (!itens || itens.length === 0) throw new Error('Carrinho vazio');
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [v] = await conn.query('INSERT INTO venda (id_cliente) VALUES (?)', [idCliente]);
      const idVenda = v.insertId;

      for (const { idProduto, quantidade } of itens) {
        // FOR UPDATE trava a linha para evitar duas compras simultâneas do último item
        const [rows] = await conn.query(
          'SELECT preco, quantidade FROM produto WHERE id = ? FOR UPDATE', [idProduto]
        );
        const produto = rows[0];
        if (!produto) throw new Error(`Produto ${idProduto} não existe`);
        if (produto.quantidade < quantidade) {
          throw new Error(`Estoque insuficiente para o produto ${idProduto}`);
        }
        await conn.query(
          'INSERT INTO venda_produto (id_venda, id_produto, preco, quantidade) VALUES (?, ?, ?, ?)',
          [idVenda, idProduto, produto.preco, quantidade]
        );
        await conn.query('UPDATE produto SET quantidade = quantidade - ? WHERE id = ?', [quantidade, idProduto]);
      }
      await conn.commit();
      return idVenda;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async listarPorCliente(idCliente) {
    const [rows] = await pool.query(
      `SELECT v.id, v.data_hora, SUM(vp.preco * vp.quantidade) AS total
         FROM venda v JOIN venda_produto vp ON vp.id_venda = v.id
        WHERE v.id_cliente = ?
        GROUP BY v.id, v.data_hora
        ORDER BY v.data_hora DESC`,
      [idCliente]
    );
    return rows;
  }

  static async itens(idVenda) {
    const [rows] = await pool.query(
      `SELECT vp.id_produto, p.descricao, vp.preco, vp.quantidade
         FROM venda_produto vp JOIN produto p ON p.id = vp.id_produto
        WHERE vp.id_venda = ?`,
      [idVenda]
    );
    return rows;
  }

  static async excluir(id) {
    const [res] = await pool.query('DELETE FROM venda WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}

module.exports = Venda;
