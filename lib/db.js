import mongoose from 'mongoose';
import dns from 'dns';

// Fix for DNS resolution with MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  // Ignore in environments where setServers is restricted
}

// Direct standard ReplicaSet URI for maximum reliability across ISPs, routers, and serverless runtimes
const DIRECT_ATLAS_URI = 'mongodb://Workplace-Hub:wLEEBnP2FkArldxp@ac-sp2ysyt-shard-00-00.20m3mar.mongodb.net:27017,ac-sp2ysyt-shard-00-01.20m3mar.mongodb.net:27017,ac-sp2ysyt-shard-00-02.20m3mar.mongodb.net:27017/workplace_hub?ssl=true&replicaSet=atlas-kta6wm-shard-0&authSource=admin&retryWrites=true&w=majority';

function getEffectiveUri() {
  const envUri = process.env.MONGODB_URI;
  if (!envUri) return DIRECT_ATLAS_URI;
  // If the env URI is using SRV for this cluster, direct shard is preferred to prevent querySrv ECONNREFUSED
  if (envUri.includes('cluster-book-worm.20m3mar.mongodb.net') && envUri.startsWith('mongodb+srv://')) {
    return DIRECT_ATLAS_URI;
  }
  return envUri;
}

const MONGODB_URI = getEffectiveUri();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .catch(async (err) => {
        console.warn('Initial connect failed, retrying with direct replicaSet URI...', err.message);
        return mongoose.connect(DIRECT_ATLAS_URI, opts);
      })
      .then((mongooseInstance) => {
        console.log('Successfully connected to MongoDB Atlas');
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
