const pool = require('./db');
const Usuario = require('./Usuario');

class Cliente {
  // Cria usuario + cliente numa transação. `senhaHash` deve vir já com bcrypt.
  // Lança erro com code 'ER_DUP_ENTRY' se o login já existir.
  static async criar({ nome, endereco, email, telefone = null, login, senhaHash, formaPagamento = null }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [res] = await conn.query(
        `INSERT INTO usuario (nome, endereco, email, telefone, login, senha)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, endereco, email, telefone, login, senhaHash]
      );
      await conn.query('INSERT INTO cliente (id, forma_pagamento) VALUES (?, ?)', [res.insertId, formaPagamento]);
      await conn.commit();
      return res.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.nome, u.endereco, u.email, u.telefone, u.login, c.forma_pagamento
         FROM cliente c JOIN usuario u ON u.id = c.id
        WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Alteração de dados pessoais (TF02 - item 6.1)
  static async atualizar(id, { formaPagamento, ...dadosUsuario }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await Usuario.atualizar(id, dadosUsuario, conn);
      if (formaPagamento !== undefined) {
        await conn.query('UPDATE cliente SET forma_pagamento = ? WHERE id = ?', [formaPagamento, id]);
      }
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // Exclusão do cadastro (TF02 - item 6.1)
  static async excluir(id) {
    return Usuario.excluir(id);
  }
}

module.exports = Cliente;
