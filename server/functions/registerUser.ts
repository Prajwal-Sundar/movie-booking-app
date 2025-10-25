import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import User, { Role } from '../models/user';
import bcrypt from 'bcryptjs';

export const handler: Handler = async (event) => {
  await connectDB();
  const body = JSON.parse(event.body || '{}');
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) return { statusCode: 400, body: 'Missing fields' };
  if (!Object.values(Role).includes(role)) return { statusCode: 400, body: 'Invalid role' };

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, role });
  await user.save();
  return { statusCode: 200, body: JSON.stringify(user) };
};
