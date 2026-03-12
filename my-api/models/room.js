import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: String }, // For the preview in your chat-list
  updatedAt: { type: Date, default: Date.now }, // To sort the list (most recent on top)
});

const Room = mongoose.model("Room", RoomSchema);
export default Room;
