import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV !== "development",
    secure : true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "None",
    // this is important for cross-site cookies, when i had it as 'None' then i could use both the frontend and backend on localhost,
  });

  return token;
};

export default generateToken;
