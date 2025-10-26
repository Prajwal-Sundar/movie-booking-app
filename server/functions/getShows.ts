import { Handler } from "@netlify/functions";
import mongoose from "mongoose";
import { connectDB } from "../connection";
import Show from "../models/show";

export const handler: Handler = async (event) => {
  try {
    await connectDB();

    // 🎬 Read optional query parameter
    const params = event.queryStringParameters || {};
    const theatreId = params.theatreId;

    // 🧩 Build conditional query (use correct field: theatre)
    const query =
      theatreId && mongoose.Types.ObjectId.isValid(theatreId)
        ? { theatre: new mongoose.Types.ObjectId(theatreId) }
        : {};

    // 📜 Fetch shows (filtered if theatreId provided)
    const shows = await Show.find(query).lean();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: theatreId
          ? `Shows for theatre ${theatreId} retrieved successfully.`
          : "All shows retrieved successfully.",
        data: shows,
      }),
    };
  } catch (err: any) {
    console.error("❌ Error fetching shows:", err);
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
