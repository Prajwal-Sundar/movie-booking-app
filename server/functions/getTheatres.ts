import { Handler } from "@netlify/functions";
import { connectDB } from "../connection";
import Theatre from "../models/theatre";
import { withAuth } from "../withAuth";
import { Role } from "../models/user";

const getTheatres: Handler = async (event) => {
  try {
    await connectDB();

    // 🧩 Read optional ownerId query param
    const params = event.queryStringParameters || {};
    const ownerId = params.ownerId;

    // 🎭 Build query conditionally
    const query = ownerId ? { ownerId } : {};

    // 🏛️ Fetch theatres (filtered if ownerId provided)
    const theatres = await Theatre.find(query)
      .populate("ownerId", "name email role")
      .lean();

    // 🧠 Rename ownerId → owner for frontend clarity
    const formatted = theatres.map(({ ownerId, ...rest }) => ({
      ...rest,
      owner: ownerId,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: ownerId
          ? `Theatres owned by ${ownerId} retrieved successfully.`
          : "All theatres retrieved successfully.",
        data: formatted,
      }),
    };
  } catch (err: any) {
    console.error("❌ Error fetching theatres:", err);
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

// ✅ Keep same roles (backward compatible)
export const handler = withAuth(getTheatres, {
  roles: [Role.APP_OWNER, Role.THEATRE_OWNER, Role.USER],
});
