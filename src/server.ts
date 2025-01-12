import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./middleWare/db";
import errorHandler from "./middleWare/errorHandler";
import userRoute from "./routes/userRoute";
import mongoSanitize from "express-mongo-sanitize";
import "./types/types";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import cors from "cors";



dotenv.config();


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(cors({origin: "http://localhost:5173" }));
app.use("/uploads", express.static("uploads"));


app.use("/user", userRoute);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);


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