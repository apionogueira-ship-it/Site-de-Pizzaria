import { Product } from "../types";

export const DEFAULT_PRODUCTS: Product[] = [
  // Pizzas Tradicionais
  {
    id: "1",
    category: "Pizzas Tradicionais",
    name: "Calabresa",
    description: "Molho artesanal de tomate, muçarela de búfala, calabresa fatiada de primeira qualidade, cebola roxa fresca e azeitonas pretas chilenas.",
    price: 42.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "2",
    category: "Pizzas Tradicionais",
    name: "Margherita Especial",
    description: "Molho de tomate fresco, muçarela premium, rodelas de tomate selecionadas, manjericão fresco gigante e um fio generoso de azeite extra virgem.",
    price: 39.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "3",
    category: "Pizzas Tradicionais",
    name: "Quatro Queijos",
    description: "Combinação perfeita de Muçarela, Catupiry Original, Gorgonzola Dolce e Parmesão ralado na hora sobre molho de tomate.",
    price: 46.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "4",
    category: "Pizzas Tradicionais",
    name: "Portuguesa Clássica",
    description: "Presunto cozido fatiado, muçarela, ovos cozidos, cebola, ervilhas frescas e azeitonas pretas temperadas com orégano.",
    price: 44.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60"
  },

  // Pizzas Especiais
  {
    id: "5",
    category: "Pizzas Especiais",
    name: "Parma com Rúcula",
    description: "Muçarela especial, fatias finas de Presunto de Parma importado, folhas frescas de rúcula selvagem, lascas de queijo Grana Padano e redução de balsâmico.",
    price: 54.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "6",
    category: "Pizzas Especiais",
    name: "Quatro Cogumelos",
    description: "Mix premium de cogumelos frescos (Shimeji, Shiitake, Paris e Portobello) salteados no vinho branco, muçarela e toque de azeite trufado.",
    price: 56.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1604917621956-10dfa7cce2e7?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "7",
    category: "Pizzas Especiais",
    name: "Frango Premium com Catupiry",
    description: "Peito de frango desfiado temperado com ervas finas, milho verde cozido no vapor, muçarela e Catupiry Original legítimo.",
    price: 45.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
  },

  // Pizzas Doces
  {
    id: "8",
    category: "Pizzas Doces",
    name: "Nutella Premium com Morango",
    description: "Creme de avelã Nutella legítimo espalhado generosamente sobre massa crocante, fatias de morango fresco e raspas de chocolate branco.",
    price: 42.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "9",
    category: "Pizzas Doces",
    name: "Doce de Leite com Banana",
    description: "Doce de leite Viçosa cremoso, bananas fatiadas caramelizadas, pitadas de canela em pó e muçarela gratinada levemente.",
    price: 39.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=60"
  },

  // Bebidas
  {
    id: "10",
    category: "Bebidas",
    name: "Coca-Cola Original 350ml",
    description: "Lata trincando de gelada para acompanhar seu pedido.",
    price: 6.50,
    availability: true,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "11",
    category: "Bebidas",
    name: "Guaraná Antarctica 350ml",
    description: "Lata bem gelada do refrigerante sabor do Brasil.",
    price: 6.00,
    availability: true,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "12",
    category: "Bebidas",
    name: "Suco Natural de Laranja 500ml",
    description: "Espremido na hora, 100% puro e sem adição de conservantes ou açúcar.",
    price: 9.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "13",
    category: "Bebidas",
    name: "Cerveja Heineken Long Neck",
    description: "Cerveja Lager premium gelada. Proibido o consumo para menores de 18 anos.",
    price: 11.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=60"
  },

  // Sobremesas
  {
    id: "14",
    category: "Sobremesas",
    name: "Petit Gâteau com Sorvete",
    description: "Bolo quente de chocolate belga com recheio cremoso, acompanhado de uma bola de sorvete de creme e calda de chocolate.",
    price: 19.90,
    availability: true,
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "15",
    category: "Sobremesas",
    name: "Panna Cotta de Frutas Vermelhas",
    description: "Sobremesa italiana clássica de creme de leite cozido com fava de baunilha, coberta com uma coulis brilhante de frutas vermelhas silvestre.",
    price: 16.90,
    availability: false, // For testing unavailable item styling
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60"
  }
];

export const AVAILABLE_CRUSTS = [
  { id: "tradicional", name: "Massa Tradicional", price: 0 },
  { id: "borda-catupiry", name: "Borda Recheada de Catupiry", price: 8.00 },
  { id: "borda-cheddar", name: "Borda Recheada de Cheddar", price: 8.00 },
  { id: "borda-chocolate", name: "Borda Recheada de Chocolate", price: 10.00 },
];

export const AVAILABLE_EXTRAS = [
  { id: "queijo-extra", name: "Queijo Extra", price: 5.50 },
  { id: "bacon-extra", name: "Bacon Crocante Extra", price: 6.00 },
  { id: "cebola-extra", name: "Cebola Roxa Extra", price: 2.00 },
  { id: "tomate-extra", name: "Tomate Extra", price: 2.50 },
  { id: "alho-frito", name: "Alho Frito Extra", price: 3.00 },
];
