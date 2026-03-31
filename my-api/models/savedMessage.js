import mongoose from "mongoose";

const savedMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
  },
  { timestamps: true },
);

// Ensure a user can only save a specific message once
savedMessageSchema.index({ user: 1, message: 1 }, { unique: true });

const SavedMessage = mongoose.model("SavedMessage", savedMessageSchema);
export default SavedMessage;
