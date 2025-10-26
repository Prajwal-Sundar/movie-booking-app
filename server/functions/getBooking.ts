import { Handler } from "@netlify/functions";
import mongoose from "mongoose";
import { connectDB } from "../connection";
import Booking from "../models/booking";
import "../models/user"; // ensure User schema is registered
import "../models/show"; // ensure Show schema is registered

export const handler: Handler = async (event) => {
  try {
    await connectDB();

    // 🔍 Extract query parameters
    const params = event.queryStringParameters || {};
    const bookingId = params.bookingId;
    const userId = params.userId;

    // 🧾 Validate required params
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Invalid or missing bookingId parameter.",
        }),
      };
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Invalid or missing userId parameter.",
        }),
      };
    }

    // 🎟️ Fetch the booking
    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("show")
      .lean();

    if (!booking) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message: `Booking with ID ${bookingId} not found.`,
        }),
      };
    }

    // 🔒 Authorization check
    if (booking.user?._id?.toString() !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          message: "Forbidden: You are not authorized to view this booking.",
        }),
      };
    }

    console.log("🎟️ Fetched booking:", booking);

    // ✅ Success
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Booking ${bookingId} retrieved successfully for user ${userId}.`,
        data: booking,
      }),
    };
  } catch (err: any) {
    console.error("❌ Error fetching booking:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      }),
    };
  }
};
