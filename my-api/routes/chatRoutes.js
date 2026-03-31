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
  rejectFriendRequest,
  getNotifications,
  markMessageAsRead,
  cancelFriendRequest,
  removeFriend,
  saveMessage,
  getSavedMessages,
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
chatRouter.post("/friend-request/reject", rejectFriendRequest);
chatRouter.post("/friend-request/cancel", cancelFriendRequest);
chatRouter.get("/friend-request", getFriendRequests);

// friends
chatRouter.post("/friend/remove", removeFriend);

// notifications
chatRouter.get("/notifications", getNotifications);
chatRouter.post("/messages/mark-as-read", markMessageAsRead);

// saved messages
chatRouter.post("/messages/save", saveMessage);
chatRouter.get("/messages/saved", getSavedMessages);

export default chatRouter;
