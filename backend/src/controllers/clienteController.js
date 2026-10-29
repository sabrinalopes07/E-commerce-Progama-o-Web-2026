const bcrypt = require('bcryptjs');
const { Cliente, Usuario } = require('../model');
const { validarCadastroCliente, validarAtualizacaoCliente } = require('../utils/validacao');
const { destruirSessao } = require('../middleware/auth');

// POST /api/clientes  (público)  -> Checklist 4: inserção de um novo cliente
// Sempre cria um usuário com perfil CLIENTE. Administradores só são inseridos direto no banco
// (veja scripts/criar-admin.js), então qualquer campo "perfil" enviado no corpo é ignorado.
async function cadastrar(req, res) {
  const { erros, dados } = validarCadastroCliente(req.body);
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erro: 'Dados inválidos. Corrija os campos indicados.', erros });
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  try {
    const id = await Cliente.criar({
      nome: dados.nome,
      endereco: dados.endereco,
      email: dados.email,
      telefone: dados.telefone,
      login: dados.login,
      senhaHash,
      formaPagamento: dados.formaPagamento,
    });
    return res.status(201).json({ id, mensagem: 'Cadastro realizado com sucesso!' });
  } catch (err) {
    // A única chave única da tabela usuario é o login (uk_usuario_login)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        erro: 'Este usuário já está em uso. Escolha outro.',
        erros: { login: 'Este usuário já está em uso.' },
      });
    }
    throw err; // vai para o tratador de erros (500)
  }
}

// GET /api/clientes/me  (só CLIENTE logado)
// Devolve os dados do próprio cliente (sem a senha). Usado para preencher o formulário de edição.
async function meusDados(req, res) {
  const cliente = await Cliente.buscarPorId(req.session.usuario.id);
  if (!cliente) return res.status(404).json({ erro: 'Cadastro não encontrado.' });
  return res.json(cliente);
}

// PUT /api/clientes/me  (só CLIENTE logado)  -> Checklist 6.1: alteração dos dados pessoais
// O id vem SEMPRE da sessão (nunca do corpo ou da URL): o cliente só altera o próprio cadastro.
async function atualizar(req, res) {
  const { erros, dados } = validarAtualizacaoCliente(req.body);
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erro: 'Dados inválidos. Corrija os campos indicados.', erros });
  }
  if (Object.keys(dados).length === 0) {
    return res.status(400).json({ erro: 'Nenhum dado para atualizar.' });
  }

  const { senha, ...campos } = dados;
  if (senha) campos.senhaHash = await bcrypt.hash(senha, 10);

  const id = req.session.usuario.id;
  await Cliente.atualizar(id, campos);

  const atualizado = await Cliente.buscarPorId(id);
  if (!atualizado) return res.status(404).json({ erro: 'Cadastro não encontrado.' });

  req.session.usuario.nome = atualizado.nome; // mantém o nome da sessão em dia
  return res.json(atualizado);
}

// DELETE /api/clientes/me  (só CLIENTE logado)  -> Checklist 6.1: exclusão do cadastro
// Corpo: { senha }. Pedimos a senha para confirmar, para que ninguém apague a conta
// só por ter usado um computador onde o cliente esqueceu a sessão aberta.
// Apaga também as compras do cliente (ON DELETE CASCADE do banco) e encerra a sessão.
async function excluir(req, res) {
  const senha = req.body && req.body.senha;
  if (typeof senha !== 'string' || !senha) {
    return res.status(400).json({ erro: 'Informe sua senha para confirmar a exclusão.' });
  }

  const id = req.session.usuario.id;
  const cliente = await Cliente.buscarPorId(id);
  if (!cliente) {
    await destruirSessao(req, res);
    return res.status(404).json({ erro: 'Cadastro não encontrado.' });
  }

  const usuario = await Usuario.buscarPorLogin(cliente.login); // traz o hash da senha
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(403).json({ erro: 'Senha incorreta.' });
  }

  await Cliente.excluir(id);
  await destruirSessao(req, res);
  return res.json({ mensagem: 'Cadastro excluído.' });
}

module.exports = { cadastrar, meusDados, atualizar, excluir };
