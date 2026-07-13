import { Product } from "../types";
import { DEFAULT_PRODUCTS } from "../data/defaultMenu";

/**
 * Parses a CSV string into a list of key-value records.
 * Supports quoted strings to prevent commas in descriptions from breaking the parser.
 */
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse headers and clean BOM or extra quotes
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
  
  const results: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let currentVal = "";
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(currentVal.trim());
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    // Clean outer quotes from values
    const cleanedValues = values.map((v) => {
      let val = v;
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      return val.replace(/""/g, '"'); // Unescape double double-quotes
    });

    const obj: any = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = cleanedValues[index] !== undefined ? cleanedValues[index] : "";
      }
    });
    results.push(obj);
  }
  return results;
}

/**
 * Normalizes values parsed from CSV or JSON to match the Product schema.
 */
export function normalizeProduct(raw: any, index: number): Product {
  const id = raw.id ? String(raw.id).trim() : String(index + 1);
  const category = raw.category ? String(raw.category).trim() : "Outros";
  const name = raw.name ? String(raw.name).trim() : "Item sem nome";
  const description = raw.description ? String(raw.description).trim() : "";
  
  // Handle price conversion (supports "R$ 42,90", "42.90", "42,90")
  let rawPrice = String(raw.price || "0")
    .replace(/[R$\s]/g, "")
    .replace(",", ".");
  let price = parseFloat(rawPrice);
  if (isNaN(price)) price = 0;

  // Handle availability (supports "sim", "nao", "não", "true", "false", "disponivel", "1", "0", etc.)
  const rawAvail = String(raw.availability || "sim").toLowerCase().trim();
  const availability = !(
    rawAvail === "não" ||
    rawAvail === "nao" ||
    rawAvail === "false" ||
    rawAvail === "0" ||
    rawAvail === "indisponível" ||
    rawAvail === "indisponivel"
  );

  const image = raw.image && raw.image.startsWith("http") ? raw.image.trim() : undefined;

  return {
    id,
    category,
    name,
    description,
    price,
    availability,
    image,
  };
}

/**
 * Main function to fetch and load menu products
 */
export async function fetchMenuData(url: string): Promise<{ products: Product[]; error?: string }> {
  if (!url) {
    return { products: DEFAULT_PRODUCTS };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: Código ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const textData = await response.text();

    let rawItems: any[] = [];

    // Check if response is JSON or CSV
    if (contentType.includes("application/json") || textData.trim().startsWith("[") || textData.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(textData);
        rawItems = Array.isArray(parsed) ? parsed : (parsed.products || parsed.items || []);
      } catch (e) {
        // If JSON parsing fails, try to parse as CSV
        rawItems = parseCSV(textData);
      }
    } else {
      // Default to CSV parsing (most typical for published Google Sheets)
      rawItems = parseCSV(textData);
    }

    if (!rawItems || rawItems.length === 0) {
      throw new Error("Não foi possível encontrar nenhum item na URL fornecida.");
    }

    const products = rawItems.map((item, idx) => normalizeProduct(item, idx));
    return { products };
  } catch (err: any) {
    console.error("Error loading menu data:", err);
    return { 
      products: DEFAULT_PRODUCTS, 
      error: `Não foi possível carregar a planilha (${err.message}). Exibindo cardápio padrão.` 
    };
  }
}
