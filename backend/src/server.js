// Ponto de entrada do back-end. Rode com: npm start
const app = require('./app');
const { pool } = require('./model');

const PORTA = process.env.PORT || 3001;

app.listen(PORTA, async () => {
  console.log(`API rodando em http://localhost:${PORTA}`);
  try {
    await pool.query('SELECT 1');
    console.log('Conexão com o MySQL OK.');
  } catch (err) {
    console.error('Não foi possível conectar ao MySQL. Confira o .env:', err.message);
  }
});
