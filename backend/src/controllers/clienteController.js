const bcrypt = require('bcryptjs');
const { Cliente } = require('../model');
const { validarCadastroCliente } = require('../utils/validacao');

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
// Devolve os dados do próprio cliente (sem a senha). Útil para preencher o formulário de edição.
async function meusDados(req, res) {
  const cliente = await Cliente.buscarPorId(req.session.usuario.id);
  if (!cliente) return res.status(404).json({ erro: 'Cadastro não encontrado.' });
  return res.json(cliente);
}

module.exports = { cadastrar, meusDados };
