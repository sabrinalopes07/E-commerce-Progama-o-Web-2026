import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./Telas/Login";
import Cadastro from "./Telas/Cadastro";
import EditarUsuarioModal from "./Telas/EditarUsuario";
import { api } from "./services/api";

function App() {
  // Usuário da sessão: { id, nome, perfil } ('CLIENTE' | 'ADMIN') ou null se ninguém estiver logado
  const [usuario, setUsuario] = useState(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState("login"); // 'login' | 'cadastro'
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [aviso, setAviso] = useState(""); // mensagem exibida na tela de login

  // Ao abrir/recarregar a página, pergunta ao servidor se ainda existe uma sessão válida
  useEffect(() => {
    api
      .usuarioLogado()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setVerificandoSessao(false));
  }, []);

  // Volta para a tela de login, deixando ninguém logado
  const voltarParaLogin = (mensagem = "") => {
    setUsuario(null);
    setModalEdicaoAberto(false);
    setPaginaAtual("login");
    setAviso(mensagem);
  };

  const sair = async () => {
    try {
      await api.logout();
    } finally {
      voltarParaLogin();
    }
  };

  if (verificandoSessao) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Carregando...</div>;
  }

  // ----- Ninguém logado: telas públicas -----
  if (!usuario) {
    return paginaAtual === "login" ? (
      <Login
        isOpen={true}
        aviso={aviso}
        onLoginSuccess={(u) => {
          setAviso("");
          setUsuario(u);
        }}
        onSwitchToRegister={() => {
          setAviso("");
          setPaginaAtual("cadastro");
        }}
      />
    ) : (
      <Cadastro onSwitchToLogin={() => setPaginaAtual("login")} />
    );
  }

  // ----- Logado: área provisória -----
  // Substituir pelas telas definitivas: interface do cliente (TF02) e do administrador (TF03).
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">Olá, {usuario.nome}!</h1>
      <p className="text-gray-600">
        Você está logado como {usuario.perfil === "ADMIN" ? "administrador" : "cliente"}.
      </p>

      {usuario.perfil === "CLIENTE" && (
        <button
          onClick={() => setModalEdicaoAberto(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow font-semibold"
        >
          Editar meus dados
        </button>
      )}

      <button
        onClick={sair}
        className="px-6 py-3 border border-gray-300 text-gray-800 rounded-lg shadow-sm font-semibold hover:bg-gray-50"
      >
        Sair
      </button>

      <EditarUsuarioModal
        isOpen={modalEdicaoAberto}
        onClose={() => setModalEdicaoAberto(false)}
        onSaved={(cliente) => setUsuario((u) => ({ ...u, nome: cliente.nome }))}
        onDeleted={() => voltarParaLogin("Sua conta foi excluída.")}
        onSessaoExpirada={() => voltarParaLogin("Sua sessão expirou. Entre novamente.")}
      />
    </div>
  );
}

export default App;
