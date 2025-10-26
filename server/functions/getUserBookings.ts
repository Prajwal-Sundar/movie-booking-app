import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import { Booking } from '../models';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function getUserBookings(event: any) {
  await connectDB();

  const { userId } = event.queryStringParameters || {};
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { statusCode: 400, body: 'Invalid userId' };
  }

  const bookings = await Booking.find({ user: userId }).populate('show');
  console.log(bookings);
  return { statusCode: 200, body: JSON.stringify(bookings) };
};

export const handler = withAuth(getUserBookings, { roles: [Role.USER] });