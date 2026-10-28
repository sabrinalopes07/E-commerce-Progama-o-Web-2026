require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { NOME_COOKIE } = require('./middleware/auth');
const routes = require('./routes');

const emProducao = process.env.NODE_ENV === 'production';

if (emProducao && !process.env.SESSION_SECRET) {
  throw new Error('Defina SESSION_SECRET no .env antes de rodar em produção.');
}
if (!process.env.SESSION_SECRET) {
  console.warn('[aviso] SESSION_SECRET não definido: usando um segredo de desenvolvimento. Defina no .env.');
}

const app = express();

// O React (porta 3000) conversa com esta API; "credentials" permite enviar o cookie de sessão.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));

// Sessão de usuário (cookie assinado + dados guardados na memória do servidor).
// Observação: a memória é apagada quando o servidor reinicia (todos precisam logar de novo).
app.use(
  session({
    name: NOME_COOKIE,
    secret: process.env.SESSION_SECRET || 'segredo-apenas-para-desenvolvimento',
    resave: false,
    saveUninitialized: false, // só cria cookie quando alguém loga
    cookie: {
      httpOnly: true, // JavaScript do navegador não consegue ler o cookie
      sameSite: 'lax',
      secure: emProducao, // em produção exige HTTPS
      maxAge: 1000 * 60 * 60 * 2, // 2 horas
    },
  })
);

app.use('/api', routes);

// Rota /api inexistente
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// Tratador de erros (Express 5 encaminha erros de funções async para cá)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Requisição grande demais.' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
