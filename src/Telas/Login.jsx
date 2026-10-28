import React, { useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import loginIMG from "../Imagens/imgLogin.png";
import { api } from "../services/api";

// onLoginSuccess(usuario) é chamado com { id, nome, perfil } ('CLIENTE' ou 'ADMIN') quando o login dá certo.
export default function Login({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const usuarioLogado = await api.login(usuario.trim(), senha);
      if (onLoginSuccess) onLoginSuccess(usuarioLogado);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    /* Container principal da PÁGINA (ocupa a tela toda) */
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Lado Esquerdo: Imagem ocupando exatamente metade da tela */}
      <div className="hidden w-1/2 lg:block relative">
        <img
          src={loginIMG}
          alt="Pessoas trabalhando no computador"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Lado Direito: Formulário ocupando a outra metade */}
      <div className="relative flex w-full flex-col p-8 lg:w-1/2 overflow-hidden bg-[#EBF0F7]">
        {/* Círculos Azuis Decorativos */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-600 pointer-events-none"></div>
        <div className="absolute top-1/2 -right-16 h-40 w-40 -translate-y-1/2 rounded-full bg-blue-600 pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-blue-600 pointer-events-none"></div>
        <div className="absolute -bottom-24 right-4 h-48 w-48 rounded-full bg-blue-600 pointer-events-none"></div>

        {/* Conteúdo Principal */}
        <div className="relative z-10 flex flex-col w-full max-w-[700px] mx-auto pt-8">
          {/* Logo / Marca */}
          <div className="flex items-center gap-2 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShoppingBag className="h-6 w-6" />
            </div>

            <span className="font-bold text-gray-900 text-ms">
              E-commercePW
            </span>
          </div>

          {/* Título Principal */}
          <h2 className="w-full text-4xl font-extrabold text-gray-900 leading-snug mb-8 [font-family:Roboto,sans-serif]">
            Acesso instantâneo às compras direto do conforto da sua casa
          </h2>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-3xl font-bold text-gray-700 [font-family:Roboto,sans-serif]">
              Entrar
            </h3>

            <div>
              <label className="block text-xl font-medium text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
                Usuário
              </label>
              <input
                type="text"
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none transition shadow-sm "
              />
            </div>

            <div>
              <label className="block text-xl font-medium text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
                Senha
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none transition shadow-sm"
              />
            </div>

            {erro && (
              <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full mt-6 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed [font-family:Roboto,sans-serif] "
            >
              {enviando ? "Entrando..." : "Entrar"}
            </button>

            {/* Divisor Ou */}
            <div className="my-6 flex items-center justify-center gap-3 ">
              <div className="h-[2px] w-24 bg-gray-400" />
              <span className="text-xm text-gray-500 font-medium">Ou</span>
              <div className="h-[2px] w-24 bg-gray-400" />
            </div>

          </form>

          {/* Botão para criar conta */}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="w-full rounded-lg border border-gray-300  py-2.5 text-xm font-medium text-gray-800 hover:bg-gray-50 transition shadow-sm mt-8"
          >
            Não possui conta? Crie uma
          </button>

        </div>
      </div>
    </div>
  );
}
