import React, { useEffect, useState } from "react";

import EditarModalBase from "./ModalBase/EditarModalBase";
import { api } from "../services/api";
import { validarEdicao } from "../utils/validacaoCadastro";

// Props:
//  onSaved(cliente)    chamado depois de salvar, com os dados atualizados vindos do servidor
//  onDeleted()         chamado depois que a conta é excluída (a sessão já foi encerrada)
//  onSessaoExpirada()  chamado se o servidor responder 401 (a sessão acabou)
export default function EditarUsuarioModal({ isOpen, onClose, onSaved, onDeleted, onSessaoExpirada }) {
  const [formData, setFormData] = useState({
    nome: "",
    senha: "",
    endereco: "",
    email: "",
  });
  const [erros, setErros] = useState({}); // erros por campo
  const [erroGeral, setErroGeral] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Exclusão da conta (pede a senha para confirmar)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState("");
  const [erroExclusao, setErroExclusao] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  // Se a sessão acabou (401), avisa o App; senão, mostra o erro na própria tela
  const tratarErro = (err, aoFalhar) => {
    if (err.status === 401 && onSessaoExpirada) onSessaoExpirada();
    else aoFalhar(err);
  };

  // Toda vez que o modal abre, busca os dados atuais do cliente no servidor (banco)
  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelado = false;

    setErros({});
    setErroGeral("");
    setConfirmandoExclusao(false);
    setSenhaExclusao("");
    setErroExclusao("");
    setCarregando(true);

    api
      .meusDadosCliente()
      .then((c) => {
        if (!cancelado) setFormData({ nome: c.nome, email: c.email, endereco: c.endereco, senha: "" });
      })
      .catch((err) => {
        if (!cancelado) tratarErro(err, (e) => setErroGeral(e.message));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (erros[name]) setErros({ ...erros, [name]: undefined }); // limpa o erro ao corrigir o campo
  };

  const handleSave = async () => {
    setErroGeral("");

    // Só envia ao servidor se estiver tudo correto
    const errosEncontrados = validarEdicao(formData);
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados);
      return;
    }

    setSalvando(true);
    try {
      const dados = { nome: formData.nome, email: formData.email, endereco: formData.endereco };
      if (formData.senha) dados.senha = formData.senha; // em branco = mantém a senha atual
      const atualizado = await api.atualizarMeusDados(dados);
      if (onSaved) onSaved(atualizado);
      onClose();
    } catch (err) {
      tratarErro(err, (e) => {
        setErros(e.erros || {});
        setErroGeral(e.message);
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    setErroExclusao("");
    if (!senhaExclusao) {
      setErroExclusao("Digite sua senha para confirmar.");
      return;
    }
    setExcluindo(true);
    try {
      await api.excluirMinhaConta(senhaExclusao);
      if (onDeleted) onDeleted();
    } catch (err) {
      tratarErro(err, (e) => setErroExclusao(e.message));
    } finally {
      setExcluindo(false);
    }
  };

  const inputStyle = {
    backgroundColor: "#EBF4FF",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 16px",
    width: "100%",
    fontSize: "14px",
    color: "#1f2937",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
    display: "block",
  };

  const msgErro = (campo) =>
    erros[campo] ? <p className="mt-1 text-xs text-red-600">{erros[campo]}</p> : null;

  return (
    <EditarModalBase
      isOpen={isOpen}
      onClose={onClose}
      onBack={onClose}
      title="Editar dados do usuário"
      onCancel={onClose}
      onSave={handleSave}
      saveText={salvando ? "Salvando..." : "Salvar"}
      saveDisabled={carregando || salvando || excluindo}
    >
      {carregando && <p className="text-sm text-gray-500">Carregando seus dados...</p>}

      {erroGeral && (
        <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {erroGeral}
        </p>
      )}

      {/* Campo 1: Nome Completo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
          Nome Completo
        </label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          disabled={carregando}
          style={inputStyle}
        />
        {msgErro("nome")}
      </div>

      {/* Campo 2: Nova senha (opcional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
          Nova senha
        </label>
        <input
          type="password"
          name="senha"
          autoComplete="new-password"
          placeholder="Deixe em branco para manter a senha atual"
          value={formData.senha}
          onChange={handleChange}
          disabled={carregando}
          style={inputStyle}
        />
        {msgErro("senha")}
      </div>

      {/* Campo 3: Endereço */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
          Endereço
        </label>
        <input
          type="text"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          disabled={carregando}
          style={inputStyle}
        />
        {msgErro("endereco")}
      </div>

      {/* Campo 4: Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={carregando}
          style={inputStyle}
        />
        {msgErro("email")}
      </div>

      {/* Exclusão do cadastro */}
      <div className="pt-4 border-t border-gray-300/60">
        {!confirmandoExclusao ? (
          <button
            type="button"
            onClick={() => setConfirmandoExclusao(true)}
            className="text-sm font-semibold text-red-600 hover:underline [font-family:Roboto,sans-serif]"
          >
            Excluir minha conta
          </button>
        ) : (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Esta ação é permanente: seu cadastro e suas compras serão apagados. Digite sua senha para confirmar.
            </p>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={senhaExclusao}
              onChange={(e) => setSenhaExclusao(e.target.value)}
              style={{ ...inputStyle, backgroundColor: "#ffffff" }}
            />
            {erroExclusao && <p className="text-xs text-red-700">{erroExclusao}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmandoExclusao(false);
                  setSenhaExclusao("");
                  setErroExclusao("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-400 text-white text-sm font-semibold hover:bg-gray-500 transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleExcluir}
                disabled={excluindo}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {excluindo ? "Excluindo..." : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        )}
      </div>
    </EditarModalBase>
  );
}
