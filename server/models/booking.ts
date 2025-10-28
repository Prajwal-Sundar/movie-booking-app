import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  show: mongoose.Types.ObjectId;
  seats: string[];
  isCancelled: boolean;
}

const BookingSchema: Schema = new Schema<IBooking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: { type: [String], required: true },
  isCancelled: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
