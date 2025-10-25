import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  show: mongoose.Types.ObjectId;
  seats: string[]; // e.g., ["A1", "A2"]
}

const BookingSchema: Schema = new Schema<IBooking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: { type: [String], required: true },
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
