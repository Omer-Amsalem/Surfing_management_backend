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
import cors from "cors";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static("uploads"));

app.use("/user", userRoute);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/api.gemini.com", chatRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(
      path.join(__dirname, "../../Surfing_management_frontend/dist")
    )
  );

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "../../Surfing_management_frontend/dist",
        "index.html"
      )
    );
  });
}

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV === "test") return;
    if (process.env.NODE_ENV !== "production") {
      const httpServer = http.createServer(app);
      httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
      return;
    }
    http
      .createServer((req, res) => {
        res.writeHead(301, {
          Location: "https://" + req.headers.host + req.url,
        });
        res.end();
      })
      .listen(80, () => {
        console.log("Redirecting HTTP to HTTPS");
      });
    const options = {
      key: fs.readFileSync("./client-key.pem"),
      cert: fs.readFileSync("./client-cert.pem"),
    };
    const httpsServer = https.createServer(options, app);
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`Server running on port ${HTTPS_PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    console.error("Failed to start the server due to DB connection issue.");
    process.exit(1);
  }
};

startServer();

export default app;
