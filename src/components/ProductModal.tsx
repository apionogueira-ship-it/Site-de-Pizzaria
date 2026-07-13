import { useState, useEffect } from "react";
import { Product, CustomOption, CartItem } from "../types";
import { AVAILABLE_CRUSTS, AVAILABLE_EXTRAS } from "../data/defaultMenu";
import { X, Plus, Minus, Check, ShoppingBag, MessageSquare } from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (cartItem: Omit<CartItem, "cartId">) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedCrust, setSelectedCrust] = useState<CustomOption>(AVAILABLE_CRUSTS[0]);
  const [selectedExtras, setSelectedExtras] = useState<CustomOption[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedCrust(AVAILABLE_CRUSTS[0]);
      setSelectedExtras([]);
      setNotes("");
    }
  }, [product]);

  if (!product) return null;

  const isPizza = product.category.toLowerCase().includes("pizza");

  const toggleExtra = (extra: CustomOption) => {
    setSelectedExtras((prev) =>
      prev.some((item) => item.id === extra.id)
        ? prev.filter((item) => item.id !== extra.id)
        : [...prev, extra]
    );
  };

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Calculate current price
  const basePrice = product.price;
  const crustPrice = isPizza ? selectedCrust.price : 0;
  const extrasPrice = isPizza ? selectedExtras.reduce((sum, item) => sum + item.price, 0) : 0;
  const unitPrice = basePrice + crustPrice + extrasPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart({
      product,
      quantity,
      selectedCrust: isPizza ? selectedCrust : { id: "none", name: "Nenhum", price: 0 },
      selectedExtras: isPizza ? selectedExtras : [],
      notes,
    });
    onClose();
  };

  return (
    <div id="product-modal" className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md h-[88vh] sm:h-auto sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden animate-slide-up shadow-2xl">
        
        {/* Banner/Image Area */}
        <div className="relative h-48 shrink-0 bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-600 font-bold text-lg">
              🍕 {product.name}
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {!product.availability && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-orange-600 text-white font-bold text-sm px-4 py-1.5 rounded-full shadow-lg">
                INDISPONÍVEL HOJE
              </span>
            </div>
          )}
        </div>

        {/* Info & Configurations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h2 className="text-xl font-bold text-gray-800 mt-2">{product.name}</h2>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">{product.description}</p>
            <div className="text-lg font-black text-green-600 mt-2">
              R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {product.availability && (
            <>
              {/* Crust Selection (Pizzas Only) */}
              {isPizza && (
                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                    Selecione a Borda
                  </h3>
                  <div className="space-y-2">
                    {AVAILABLE_CRUSTS.map((crust) => (
                      <label
                        key={crust.id}
                        onClick={() => setSelectedCrust(crust)}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                          selectedCrust.id === crust.id
                            ? "border-orange-500 bg-orange-50/50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedCrust.id === crust.id
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selectedCrust.id === crust.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{crust.name}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                          {crust.price === 0
                            ? "Grátis"
                            : `+ R$ ${crust.price.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras Selection (Pizzas Only) */}
              {isPizza && (
                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                    Ingredientes Extras (Opcional)
                  </h3>
                  <div className="space-y-2">
                    {AVAILABLE_EXTRAS.map((extra) => {
                      const isSelected = selectedExtras.some((item) => item.id === extra.id);
                      return (
                        <label
                          key={extra.id}
                          onClick={() => toggleExtra(extra)}
                          className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                isSelected
                                  ? "border-orange-600 bg-orange-600 text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-medium text-gray-700">{extra.name}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-600">
                            + R$ {extra.price.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Notes / Observações */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span>Observações Especiais</span>
                </div>
                <textarea
                  placeholder="Ex: sem cebola, bem assada, molho extra, talheres..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={140}
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
          {product.availability ? (
            <div className="flex items-center justify-between gap-4">
              {/* Quantity Controls */}
              <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-xs">
                <button
                  onClick={handleDecrement}
                  className="p-2.5 hover:bg-gray-100 rounded-l-xl text-gray-600 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-gray-800 w-10 text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="p-2.5 hover:bg-gray-100 rounded-r-xl text-gray-600 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAdd}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar • R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-400 font-semibold py-3 px-4 rounded-xl text-sm"
            >
              Fora de Estoque temporariamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
