const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>')) {
      console.warn('⚠️ MongoDB URI is not fully configured. Using a local fallback or ignoring DB connection to allow app start.');
      // Optional: process.exit(1) if you want to strictly enforce it
      return; 
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
