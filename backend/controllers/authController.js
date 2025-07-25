import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { verifyGoogleToken } from "../config/googleOAuth.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
// @desc Register a new user
// @route POST /api/auth/signup
// @access Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, googleId } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    googleId,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
      },
    });
    console.log("✅ User created");
  } else {
    res.status(400);
    throw new Error("❌ Invalid user data");
  }
});

// @desc Login a user
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user.password) {
    console.log("⚠️ Google login required");
    return res.status(400).json({
      message:
        "Please login with Google, as you had previously logged in with Google and haven't setup a password yet.",
    });
  }

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
      },
    });
    console.log("✅ Login successful");
  } else {
    return res.status(401).json({
      message: "❌ Invalid email or password",
    });
  }
});

// @desc Forgot password
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("❌ User not found");
  }

  const resetToken = jwt.sign(
    // sign method takes 3 arguments: payload, secret, options, that is userid that was used to generate the token, secret key that was used to generate the token, and options that is the expiration time of the token
    { id: user._id },
    process.env.JWT_FORGET_PASSWORD_SECRET,
    { expiresIn: "15m" }
  );

  const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>If you didn’t request this, ignore this email.</p>
    `;

  await sendEmail(email, "Password Reset Request", message);
  // console.log("✅ Email sent successfully");

  return res
    .status(200)
    .json({ message: "Reset password email sent successfully" });
});

// @desc Reset password
// @route POST /api/auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_FORGET_PASSWORD_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }
  user.password = password;
  await user.save();
  console.log("✅ Password reset successful");
  return res.status(200).json({
    message: "Password reset successful",
  });
});

// @desc Logout a user
// @route POST /api/auth/logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  console.log("✅ Logout successful");
  res.status(200).json({
    message: "Logged out successfully",
  });
});

// @desc Get user profile
// @route GET /api/auth/getProfile
// @access Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio || "",
    profileImage: user.profileImage || "",
    skills: user.skills || [],
    googleId: user.googleId,
    memberSince: user.memberSince,
  });
});

// @desc Google OAuth
// @route POST /api/auth/google
// @access Public

const googleSignin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const userProfile = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const googleUser = await userProfile.json();
    // console.log("Google user:", googleUser);
    console.log(" Google user logged in :", googleUser.email);
    let user = await User.findOne({ email: googleUser.email });
    // console.log("User:", user);
    // if user exists but not linked to google
    if (user && !user.googleId) {
      console.log("➕ account merging");
      user.googleId = googleUser.sub;
      await user.save();
    }

    // if new user
    if (!user) {
      console.log("🆕 Creatingnew user using google ", googleUser.email);
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        password: null,
      });
    }

    generateToken(res, user._id);
    console.log("✅ Google signin successful");
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.log("❌ Google signin failed", error);
  }
};

// @desc Update user profile
// @route PUT /api/auth/update-profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update basic fields if provided
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  // Update optional fields if provided
  if (req.body.bio !== undefined) {
    user.bio = req.body.bio;
  }

  if (req.body.profileImage !== undefined) {
    user.profileImage = req.body.profileImage;
  }

  // Update skills if provided
  if (req.body.skills) {
    user.skills = req.body.skills;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    bio: updatedUser.bio || "",
    profileImage: updatedUser.profileImage || "",
    skills: updatedUser.skills || [],
    googleId: updatedUser.googleId,
    memberSince: updatedUser.memberSince,
  });
});

// @desc Update user password
// @route PUT /api/auth/update-password
// @access Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide both current and new password");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // If user registered with Google and doesn't have a password
  if (!user.password) {
    res.status(400);
    throw new Error("You registered with Google. Please set a password first");
  }

  // Check if current password matches
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});

export {
  signup,
  login,
  logout,
  googleSignin,
  getProfile,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
};
