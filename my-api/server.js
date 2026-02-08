import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./lib/db.js";
// import User from "./models/user.js";
import bcrypt from "bcryptjs";
import http from "http";
import userRouter from "./routes/userRoutes.js";

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

app.use("/api/server", async (req, res) => res.send("api is ready"));

app.use("/auth", userRouter);

server.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT}/`);
});
