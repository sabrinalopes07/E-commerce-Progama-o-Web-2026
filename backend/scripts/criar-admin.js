// Cria um ADMINISTRADOR direto no banco (o enunciado não exige tela para isso).
//
// Uso:   node scripts/criar-admin.js <login> <senha> ["Nome do admin"]
// Ex.:   node scripts/criar-admin.js admin admin123 "Administrador"
const bcrypt = require('bcryptjs');
const { pool } = require('../src/model');

async function main() {
  const [login, senha, nome = 'Administrador'] = process.argv.slice(2);
  if (!login || !senha) {
    console.log('Uso: node scripts/criar-admin.js <login> <senha> ["Nome do admin"]');
    process.exitCode = 1;
    return;
  }
  if (senha.length < 6) {
    console.log('A senha deve ter pelo menos 6 caracteres.');
    process.exitCode = 1;
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query(
      `INSERT INTO usuario (nome, endereco, email, login, senha) VALUES (?, ?, ?, ?, ?)`,
      [nome, 'Sede da loja', `${login}@loja.com`, login, senhaHash]
    );
    await conn.query('INSERT INTO adm (id) VALUES (?)', [res.insertId]);
    await conn.commit();
    console.log(`Administrador criado! id=${res.insertId} login=${login}`);
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') console.log(`O login "${login}" já existe.`);
    else throw err;
  } finally {
    conn.release();
  }
}

main()
  .catch((err) => {
    console.error('Falhou:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
