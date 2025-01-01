import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI as string;
        if (!mongoURI) {
            throw new Error("MONGO_URI not defined in environment variables");
        }
        
        mongoose
          .connect(process.env.MONGO_URI as string)
          .then(() => console.log('MongoDB connected...'))
          .catch((err) => console.error('MongoDB connection failed:', err));
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error; 
    }
};

export default connectDB;
