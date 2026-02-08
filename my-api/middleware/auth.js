import User from "../models/user.js";
import jwt from "jsonwebtoken";

//middleware to protect routes
const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;

    const decode = jwt.verify(token, process.env.JWT_TOKEN);

    const user = await User.findById(decode.userName).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default protectRoute;
