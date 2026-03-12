import express from "express";
import {
  getRooms,
  createRoom,
  getRoom,
  getMessages,
  createMessage,
} from "../controllers/chatController.js";
import protectRoute from "../middleware/auth.js";

const chatRouter = express.Router();

// All chat routes are protected
chatRouter.use(protectRoute);

chatRouter.get("/rooms", getRooms);
chatRouter.post("/rooms", createRoom);
chatRouter.get("/rooms/:id", getRoom);
chatRouter.get("/rooms/:id/messages", getMessages);
chatRouter.post("/rooms/:id/messages", createMessage);

export default chatRouter;
