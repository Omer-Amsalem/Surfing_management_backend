import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./middleWare/db";
import errorHandler from "./middleWare/errorHandler";
import userRoute from "./routes/userRoute";
import mongoSanitize from "express-mongo-sanitize";
import "./types/types";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import chatRoutes from "./routes/chatRoutes";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import options from "./doc/swagger";
import cors from "cors";
import http from "http";
import path from "path";

dotenv.config();

const app: Application = express();

// --- Swagger Documentation ---
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// --- Middlewares כלליים ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
// CORS – מאפשר עדכון ב־ENV
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Server סטטי ל־uploads (אם קיים)
app.use("/uploads", express.static("uploads"));

// --- Routes של ה־API ---
app.use("/user", userRoute);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/api.gemini.com", chatRoutes);

// --- Serve סטטי של ה־Frontend במצב production ---
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(
      path.join(__dirname, "../../Surfing_management_frontend/dist")
    )
  );
  app.get("*", (_req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "../../Surfing_management_frontend/dist",
        "index.html"
      )
    );
  });
}

// --- Error Handler Middleware (סוף השרשרת) ---
app.use(errorHandler);

// --- התחברות ל־MongoDB והפעלת השרת ---
const PORT = parseInt(process.env.PORT || "5000", 10);

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV === "test") return;

    // תמיד נפתח HTTP רגיל; Render ידאג ל־HTTPS מבחוץ
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, () => {
      console.log(`Server running (HTTP) on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
