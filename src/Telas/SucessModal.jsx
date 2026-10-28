import imgCheck from "../Imagens/imgCheck.png";

export default function SucessoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative w-[28vw] min-w-[320px] h-[32vh] min-h-[220px] bg-[#EBF0F7] rounded-xl shadow-2xl flex flex-col items-center justify-center p-6 overflow-hidden border border-gray-300">
        
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-600 pointer-events-none"></div>

        
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-600 pointer-events-none"></div>

        {/* Conteúdo do Popup */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <img
            src={imgCheck}
            alt="Check de Sucesso"
            className="w-16 h-16 mb-4 object-contain"
          />
          <h3 className="text-2xl font-bold text-gray-900 [font-family:Roboto,sans-serif]">
            Cadastro realizado com sucesso!
          </h3>
        </div>

        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-sm font-bold z-20"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
