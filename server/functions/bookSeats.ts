import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import { Booking } from '../models';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function bookSeats(event: any) {
  await connectDB();

  const { userId, showId, seats } = JSON.parse(event.body || '{}');
  if (!userId || !showId || !seats?.length) {
    return { statusCode: 400, body: 'Missing fields' };
  }
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(showId)) {
    return { statusCode: 400, body: 'Invalid IDs' };
  }

  const existingBookings = await Booking.find({ show: showId, seats: { $in: seats } });
  if (existingBookings.length) {
    return { statusCode: 400, body: 'One or more seats already booked' };
  }

  const booking = new Booking({ user: userId, show: showId, seats });
  await booking.save();

  return { statusCode: 200, body: JSON.stringify(booking) };
};

export const handler = withAuth(bookSeats, { roles: [Role.USER] });