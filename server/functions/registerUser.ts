import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import User, { Role } from '../models/user';
import bcrypt from 'bcryptjs';

export const handler: Handler = async (event) => {
  try {
    await connectDB();

    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Missing request body' }) };
    }

    const { name, email, password, role } = JSON.parse(event.body);

    if (!name || !email || !password || !role) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Missing required fields' }) };
    }

    if (!Object.values(Role).includes(role)) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Invalid role' }) };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Email is already registered' }) };
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }),
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message,
      }),
    };
  }
};
