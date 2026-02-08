import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

// controller for user signup
export const signUp = async (req, res) => {
  try {
    const { email, userName, password, conformPassword } = req.body;

    if (!email || !password || !userName || !conformPassword) {
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
    if (password !== conformPassword) {
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

export const logOut = async (req, res) => {
  // Since JWT is stateless, we can't truly "sign out" on the server side.
  // However, we can instruct the client to delete the token.
  return res
    .status(200)
    .json({ success: true, message: "Signed out successfully." });
};

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};
