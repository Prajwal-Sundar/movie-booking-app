import { Handler } from "@netlify/functions";
import { connectDB } from "../connection";
import User, { Role } from "../models/user";
import { withAuth } from "../withAuth";

const getTheatreOwners: Handler = async () => {
  try {
    // 🧠 Connect to DB
    await connectDB();

    // 🎭 Fetch all users who are theatre owners
    const owners = await User.find({ role: Role.THEATRE_OWNER }).select(
      "-password" // exclude sensitive info
    );

    // 📦 Return response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Theatre owners retrieved successfully.",
        data: owners,
      }),
    };
  } catch (err: any) {
    console.error("❌ Error fetching theatre owners:", err);
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

// ✅ Restrict this endpoint to App Owners
export const handler = withAuth(getTheatreOwners, { roles: [Role.APP_OWNER] });
