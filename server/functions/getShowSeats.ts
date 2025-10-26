import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import { Show, Theatre, Booking } from '../models';
import mongoose from 'mongoose';
import { withAuth } from '../withAuth';
import { Role } from '../models/user';

async function getShowSeats(event: any) {
  await connectDB();

  const { showId } = event.queryStringParameters || {};
  if (!showId || !mongoose.Types.ObjectId.isValid(showId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: 'Invalid showId',
      }),
    };
  }

  // ✅ Only populate theatre — no movie populate
  const show = await Show.findById(showId).populate('theatre');
  if (!show) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        message: 'Show not found',
      }),
    };
  }

  // ✅ Get all bookings for this show
  const bookings = await Booking.find({ show: show._id });
  const bookedSeats = bookings.flatMap((b) => b.seats);

  // ✅ Extract theatre details
  const theatre: any = show.theatre;
  const screen = theatre.screens?.find(
    (s: any) => s.screenNumber === show.screenNumber
  );

  if (!screen) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        message: 'Screen not found in theatre',
      }),
    };
  }

  // ✅ Convert seat labels like "B5" into 2D grid coordinates
  const bookedSeatLocations: number[][] = bookedSeats.map((seatLabel: string) => {
    const rowChar = seatLabel[0].toUpperCase();
    const rowIndex = rowChar.charCodeAt(0) - 65;
    const colIndex = parseInt(seatLabel.slice(1)) - 1;
    return [rowIndex, colIndex];
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'All seats retrieved successfully.',
      rows: screen.rows,
      columns: screen.cols,
      bookedSeats: bookedSeatLocations,

      // ✅ Include extra show/theatre info
      movieName: show.movieName || 'Unknown Movie',
      showTime: show.time || 'Unknown Time',
      showDate: show.date || null,
      theatreName: theatre?.name || 'Unknown Theatre',
      theatreLocation: theatre?.location || 'Unknown Location',
      screenNumber: show.screenNumber || 1,
    }),
  };
}

// ✅ Keep withAuth wrapper for token validation
export const handler = withAuth(getShowSeats, { roles: [Role.USER] });
