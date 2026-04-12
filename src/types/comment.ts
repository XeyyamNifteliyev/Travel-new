export interface BlogComment {
  id: string;
  blogId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
}
