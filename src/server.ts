import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./middleWare/db";
import errorHandler from "./middleWare/errorHandler";
import userRoute from "./routes/userRoute";
import mongoSanitize from "express-mongo-sanitize";
import "./types/types";


dotenv.config();


const app: Application = express();

app.use(express.json());
app.use(mongoSanitize());

app.use("/user", userRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        if (process.env.NODE_ENV === "test") return;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server due to DB connection issue.");
        process.exit(1); 
    }
};

startServer();

export default app;
