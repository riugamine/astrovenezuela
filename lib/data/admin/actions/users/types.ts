export interface UserData {
  email: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'customer';
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}