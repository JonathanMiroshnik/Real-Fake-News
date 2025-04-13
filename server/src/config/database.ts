import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
  });
};

export default connectDatabase;
