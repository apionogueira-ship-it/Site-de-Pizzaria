import React, { useState } from "react";
import { PizzeriaConfig } from "../types";
import { X, HelpCircle, Save, Database, Settings, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: PizzeriaConfig;
  onSaveConfig: (newConfig: PizzeriaConfig) => void;
  isLoading: boolean;
  onReload: () => void;
  error?: string;
  isSuccess?: boolean;
}

export default function AdminPanel({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  isLoading,
  onReload,
  error,
  isSuccess,
}: AdminPanelProps) {
  const [formData, setFormData] = useState<PizzeriaConfig>({ ...config });
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "deliveryFee" || name === "minOrder" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleStatusToggle = () => {
    setFormData((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
  };

  return (
    <div id="admin-panel" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-gray-800">Painel de Controle</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          {/* Status feedback */}
          {error && (
            <div className="p-3 bg-orange-50 text-orange-700 text-xs rounded-lg flex items-start gap-2 border border-orange-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg flex items-start gap-2 border border-green-100 animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Configurações salvas e dados atualizados com sucesso!</span>
            </div>
          )}

          {/* Quick status switch */}
          <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
            <div>
              <h3 className="font-semibold text-sm text-gray-800">Status da Pizzaria</h3>
              <p className="text-xs text-gray-500">
                {formData.isOpen ? "Aberto - Aceitando pedidos" : "Fechado - Apenas visualização"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStatusToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                formData.isOpen ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.isOpen ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Nome da Pizzaria
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  WhatsApp (com DDD)
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="Ex: 5511999999999"
                  required
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
                />
                <span className="text-[10px] text-gray-400">Apenas números (DDI+DDD+Cel)</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Tempo de Entrega
                </label>
                <input
                  type="text"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  placeholder="Ex: 40-50 min"
                  required
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Taxa de Entrega (R$)
                </label>
                <input
                  type="number"
                  name="deliveryFee"
                  step="0.01"
                  min="0"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Pedido Mínimo (R$)
                </label>
                <input
                  type="number"
                  name="minOrder"
                  step="0.01"
                  min="0"
                  value={formData.minOrder}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Endereço da Pizzaria
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden resize-none"
              />
            </div>

            {/* Google Sheets Section */}
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1">
                  <Database className="w-4 h-4" /> Banco de Dados do Cardápio
                </span>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Como Fazer?
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Link CSV/Planilha Google (opcional)
                </label>
                <input
                  type="url"
                  name="sheetUrl"
                  value={formData.sheetUrl}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                  className="w-full p-2.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
                />
              </div>

              {formData.sheetUrl ? (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-green-700 font-medium">✓ Planilha Customizada Ativa</span>
                  <button
                    type="button"
                    onClick={onReload}
                    disabled={isLoading}
                    className="text-[10px] bg-white border border-gray-200 text-gray-700 py-1 px-2 rounded-md hover:bg-gray-50 flex items-center gap-1 shadow-xs font-medium disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} /> Recarregar
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 leading-normal">
                  Nenhum link configurado. O aplicativo está rodando de forma estável utilizando o <strong>Cardápio Padrão</strong> embutido.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Alterações
            </button>
          </form>

          {/* Guide section */}
          {(showGuide || !formData.sheetUrl) && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4 animate-fade-in">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1">
                📖 Tutorial de Integração com Google Sheets
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Você pode gerenciar todo o seu cardápio de forma gratuita pelo Google Sheets! Basta seguir estes passos:
              </p>
              
              <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-2.5 leading-relaxed">
                <li>
                  Crie uma nova planilha no <strong>Google Drive / Sheets</strong>.
                </li>
                <li>
                  Na <strong>primeira linha</strong> (cabeçalho), crie as colunas exatamente com estes nomes:
                  <div className="grid grid-cols-2 gap-1 mt-1 bg-white p-2 rounded-md border border-gray-200 text-[10px] font-mono text-gray-700">
                    <div>• <span className="font-bold text-orange-600">id</span> (número único)</div>
                    <div>• <span className="font-bold text-orange-600">category</span> (categoria)</div>
                    <div>• <span className="font-bold text-orange-600">name</span> (nome do prato)</div>
                    <div>• <span className="font-bold text-orange-600">description</span> (descrição)</div>
                    <div>• <span className="font-bold text-orange-600">price</span> (preço, ex: 42.90)</div>
                    <div>• <span className="font-bold text-orange-600">availability</span> (sim / nao)</div>
                    <div className="col-span-2">• <span className="font-bold text-orange-600">image</span> (link completo de imagem)</div>
                  </div>
                </li>
                <li>
                  Adicione seus produtos nas linhas seguintes respeitando o formato. Exemplo:
                  <ul className="list-disc pl-4 mt-1 bg-gray-100 p-1.5 rounded-sm text-[10px] font-mono text-gray-600">
                    <li>id: 1</li>
                    <li>category: Pizzas</li>
                    <li>name: Calabresa</li>
                    <li>description: Molho, muçarela, calabresa e cebola</li>
                    <li>price: 39.90</li>
                    <li>availability: sim</li>
                    <li>image: https://images.unsplash.com/...</li>
                  </ul>
                </li>
                <li>
                  Vá em <strong>Arquivo</strong> &gt; <strong>Compartilhar</strong> &gt; <strong>Publicar na Web</strong>.
                </li>
                <li>
                  Selecione a aba da planilha desejada (ex: <strong>Página1</strong>), mude o formato de "Página da Web" para <strong>Valores separados por vírgula (.csv)</strong>.
                </li>
                <li>
                  Clique em <strong>Publicar</strong> e confirme.
                </li>
                <li>
                  <strong>Copie o link</strong> gerado e cole no campo acima!
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
