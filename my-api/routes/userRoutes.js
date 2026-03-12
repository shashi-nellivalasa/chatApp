import express from "express";
import {
  signUp,
  signIn,
  signOut,
  checkAuth,
  getUsers,
  getCurrentUser,
  uploadProfilePic,
} from "../controllers/userController.js";
import protectRoute from "../middleware/auth.js";

import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

const userRouter = express.Router();

userRouter.post("/signUp", signUp);
userRouter.post("/signOut", protectRoute, signOut);
userRouter.post("/signIn", signIn);
userRouter.get("/me", protectRoute, getCurrentUser);
userRouter.get("/", protectRoute, getUsers); // Fetch all users (protected)
userRouter.post("/uploadProfilePic", protectRoute, upload.single("profilePic"), uploadProfilePic);

export default userRouter;
