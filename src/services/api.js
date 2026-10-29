// Comunicação com o back-end (Node/Express, porta 3001).
// O back-end libera o React (localhost:3000) via CORS com credenciais, e o cookie de sessão
// viaja porque usamos `credentials: "include"` nas requisições.
// Para apontar para outro servidor, crie um arquivo .env na raiz do React com:
//   REACT_APP_API_URL=http://endereco-do-servidor:porta
const BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(mensagem, status, erros = {}) {
    super(mensagem);
    this.status = status;
    this.erros = erros; // erros por campo, ex.: { login: "Este usuário já está em uso." }
  }
}

async function requisicao(metodo, caminho, corpo) {
  let resposta;
  try {
    resposta = await fetch(`${BASE}/api${caminho}`, {
      method: metodo,
      credentials: "include", // envia/recebe o cookie de sessão
      headers: corpo ? { "Content-Type": "application/json" } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Tente novamente.", 0);
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    /* resposta sem corpo */
  }

  if (!resposta.ok) {
    throw new ApiError((dados && dados.erro) || "Erro inesperado. Tente novamente.", resposta.status, (dados && dados.erros) || {});
  }
  return dados;
}

export const api = {
  cadastrarCliente: (dados) => requisicao("POST", "/clientes", dados),
  login: (login, senha) => requisicao("POST", "/auth/login", { login, senha }),
  logout: () => requisicao("POST", "/auth/logout"),
  usuarioLogado: () => requisicao("GET", "/auth/me"), // 401 se não houver sessão
  meusDadosCliente: () => requisicao("GET", "/clientes/me"),
  // Altera os dados pessoais. Envie só o que mudou: { nome, email, endereco, senha? }
  atualizarMeusDados: (dados) => requisicao("PUT", "/clientes/me", dados),
  // Exclui o cadastro (e as compras) do cliente logado. Exige a senha para confirmar.
  excluirMinhaConta: (senha) => requisicao("DELETE", "/clientes/me", { senha }),
};
