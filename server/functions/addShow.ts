import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import Show from '../models/show';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function addShow(event: any) {
  await connectDB();
  const body = JSON.parse(event.body || '{}');
  const show = new Show(body);
  await show.save();
  return { statusCode: 200, body: JSON.stringify(show) };
};

export const handler = withAuth(addShow, { roles: [Role.THEATRE_OWNER] });