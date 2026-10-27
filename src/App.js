
import React, { useState } from 'react';
import './App.css';
import Login from './Telas/Login';
import Cadastro from './Telas/Cadastro';

function App() {
  const [paginaAtual, setPaginaAtual] = useState('login');

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
  );
}

export default App;
