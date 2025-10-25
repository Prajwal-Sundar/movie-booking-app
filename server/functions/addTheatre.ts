import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import Theatre from '../models/theatre';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function addTheatre(event: any) {
  await connectDB();
  const body = JSON.parse(event.body || '{}');
  const theatre = new Theatre(body);
  await theatre.save();
  return { statusCode: 200, body: JSON.stringify(theatre) };
};

export const handler = withAuth(addTheatre, { roles: [Role.APP_OWNER] });