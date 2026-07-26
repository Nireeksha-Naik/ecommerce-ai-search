export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number; // present if the item is on sale
  category: string;
  rating: number; // 0 - 5
  reviewCount: number;
  inStock: boolean;
  image: string;
  description: string;
  tags: string[];
}

export interface SearchResult {
  products: Product[];
  summary: string;
  aiExplanations: Record<string, string>; // productId -> "✨ Matches: ..."
}

export interface SearchFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
}