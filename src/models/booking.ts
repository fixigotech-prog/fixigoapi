export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
