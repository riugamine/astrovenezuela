import { Database } from '@/lib/types/database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export interface ServerResponse<T> {
  data: T | null;
  error: Error | null;
}