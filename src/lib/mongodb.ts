import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env");
}

declare global {
  var mongooseCache:
    | {
        conn?: typeof mongoose;
        promise?: Promise<typeof mongoose>;
      }
    | undefined;
}

if (!global.mongooseCache) global.mongooseCache = {};

export async function connectDB() {
  if (!global.mongooseCache) {
    return;
  }

  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache?.promise) {
    global.mongooseCache.promise = mongoose
      .connect(MONGODB_URI!)
      .then((x) => x);
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}
