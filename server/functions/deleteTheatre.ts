import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import Theatre from '../models/theatre';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function deleteTheatre(event: any) {
  await connectDB();
  const { id } = JSON.parse(event.body || '{}');
  if (!mongoose.Types.ObjectId.isValid(id)) return { statusCode: 400, body: 'Invalid id' };

  await Theatre.findByIdAndDelete(id);
  return { statusCode: 200, body: 'Deleted' };
};


export const handler = withAuth(deleteTheatre, { roles: [Role.APP_OWNER] });