export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category_id?: string;
  category?: {
    name: string;
    slug: string;
  };
  unit?: string; // e.g. "1 kg", "500g", "1L", "5 kg Pack", "Packet"
  sizes?: string[]; // Variant options e.g. ["500g", "1 kg", "5 kg"]
  tags?: string[];
  is_active: boolean;
  is_featured: boolean;
  stock_count?: number;
  created_at?: string;
  updated_at?: string;
}
