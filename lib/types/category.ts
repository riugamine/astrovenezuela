export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
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