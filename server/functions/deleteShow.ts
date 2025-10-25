import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import Show from '../models/show';
import mongoose from 'mongoose';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function deleteShow(event: any) {
  await connectDB();
  const { id } = JSON.parse(event.body || '{}');
  if (!mongoose.Types.ObjectId.isValid(id)) return { statusCode: 400, body: 'Invalid id' };

  await Show.findByIdAndDelete(id);
  return { statusCode: 200, body: 'Deleted' };
};

export const handler = withAuth(deleteShow, { roles: [Role.THEATRE_OWNER] });