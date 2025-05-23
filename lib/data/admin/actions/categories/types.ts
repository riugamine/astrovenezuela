export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  banner_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subcategory: string | null; // Nuevo campo
}

export interface CategoryData {
  name: string;
  description?: string | null;
  parent_id?: string | null;
  banner_url?: string | null;
  is_active: boolean;
  slug?: string;
  subcategory?: string | null; // Nuevo campo
}

export interface CategoryWithSubcategories extends Category {
  subcategories?: Category[];
}