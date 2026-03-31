import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./lib/db.js";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import mongoose from "mongoose";
import redisEventBus from "./lib/redisEventBus.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "https://shashi-nellivalasa.github.io"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(express.json());
connectDB();

app.use(
  cors({
    origin: ["http://localhost:4200", "https://shashi-nellivalasa.github.io"], // whitelist allowed origins
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

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/auth", userRouter);
app.use("/api", chatRouter);

import jwt from "jsonwebtoken";
import User from "./models/user.js";

// Socket.io connection handling with Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decode = jwt.verify(token, process.env.JWT_TOKEN);
    const user = await User.findById(decode.userName).select("-password");
    
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user information to socket
    socket.user = user;
    next();
  } catch (error) {
    console.log("Socket Authentication Error:", error.message);
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("An authenticated user connected:", socket.user.userName, "| Socket ID:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.userName} joined room ${roomId}`);
  });

  socket.on("send_message", (data) => {
    // Expecting data to have { roomId, message, senderId }
    socket.to(data.roomId).emit("receive_message", data);
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Subscribe to backend events via Message Queue
redisEventBus.subscribe("message.created", (messageData) => {
  // When a message is created via API, emit to the specific room
  // Extract roomId handling populated or unpopulated `room` object
  const roomId = messageData.room?._id || messageData.room;
  if (roomId) {
    io.to(roomId.toString()).emit("receive_message", messageData);
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server is running! http://localhost:${process.env.PORT || 3000}/`,
  );
});
