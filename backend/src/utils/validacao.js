// Validação dos dados enviados pelo front-end. Nunca confie só na validação do navegador:
// o servidor valida de novo.

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_LOGIN = /^[A-Za-z0-9_.-]+$/;
const REGEX_TELEFONE = /^[0-9 ()+-]{8,20}$/;

const texto = (v) => (typeof v === 'string' ? v.trim() : '');

// Retorna { erros, dados }.
// `erros` é um objeto { campo: 'mensagem' } (vazio = tudo certo).
// `dados` já vem limpo (sem espaços nas pontas) e só com os campos que o cadastro aceita.
function validarCadastroCliente(body = {}) {
  const erros = {};

  const nome = texto(body.nome);
  const endereco = texto(body.endereco);
  const email = texto(body.email);
  const login = texto(body.login);
  const telefone = texto(body.telefone);
  const formaPagamento = texto(body.formaPagamento);
  const senha = typeof body.senha === 'string' ? body.senha : '';

  if (nome.length < 3 || nome.length > 100) erros.nome = 'Informe o nome completo (3 a 100 caracteres).';
  if (endereco.length < 5 || endereco.length > 255) erros.endereco = 'Informe o endereço (5 a 255 caracteres).';
  if (!REGEX_EMAIL.test(email) || email.length > 120) erros.email = 'Informe um e-mail válido.';

  if (login.length < 3 || login.length > 50 || !REGEX_LOGIN.test(login)) {
    erros.login = 'O usuário deve ter de 3 a 50 caracteres: letras, números, ponto, hífen ou sublinhado.';
  }

  // bcrypt só considera os primeiros 72 bytes da senha
  if (senha.length < 6 || Buffer.byteLength(senha, 'utf8') > 72) {
    erros.senha = 'A senha deve ter entre 6 e 72 caracteres.';
  }

  if (telefone && !REGEX_TELEFONE.test(telefone)) erros.telefone = 'Telefone inválido.';
  if (formaPagamento.length > 30) erros.formaPagamento = 'Forma de pagamento inválida.';

  return {
    erros,
    dados: {
      nome,
      endereco,
      email,
      login,
      senha,
      telefone: telefone || null,
      formaPagamento: formaPagamento || null,
    },
  };
}

// Alteração dos dados pessoais: só valida os campos que vieram no corpo.
// O que não for enviado continua como está no banco. O login NÃO pode ser alterado por aqui.
// A senha só é alterada se vier preenchida (vazia = manter a atual).
function validarAtualizacaoCliente(body = {}) {
  const erros = {};
  const dados = {};

  if (body.nome !== undefined) {
    const nome = texto(body.nome);
    if (nome.length < 3 || nome.length > 100) erros.nome = 'Informe o nome completo (3 a 100 caracteres).';
    else dados.nome = nome;
  }

  if (body.endereco !== undefined) {
    const endereco = texto(body.endereco);
    if (endereco.length < 5 || endereco.length > 255) erros.endereco = 'Informe o endereço (5 a 255 caracteres).';
    else dados.endereco = endereco;
  }

  if (body.email !== undefined) {
    const email = texto(body.email);
    if (!REGEX_EMAIL.test(email) || email.length > 120) erros.email = 'Informe um e-mail válido.';
    else dados.email = email;
  }

  if (body.telefone !== undefined) {
    const telefone = texto(body.telefone);
    if (telefone && !REGEX_TELEFONE.test(telefone)) erros.telefone = 'Telefone inválido.';
    else dados.telefone = telefone || null;
  }

  if (body.formaPagamento !== undefined) {
    const formaPagamento = texto(body.formaPagamento);
    if (formaPagamento.length > 30) erros.formaPagamento = 'Forma de pagamento inválida.';
    else dados.formaPagamento = formaPagamento || null;
  }

  if (body.senha !== undefined && body.senha !== '') {
    const senha = typeof body.senha === 'string' ? body.senha : '';
    if (senha.length < 6 || Buffer.byteLength(senha, 'utf8') > 72) erros.senha = 'A senha deve ter entre 6 e 72 caracteres.';
    else dados.senha = senha;
  }

  return { erros, dados };
}

module.exports = { validarCadastroCliente, validarAtualizacaoCliente };
