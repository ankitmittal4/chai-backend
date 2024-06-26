import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { app } from "../app.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    // console.log("MongoDB connected: ", connectionInstance.connections);
    console.log(
      `MongoDB connected: Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection Failed: ", error);
    process.exit(1);
  }
};
export default connectDB;
