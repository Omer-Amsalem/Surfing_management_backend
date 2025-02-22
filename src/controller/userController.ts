import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import asyncHandler from "express-async-handler";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../middleWare/jwtMiddle";
import dotenv from "dotenv";
dotenv.config();
import { OAuth2Client } from "google-auth-library";
import { v4 as uuid } from "uuid";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

// Register User
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      res.status(404);
      throw new Error("All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      profilePicture: req.file ? req.file.path : undefined,
    });

    await user.save();
    res.status(201).json({ user });
  }
);

// Login User
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400);
    throw new Error("User not found or password is incorrect");
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken.push(refreshToken);
  await user.save();

  res.status(200).json({
    email: user.email,
    id: user._id,
    accessToken,
    refreshToken,
    isHost: user.isHost,
    userPhoto: user.profilePicture,
  });
});

// Refresh Token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.body;
    console.log(token);
    if (!token) {
      res.status(403);
      throw new Error("Refresh token required");
    }
    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      res.status(403);
      throw new Error("Invalid refresh token");
    }
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;


    } catch (err) {
      user.refreshToken = [];
      await user.save();
      res.status(404);
      throw new Error("Expired or invalid refresh token");
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());
    // Update user's refresh token array
    user.refreshToken = user.refreshToken.filter((t) => t !== token); // Remove old token
    user.refreshToken.push(newRefreshToken);
    await user.save();

    res
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  }
);

// Logout User
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Refresh token required");
  }

  // Verify the refresh token and extract the user ID
  let userId: string;
  try {
    const payload = verifyRefreshToken(token);
    if (!payload) {
      res.status(403);
      throw new Error("Invalid or expired refresh token");
    }
    userId = payload.userId;
  } catch (err) {
    res.status(403);
    throw new Error("Invalid or expired refresh token");
  }

  // Find the user using the extracted ID
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if the provided token exists in the user's refresh token list
  if (!user.refreshToken.includes(token)) {
    res.status(403);
    throw new Error("Refresh token is not valid for this user");
  }

  // Remove the token from the refresh token list
  user.refreshToken = user.refreshToken.filter((t) => t !== token);
  user.refreshToken = [];
  await user.save();

  res.status(200).json({ message: "User logged out successfully" });
});

// Update User
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { firstName, lastName, role, description } = req.body;
  const profilePicture = req.file ? req.file.path : user.profilePicture;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (profilePicture) user.profilePicture = profilePicture;
  if (role) user.role = role;
  if (description) user.description = description;

  const updatedUser = await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      userPhoto: updatedUser.profilePicture,
    },
  });
});

// Delete User
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  await user.deleteOne();

  res.status(200).json({ message: "User deleted successfully" });
});

//get user by id
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json(user);
});

// get user activities with pagination
export const getUserActivities = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
    res.status(400);
    throw new Error("Invalid page or limit values");
  }

  // Find total activities count
  const totalActivities = await User.findById(id).select("userActivity").lean();
  if (!totalActivities) {
    res.status(404);
    throw new Error("User not found");
  }

  const totalRecords = totalActivities.userActivity.length;
  const totalPages = Math.ceil(totalRecords / limitNumber);

  // Fetch paginated activities
  const userWithActivities = await User.findById(id)
    .populate({
      path: "userActivity",
      options: {
        skip: (pageNumber - 1) * limitNumber,
        limit: limitNumber,
        sort: { createdAt: -1 }, // Sort by latest activity
      },
    });



  res.status(200).json({
    posts: userWithActivities?.userActivity,
    totalRecords,
    totalPages,
    currentPage: pageNumber,
  });
});


// Auth Middleware
export const auth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401);
      throw new Error("Access token required");
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(403);
      throw new Error("Invalid or expired access token");
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    req.user = user;

    next();
  }
);

export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
  );
  const { code }: { code: string } = req.body;
  try {
    if (!code) {
      res.status(400).send("Invalid code");
      return;
    }
    const response = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: response.tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).send("Invalid payload");
      return;
    }

    const email = payload.email;
    if (!email) {
      res.status(402).send("Invalid email");
      return;
    }
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      const newUser = await User.create({
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: email,
        password: uuid(),
        role: "ללא תפקיד",
        profilePicture: payload.picture,
        activityCount: 0,
        isHost: false,
        description: "",
        userActivity: [],
        refreshTokens: [],
      });
      const refreshToken = generateRefreshToken(newUser._id.toString());
      const accessToken = generateAccessToken(newUser._id.toString());
      if (refreshToken && accessToken) {
        newUser.refreshToken.push(refreshToken);
        await newUser.save();
        res.status(200).send({
          user: newUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      }
    } else {
      const refreshToken = generateRefreshToken(user._id.toString());
      const accessToken = generateAccessToken(user._id.toString());
      if (refreshToken && accessToken) {
        user.refreshToken.push(refreshToken);
        await user.save();
        res.status(200).send({
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      }
    }
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};
