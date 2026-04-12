export interface Blog {
  id: string;
  author_id: string;
  title: string;
  content: string;
  cover_image?: string;
  language: 'az' | 'ru' | 'en';
  tags: string[];
  views: number;
  likes: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

export interface BlogFormData {
  title: string;
  content: string;
  cover_image?: string;
  language: 'az' | 'ru' | 'en';
  tags: string[];
  status: 'draft' | 'published';
}
