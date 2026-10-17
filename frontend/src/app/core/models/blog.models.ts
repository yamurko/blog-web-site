export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface Category {
  id?: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  summary?: string;
  authorId: number;
  authorUsername: string;
  category?: Category;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostRequest {
  title: string;
  content: string;
  summary?: string;
  categoryId?: number;
  tags?: string[];
  published?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
