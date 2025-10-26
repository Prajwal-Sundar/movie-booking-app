import { Handler } from "@netlify/functions";
import { connectDB } from "../connection";
import Theatre from "../models/theatre";
import { withAuth } from "../withAuth";
import { Role } from "../models/user";

const getTheatres: Handler = async () => {
  try {
    await connectDB();

    // 🎭 Fetch all theatres and include owner info
    const theatres = await Theatre.find()
      .populate("ownerId", "name email role")
      .lean();

    // 🧩 Rename `ownerId` → `owner` for frontend clarity
    const formatted = theatres.map(({ ownerId, ...rest }) => ({
      ...rest,
      owner: ownerId,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Theatres retrieved successfully.",
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

export const handler = withAuth(getTheatres, {
  roles: [Role.APP_OWNER, Role.THEATRE_OWNER, Role.USER],
});
