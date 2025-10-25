import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import { Booking } from '../models';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function cancelBooking(event: any) {
  await connectDB();

  const { bookingId } = JSON.parse(event.body || '{}');
  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    return { statusCode: 400, body: 'Invalid bookingId' };
  }

  await Booking.findByIdAndDelete(bookingId);
  return { statusCode: 200, body: 'Deleted' };
};

export const handler = withAuth(cancelBooking, { roles: [Role.USER] });