import React, { useState } from "react";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";
import imgCadastro from "../Imagens/imgCadastro.png";
import SucessoModal from "./SucessModal";
import { api } from "../services/api";
import { validarCadastro } from "../utils/validacaoCadastro";

export default function Cadastro({ onSwitchToLogin }) {
  const [dadosFormulario, setDadosFormulario] = useState({
    nome: '',
    login: '',
    email: '',
    senha: '',
    cpf: '',
    endereco: '',
  });

  // Estado para controlar se a senha está visível ou não
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erros, setErros] = useState({}); // erros por campo: { email: "..." }
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cadastrado, setCadastrado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosFormulario({ ...dadosFormulario, [name]: value });
    if (erros[name]) setErros({ ...erros, [name]: undefined }); // limpa o erro ao corrigir o campo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroGeral('');

    // Só envia ao servidor se tudo estiver correto
    const errosEncontrados = validarCadastro(dadosFormulario);
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados);
      return;
    }

    setEnviando(true);
    try {
      // O CPF ainda não existe no banco (tabela usuario), por isso não é enviado.
      const { cpf, ...dadosParaEnviar } = dadosFormulario;
      await api.cadastrarCliente(dadosParaEnviar);
      setCadastrado(true); // abre o modal de sucesso
    } catch (err) {
      setErros(err.erros || {}); // ex.: login já em uso (409)
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const fecharSucesso = () => {
    setCadastrado(false);
    if (onSwitchToLogin) onSwitchToLogin();
  };

  // Mensagem de erro exibida abaixo de cada campo
  const msgErro = (campo) =>
    erros[campo] ? <p className="mt-1 text-xs text-red-600">{erros[campo]}</p> : null;

  const inputStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '10px 16px',
    width: '100%',
    fontSize: '14px',
    color: '#1f2937',
    outline: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    display: 'block'
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Lado Esquerdo: Imagem */}
      <div className="hidden w-1/2 lg:block relative">
        <img
          src={imgCadastro}
          alt="Pessoas trabalhando no computador"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Lado Direito: Formulário */}
      <div className="relative flex w-full flex-col p-8 lg:w-1/2 overflow-y-auto overflow-x-hidden bg-[#EBF0F7]">
        {/* Círculos Azuis Decorativos */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-600 pointer-events-none"></div>
        <div className="absolute top-1/2 -right-16 h-40 w-40 -translate-y-1/2 rounded-full bg-blue-600 pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-blue-600 pointer-events-none"></div>
        <div className="absolute -bottom-24 right-4 h-48 w-48 rounded-full bg-blue-600 pointer-events-none"></div>

        {/* Conteúdo Principal */}
        <div className="relative z-10 flex flex-col w-full max-w-[700px] mx-auto pt-4">
          
          {/* Logo / Marca */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              E-commercePW
            </span>
          </div>

          {/* Título Principal */}
          <h2 className="w-full text-3xl font-extrabold text-gray-900 leading-snug mb-4 [font-family:Roboto,sans-serif]">
            Crie sua conta e aproveite ofertas exclusivas
          </h2>

          {/* Formulário */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <h3 className="text-2xl font-bold text-gray-700 [font-family:Roboto,sans-serif] mb-1">
              Cadastro
            </h3>

            <div>
              <label className="block text-x  text-gray-700 mb-2 [font-family:Roboto,sans-serif]">
                Nome completo
              </label>
              <input
                type="text"
                name="nome"
                value={dadosFormulario.nome}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              {msgErro('nome')}
            </div>

            <div>
              <label className="block text-x text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
                Usuário (para entrar no sistema)
              </label>
              <input
                type="text"
                name="login"
                autoComplete="username"
                value={dadosFormulario.login}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              {msgErro('login')}
            </div>

            <div>
              <label className="block text-x text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={dadosFormulario.email}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              {msgErro('email')}
            </div>

            <div>
              <label className="block text-x text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  name="senha"
                  value={dadosFormulario.senha}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {mostrarSenha ? <Eye className="h-5 w-5" /> : <EyeOff  className="h-5 w-5" />}
                </button>
              </div>
              {msgErro('senha')}
            </div>

            <div>
              <label className="block text-x text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={dadosFormulario.cpf}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-x text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
                Endereço
              </label>
              <input
                type="text"
                name="endereco"
                value={dadosFormulario.endereco}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              {msgErro('endereco')}
            </div>

            {erroGeral && (
              <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {erroGeral}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full mt-4 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed [font-family:Roboto,sans-serif]"
            >
              {enviando ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          {/* Botão para voltar ao Login */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-blue-600 hover:underline font-medium [font-family:Roboto,sans-serif]"
            >
              Já tem uma conta? Faça login
            </button>
          </div>

        </div>
      </div>

      {/* Modal de sucesso: ao fechar, volta para a tela de login */}
      <SucessoModal isOpen={cadastrado} onClose={fecharSucesso} />
    </div>
  );
}
