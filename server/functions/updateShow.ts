import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import Show from '../models/show';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function updateShow(event: any) {
  await connectDB();
  const { id, update } = JSON.parse(event.body || '{}');
  if (!mongoose.Types.ObjectId.isValid(id)) return { statusCode: 400, body: 'Invalid id' };

  const show = await Show.findByIdAndUpdate(id, update, { new: true });
  return { statusCode: 200, body: JSON.stringify(show) };
};

export const handler = withAuth(updateShow, { roles: [Role.THEATRE_OWNER] });