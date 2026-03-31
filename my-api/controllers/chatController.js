import Room from "../models/room.js";
import Message from "../models/message.js";
import FriendRequest from "../models/friendRequest.js";
import SavedMessage from "../models/savedMessage.js";
import redisEventBus from "../lib/redisEventBus.js";

// Get all rooms for the authenticated user
export const getRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const rooms = await Room.find({
      participants: { $in: [userId] },
    }).populate("participants", "-password");

    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { participants } = req.body;
    const userId = req.user._id;

    if (!participants.includes(userId.toString())) {
      participants.push(userId.toString());
    }

    // check if room already exists between these users
    const existingRoom = await Room.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (existingRoom) {
      return res.status(200).json({
        success: true,
        room: existingRoom,
        message: "Room already exists",
      });
    }

    const newRoom = await Room.create({
      participants,
    });

    const populatedRoom = await newRoom.populate("participants", "-password");

    res.status(201).json({ success: true, room: populatedRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific room
export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate("participants", "-password");

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found." });
    }

    // Check if user is a participant
    if (
      !room.participants.some(
        (p) => p._id.toString() === req.user._id.toString(),
      )
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access to this room." });
    }

    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for a specific room
export const getMessages = async (req, res) => {
  try {
    const { id: roomId } = req.params;
    const messages = await Message.find({ room: roomId })
      .populate("sender", "userName email")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new message in a room
export const createMessage = async (req, res) => {
  try {
    const { id: roomId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required" });
    }

    const newMessage = await Message.create({
      room: roomId,
      sender: userId,
      content,
    });

    const populatedMessage = await newMessage.populate(
      "sender",
      "userName email",
    );

    // Update the room's last message and updatedAt
    await Room.findByIdAndUpdate(roomId, {
      lastMessage: content,
      updatedAt: Date.now(),
    });

    res.status(201).json({ success: true, message: populatedMessage });

    // Publish to Message Queue
    redisEventBus.publish('message.created', populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const sender = req.user._id;
    const { receiver } = req.body;

    if (sender.toString() === receiver) {
      return res.status(400).json({
        success: false,
        message: "You cannot send request to yourself",
      });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Request already exists",
      });
    }

    const request = await FriendRequest.create({
      sender,
      receiver,
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // ensure only receiver can accept
    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    request.status = "accepted";
    await request.save();

    // check if room already exists
    const existingRoom = await Room.findOne({
      participants: { $all: [request.sender, request.receiver], $size: 2 },
    });

    if (existingRoom) {
      return res.json({
        success: true,
        room: existingRoom,
      });
    }

    const newRoom = await Room.create({
      participants: [request.sender, request.receiver],
    });

    const populatedRoom = await newRoom.populate("participants", "-password");

    res.json({
      success: true,
      room: populatedRoom,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "userName firstName lastName profilePicUrl");

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ success: true, message: "Friend request rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get pending friend requests
    const friendRequests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "userName firstName lastName profilePicUrl");

    // 2. Get unread messages
    // First find all rooms the user is in
    const rooms = await Room.find({ participants: userId });

    // For each room, find unread messages from others
    const unreadMessagesData = [];
    for (const room of rooms) {
      const unreadCount = await Message.countDocuments({
        room: room._id,
        sender: { $ne: userId },
        isRead: false,
      });

      if (unreadCount > 0) {
        // Get the latest unread message for context
        const lastUnread = await Message.findOne({
          room: room._id,
          sender: { $ne: userId },
          isRead: false,
        })
          .sort({ createdAt: -1 })
          .populate("sender", "userName profilePicUrl");

        unreadMessagesData.push({
          roomId: room._id,
          unreadCount,
          lastMessage: lastUnread,
        });
      }
    }

    res.status(200).json({
      success: true,
      friendRequests,
      unreadMessages: unreadMessagesData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.user._id;

    await Message.updateMany(
      { room: roomId, sender: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    const request = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found or already handled." });
    }

    res.json({ success: true, message: "Friend request cancelled." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    // 1. Delete the room between them
    const room = await Room.findOneAndDelete({
      participants: { $all: [userId, friendId], $size: 2 },
    });

    if (room) {
      // 2. Delete all messages in that room
      await Message.deleteMany({ room: room._id });
    }

    // 3. Delete any friend requests between them (accepted, pending, or rejected)
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    });

    res.json({ success: true, message: "Friend removed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    const userId = req.user._id;

    const existing = await SavedMessage.findOne({
      user: userId,
      message: messageId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Message already saved" });
    }

    await SavedMessage.create({ user: userId, message: messageId });
    res
      .status(201)
      .json({ success: true, message: "Message saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSavedMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const saved = await SavedMessage.find({ user: userId })
      .populate({
        path: "message",
        populate: {
          path: "sender",
          select: "userName profilePicUrl",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
