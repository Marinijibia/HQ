export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user' | 'executive';
  createdAt: string;
}
