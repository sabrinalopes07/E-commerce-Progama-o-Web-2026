import React, { useState } from "react";
import "./App.css";
//import SucessoModal from "./Telas/SucessModal";
//import Login from './Telas/Login';
//import Cadastro from './Telas/Cadastro';
import EditarUsuarioModal from "./Telas/EditarUsuario";

function App() {
  const [modalAberto, setModalAberto] = useState(true);

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

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <button
        onClick={() => setModalAberto(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow font-semibold"
      >
        Abrir Modal de Edição
      </button>

      {/* Componente testado separadamente */}
      <EditarUsuarioModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  );
}

export default App;
