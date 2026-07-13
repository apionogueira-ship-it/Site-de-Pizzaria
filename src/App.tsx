import { useState, useEffect } from "react";
import { Product, CartItem, PizzeriaConfig, DEFAULT_CONFIG } from "./types";
import { DEFAULT_PRODUCTS } from "./data/defaultMenu";
import { fetchMenuData } from "./utils/dataLoader";
import AdminPanel from "./components/AdminPanel";
import ProductModal from "./components/ProductModal";
import CartDrawer from "./components/CartDrawer";
import { 
  ShoppingBag, 
  Settings, 
  Search, 
  Clock, 
  Truck, 
  DollarSign, 
  Info, 
  MapPin, 
  Phone,
  AlertCircle,
  Menu,
  Heart,
  ChevronRight,
  Unlock,
  Lock
} from "lucide-react";

export default function App() {
  // Config state
  const [config, setConfig] = useState<PizzeriaConfig>(() => {
    const saved = localStorage.getItem("pizzeria_config");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Hidden Admin lock/unlock mechanism
  const [isAdminModeUnlocked, setIsAdminModeUnlocked] = useState(() => {
    // Check if previously unlocked in this session
    return sessionStorage.getItem("admin_unlocked") === "true";
  });
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState<string | undefined>(undefined);
  const [adminSuccess, setAdminSuccess] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("pizzeria_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation / Search state
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals / Panels toggles
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check URL params on mount
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("admin") === "true" || queryParams.get("gerente") === "true") {
      setIsAdminModeUnlocked(true);
      sessionStorage.setItem("admin_unlocked", "true");
      setShowUnlockNotification(true);
      setTimeout(() => setShowUnlockNotification(false), 4000);
    }
  }, []);

  // Clear logo click count after inactivity
  useEffect(() => {
    if (titleClickCount > 0) {
      const timer = setTimeout(() => setTitleClickCount(0), 2500);
      return () => clearTimeout(timer);
    }
  }, [titleClickCount]);

  const handleTitleClick = () => {
    setTitleClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminModeUnlocked(true);
        sessionStorage.setItem("admin_unlocked", "true");
        setShowUnlockNotification(true);
        setTimeout(() => setShowUnlockNotification(false), 5000);
        setIsAdminOpen(true);
        return 0;
      }
      return next;
    });
  };

  // Load menu data whenever sheetUrl changes
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setDataError(undefined);
      const res = await fetchMenuData(config.sheetUrl);
      setProducts(res.products);
      if (res.error) {
        setDataError(res.error);
      }
      setIsLoading(false);
    }
    loadData();
  }, [config.sheetUrl]);

  // Set initial category when products load
  useEffect(() => {
    if (products.length > 0) {
      const categories = Array.from(new Set(products.map((p) => p.category)));
      if (categories.length > 0 && !categories.includes(activeCategory)) {
        setActiveCategory(categories[0]);
      }
    }
  }, [products]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("pizzeria_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("pizzeria_cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch / Reload products manually
  const handleReloadData = async () => {
    setIsLoading(true);
    setDataError(undefined);
    const res = await fetchMenuData(config.sheetUrl);
    setProducts(res.products);
    if (res.error) {
      setDataError(res.error);
    }
    setIsLoading(false);
  };

  // Save admin panel modifications
  const handleSaveConfig = (newConfig: PizzeriaConfig) => {
    setConfig(newConfig);
    setAdminSuccess(true);
    setTimeout(() => setAdminSuccess(false), 4000);
  };

  // Cart Handlers
  const handleAddToCart = (item: Omit<CartItem, "cartId">) => {
    // Generate a unique Cart ID based on product, crust, extras, and notes
    const sortedExtras = [...item.selectedExtras].map((e) => e.id).sort().join(",");
    const cartId = `${item.product.id}-${item.selectedCrust.id}-${sortedExtras}-${item.notes.trim()}`;

    setCart((prevCart) => {
      const existingItemIdx = prevCart.findIndex((i) => i.cartId === cartId);
      if (existingItemIdx > -1) {
        // Item with same modifications exists, update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIdx].quantity += item.quantity;
        return updatedCart;
      } else {
        // Add as a new distinct item
        return [...prevCart, { ...item, cartId }];
      }
    });
  };

  const handleUpdateQuantity = (cartId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(cartId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveItem = (cartId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  // Computed data
  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If searching, ignore active category tab to make finding products easier!
    const matchesCategory = searchQuery ? true : product.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemUnitPrice =
      item.product.price +
      item.selectedCrust.price +
      item.selectedExtras.reduce((s, e) => s + e.price, 0);
    return sum + itemUnitPrice * item.quantity;
  }, 0);

  return (
    <div id="main-container" className="min-h-screen bg-slate-950 font-sans text-slate-100 relative overflow-hidden flex items-center justify-center p-0 md:py-12 md:px-8">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-orange-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-12 lg:gap-16">
        
        {/* Left Column: Mobile App Preview */}
        <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
          {/* 
            This acts as a premium mobile preview framing wrapper on large screens,
            and displays as a fluid, full-screen viewport on actual phone screens.
          */}
          <div className="w-full max-w-md min-h-screen md:min-h-[780px] md:max-h-[820px] md:h-[820px] md:rounded-[3rem] bg-white shadow-2xl flex flex-col relative overflow-hidden md:border-[8px] md:border-slate-800 text-slate-900 transition-all duration-300">
            
            {/* Banner header with controls */}
            <div className="relative h-48 shrink-0 bg-orange-950">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800"
                alt="Pizzeria background"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Top buttons overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="bg-white/15 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.isOpen ? "bg-green-500 animate-pulse" : "bg-orange-500"}`} />
                  {config.isOpen ? "Aberto para Pedidos" : "Fechado Hoje"}
                </span>

                {/* Admin toggle gear icon - only visible if unlocked */}
                {isAdminModeUnlocked ? (
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full transition shadow-md border border-green-500 cursor-pointer animate-pulse"
                    title="Configurações do Cardápio (Ativo)"
                  >
                    <Settings className="w-5 h-5 animate-spin-slow" />
                  </button>
                ) : (
                  // Secret subtle lock button that unlocks on click as alternative or click title
                  <button
                    onClick={handleTitleClick}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-white/10 hover:text-white/30 rounded-full transition cursor-pointer"
                    title="Área de Clientes"
                  >
                    <Lock className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Toast de desbloqueio */}
              {showUnlockNotification && (
                <div className="absolute top-16 left-4 right-4 z-50 bg-slate-900 border border-green-500 text-green-400 p-2.5 rounded-xl text-center shadow-xl flex items-center justify-center gap-2 animate-bounce">
                  <Unlock className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Painel de Gerente Liberado!</span>
                </div>
              )}

              {/* Brand/Branding Section inside Hero */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h1 
                  onClick={handleTitleClick}
                  className="text-2xl font-black font-display tracking-tight drop-shadow-md uppercase text-orange-500 cursor-pointer select-none active:scale-95 transition"
                  title="Toque 5 vezes para gerenciar"
                >
                  {config.name}
                </h1>
                <p className="text-xs text-white/85 flex items-center gap-1 mt-1 drop-shadow-sm truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-orange-500" />
                  <span>{config.address}</span>
                </p>
              </div>
            </div>

            {/* Mini stats dashboard strip */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100 text-center py-3 px-2 shrink-0">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>Preparo</span>
                </div>
                <span className="text-xs font-black text-gray-800 mt-0.5">{config.deliveryTime}</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <Truck className="w-3.5 h-3.5 text-orange-500" />
                  <span>Entrega</span>
                </div>
                <span className="text-xs font-black text-gray-800 mt-0.5">
                  {config.deliveryFee === 0 
                    ? "Grátis" 
                    : `R$ ${config.deliveryFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                  <span>Mínimo</span>
                </div>
                <span className="text-xs font-black text-gray-800 mt-0.5">
                  R$ {config.minOrder.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Search bar */}
            <div className="p-3 shrink-0 bg-white">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar pizza, refrigerante, sobremesa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-100 hover:border-gray-200 focus:border-orange-500 focus:bg-white text-xs p-3.5 pl-9 rounded-xl outline-hidden transition"
                />
              </div>
            </div>

            {/* Categories scroll menu (Disabled when searching) */}
            {!searchQuery && categories.length > 0 && (
              <div className="px-3 py-1 bg-white border-b border-gray-100 shrink-0 overflow-x-auto no-scrollbar flex gap-2">
                {categories.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`text-xs font-bold py-2 px-4 rounded-full whitespace-nowrap transition cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-orange-600 text-white shadow-sm"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Data load status errors */}
            {dataError && (
              <div className="m-3 p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 text-xs flex items-start gap-2 animate-fade-in shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{dataError}</span>
              </div>
            )}

            {/* Pizzeria Closed Banner */}
            {!config.isOpen && (
              <div className="mx-3 mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-xs flex items-start gap-2 shrink-0">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
                <div>
                  <span className="font-bold">Estamos Fechados no Momento!</span>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Você pode navegar pelo cardápio e montar seu carrinho, mas o envio de pedidos está temporariamente bloqueado.
                  </p>
                </div>
              </div>
            )}

            {/* Products list area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3.5 pb-24 bg-gray-50/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                  <span className="text-xs text-gray-500 font-medium">Carregando cardápio dinâmico...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <span className="text-3xl">🍕</span>
                  <div>
                    <h3 className="font-bold text-gray-700 text-sm">Nenhum item encontrado</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tente ajustar a busca ou confira outras categorias.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {searchQuery && (
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider pt-1 pl-1">
                      Resultados da busca por "{searchQuery}"
                    </div>
                  )}

                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => product.availability && setSelectedProduct(product)}
                      className={`bg-white p-3 rounded-2xl border border-gray-100 flex gap-3 shadow-xs hover:shadow-md transition duration-200 ${
                        product.availability ? "cursor-pointer" : "opacity-65"
                      }`}
                    >
                      {/* Left: text info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-gray-800 truncate">{product.name}</h3>
                            {!product.availability && (
                              <span className="bg-orange-100 text-orange-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0">
                                Esgotado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 leading-normal line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-black text-green-600">
                            R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          
                          {product.availability ? (
                            <div className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white p-1 px-3.5 rounded-full font-extrabold text-[11px] transition flex items-center gap-1">
                              <span>Adicionar</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-semibold">Indisponível</span>
                          )}
                        </div>
                      </div>

                      {/* Right: product photo */}
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🍕
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Floating Cart bar (bottom of the mobile screen) */}
            {cart.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl p-3.5 flex items-center justify-between shadow-2xl border border-orange-500 transition cursor-pointer animate-slide-up"
                   onClick={() => setIsCartOpen(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingBag className="w-5 h-5 fill-white text-orange-600" />
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-zinc-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-600 shadow-sm animate-pulse">
                      {cartItemsCount}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Ver Sacola</p>
                    <p className="text-xs font-black">
                      R$ {cartSubtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                <span className="text-xs font-black uppercase tracking-wider bg-white/15 py-1 px-3.5 rounded-lg border border-white/10 flex items-center gap-1">
                  <span>Carrinho</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            )}

            {/* Admin Configuration Drawer */}
            <AdminPanel
              isOpen={isAdminOpen}
              onClose={() => setIsAdminOpen(false)}
              config={config}
              onSaveConfig={handleSaveConfig}
              isLoading={isLoading}
              onReload={handleReloadData}
              error={dataError}
              isSuccess={adminSuccess}
            />

            {/* Product Customizer Detail Modal */}
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
            />

            {/* Shopping Cart Drawer */}
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              config={config}
            />
            
          </div>
          <p className="mt-3 text-slate-500 text-xs font-medium text-center hidden md:block">
            Visualização Responsiva Mobile-First
          </p>
        </div>

        {/* Right Column: Control Panel & Docs for Owner OR Elegant Brand Presentation for Customers */}
        <div className="hidden md:flex flex-col flex-1 max-w-lg text-slate-100 self-stretch justify-center">
          {isAdminModeUnlocked ? (
            /* Admin Mode Unlocked: Show Sheet Integration Docs */
            <div className="space-y-6">
              <div className="mb-2">
                <span className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Painel Administrativo Ativo
                </span>
                <h2 className="text-3xl lg:text-4xl font-black font-display tracking-tight mt-3 mb-2 text-white">
                  Sua Pizzaria no <span className="text-orange-500">Google Sheets</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Gerencie produtos, preços, descrições e fotos de forma gratuita direto de uma planilha, com pedidos enviados instantaneamente ao seu WhatsApp.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 lg:p-8 space-y-5 backdrop-blur-md shadow-xl">
                <h3 className="text-base font-bold flex items-center gap-2.5 text-white">
                  <span className="w-7 h-7 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center text-xs font-extrabold">1</span>
                  Como estruturar sua planilha?
                </h3>
                
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">ID Único</p>
                    <p className="text-xs font-mono text-orange-400 font-semibold">id</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Nome Prato</p>
                    <p className="text-xs font-mono text-orange-400 font-semibold">name</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Preço Unitário</p>
                    <p className="text-xs font-mono text-orange-400 font-semibold">price</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                  <p className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>Crie as colunas: <code className="text-orange-400 font-mono">id</code>, <code className="text-orange-400 font-mono">category</code>, <code className="text-orange-400 font-mono">name</code>, <code className="text-orange-400 font-mono">description</code>, <code className="text-orange-400 font-mono">price</code>, <code className="text-orange-400 font-mono">availability</code> e <code className="text-orange-400 font-mono">image</code>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>Vá em <strong className="text-slate-200">Arquivo &gt; Compartilhar &gt; Publicar na Web</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>Publique como <strong className="text-slate-200">Valores separados por vírgulas (.csv)</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>Cole o link gerado abrindo o painel de configurações (ícone de engrenagem) no topo do smartphone ao lado.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>Qualquer alteração na planilha se refletirá no cardápio de forma instantânea!</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex gap-3">
                  <div className="flex-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] uppercase text-slate-500 font-bold mb-1">Sincronização</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${config.sheetUrl ? "bg-green-500 animate-pulse" : "bg-orange-500"}`}></div>
                      <span className="text-[11px] font-bold text-slate-300">
                        {config.sheetUrl ? "Planilha Ativa" : "Dados Locais"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 text-right">
                    <p className="text-[9px] uppercase text-slate-500 font-bold mb-1">WhatsApp Pizzaria</p>
                    <span className="text-[11px] font-bold text-green-400">
                      {config.whatsappNumber ? `+${config.whatsappNumber}` : "Não configurado"}
                    </span>
                  </div>
                </div>

                {/* Lock out button */}
                <button
                  onClick={() => {
                    setIsAdminModeUnlocked(false);
                    sessionStorage.removeItem("admin_unlocked");
                  }}
                  className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-700/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-orange-500" />
                  Sair do Modo de Configuração
                </button>
              </div>
            </div>
          ) : (
            /* Customer View: Elegant Brand Presentation */
            <div className="space-y-8 animate-fade-in">
              <div>
                <span className="bg-orange-500/10 text-orange-400 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-orange-500/20">
                  🍕 Pizzaria Artesanal Premium
                </span>
                <h2 className="text-4xl lg:text-5xl font-black font-display tracking-tight mt-4 mb-3 text-white uppercase leading-tight">
                  {config.name}
                </h2>
                <p className="text-slate-400 text-base leading-relaxed">
                  Experiência gastronômica única com massas de fermentação lenta, molho de tomate italiano artesanal e ingredientes selecionados assados com perfeição.
                </p>
              </div>

              {/* Pizza benefits grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl backdrop-blur-md">
                  <span className="text-2xl">🔥</span>
                  <h4 className="font-bold text-sm text-white mt-2">Forno de Pedra</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Calor intenso constante para uma borda perfeitamente aerada e crocante.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl backdrop-blur-md">
                  <span className="text-2xl">🌾</span>
                  <h4 className="font-bold text-sm text-white mt-2">Fermentação 48h</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Massa extremamente leve, de fácil digestão e sabor inigualável.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl backdrop-blur-md">
                  <span className="text-2xl">🍅</span>
                  <h4 className="font-bold text-sm text-white mt-2">Ingredientes Premium</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Queijos selecionados, manjericão fresco e molho de tomate artesanal.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl backdrop-blur-md">
                  <span className="text-2xl">⚡</span>
                  <h4 className="font-bold text-sm text-white mt-2">Pedido WhatsApp</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Monte sua sacola ao lado e envie o pedido instantaneamente de forma rápida.</p>
                </div>
              </div>

              {/* How it works info */}
              <div className="bg-orange-600/10 border border-orange-500/20 rounded-2xl p-5 space-y-3.5 backdrop-blur-md">
                <h4 className="font-bold text-sm text-orange-400 flex items-center gap-2">
                  <span>📱</span> Como fazer seu pedido por aqui:
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-1">
                    <span className="w-5 h-5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded-full flex items-center justify-center mx-auto">1</span>
                    <p className="text-[11px] text-slate-300 font-bold">Escolha</p>
                    <p className="text-[9px] text-slate-400">Monte seus itens no cardápio interativo</p>
                  </div>
                  <div className="space-y-1 border-x border-slate-800/80 px-2">
                    <span className="w-5 h-5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded-full flex items-center justify-center mx-auto">2</span>
                    <p className="text-[11px] text-slate-300 font-bold">Personalize</p>
                    <p className="text-[9px] text-slate-400">Escolha bordas, extras e observações</p>
                  </div>
                  <div className="space-y-1">
                    <span className="w-5 h-5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded-full flex items-center justify-center mx-auto">3</span>
                    <p className="text-[11px] text-slate-300 font-bold">Envie</p>
                    <p className="text-[9px] text-slate-400">Confirme seus dados e mande pelo WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
