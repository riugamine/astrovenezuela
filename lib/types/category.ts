export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string; // Self-referential relatio
  created_at: string;
  updated_at: string;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
};