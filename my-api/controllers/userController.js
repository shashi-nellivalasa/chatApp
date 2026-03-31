import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import FriendRequest from "../models/friendRequest.js";

// controller for user signup
export const signUp = async (req, res) => {
  try {
    const { email, userName, firstName, lastName, password, confirmPassword } =
      req.body;

    if (!email || !password || !userName || !confirmPassword) {
      return res.status(400).json({ message: "All fields are mandatory." });
    }

    //User exist check.
    const emailFound = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (emailFound) {
      return res.status(400).json({ message: "Email already exist." });
    }

    //email validation.
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // username validation
    if (/[^a-zA-Z0-9]/.test(userName)) {
      return res
        .status(400)
        .json({ message: "userName must not contain special characters." });
    }

    // password validation.
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and Conform password should match." });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long.",
      });
    }

    // email to lower case
    const cleanEmail = email.trim().toLowerCase();

    // generating the hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: cleanEmail,
      userName,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      userName,
      token,
      message: "user added successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// controller for user signIn
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password fields are mandatory." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = await User.findOne({ email: cleanEmail });

    if (!matchedUser) {
      return res
        .status(401)
        .json({ success: false, message: "Email not found." });
    }

    const passwordMatch = await bcrypt.compare(password, matchedUser.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "wrong password." });
    }

    // Update the user's status to "online" in the database
    matchedUser.status = "online";
    await matchedUser.save();

    const token = generateToken(matchedUser._id);
    return res.status(200).json({
      success: true,
      token,
      message: "Sign in successful.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const signOut = async (req, res) => {
  try {
    // If the route is protected, we can set status to offline
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { status: "offline" });
    }

    // Since JWT is stateless, we can't truly "sign out" on the server side.
    // However, we can instruct the client to delete the token.
    return res
      .status(200)
      .json({ success: true, message: "Signed out successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error during sign out." });
  }
};

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

import Room from "../models/room.js";

// fetching all users
export const getUsers = async (req, res) => {
  try {
    // 1. Fetch all users except passwords
    const users = await User.find({}, "-password").lean();

    // 2. Find all rooms the current user is a participant of
    const currentUserId = req.user._id;
    const rooms = await Room.find({ participants: currentUserId });

    // 3. Find all friend requests where current user is the sender
    const sentRequests = await FriendRequest.find({
      sender: currentUserId,
      status: "pending",
    });

    // 4. Extract all unique user IDs that the current user already has a room with
    const connectedUserIds = new Set();
    rooms.forEach((room) => {
      room.participants.forEach((participantId) => {
        if (participantId.toString() !== currentUserId.toString()) {
          connectedUserIds.add(participantId.toString());
        }
      });
    });

    // 5. Extract all user IDs that have a pending request from current user
    const requestedUserIds = new Set(
      sentRequests.map((req) => req.receiver.toString()),
    );

    // 6. Map the users and determine the `status`
    const usersWithStatus = users.map((user) => {
      let status = "add";
      const userIdStr = user._id.toString();

      if (connectedUserIds.has(userIdStr)) {
        status = "added";
      } else if (requestedUserIds.has(userIdStr)) {
        status = "requested";
      }

      return {
        ...user,
        status,
        added: status === "added", // Keep for backward compatibility if needed
      };
    });

    return res.status(200).json({ success: true, users: usersWithStatus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

import sharp from "sharp";

// upload profile picture
export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided" });
    }

    // Compress and resize the image directly from the buffer using sharp
    const compressedBuffer = await sharp(req.file.buffer)
      .resize({ width: 300, height: 300, fit: "cover" }) // Resize to 300x300, crop to fit
      .webp({ quality: 80 }) // Convert to format WebP at 80% quality
      .toBuffer();

    // Convert the compressed file buffer to a Base64 encoded string
    const base64Image = compressedBuffer.toString("base64");
    // Create the Data URI string to be used directly in an <img> src tag
    const imageUrl = `data:image/webp;base64,${base64Image}`;

    // Update user profile in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicUrl: imageUrl },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      profilePicUrl: imageUrl,
      user: updatedUser,
      message:
        "Profile picture compressed and uploaded to MongoDB successfully.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during upload" });
  }
};
