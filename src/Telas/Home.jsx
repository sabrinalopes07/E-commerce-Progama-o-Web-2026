import React from "react";
import { ShoppingBag, Search, User, ShoppingCart } from "lucide-react";
import imgHome from "../Imagens/home.jpg";
import AdminPainel from "./Adm";

export default function Home({
  onOpenLogin,
  onSwitchToRegister,
  onOpenRegister,
  onOpenAdmin,
}) {
  return (
    <div className="min-h-screen bg-[#EBF0F7] [font-family:Roboto,sans-serif]">
      {/* Barra superior promocional */}
      <div className="bg-[#0F172A] text-white text-center text-xs py-2 px-4 [font-family:Roboto,sans-serif]">
        Frete grátis para todo o Brasil em compras acima de R$ 299! Aproveite!
      </div>

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-20 py-5">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Logo + Busca */}
          <div className="flex items-center flex-1 min-w-0">
            {/* Logo */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 font-bold text-gray-900 text-base cursor-pointer shrink-0"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <ShoppingBag className="h-5 w-5" />
              </span>

              <span className="text-2xl">LojaOnline</span>
            </button>

            {/* Busca */}
            <div className="hidden md:flex items-center gap-2 bg-[#F8FAFC] rounded-lg px-3 py-2 w-[420px] h-[42px] border border-[#E2E8F0] md:ml-[104px]">
              <Search className="h-4 w-4 text-[#475569] shrink-0" />

              <input
                type="text"
                placeholder="Buscar produtos, marcas e categorias..."
                className="bg-transparent text-sm text-[#94A3B8] w-full focus:outline-none"
              />
            </div>
          </div>

          {/* Direita: Entrar, Cadastre-se, Carrinho */}
          <div className="flex items-center gap-7 font-[24px] shrink-0">
            {/* Entrar */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-1 text-[#0F172A] hover:text-blue-600 transition cursor-pointer px-2 py-1.5 font-bold"
            >
              <User className="h-5 w-5" strokeWidth={2.5} />
              <span>Entrar</span>
            </button>

            {/* Cadastre-se */}
            <button
              type="button"
              onClick={onOpenRegister}
              className="rounded-lg bg-[#EFF4FF] px-4 py-2 text-[#0052FF] hover:bg-blue-100 transition cursor-pointer font-bold"
            >
              <span>Cadastre-se</span>
            </button>

            <span className="h-5 w-[1px] bg-gray-300" />

            {/* Carrinho */}
            <button
              type="button"
              className="relative flex items-center gap-2 text-[#0F172A] hover:text-blue-600 transition cursor-pointer px-2 py-1.5 font-bold"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
              <span>Carrinho</span>
            </button>
          </div>
        </div>
      </header>
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 bg-white [font-family:Roboto,sans-serif]">
        {/* Lado Esquerdo: Textos promocionais */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:pl-[80px] lg:pr-16">
          <span className="w-fit rounded-md bg-[#EFF4FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052FF] mb-4">
            SEMANA BLACK FRIDAY
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight mb-4">
            Ofertas Imperdíveis com até 50% OFF
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-4">
            Equipe sua casa, renove seu guarda-roupa ou garanta os melhores
            eletrônicos com as facilidades do Pix e parcelamento em até 12x.
          </p>

          <p className="text-xs text-gray-400">
            Promoção válida de 02/11 a 27/11/2026. Descontos aplicados sobre
            preço original.
          </p>
        </div>

        {/* Lado Direito: Imagem do banner ajustada */}
        <div className="relative flex items-center justify-center h-[320px] lg:h-[520px] w-full overflow-hidden bg-gradient-to-br from-sky-200 via-amber-100 to-amber-200">
          {imgHome ? (
            <img
              src={imgHome}
              alt="Produtos em destaque da Semana do Consumidor"
              className="h-full w-full object-cover object-center"
            />
          ) : null}
        </div>
      </section>

      {onOpenAdmin && (
        <button
          type="button"
          onClick={onOpenAdmin}
          className="rounded-lg bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200 transition cursor-pointer"
        >
          Painel Admin (Temp)
        </button>
      )}
    </div>
  );
}
