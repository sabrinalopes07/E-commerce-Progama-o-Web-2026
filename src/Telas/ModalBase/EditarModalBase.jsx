export default function EditarModalBase({
  isOpen,
  onClose,
  onBack,
  title,
  children,
  onCancel,
  onSave,
  saveText = "Salvar",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      {/* Caixa principal do Modal com fundo #EBF0F7 e padding de 32px */}
      <div className="relative w-full max-w-[650px] bg-[#EBF0F7] rounded-xl shadow-2xl p-8 flex flex-col max-h-[90vh] overflow-y-auto border border-gray-300">
        {/* Botão Voltar (<) */}
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-800 text-xl font-bold hover:text-blue-600 transition mb-4 w-fit"
          >
            &lt;
          </button>
        )}

        {/* Título */}
        {title && (
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 [font-family:Roboto,sans-serif]">
            {title}
          </h2>
        )}

        {/* Conteúdo / Campos (com espaçamento padrão) */}
        <div className="space-y-4 mb-8">{children}</div>

        {/* Botões de Ação (Cancelar e Salvar) */}
        <div className="flex items-center justify-end gap-3 mt-auto pt-4 border-t border-gray-300/60">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg bg-gray-400 text-white text-sm font-semibold hover:bg-gray-500 transition [font-family:Roboto,sans-serif]"
            >
              Cancelar
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md [font-family:Roboto,sans-serif]"
            >
              {saveText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
