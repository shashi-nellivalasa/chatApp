import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./lib/db.js";
// import User from "./models/user.js";
import bcrypt from "bcryptjs";
import http from "http";
import userRouter from "./routes/userRoutes.js";
import mongoose from "mongoose";

dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(express.json());
connectDB();

app.use(
  cors({
    origin: ["http://localhost:4200", "https://your-frontend-domain.com"], // whitelist allowed origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.get("/health", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      return res.status(200).send("OK");
    }
    res.status(503).send("DB not ready");
  } catch {
    res.status(500).send("Health check failed");
  }
});

app.use("/auth", userRouter);

server.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT}/`);
});
