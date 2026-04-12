export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  countries_visited: string[];
  created_at: string;
}
