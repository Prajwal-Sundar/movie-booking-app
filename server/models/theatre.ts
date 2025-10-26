import mongoose, { Schema, Document, Types } from "mongoose";

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
  ownerId: Types.ObjectId;
}

const ScreenSchema: Schema<IScreen> = new Schema({
  screenNumber: { type: Number, required: true },
  rows: { type: Number, required: true },
  cols: { type: Number, required: true },
});

const TheatreSchema: Schema<ITheatre> = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    numberOfScreens: { type: Number, required: true },
    screens: { type: [ScreenSchema], required: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Theatre ||
  mongoose.model<ITheatre>("Theatre", TheatreSchema);
