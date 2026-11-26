import React, { useState } from "react";
import "./App.css";
import Home from "./Telas/Home";
import Login from "./Telas/Login";
import Cadastro from "./Telas/Cadastro";
import AdminPainel from "./Telas/Adm";

function App() {
  const [paginaAtual, setPaginaAtual] = useState("home");

  if (paginaAtual === "admin") {
    return <AdminPainel onLogout={() => setPaginaAtual("home")} />;
  }

  if (paginaAtual === "login") {
    return (
      <Login
        onSwitchToRegister={() => setPaginaAtual("cadastro")}
        onBackToHome={() => setPaginaAtual("home")}
      />
    );
  }

  if (paginaAtual === "cadastro") {
    return (
      <Cadastro
        onSwitchToLogin={() => setPaginaAtual("login")}
        onBackToHome={() => setPaginaAtual("home")}
      />
    );
  }

  return (
    <Home
      onOpenLogin={() => setPaginaAtual("login")}
      onOpenRegister={() => setPaginaAtual("cadastro")}
      onOpenAdmin={() => setPaginaAtual("admin")}
    />
  );
}

//const [modalAberto, setModalAberto] = useState(true);

/*const [paginaAtual, setPaginaAtual] = useState('login');

  return (
    <div>
      {paginaAtual === 'login' ? (
        <Login
          isOpen={true}
          onSwitchToRegister={() => setPaginaAtual('cadastro')}
        />
      ) : (
        <Cadastro
          isOpen={true}
          onSwitchToLogin={() => setPaginaAtual('login')}
        />
      )}
    </div>
  );*/

/*
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <button
        onClick={() => setModalAberto(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow font-semibold"
      >
        Abrir Modal de Edição
      </button>

      
      <EditarUsuarioModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  ); 
  */

export default App;
