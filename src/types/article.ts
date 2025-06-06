export interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  prompt: string;
  journalId: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Journal {
  articles: Article[];
} 