import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";


const protect = asyncHandler(async(req,res,next) => {
  const token = req.cookies.jwt;
  if(!token){
    return res.status(401).json({
      message: "Unauthorized, no token provided"
    })
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.userId).select("-password");

  if(!req.user){
    return res.status(401).json({
      message: "Doubtful message, User not foun OR token is invalid",
    })
  }
  next();
});

export { protect };