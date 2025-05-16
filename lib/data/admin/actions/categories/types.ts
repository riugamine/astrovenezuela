export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface CategoryData {
  name: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  is_active?: boolean;
}