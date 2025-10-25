import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import Theatre from '../models/theatre';

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function getTheatres(event: any) {
  await connectDB();
  const theatres = await Theatre.find();
  return { statusCode: 200, body: JSON.stringify(theatres) };
};

export const handler = withAuth(getTheatres, { roles: [Role.APP_OWNER, Role.THEATRE_OWNER, Role.USER] });