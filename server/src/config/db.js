import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[mongo] connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[mongo] connection error:', err.message);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
