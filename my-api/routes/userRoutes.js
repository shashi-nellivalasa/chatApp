import express from "express";
import {
  signUp,
  signIn,
  logOut,
  checkAuth,
} from "../controllers/userController.js";
import protectRoute from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signUp", signUp);
userRouter.post("/logOut", logOut);
userRouter.post("/signIn", signIn);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
