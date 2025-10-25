import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const handler: Handler = async (event) => {
  await connectDB();
  const { email, password } = JSON.parse(event.body || '{}');
  const user = await User.findOne({ email });
  if (!user) return { statusCode: 400, body: 'User not found' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { statusCode: 400, body: 'Incorrect password' };

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
  return { statusCode: 200, body: JSON.stringify({ token }) };
};
