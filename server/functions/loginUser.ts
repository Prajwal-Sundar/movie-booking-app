import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const handler: Handler = async (event) => {
  try {
    await connectDB();

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    const { email, password } = JSON.parse(event.body);

    // 🧩 Validate inputs
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email and password are required' }),
      };
    }

    // 🔍 Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No account found with this email.' }),
      };
    }

    // 🔐 Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Incorrect password. Please try again.' }),
      };
    }

    // 🪪 Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // ✅ Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
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
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error - Please contact admin',
      }),
    };
  }
};
