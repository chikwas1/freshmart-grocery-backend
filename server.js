// server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// P2 FIX: Validate required environment variables at startup
if (!MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI is missing from environment variables.');
  process.exit(1);
}

let server;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1); // Exit non-zero on connection failure
  });

// P2 FIX: Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error during database disconnection:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
