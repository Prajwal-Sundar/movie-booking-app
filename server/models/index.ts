import mongoose from 'mongoose';
import TheatreModel, { ITheatre } from './theatre';
import ShowModel, { IShow } from './show';
import UserModel from './user';
import BookingModel from './booking';

export const Theatre = mongoose.models.Theatre || TheatreModel;
export const Show = mongoose.models.Show || ShowModel;
export const User = mongoose.models.User || UserModel;
export const Booking = mongoose.models.Booking || BookingModel;