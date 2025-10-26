import { Handler } from "@netlify/functions";
import { connectDB } from "../connection";
import Theatre from "../models/theatre";
import User, { Role } from "../models/user";
import { withAuth } from "../withAuth";

const addTheatre: Handler = async (event: any) => {
  try {
    await connectDB();

    const body = JSON.parse(event.body || "{}");
    const { name, location, numberOfScreens, screens, ownerId } = body;

    // 🧩 Validate required fields
    if (!name || !location || !numberOfScreens || !screens?.length || !ownerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message:
            "Missing required fields: name, location, numberOfScreens, screens, ownerId.",
        }),
      };
    }

    // 🔍 Validate Owner
    const owner = await User.findById(ownerId);

    if (!owner) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message: "Owner not found. Please provide a valid ownerId.",
        }),
      };
    }

    if (owner.role !== Role.THEATRE_OWNER) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          message: "Provided user is not a theatre owner.",
        }),
      };
    }

    // 🎭 Create and save theatre
    const theatre = new Theatre({
      name,
      location,
      numberOfScreens,
      screens,
      ownerId,
    });

    await theatre.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Theatre added successfully.",
        data: theatre,
      }),
    };
  } catch (err: any) {
    console.error("❌ Error adding theatre:", err);
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

// ✅ Restrict to App Owner role
export const handler = withAuth(addTheatre, { roles: [Role.APP_OWNER] });
