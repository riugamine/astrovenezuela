export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string; // Self-referential relatio
  created_at: string;
  updated_at: string;
};
