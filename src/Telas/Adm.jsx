import React, { useEffect, useState } from "react";

import {
  Home as HomeIcon,
  User,
  LayoutGrid,
  Package,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  Users,
  ShoppingCart,
  Search,
  Pencil,
  Trash2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  removerProduto,
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  removerCategoria,
  listarUsuarios,
  criarUsuario,
  atualizarUsuarioLista,
  removerUsuarioLista,
  obterAdmin,
  atualizarAdmin,
  excluirCadastroAdmin,
} from "../services/databaseService";

export default function AdminPainel({ onLogout }) {
  //Menu Lateral tela do Adm
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

  //Funcionalidades
  const [admin, setAdmin] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Filtros de busca
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");
  const [buscaProduto, setBuscaProduto] = useState("");

  // Modais
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formProduto, setFormProduto] = useState({
    descricao: "",
    preco: "",
    estoque: "",
    categoriaId: "",
  });

  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nomeCategoria, setNomeCategoria] = useState("");

  const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null); // null = novo usuário; objeto = editando usuário ou admin
  const [editandoProprioAdmin, setEditandoProprioAdmin] = useState(false);
  const [formUsuario, setFormUsuario] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
  });

  const carregarTudo = async () => {
    const [adm, prods, cats, users] = await Promise.all([
      obterAdmin(),
      listarProdutos(),
      listarCategorias(),
      listarUsuarios(),
    ]);
    setAdmin(adm);
    setProdutos(prods);
    setCategorias(cats);
    setUsuarios(users);
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const formatarId = (id) => String(id).padStart(2, "0");

  // --- AÇÕES PRODUTO ---
  const abrirNovoProduto = () => {
    setProdutoEditando(null);
    setFormProduto({
      descricao: "",
      preco: "",
      estoque: "",
      categoriaId: categorias[0]?.id || 1,
    });
    setModalProdutoAberto(true);
  };

  const abrirEditarProduto = (prod) => {
    setProdutoEditando(prod);
    setFormProduto({
      descricao: prod.descricao,
      preco: prod.preco,
      estoque: prod.estoque,
      categoriaId: prod.categoriaId,
    });
    setModalProdutoAberto(true);
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    if (!formProduto.descricao.trim()) return;
    if (produtoEditando) {
      await atualizarProduto(produtoEditando.id, formProduto);
    } else {
      await criarProduto(formProduto);
    }
    setModalProdutoAberto(false);
    carregarTudo();
  };

  const deletarProduto = async (id) => {
    await removerProduto(id);
    carregarTudo();
  };

  // --- AÇÕES CATEGORIA ---
  const abrirNovaCategoria = () => {
    setCategoriaEditando(null);
    setNomeCategoria("");
    setModalCategoriaAberto(true);
  };

  const abrirEditarCategoria = (cat) => {
    setCategoriaEditando(cat);
    setNomeCategoria(cat.nome);
    setModalCategoriaAberto(true);
  };

  const salvarCategoria = async (e) => {
    e.preventDefault();
    if (!nomeCategoria.trim()) return;
    if (categoriaEditando) {
      await atualizarCategoria(categoriaEditando.id, nomeCategoria.trim());
    } else {
      await criarCategoria(nomeCategoria.trim());
    }
    setModalCategoriaAberto(false);
    carregarTudo();
  };

  const deletarCategoria = async (id) => {
    await removerCategoria(id);
    carregarTudo();
  };

  // --- AÇÕES USUÁRIO / ADMIN ---
  const abrirEditarProprioAdmin = () => {
    setEditandoProprioAdmin(true);
    setUsuarioEditando(admin);
    setFormUsuario({
      nome: admin?.nome || "",
      email: admin?.email || "",
      telefone: admin?.telefone || "",
      endereco: admin?.endereco || "",
    });
    setModalUsuarioAberto(true);
  };

  const abrirNovoUsuario = () => {
    setEditandoProprioAdmin(false);
    setUsuarioEditando(null);
    setFormUsuario({ nome: "", email: "", telefone: "", endereco: "" });
    setModalUsuarioAberto(true);
  };

  const abrirEditarUsuarioLista = (user) => {
    setEditandoProprioAdmin(false);
    setUsuarioEditando(user);
    setFormUsuario({
      nome: user.nome || "",
      email: user.email || "",
      telefone: user.telefone || "",
      endereco: user.endereco || "",
    });
    setModalUsuarioAberto(true);
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    if (!formUsuario.nome.trim()) return;
    if (editandoProprioAdmin) {
      await atualizarAdmin(formUsuario);
    } else if (usuarioEditando) {
      await atualizarUsuarioLista(usuarioEditando.id, formUsuario);
    } else {
      await criarUsuario(formUsuario);
    }
    setModalUsuarioAberto(false);
    carregarTudo();
  };

  const handleExcluirCadastroAdmin = async () => {
    await excluirCadastroAdmin();
    setModalUsuarioAberto(false);
    if (onLogout) onLogout();
  };

  // Filtros
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
      u.email.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
      formatarId(u.id).includes(buscaUsuario),
  );

  const categoriasFiltradas = categorias.filter((c) =>
    c.nome.toLowerCase().includes(buscaCategoria.toLowerCase()),
  );

  const produtosFiltrados = produtos.filter((p) =>
    p.descricao.toLowerCase().includes(buscaProduto.toLowerCase()),
  );

  const nomeCategoriaPorId = (id) =>
    categorias.find((c) => Number(c.id) === Number(id))?.nome ||
    "Sem categoria";

  const menuItens = [
    { id: "dashboard", label: "Início / Dashboard", icon: HomeIcon },
    { id: "usuarios", label: "Usuários", icon: User },
    { id: "categorias", label: "Categorias", icon: LayoutGrid },
    { id: "produtos", label: "Produtos", icon: Package },
    { id: "compras", label: "Compras", icon: ShoppingBag },
    { id: "relatorios", label: "Relatórios", icon: FileText },
  ];

  const inputEscuroStyle = {
    backgroundColor: "#DEECFF",
    color: "#475569",
    borderRadius: "8px",
    padding: "12px 14px",
    width: "100%",
    fontSize: "14px",
    border: "none",
    outline: "none",
  };

  return (
    <div className="flex min-h-screen w-full bg-[#eef2f7] [font-family:Roboto,sans-serif]">
      {/* SIDEBAR ESQUERDA */}
      <aside className="w-[280px] shrink-0 bg-white  flex flex-col justify-between">
        <div>
          {/* Perfil do Admin */}
          <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-2">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-10 w-10 rounded-full bg-[#E2E8F0] border border-slate-400 shrink-0 flex items-center justify-center text-[#0F172A] font-bold">
                {(admin?.nome || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-bold text-[#0F172A]">
                  {admin?.nome || "Admin User"}
                </p>
                <p className="text-[14px] text-[#475569] underline ">
                  {admin?.email || "email.usuario@gmail.com"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={abrirEditarProprioAdmin}
              title="Alterar dados pessoais"
              className="text-[#1F1F1F] hover:text-blue-600 transition cursor-pointer shrink-0 "
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>

          {/* Menu lateral */}
          <nav className="p-3 space-y-1.5">
            {menuItens.map((item) => {
              const Icone = item.icon;
              const ativo = abaAtiva === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAbaAtiva(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[16px]  transition cursor-pointer ${
                    ativo
                      ? "bg-[#0052FF] text-white shadow-sm font-medium"
                      : "text-[#0F172A] hover:bg-slate-100"
                  }`}
                >
                  <Icone className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sair / Logout */}
        <div className="p-6 border-t border-gray-300">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-bold text-[#0F172A] hover:text-red-600 transition cursor-pointer"
          >
            <span>Sair / Logout</span>
            <LogOut className="h-5 w-5 text-red-500" />
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 min-w-0 pl-[34px] pr-[38px] py-6 overflow-y-auto text-left">
        {/* ABA 1: INÍCIO / DASHBOARD */}
        {abaAtiva === "dashboard" && (
          <div className= "w-full">
            <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-12 mt-[52px]">
              Painel Administrativo
            </h1>

            {/* 4 Cards Superiores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-col items-center w-[365px] h-[300px] ">
                <User className="h-9 w-9 text-[#0F172A] mb-3" />
                <div className="w-full h-[220px] rounded-lg bg-[#E2E8F0] flex flex-col items-center justify-center">
                  <span className="text-[64px] font-extrabold text-[#0052FF]">
                    {usuarios.length}
                  </span>
                  <span className="text-[24px] font-medium text-black-600 mt-1">
                    Usuários
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-col items-center w-[365px] h-[300px]">
                <ShoppingCart className="h-9 w-9 text-[#0F172A] mb-3" />
                <div className="w-full h-[220px] rounded-lg bg-[#E2E8F0] flex flex-col items-center justify-center">
                  <span className="text-[64px] font-extrabold text-[#0052FF]">
                    {produtos.length}
                  </span>
                  <span className="text-[22px] font-medium text-black-600 mt-1">
                    Produtos
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-col items-center w-[365px] h-[300px]">
                <ShoppingBag className="h-9 w-9 text-[#0F172A] mb-3" />
                <div className="w-full h-[220px] rounded-lg bg-[#E2E8F0] flex flex-col items-center justify-center">
                  <span className="text-[64px] font-extrabold text-[#0052FF]">
                    {categorias.length}
                  </span>
                  <span className="text-[22px] font-medium text-black-600 mt-1">
                    Categorias
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-col items-center w-[365px] h-[300px]">
                <Package className="h-9 w-9 text-[#0F172A] mb-3" />
                <div className="w-full h-[220px] rounded-lg bg-[#E2E8F0] flex flex-col items-center justify-center">
                  <span className="text-[64px] font-extrabold text-[#0052FF]">
                    {produtos.reduce(
                      (acc, p) => acc + Number(p.estoque || 0),
                      0,
                    )}
                  </span>
                  <span className="text-[22px] font-medium text-black-600 mt-1">
                    Itens em Estoque
                  </span>
                </div>
              </div>
            </div>

            {/* Acesso Rápido */}
            <h2 className="text-[28px] font-extrabold text-[#0F172A] mb-4">
              Acesso rápido
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                type="button"
                onClick={() => setAbaAtiva("usuarios")}
                className="bg-white rounded-xl p-6 flex items-center gap-3 text-left font-bold text-lg text-[#0F172A] hover:shadow-md transition cursor-pointer"
              >
                <Users className="h-6 w-6" />
                <span>Gerenciar usuários</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("categorias")}
                className="bg-white rounded-xl p-6 flex items-center gap-3 text-left font-bold text-lg text-[#0F172A] hover:shadow-md transition cursor-pointer"
              >
                <LayoutGrid className="h-6 w-6" />
                <span>Gerenciar categorias</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("produtos")}
                className="bg-white rounded-xl p-6 flex items-center gap-3 text-left font-bold text-lg text-[#0F172A] hover:shadow-md transition cursor-pointer"
              >
                <Package className="h-6 w-6" />
                <span>Gerenciar produtos</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("relatorios")}
                className="bg-white rounded-xl p-6 flex items-center gap-3 text-left font-bold text-lg text-[#0F172A] hover:shadow-md transition cursor-pointer"
              >
                <FileText className="h-6 w-6" />
                <span>Visualizar relatórios</span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: USUÁRIOS */}
        {abaAtiva === "usuarios" && (
          <div className="flex-1 min-w-0 pl-[34px] pr-[38px] py-6 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold text-[#0F172A]">
                Usuários
              </h1>
              <button
                type="button"
                onClick={abrirNovoUsuario}
                className="flex items-center gap-2 rounded-lg bg-[#0055FF] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Usuário</span>
              </button>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <input
                type="text"
                placeholder="Buscar por nome, email ou ID"
                value={buscaUsuario}
                onChange={(e) => setBuscaUsuario(e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 0,
                  boxShadow: "none",
                }}
                className="w-full text-sm text-slate-700 focus:outline-none"
              />
            </div>

            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-sm text-slate-600">
                    <th className="py-4 px-6 font-medium">ID</th>
                    <th className="py-4 px-6 font-medium">Nome</th>
                    <th className="py-4 px-6 font-medium">E-mail</th>
                    <th className="py-4 px-6 font-medium text-right pr-12">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-300 last:border-none text-sm text-slate-700"
                    >
                      <td className="py-4 px-6">{formatarId(u.id)}</td>
                      <td className="py-4 px-6">{u.nome}</td>
                      <td className="py-4 px-6">{u.email}</td>
                      <td className="py-4 px-6 text-right pr-10">
                        <div className="inline-flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => abrirEditarUsuarioLista(u)}
                            className="text-slate-800 hover:text-blue-600 cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await removerUsuarioLista(u.id);
                              carregarTudo();
                            }}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Remover"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginacaoVisual />
          </div>
        )}

        {/* ABA 3: CATEGORIAS */}
        {abaAtiva === "categorias" && (
          <div className="flex-1 min-w-0 pl-[34px] pr-[38px] py-6 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold text-[#0F172A]">
                Categorias
              </h1>
              <button
                type="button"
                onClick={abrirNovaCategoria}
                className="flex items-center gap-2 rounded-lg bg-[#0055FF] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Nova categoria</span>
              </button>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Buscar categoria..."
                value={buscaCategoria}
                onChange={(e) => setBuscaCategoria(e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 0,
                  boxShadow: "none",
                }}
                className="w-full text-sm text-slate-700 focus:outline-none"
              />
              <Search className="h-5 w-5 text-slate-800 shrink-0" />
            </div>

            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-sm text-slate-600">
                    <th className="py-4 px-6 font-medium">ID</th>
                    <th className="py-4 px-6 font-medium">Nome</th>
                    <th className="py-4 px-6 font-medium text-right pr-14">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasFiltradas.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-slate-300 last:border-none text-sm text-slate-700"
                    >
                      <td className="py-4 px-6">{formatarId(cat.id)}</td>
                      <td className="py-4 px-6">{cat.nome}</td>
                      <td className="py-4 px-6 text-right pr-10">
                        <div className="inline-flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => abrirEditarCategoria(cat)}
                            className="text-slate-800 hover:text-blue-600 cursor-pointer"
                            title="Visualizar"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirEditarCategoria(cat)}
                            className="text-slate-800 hover:text-blue-600 cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletarCategoria(cat.id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginacaoVisual />
          </div>
        )}

        {/* ABA 4: PRODUTOS (CRUD Completo conforme TF03) */}
        {abaAtiva === "produtos" && (
          <div className="flex-1 min-w-0 pl-[34px] pr-[38px] py-6 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold text-[#0F172A]">
                Produtos
              </h1>
              <button
                type="button"
                onClick={abrirNovoProduto}
                className="flex items-center gap-2 rounded-lg bg-[#0055FF] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Produto</span>
              </button>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Buscar produto por descrição..."
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 0,
                  boxShadow: "none",
                }}
                className="w-full text-sm text-slate-700 focus:outline-none"
              />
              <Search className="h-5 w-5 text-slate-800 shrink-0" />
            </div>

            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-sm text-slate-600">
                    <th className="py-4 px-6 font-medium">ID</th>
                    <th className="py-4 px-6 font-medium">Descrição</th>
                    <th className="py-4 px-6 font-medium">Categoria</th>
                    <th className="py-4 px-6 font-medium">Preço</th>
                    <th className="py-4 px-6 font-medium">Estoque</th>
                    <th className="py-4 px-6 font-medium text-right pr-12">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((prod) => (
                    <tr
                      key={prod.id}
                      className="border-b border-slate-300 last:border-none text-sm text-slate-700"
                    >
                      <td className="py-4 px-6">{formatarId(prod.id)}</td>
                      <td className="py-4 px-6 font-medium text-[#0F172A]">
                        {prod.descricao}
                      </td>
                      <td className="py-4 px-6">
                        {nomeCategoriaPorId(prod.categoriaId)}
                      </td>
                      <td className="py-4 px-6">
                        R$ {Number(prod.preco).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="py-4 px-6">{prod.estoque} un.</td>
                      <td className="py-4 px-6 text-right pr-10">
                        <div className="inline-flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => abrirEditarProduto(prod)}
                            className="text-slate-800 hover:text-blue-600 cursor-pointer"
                            title="Editar produto"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletarProduto(prod.id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Excluir produto"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginacaoVisual />
          </div>
        )}

        {/* ABAS SECUNDÁRIAS (Compras / Relatórios) */}
        {(abaAtiva === "compras" || abaAtiva === "relatorios") && (
          <div className="flex-1 min-w-0 pl-[34px] pr-[38px] py-6 overflow-y-auto text-left">
            <h1 className="text-3xl font-extrabold text-[#0F172A] mb-6 capitalize">
              {abaAtiva === "compras" ? "Compras" : "Relatórios"}
            </h1>
            <div className="bg-white rounded-xl p-8 text-slate-600 text-sm">
              Resumo atual do sistema: <strong>{produtos.length}</strong>{" "}
              produtos cadastrados, <strong>{categorias.length}</strong>{" "}
              categorias ativas e <strong>{usuarios.length}</strong> usuários
              registrados.
            </div>
          </div>
        )}
      </main>

      {/* MODAL: NOVO / EDITAR PRODUTO (Idêntico ao wireframe) */}
      {modalProdutoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={salvarProduto}
            className="w-full max-w-[680px] rounded-2xl bg-white p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setModalProdutoAberto(false)}
              className="text-2xl font-bold text-[#0F172A] hover:text-blue-600 mb-4 cursor-pointer"
            >
              &lt;
            </button>

            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-6">
              {produtoEditando ? "Editar Produto" : "Novo Produto"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={formProduto.descricao}
                  onChange={(e) =>
                    setFormProduto({
                      ...formProduto,
                      descricao: e.target.value,
                    })
                  }
                  style={inputEscuroStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">
                    Preço
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formProduto.preco}
                    onChange={(e) =>
                      setFormProduto({ ...formProduto, preco: e.target.value })
                    }
                    style={inputEscuroStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">
                    Estoque
                  </label>
                  <input
                    type="number"
                    required
                    value={formProduto.estoque}
                    onChange={(e) =>
                      setFormProduto({
                        ...formProduto,
                        estoque: e.target.value,
                      })
                    }
                    style={inputEscuroStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Categoria
                </label>
                <select
                  value={formProduto.categoriaId}
                  onChange={(e) =>
                    setFormProduto({
                      ...formProduto,
                      categoriaId: e.target.value,
                    })
                  }
                  style={inputEscuroStyle}
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setModalProdutoAberto(false)}
                className="rounded-lg bg-[#C9C9C9] px-7 py-3 text-sm font-bold text-white hover:bg-gray-400 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0055FF] px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: NOVA / EDITAR CATEGORIA */}
      {modalCategoriaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={salvarCategoria}
            className="w-full max-w-[520px] rounded-2xl bg-white p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setModalCategoriaAberto(false)}
              className="text-2xl font-bold text-[#0F172A] hover:text-blue-600 mb-4 cursor-pointer"
            >
              &lt;
            </button>

            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-6">
              {categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
            </h2>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">
                Nome da Categoria
              </label>
              <input
                type="text"
                required
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                style={inputEscuroStyle}
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setModalCategoriaAberto(false)}
                className="rounded-lg bg-[#C9C9C9] px-7 py-3 text-sm font-bold text-white hover:bg-gray-400 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0055FF] px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDITAR DADOS DO USUÁRIO / NOVO USUÁRIO (Idêntico ao wireframe) */}
      {modalUsuarioAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={salvarUsuario}
            className="w-full max-w-[680px] rounded-2xl bg-white p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <button
                  type="button"
                  onClick={() => setModalUsuarioAberto(false)}
                  className="text-2xl font-bold text-[#0F172A] hover:text-blue-600 mb-4 block cursor-pointer"
                >
                  &lt;
                </button>
                <h2 className="text-3xl font-extrabold text-[#0F172A]">
                  {usuarioEditando ? "Editar dados do usuário" : "Novo Usuário"}
                </h2>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-20 rounded-full bg-[#DCE3EC] border-2 border-slate-400" />
                <button
                  type="button"
                  className="rounded-lg bg-[#C9C9C9] px-4 py-2 text-xs font-bold text-white hover:bg-gray-400 transition cursor-pointer"
                >
                  Alterar foto
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formUsuario.nome}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, nome: e.target.value })
                  }
                  style={inputEscuroStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formUsuario.email}
                    onChange={(e) =>
                      setFormUsuario({ ...formUsuario, email: e.target.value })
                    }
                    style={inputEscuroStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formUsuario.telefone}
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        telefone: e.target.value,
                      })
                    }
                    style={inputEscuroStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formUsuario.endereco}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, endereco: e.target.value })
                  }
                  style={inputEscuroStyle}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-8">
              {editandoProprioAdmin ? (
                <button
                  type="button"
                  onClick={handleExcluirCadastroAdmin}
                  className="rounded-lg border border-red-300 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  Excluir meu cadastro
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalUsuarioAberto(false)}
                  className="rounded-lg bg-[#C9C9C9] px-7 py-3 text-sm font-bold text-white hover:bg-gray-400 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0055FF] px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function PaginacaoVisual() {
  return (
    <div className="flex items-center justify-end gap-2 mt-6">
      <button
        type="button"
        className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {[1, 2, 3, 4].map((num) => (
        <button
          key={num}
          type="button"
          className="h-9 w-9 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-blue-600 hover:text-white transition cursor-pointer"
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
