import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  APP_OWNER = 'APP_OWNER',
  THEATRE_OWNER = 'THEATRE_OWNER',
  USER = 'USER',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const UserSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), required: true },
});

export default mongoose.model<IUser>('User', UserSchema);
