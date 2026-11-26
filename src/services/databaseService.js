const KEYS = {
  PRODUTOS: "ecommerce_pw_produtos_v1",
  CATEGORIAS: "ecommerce_pw_categorias_v1",
  USUARIOS: "ecommerce_pw_usuarios_v1",
  ADMIN: "ecommerce_pw_admin_v1",
};

const SEED_CATEGORIAS = [
  { id: 1, nome: "Eletrônicos" },
  { id: 2, nome: "Livros" },
  { id: 3, nome: "Roupas" },
  { id: 4, nome: "Casa" },
  { id: 5, nome: "Esportes" },
];

const SEED_PRODUTOS = [
  {
    id: 1,
    descricao: "Headphone",
    preco: 589.9,
    estoque: 42,
    categoriaId: 1,
  },
  {
    id: 2,
    descricao: "Smartwatch",
    preco: 299.0,
    estoque: 3,
    categoriaId: 1,
  },
  {
    id: 3,
    descricao: "Mochila",
    preco: 189.9,
    estoque: 18,
    categoriaId: 5,
  },
  {
    id: 4,
    descricao: "Moletom",
    preco: 159.9,
    estoque: 27,
    categoriaId: 3,
  },
];

const SEED_USUARIOS = [
  { id: 1, nome: "Tiago", email: "Tiago@gmail.com", telefone: "(85) 99999-0001", endereco: "Fortaleza - CE" },
  { id: 2, nome: "Sabrina", email: "Sabrina@gmail.com", telefone: "(85) 99999-0002", endereco: "Fortaleza - CE" },
  { id: 3, nome: "David", email: "David@gmail.com", telefone: "(85) 99999-0003", endereco: "Fortaleza - CE" },
  { id: 4, nome: "Ingryd", email: "Ingryd@gmail.com", telefone: "(85) 99999-0004", endereco: "Fortaleza - CE" },
  { id: 5, nome: "Leo", email: "Leleo@gmail.com", telefone: "(85) 99999-0005", endereco: "Fortaleza - CE" },
];

const SEED_ADMIN = {
  id: 99,
  nome: "Admin User",
  email: "email.usuario@gmail.com",
  telefone: "(85) 98888-7777",
  endereco: "Av. da Universidade, Fortaleza - CE",
  foto: "",
};

function initSeed() {
  if (!localStorage.getItem(KEYS.CATEGORIAS)) {
    localStorage.setItem(KEYS.CATEGORIAS, JSON.stringify(SEED_CATEGORIAS));
  }
  if (!localStorage.getItem(KEYS.PRODUTOS)) {
    localStorage.setItem(KEYS.PRODUTOS, JSON.stringify(SEED_PRODUTOS));
  }
  if (!localStorage.getItem(KEYS.USUARIOS)) {
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(SEED_USUARIOS));
  }
  if (!localStorage.getItem(KEYS.ADMIN)) {
    localStorage.setItem(KEYS.ADMIN, JSON.stringify(SEED_ADMIN));
  }
}

initSeed();

const ler = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const salvar = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// --- PRODUTOS ---
export const listarProdutos = async () => ler(KEYS.PRODUTOS);

export const criarProduto = async (dados) => {
  const lista = ler(KEYS.PRODUTOS);
  const novo = {
    id: lista.length ? Math.max(...lista.map((i) => i.id)) + 1 : 1,
    descricao: dados.descricao,
    preco: Number(dados.preco),
    estoque: Number(dados.estoque),
    categoriaId: Number(dados.categoriaId),
  };
  salvar(KEYS.PRODUTOS, [...lista, novo]);
  return novo;
};

export const atualizarProduto = async (id, dados) => {
  const lista = ler(KEYS.PRODUTOS);
  const atualizada = lista.map((item) =>
    item.id === id
      ? {
          ...item,
          descricao: dados.descricao,
          preco: Number(dados.preco),
          estoque: Number(dados.estoque),
          categoriaId: Number(dados.categoriaId),
        }
      : item
  );
  salvar(KEYS.PRODUTOS, atualizada);
};

export const removerProduto = async (id) => {
  salvar(KEYS.PRODUTOS, ler(KEYS.PRODUTOS).filter((i) => i.id !== id));
};

// --- CATEGORIAS ---
export const listarCategorias = async () => ler(KEYS.CATEGORIAS);

export const criarCategoria = async (nome) => {
  const lista = ler(KEYS.CATEGORIAS);
  const nova = {
    id: lista.length ? Math.max(...lista.map((i) => i.id)) + 1 : 1,
    nome,
  };
  salvar(KEYS.CATEGORIAS, [...lista, nova]);
  return nova;
};

export const atualizarCategoria = async (id, nome) => {
  const lista = ler(KEYS.CATEGORIAS);
  salvar(
    KEYS.CATEGORIAS,
    lista.map((c) => (c.id === id ? { ...c, nome } : c))
  );
};

export const removerCategoria = async (id) => {
  salvar(KEYS.CATEGORIAS, ler(KEYS.CATEGORIAS).filter((c) => c.id !== id));
};

// --- USUÁRIOS ---
export const listarUsuarios = async () => ler(KEYS.USUARIOS);

export const criarUsuario = async (dados) => {
  const lista = ler(KEYS.USUARIOS);
  const novo = {
    id: lista.length ? Math.max(...lista.map((i) => i.id)) + 1 : 1,
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone || "",
    endereco: dados.endereco || "",
  };
  salvar(KEYS.USUARIOS, [...lista, novo]);
  return novo;
};

export const atualizarUsuarioLista = async (id, dados) => {
  const lista = ler(KEYS.USUARIOS);
  salvar(
    KEYS.USUARIOS,
    lista.map((u) => (u.id === id ? { ...u, ...dados } : u))
  );
};

export const removerUsuarioLista = async (id) => {
  salvar(KEYS.USUARIOS, ler(KEYS.USUARIOS).filter((u) => u.id !== id));
};

// --- ADMIN LOGADO (Dados pessoais e exclusão de cadastro) ---
export const obterAdmin = async () => {
  const raw = localStorage.getItem(KEYS.ADMIN);
  return raw ? JSON.parse(raw) : null;
};

export const atualizarAdmin = async (dados) => {
  const atual = (await obterAdmin()) || SEED_ADMIN;
  const atualizado = { ...atual, ...dados };
  localStorage.setItem(KEYS.ADMIN, JSON.stringify(atualizado));
  return atualizado;
};

export const excluirCadastroAdmin = async () => {
  localStorage.removeItem(KEYS.ADMIN);
};
