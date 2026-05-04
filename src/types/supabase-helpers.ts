import type { User } from '@supabase/supabase-js';

export type { User } from '@supabase/supabase-js';

export interface ProfileRow {
  id: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  facebook: string | null;
  updated_at: string | null;
}

export interface BlogListItem {
  id: string;
  title: string;
  status: 'published' | 'draft';
  language: string | null;
  created_at: string;
  views: number;
  likes: number;
}

export interface CompanionItem {
  id: string;
  destination_country: string;
  destination_city: string | null;
  departure_date: string;
  return_date: string | null;
  status: 'open' | 'filled' | 'cancelled';
  gender_preference: string | null;
  interests: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  youtube_url: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface UserCountryItem {
  id: string;
  country_slug: string;
  visited_at: string | null;
}
