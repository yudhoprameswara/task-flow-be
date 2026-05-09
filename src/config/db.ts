import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process if connection fails (fail-fast strategy).
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ FATAL ERROR: MONGODB_URI is not defined in environment variables.');
    console.error('👉 Please set MONGODB_URI in your Render Dashboard (Environment tab).');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.error('❌ FATAL ERROR: MongoDB connection error:', error.message);
    console.error('👉 Check if your IP is whitelisted in MongoDB Atlas or if the credentials are correct.');
    process.exit(1);
  }
};
