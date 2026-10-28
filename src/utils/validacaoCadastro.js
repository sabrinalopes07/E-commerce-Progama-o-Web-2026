// Validação do formulário de cadastro no navegador: os dados só são enviados ao servidor
// se estiverem corretos e com todos os campos obrigatórios preenchidos.
// (As mesmas regras são conferidas de novo no servidor, em src/utils/validacao.js do back-end.)

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_LOGIN = /^[A-Za-z0-9_.-]+$/;

// Retorna um objeto { campo: "mensagem" }. Objeto vazio = formulário válido.
export function validarCadastro({ nome = "", login = "", email = "", senha = "", endereco = "" }) {
  const erros = {};

  if (nome.trim().length < 3) erros.nome = "Informe o nome completo.";

  if (login.trim().length < 3 || login.trim().length > 50 || !REGEX_LOGIN.test(login.trim())) {
    erros.login = "Use de 3 a 50 caracteres: letras, números, ponto, hífen ou sublinhado.";
  }

  if (!REGEX_EMAIL.test(email.trim())) erros.email = "Informe um e-mail válido.";

  if (senha.length < 6) erros.senha = "A senha deve ter pelo menos 6 caracteres.";

  if (endereco.trim().length < 5) erros.endereco = "Informe o endereço.";

  return erros;
}
