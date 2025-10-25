import mongoose, { Document, Schema } from 'mongoose';

export interface IShow extends Document {
  theatre: mongoose.Types.ObjectId;
  movieName: string;
  date: Date;
  time: string;
  screenNumber: number;
}

const ShowSchema: Schema = new Schema<IShow>({
  theatre: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true },
  movieName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  screenNumber: { type: Number, required: true },
});

export default mongoose.models.Show || mongoose.model<IShow>('Show', ShowSchema);
