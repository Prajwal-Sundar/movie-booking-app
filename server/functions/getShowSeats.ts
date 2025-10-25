import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import { Show, Theatre, Booking } from '../models';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function getShowSeats(event: any) {
  await connectDB();

  const { showId } = event.queryStringParameters || {};
  if (!showId || !mongoose.Types.ObjectId.isValid(showId)) {
    return { statusCode: 400, body: 'Invalid showId' };
  }

  const show = await Show.findById(showId).populate('theatre');
  if (!show) return { statusCode: 404, body: 'Show not found' };

  const bookings = await Booking.find({ show: show._id });
  const bookedSeats = bookings.flatMap((b) => b.seats);

  const theatre: any = show.theatre;
  const totalSeats: string[] = [];
  theatre.screens
    .filter((s: any) => s.screenNumber === show.screenNumber)
    .forEach((screen: any) => {
      for (let r = 0; r < screen.rows; r++) {
        for (let c = 0; c < screen.cols; c++) {
          totalSeats.push(`${String.fromCharCode(65 + r)}${c + 1}`);
        }
      }
    });

  const availableSeats = totalSeats.filter((seat) => !bookedSeats.includes(seat));

  return { statusCode: 200, body: JSON.stringify({ bookedSeats, availableSeats }) };
};

export const handler = withAuth(getShowSeats, { roles: [Role.USER] });