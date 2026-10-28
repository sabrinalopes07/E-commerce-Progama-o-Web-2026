import React, { useState } from "react";

import EditarModalBase from "./ModalBase/EditarModalBase";

export default function EditarUsuarioModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    senha: "",
    cpf: "",
    endereco: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Dados atualizados:", formData);
    onClose();
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

  return (
    <EditarModalBase
      isOpen={isOpen}
      onClose={onClose}
      onBack={onClose}
      title="Editar dados do usuário"
      onCancel={onClose}
      onSave={handleSave}
      saveText="Salvar"

    >
        {/* Campo 1: Nome Completo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
          Nome Completo
        </label>
        <input
          type="text"
          name="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Campos 2 e 3: Senha e Cpf (Lado a lado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
            Senha
          </label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
            Cpf
          </label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Campo 4: Endereço */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
          Endereço
        </label>
        <input
          type="text"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Campo 5: Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 [font-family:Roboto,sans-serif]">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>
    </EditarModalBase>
  );
}
