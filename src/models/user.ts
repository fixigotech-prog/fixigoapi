export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string | null;
  role: 'admin' | 'customer' | 'cleaner';
  createdAt: Date;
  updatedAt: Date;
}
