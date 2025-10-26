import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import { Booking, Show } from '../models';
import mongoose from 'mongoose';
import { withAuth } from '../withAuth';
import { Role } from '../models/user';

async function bookSeats(event: any) {
  console.log("🟢 [BOOK_SEATS] Function triggered");

  // --- 1️⃣ Connect to DB ---
  await connectDB();
  console.log("✅ MongoDB connected");

  // --- 2️⃣ Log raw request info ---
  console.log("📩 Raw event info:");
  console.log("   Method:", event.httpMethod);
  console.log("   Headers:", JSON.stringify(event.headers, null, 2));
  console.log("   Body:", event.body);

  // --- 3️⃣ Parse request body safely ---
  let parsedBody: any = {};
  try {
    parsedBody = JSON.parse(event.body || '{}');
  } catch (err) {
    console.error("❌ Failed to parse JSON body:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: "Invalid JSON payload",
      }),
    };
  }

  const { userId, showId, seats } = parsedBody;

  console.log("🧾 Parsed booking data:", {
    userId,
    showId,
    seats,
    seatType: Array.isArray(seats) ? "Array" : typeof seats,
  });

  // --- 4️⃣ Basic validation ---
  if (!userId || !showId || !Array.isArray(seats) || seats.length === 0) {
    console.error("❌ Validation failed: Missing or invalid fields", {
      userId,
      showId,
      seats,
    });
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: "Missing or invalid fields",
        debug: { userId, showId, seats },
      }),
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(showId)
  ) {
    console.error("❌ Invalid ObjectId format detected:", { userId, showId });
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: "Invalid userId or showId",
      }),
    };
  }

  // --- 5️⃣ Fetch and log show details ---
  console.log("🔍 Fetching show:", showId);
  const show = await Show.findById(showId).populate('theatre');
  if (!show) {
    console.error("❌ Show not found:", showId);
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        message: "Show not found",
      }),
    };
  }

  console.log("🎬 Found show:", {
    movie: show.movieName || show.name,
    theatre: show.theatre?.name,
    screenNumber: show.screenNumber,
  });

  const theatre: any = show.theatre;
  const screen = theatre?.screens?.find(
    (s: any) => s.screenNumber === show.screenNumber
  );

  if (!screen) {
    console.error("❌ Screen not found for show:", show.screenNumber);
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        message: "Screen not found for this show",
      }),
    };
  }

  const rows = screen.rows;
  const columns = screen.cols;
  console.log(`🪑 Screen details: rows=${rows}, columns=${columns}`);

  // --- 6️⃣ Validate and convert seat coordinates ---
  const seatLabel = (row: number, col: number) =>
    `${String.fromCharCode(65 + row)}${col + 1}`;

  const seatLabels: string[] = [];
  for (const [row, col] of seats) {
    console.log(`🎟️ Processing seat [${row}, ${col}]`);

    if (
      typeof row !== "number" ||
      typeof col !== "number" ||
      row < 0 ||
      col < 0 ||
      row >= rows ||
      col >= columns
    ) {
      console.error("❌ Invalid seat coordinates:", { row, col });
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: `Invalid seat coordinates: [${row}, ${col}]`,
        }),
      };
    }
    seatLabels.push(seatLabel(row, col));
  }

  console.log("✅ Seat labels generated:", seatLabels);

  // --- 7️⃣ Check for existing bookings ---
  console.log("🔎 Checking for existing bookings for show:", showId);
  const existingBookings = await Booking.find({
    show: showId,
    seats: { $in: seatLabels },
  });

  if (existingBookings.length) {
    const conflictSeats = existingBookings.flatMap((b) => b.seats);
    console.warn("⚠️ Seat conflict detected:", conflictSeats);
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: "One or more selected seats are already booked",
        debug: { conflictingSeats: conflictSeats },
      }),
    };
  }

  // --- 8️⃣ Save booking ---
  console.log("🪄 Creating new booking:", {
    user: userId,
    show: showId,
    seats: seatLabels,
  });

  const booking = new Booking({
    user: userId,
    show: showId,
    seats: seatLabels,
  });
  await booking.save();

  console.log("✅ Booking saved successfully:", booking._id);

  // --- 9️⃣ Return success ---
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: "Seats booked successfully.",
      bookedSeats: seats, // return in 2D integer format
      bookingId: booking._id,
    }),
  };
}

export const handler = withAuth(bookSeats, { roles: [Role.USER] });
