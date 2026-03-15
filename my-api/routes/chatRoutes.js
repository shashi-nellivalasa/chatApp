import express from "express";
import {
  getRooms,
  createRoom,
  getRoom,
  getMessages,
  createMessage,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
} from "../controllers/chatController.js";

import protectRoute from "../middleware/auth.js";

const chatRouter = express.Router();

chatRouter.use(protectRoute);

// rooms
chatRouter.get("/rooms", getRooms);
chatRouter.post("/rooms", createRoom);
chatRouter.get("/rooms/:id", getRoom);

// messages
chatRouter.get("/rooms/:id/messages", getMessages);
chatRouter.post("/rooms/:id/messages", createMessage);

// friend requests
chatRouter.post("/friend-request", sendFriendRequest);
chatRouter.post("/friend-request/accept", acceptFriendRequest);
chatRouter.get("/friend-request", getFriendRequests);

export default chatRouter;
