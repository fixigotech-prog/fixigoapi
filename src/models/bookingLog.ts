import { bookingStatus } from '../db/schema';

export interface BookingLog {
    id: string;
    bookingId: string;
    status:  'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes?: string | null;
    createdAt: Date;
}
