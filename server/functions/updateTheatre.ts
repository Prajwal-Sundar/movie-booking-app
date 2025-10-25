import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import Theatre from '../models/theatre';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function updateTheatre(event: any) {
  await connectDB();
  const { id, update } = JSON.parse(event.body || '{}');
  if (!mongoose.Types.ObjectId.isValid(id)) return { statusCode: 400, body: 'Invalid id' };

  const theatre = await Theatre.findByIdAndUpdate(id, update, { new: true });
  return { statusCode: 200, body: JSON.stringify(theatre) };
};

export const handler = withAuth(updateTheatre, { roles: [Role.APP_OWNER] });