import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import { Show } from '../models';
import { Theatre } from '../models';
import mongoose from 'mongoose';   // optional if you want to log models

import { withAuth } from '../withAuth'
import { Role } from '../models/user';

async function getShowsUser(event: any) {
  await connectDB();
  console.log('Registered models:', Object.keys(mongoose.models));

  const shows = await Show.find().populate('theatre');
  return { statusCode: 200, body: JSON.stringify(shows) };
};

export const handler = withAuth(getShowsUser, { roles: [Role.USER] });