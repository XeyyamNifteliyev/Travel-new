export interface YouTubeLink {
  id: string;
  userId: string;
  youtubeUrl: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  destinationCountry?: string;
  destinationCity?: string;
  language: 'az' | 'ru' | 'en';
  views: number;
  likes: number;
  status: 'active' | 'hidden';
  createdAt: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface YouTubeFormData {
  youtubeUrl: string;
  title: string;
  description?: string;
  destinationCountry?: string;
  destinationCity?: string;
  language: 'az' | 'ru' | 'en';
}
