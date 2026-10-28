const bcrypt = require('bcryptjs');
const { Usuario } = require('../model');
const { destruirSessao } = require('../middleware/auth');

// Hash "de mentira": quando o login não existe, comparamos a senha com ele mesmo assim,
// para que a resposta demore o mesmo tempo e não revele se o usuário existe.
const HASH_FALSO = bcrypt.hashSync('senha-que-nao-existe', 10);

const MENSAGEM_INVALIDO = 'Usuário ou senha inválidos.';

const regenerarSessao = (req) =>
  new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
const salvarSessao = (req) =>
  new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));

// POST /api/auth/login  (público)  -> Checklist 5: login de CLIENTE e ADMIN
// Corpo: { login, senha }. O perfil (ADMIN/CLIENTE) vem do banco, nunca do corpo da requisição.
async function login(req, res) {
  const { login: loginInformado, senha } = req.body || {};

  if (typeof loginInformado !== 'string' || typeof senha !== 'string' || !loginInformado.trim() || !senha) {
    return res.status(400).json({ erro: 'Informe o usuário e a senha.' });
  }

  const usuario = await Usuario.buscarPorLogin(loginInformado.trim());
  const senhaConfere = await bcrypt.compare(senha, usuario ? usuario.senha : HASH_FALSO);

  if (!usuario || !senhaConfere) {
    return res.status(401).json({ erro: MENSAGEM_INVALIDO });
  }

  // Gera um novo id de sessão no login (evita "session fixation")
  await regenerarSessao(req);
  req.session.usuario = { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil };
  await salvarSessao(req);

  // Nunca devolva o objeto do banco inteiro: ele contém o hash da senha.
  return res.json({ id: usuario.id, nome: usuario.nome, perfil: usuario.perfil });
}

// POST /api/auth/logout  -> Checklist 5: logout (pode ser chamado mesmo sem sessão)
async function logout(req, res) {
  await destruirSessao(req, res);
  return res.json({ mensagem: 'Sessão encerrada.' });
}

// GET /api/auth/me  -> diz quem está logado (o React usa ao abrir/recarregar a página)
async function me(req, res) {
  const sessao = req.session && req.session.usuario;
  if (!sessao) return res.status(401).json({ erro: 'Não há sessão ativa.' });

  // Confere no banco: se a conta foi excluída, a sessão deixa de valer.
  const usuario = await Usuario.buscarPorId(sessao.id);
  if (!usuario) {
    await destruirSessao(req, res);
    return res.status(401).json({ erro: 'Não há sessão ativa.' });
  }
  return res.json({ id: usuario.id, nome: usuario.nome, perfil: usuario.perfil });
}

module.exports = { login, logout, me };
