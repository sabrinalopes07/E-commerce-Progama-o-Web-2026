const { pool } = require('./src/model');

async function testar() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM categoria');
    console.log('Conexão OK! Categorias no banco:', rows[0].total);
  } catch (err) {
    console.error('Falha na conexão:', err.message);
  } finally {
    await pool.end();
  }
}

testar();