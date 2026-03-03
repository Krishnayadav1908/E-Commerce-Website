const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

if (process.env.NODE_ENV !== 'test') {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Skipping database connection.');
  } else {
    // Connect to MongoDB with optimized settings
    mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority',
      // Compression for faster data transfer
      compressors: ['snappy', 'zlib'],
    })
      .then(() => {
        console.log('Connected to MongoDB with optimized connection pool');
      })
      .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
      });

    // Handle connection errors
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected!');
    });
  }
}
