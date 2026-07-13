export interface Product {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  availability: boolean;
  image?: string; // Optional image URL
}

export interface CustomOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartId: string; // Unique ID for this item in the cart (since same product can have different options)
  product: Product;
  quantity: number;
  selectedCrust: CustomOption;
  selectedExtras: CustomOption[];
  notes: string;
}

export interface PizzeriaConfig {
  name: string;
  whatsappNumber: string;
  deliveryFee: number;
  minOrder: number;
  deliveryTime: string;
  sheetUrl: string;
  address: string;
  isOpen: boolean;
}

export const DEFAULT_CONFIG: PizzeriaConfig = {
  name: "Bella Italia Pizzaria",
  whatsappNumber: "5511999999999", // Replace with realistic default, user can change in Settings
  deliveryFee: 7.00,
  minOrder: 30.00,
  deliveryTime: "40-60 min",
  sheetUrl: "", // Empty by default, loads fallback data
  address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
  isOpen: true,
};
