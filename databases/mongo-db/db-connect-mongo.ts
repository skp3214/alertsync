import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Please define MONGODB_URI in your environment variables");
}
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnectMongo(): Promise<Connection> {
  if (cached.conn) {
    console.log("✅ Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log("🚀 Database connected successfully");
      return mongoose.connection;
    }).catch((err) => {
      console.error("❌ Database connection failed:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnectMongo;