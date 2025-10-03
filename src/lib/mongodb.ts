import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env");
}

declare global {
  var mongooseCache:
    | {
        conn?: mongoose.Connection;
        promise?: Promise<mongoose.Connection>;
      }
    | undefined;
}

if (!globalThis.mongooseCache) globalThis.mongooseCache = {};

export async function connectDB() {
  if (!globalThis.mongooseCache) globalThis.mongooseCache = {};

  if (globalThis.mongooseCache.conn) {
    return globalThis.mongooseCache.conn;
  }

  if (!globalThis.mongooseCache.promise) {
    globalThis.mongooseCache.promise = mongoose
      .connect(MONGODB_URI!)
      .then((mongooseInstance) => mongooseInstance.connection);
  }

  globalThis.mongooseCache.conn = await globalThis.mongooseCache.promise;
  return globalThis.mongooseCache.conn;
}
