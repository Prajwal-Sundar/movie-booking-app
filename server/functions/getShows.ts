import { Handler } from '@netlify/functions';
import { connectDB } from '../connection';
import Show from '../models/show';

export const handler: Handler = async () => {
  await connectDB();
  const shows = await Show.find();
  return { statusCode: 200, body: JSON.stringify(shows) };
};
