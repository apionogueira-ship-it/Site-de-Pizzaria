import { useState } from "react";
import { CartItem, PizzeriaConfig } from "../types";
import { X, Trash2, Plus, Minus, Send, ShoppingBag, Truck, Store, CreditCard, DollarSign, AlertTriangle } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onRemoveItem: (cartId: string) => void;
  config: PizzeriaConfig;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  config,
}: CartDrawerProps) {
  // Customer checkout state
  const [clientName, setClientName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"entrega" | "retirada">("entrega");
  
  // Address fields
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");
  const [reference, setReference] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credito" | "debito" | "dinheiro">("pix");
  const [changeFor, setChangeFor] = useState("");

  // Form error validation
  const [validationError, setValidationError] = useState("");

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const basePrice = item.product.price;
    const crustPrice = item.selectedCrust.price;
    const extrasPrice = item.selectedExtras.reduce((s, ext) => s + ext.price, 0);
    return sum + (basePrice + crustPrice + extrasPrice) * item.quantity;
  }, 0);

  const deliveryFee = deliveryMethod === "entrega" ? config.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const isMinOrderMet = subtotal >= config.minOrder;

  const handleSendOrder = () => {
    // Client Name validation
    if (!clientName.trim()) {
      setValidationError("Por favor, preencha o seu nome.");
      const el = document.getElementById("client-name-input");
      el?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Address validation for delivery
    if (deliveryMethod === "entrega") {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setValidationError("Por favor, preencha a Rua, Número e Bairro para entrega.");
        const el = document.getElementById("address-section");
        el?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Cash change validation
    if (paymentMethod === "dinheiro" && changeFor.trim()) {
      const changeVal = parseFloat(changeFor.replace(",", "."));
      if (!isNaN(changeVal) && changeVal < total) {
        setValidationError(`O troco de R$ ${changeVal.toFixed(2)} não pode ser menor que o total de R$ ${total.toFixed(2)}.`);
        return;
      }
    }

    setValidationError("");

    // Build perfect structured WhatsApp message text
    let messageText = `*🍕 NOVO PEDIDO - ${config.name.toUpperCase()}*\n`;
    messageText += `----------------------------------------\n`;
    messageText += `👤 *Cliente:* ${clientName.trim()}\n`;
    messageText += `🛵 *Método:* ${deliveryMethod === "entrega" ? "Entrega em Domicílio" : "Retirada na Loja"}\n`;

    if (deliveryMethod === "entrega") {
      messageText += `\n📍 *Endereço de Entrega:*\n`;
      messageText += `${street.trim()}, ${number.trim()}\n`;
      messageText += `Bairro: ${neighborhood.trim()}\n`;
      if (complement.trim()) messageText += `Complemento: ${complement.trim()}\n`;
      if (reference.trim()) messageText += `Referência: ${reference.trim()}\n`;
    } else {
      messageText += `\n📍 *Endereço de Retirada:*\n`;
      messageText += `${config.address}\n`;
    }

    messageText += `----------------------------------------\n`;
    messageText += `🛒 *Itens do Pedido:*\n\n`;

    cart.forEach((item) => {
      const itemBase = item.product.price;
      const itemCrust = item.selectedCrust.price;
      const itemExtras = item.selectedExtras.reduce((s, ext) => s + ext.price, 0);
      const itemUnitTotal = itemBase + itemCrust + itemExtras;

      messageText += `*${item.quantity}x ${item.product.name}* (R$ ${(itemUnitTotal * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })})\n`;
      
      if (item.selectedCrust.id !== "none" && item.selectedCrust.price > 0) {
        messageText += `  - Borda: ${item.selectedCrust.name} (+ R$ ${item.selectedCrust.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})\n`;
      }
      
      if (item.selectedExtras.length > 0) {
        const extrasStr = item.selectedExtras.map(e => `${e.name} (+ R$ ${e.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`).join(", ");
        messageText += `  - Extras: ${extrasStr}\n`;
      }

      if (item.notes.trim()) {
        messageText += `  - Obs: "${item.notes.trim()}"\n`;
      }
      messageText += `\n`;
    });

    messageText += `----------------------------------------\n`;
    messageText += `💰 *Resumo Financeiro:*\n`;
    messageText += `Subtotal: R$ ${subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
    if (deliveryMethod === "entrega") {
      messageText += `Taxa de Entrega: R$ ${deliveryFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
    }
    messageText += `*Total Geral: R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}*\n\n`;

    messageText += `💳 *Forma de Pagamento:* `;
    if (paymentMethod === "pix") messageText += `PIX\n`;
    if (paymentMethod === "credito") messageText += `Cartão de Crédito\n`;
    if (paymentMethod === "debito") messageText += `Cartão de Débito\n`;
    if (paymentMethod === "dinheiro") {
      messageText += `Dinheiro\n`;
      if (changeFor.trim()) {
        messageText += `  - Levar troco para: R$ ${parseFloat(changeFor.replace(",", ".")).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
      } else {
        messageText += `  - Não precisa de troco\n`;
      }
    }

    messageText += `----------------------------------------\n`;
    messageText += `_Pedido gerado via Cardápio Digital_`;

    // Encode text and create WhatsApp API link
    const encodedText = encodeURIComponent(messageText);
    const cleanNumber = config.whatsappNumber.replace(/\D/g, "");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;

    // Open WhatsApp URL
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div id="cart-drawer" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-gray-50 flex flex-col shadow-2xl overflow-hidden animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-gray-800">Seu Carrinho</h2>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items list or Empty state */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-36">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">Carrinho Vazio</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs px-4">
                  Navegue pelo nosso cardápio de pizzas e bebidas e adicione seus itens favoritos!
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 px-6 rounded-lg transition"
              >
                Voltar ao Cardápio
              </button>
            </div>
          ) : (
            <>
              {/* Cart item list */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 divide-y divide-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Itens Selecionados
                </h3>
                {cart.map((item) => {
                  const itemCrustPrice = item.selectedCrust.price;
                  const itemExtrasPrice = item.selectedExtras.reduce((s, ext) => s + ext.price, 0);
                  const itemUnitPrice = item.product.price + itemCrustPrice + itemExtrasPrice;

                  return (
                    <div key={item.cartId} className="py-3.5 first:pt-0 last:pb-0 flex gap-3">
                      {/* Product Image preview or Pizza Icon */}
                      <div className="w-12 h-12 bg-orange-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-orange-100">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">🍕</span>
                        )}
                      </div>

                      {/* Info and Option Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-800 truncate">{item.product.name}</h4>
                        
                        {/* Selected Crust */}
                        {item.selectedCrust.id !== "none" && item.selectedCrust.price > 0 && (
                          <p className="text-[10px] text-gray-500 font-medium">
                            + {item.selectedCrust.name}
                          </p>
                        )}

                        {/* Selected Extras */}
                        {item.selectedExtras.length > 0 && (
                          <p className="text-[10px] text-gray-500 font-medium truncate">
                            + Extras: {item.selectedExtras.map((e) => e.name).join(", ")}
                          </p>
                        )}

                        {/* Notes */}
                        {item.notes.trim() && (
                          <p className="text-[10px] text-orange-600 font-medium italic truncate mt-0.5">
                            Obs: "{item.notes.trim()}"
                          </p>
                        )}

                        {/* Actions & Price */}
                        <div className="flex items-center justify-between mt-2">
                          {/* Unit Total Price */}
                          <span className="text-xs font-bold text-green-600">
                            R$ {(itemUnitPrice * item.quantity).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>

                          {/* Control Quantity Buttons */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 text-xs">
                              <button
                                onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 rounded-l-lg transition text-gray-500"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 font-bold text-gray-700 min-w-6 text-center select-none text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 rounded-r-lg transition text-gray-500"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => onRemoveItem(item.cartId)}
                              className="p-1 text-gray-400 hover:text-orange-600 transition"
                              title="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery method toggle */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Como deseja receber o pedido?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("entrega")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      deliveryMethod === "entrega"
                        ? "border-orange-500 bg-orange-50/40 text-orange-600 font-bold"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span className="text-xs">Entrega em Casa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("retirada")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      deliveryMethod === "retirada"
                        ? "border-orange-500 bg-orange-50/40 text-orange-600 font-bold"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Store className="w-5 h-5" />
                    <span className="text-xs">Retirar na Pizzaria</span>
                  </button>
                </div>
              </div>

              {/* Client Details Section */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Identificação do Cliente
                </h3>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Seu Nome*
                  </label>
                  <input
                    id="client-name-input"
                    type="text"
                    placeholder="Como devemos te chamar?"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden bg-gray-50/30"
                  />
                </div>
              </div>

              {/* Delivery Address Details (Conditional) */}
              {deliveryMethod === "entrega" && (
                <div id="address-section" className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3 animate-fade-in">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Endereço de Entrega
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        Rua / Avenida*
                      </label>
                      <input
                        type="text"
                        placeholder="Rua..."
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden bg-gray-50/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        Número*
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden bg-gray-50/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        Bairro*
                      </label>
                      <input
                        type="text"
                        placeholder="Bairro..."
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden bg-gray-50/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        Complemento (Apto, Bloco)
                      </label>
                      <input
                        type="text"
                        placeholder="Apto 42, Bloco B"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden bg-gray-50/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Ponto de Referência
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Próximo ao supermercado, farmácia..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden bg-gray-50/30"
                    />
                  </div>
                </div>
              )}

              {/* Payment Method Section */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Forma de Pagamento
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition ${
                      paymentMethod === "pix"
                        ? "border-orange-500 bg-orange-50/40 text-orange-600 font-bold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Pix</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credito")}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition ${
                      paymentMethod === "credito"
                        ? "border-orange-500 bg-orange-50/40 text-orange-600 font-bold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Cartão de Crédito</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("debito")}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition ${
                      paymentMethod === "debito"
                        ? "border-orange-500 bg-orange-50/40 text-orange-600 font-bold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Cartão de Débito</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("dinheiro")}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition ${
                      paymentMethod === "dinheiro"
                        ? "border-orange-500 bg-orange-50/40 text-orange-600 font-bold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Dinheiro</span>
                  </button>
                </div>

                {paymentMethod === "dinheiro" && (
                  <div className="pt-2 animate-fade-in">
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Precisa de troco? Para quanto? (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: R$ 100,00"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-hidden bg-gray-50/30"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="px-4 py-2.5 bg-red-50 border-t border-red-100 text-red-700 text-xs font-semibold flex items-center gap-2 shrink-0 animate-bounce">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Footer Totals & Send Button */}
        {cart.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-2xl shrink-0 space-y-3">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              
              {deliveryMethod === "entrega" && (
                <div className="flex justify-between">
                  <span>Taxa de Entrega</span>
                  <span>R$ {deliveryFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-gray-900 pt-1.5 border-t border-gray-100">
                <span>Total Geral</span>
                <span className="text-green-600">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Minimum Order Verification */}
            {!isMinOrderMet ? (
              <div className="p-2.5 bg-yellow-50 text-yellow-800 text-[11px] rounded-lg border border-yellow-100 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  O valor mínimo de pedido é de <strong>R$ {config.minOrder.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>. Adicione mais R$ {(config.minOrder - subtotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em produtos.
                </span>
              </div>
            ) : (
              <button
                onClick={handleSendOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4 fill-white text-green-600" />
                <span>Enviar Pedido via WhatsApp</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
