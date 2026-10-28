const { Administrador } = require('../model');

// GET /api/admin/me  (só ADMIN logado)
// Dados do próprio administrador (sem a senha). Também serve para provar o bloqueio de acesso
// cruzado: um CLIENTE logado recebe 403 aqui.
async function meusDados(req, res) {
  const admin = await Administrador.buscarPorId(req.session.usuario.id);
  if (!admin) return res.status(404).json({ erro: 'Cadastro não encontrado.' });
  return res.json(admin);
}

module.exports = { meusDados };
