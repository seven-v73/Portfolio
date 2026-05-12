import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  return mongoose.connection;
}
