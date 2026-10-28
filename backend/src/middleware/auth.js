// Middlewares de controle de acesso (sessão de usuário + perfil).
//
// Como usar nas rotas:
//   const { exigirLogin, exigirCliente, exigirAdmin } = require('../middleware/auth');
//   router.get('/algo',  exigirCliente, handler);   // só CLIENTE logado
//   router.get('/outro', exigirAdmin,   handler);   // só ADMIN logado
//   router.get('/geral', exigirLogin,   handler);   // qualquer usuário logado
//
// Dentro do handler, o usuário da sessão fica em: req.session.usuario  -> { id, nome, perfil }

const NOME_COOKIE = 'ecommerce.sid';

// 401 = não identificado (sem sessão). 403 = identificado, mas sem permissão para esta área.
function exigirLogin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ erro: 'Você precisa estar logado para acessar este recurso.' });
  }
  next();
}

function exigirPerfil(perfil) {
  return [
    exigirLogin,
    (req, res, next) => {
      if (req.session.usuario.perfil !== perfil) {
        return res.status(403).json({ erro: 'Seu perfil não tem permissão para acessar este recurso.' });
      }
      next();
    },
  ];
}

const exigirCliente = exigirPerfil('CLIENTE');
const exigirAdmin = exigirPerfil('ADMIN');

// Encerra a sessão de verdade (apaga no servidor e remove o cookie do navegador).
// Use também depois de EXCLUIR a conta de um usuário (cliente ou admin).
function destruirSessao(req, res) {
  return new Promise((resolve, reject) => {
    if (!req.session) return resolve();
    req.session.destroy((err) => {
      if (err) return reject(err);
      res.clearCookie(NOME_COOKIE);
      resolve();
    });
  });
}

module.exports = { NOME_COOKIE, exigirLogin, exigirPerfil, exigirCliente, exigirAdmin, destruirSessao };
