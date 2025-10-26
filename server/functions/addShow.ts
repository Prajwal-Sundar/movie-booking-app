import { Handler } from "@netlify/functions";
import { connectDB } from "../connection";
import Show from "../models/show";
import Theatre from "../models/theatre";
import { withAuth } from "../withAuth";
import { Role } from "../models/user";

const addShow: Handler = async (event: any) => {
  try {
    await connectDB();

    const body = JSON.parse(event.body || "{}");
    const { theatreId, ownerId } = body;

    if (!theatreId || !ownerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Theatre ID and Owner ID are required.",
        }),
      };
    }

    // 🎭 Verify the theatre exists
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message: "Theatre not found.",
        }),
      };
    }

    // 🔒 Verify ownership directly from payload
    if (String(theatre.ownerId) !== String(ownerId)) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          message: "You do not own this theatre.",
        }),
      };
    }

    // ✅ Create and save the new show
    const show = new Show({
      ...body,
      theatre: theatreId, // ensure correct field
    });
    await show.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Show added successfully.",
        data: show,
      }),
    };
  } catch (err: any) {
    console.error("❌ Error adding show:", err);
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

export const handler = withAuth(addShow, { roles: [Role.THEATRE_OWNER] });
