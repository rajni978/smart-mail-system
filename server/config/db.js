import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo DB connected successfully");
  } catch (error) {
    console.log("Failed to connect mongo db");
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;