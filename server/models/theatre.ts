import mongoose, { Schema, Document } from 'mongoose';

export interface IScreen {
  screenNumber: number;
  rows: number;
  cols: number;
}

export interface ITheatre extends Document {
  name: string;
  location: string;
  numberOfScreens: number;
  screens: IScreen[];
}

const ScreenSchema: Schema = new Schema<IScreen>({
  screenNumber: { type: Number, required: true },
  rows: { type: Number, required: true },
  cols: { type: Number, required: true },
});

const TheatreSchema: Schema = new Schema<ITheatre>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  numberOfScreens: { type: Number, required: true },
  screens: { type: [ScreenSchema], required: true },
});

export default mongoose.models.Theatre || mongoose.model<ITheatre>('Theatre', TheatreSchema);
