import { Handler } from "@netlify/functions";
import { connectDB } from "../connection";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const handler: Handler = async (event) => {
  console.log("🔹 [LOGIN] Function triggered at:", new Date().toISOString());
  console.log("🔹 [LOGIN] Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI ? "✅ Present" : "❌ Missing",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ Present" : "❌ Missing",
  });

  try {
    await connectDB();
    console.log("✅ [LOGIN] Database connection successful");

    if (!event.body) {
      console.warn("⚠️ [LOGIN] Missing request body");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    const { email, password } = JSON.parse(event.body);
    console.log("📩 [LOGIN] Received payload:", { email });

    // 🧩 Validate inputs
    if (!email || !password) {
      console.warn("⚠️ [LOGIN] Missing email or password");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email and password are required" }),
      };
    }

    // 🔍 Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.warn("❌ [LOGIN] User not found for email:", email);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No account found with this email." }),
      };
    }

    console.log("👤 [LOGIN] Found user:", {
      id: user._id,
      email: user.email,
      role: user.role,
      hashPrefix: user.password?.substring(0, 10),
    });

    // 🔐 Validate password
    let normalizedHash = user.password;
    if (normalizedHash.startsWith("$2y$")) {
      normalizedHash = normalizedHash.replace(/^\$2y/, "$2a");
      console.log("⚙️ [LOGIN] Normalized bcrypt hash prefix from $2y$ → $2a$");
    }

    const isMatch = await bcrypt.compare(password, normalizedHash);
    console.log("🔑 [LOGIN] Password comparison result:", isMatch);

    if (!isMatch) {
      console.warn("❌ [LOGIN] Password mismatch for user:", email);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Incorrect password. Please try again." }),
      };
    }

    // 🪪 Generate JWT
    const secret = process.env.JWT_SECRET || "secret";
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn: "7d" }
    );
    console.log("✅ [LOGIN] JWT generated successfully");

    // ✅ Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }),
    };
  } catch (error: any) {
    console.error("💥 [LOGIN] Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error - Please contact admin",
        error: error.message,
      }),
    };
  }
};
