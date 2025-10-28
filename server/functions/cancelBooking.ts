import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import { Booking } from '../models';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth';
import { Role } from '../models/user';

async function cancelBooking(event: any) {
  await connectDB();

  const { bookingId } = JSON.parse(event.body || '{}');
  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    return { statusCode: 400, body: 'Invalid bookingId' };
  }

  // Instead of deleting, mark as cancelled
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { $set: { isCancelled: true } },
    { new: true } // returns the updated document
  );

  if (!updatedBooking) {
    return { statusCode: 404, body: 'Booking not found' };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: updatedBooking,
    }),
  };
}

export const handler = withAuth(cancelBooking, { roles: [Role.USER] });
