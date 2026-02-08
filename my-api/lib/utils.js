import jwt from "jsonwebtoken";

export const generateToken = (userName) => {
  const token = jwt.sign({ userName }, process.env.JWT_TOKEN);
  return token;
};
