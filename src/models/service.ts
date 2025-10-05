export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
