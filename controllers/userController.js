import express from "express";
import User from "../model/userSchema.js";
import { loginSchema, signupSchema } from "../validators/userValidator.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";

const createToken = (id, email) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret key is missing");
  }

  const token = jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

const cookieOptions = {
  httpOnly: true,
  secure: false,
  maxAge: 60 * 60 * 1000,
};

export const signup = async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);
    //   result =   {
    //   success: true,
    //   data: {
    //     username: "rohit_paul",
    //     email: "rohit@example.com",
    //     age: 22 // (coerced from a string if you used z.coerce.number())
    //   }
    // }

    if (!result.success) {
      console.log("Error in zod validation: ", result.error);
      return res
        .status(400)
        .json({ success: false, message: "Invaid credentials" });
    }

    // const userData = result.data;
    const { name, age, email, password } = result.data;

    try {
      const user = await User.findOne({ email });
      if (user) {
        return res
          .status(409)
          .json({ success: false, message: "Email already exist" });
      }

      const hashedPass = await bcrypt.hash(password, 10);
      const userCreated = await User.create({
        name,
        age,
        email,
        password: hashedPass,
      });

      //create token
      // payload = _id,email

      const token = createToken(userCreated._id, email);
      res.cookie("token", token, cookieOptions);
      res.status(201).json({
        success: true,
        message: "User created successsfully",
        userCreated,
      });
    } catch (error) {
      console.log("Error in userController", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    console.log("Error in zod validation: ", result.error);
    return res
      .status(400)
      .json({ success: false, message: "Invaid credentials" });
  }

  const { email, password } = result.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id, email);
    res.cookie("token", token);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      profile: {
        user: user.name,
        age: user.age,
        email: user.email,
        usage: user.usage,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: false }); // here we give cookie options without maxAge
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

export const profile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        age: user.age,
        email: user.email,
        usage: user.usage,
      },
    });
  } catch (error) {
    console.log("Error in profile controller", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    // find all the chatId which belongs to user
    const userId = req.user._id;

    const chats = await Chat.find({ userId }).select("_id");

    const chatIds = chats.map((chat) => chat._id);
    //delete all the messages which belongs to chatId
    await Message.deleteMany({
      chatId: { $in: chatIds },
    });

    //Delete all the chatId which belongs to this user

    await Chat.deleteMany({ userId });

    //Delete user profile: by its id

    await User.deleteOne({ _id: userId });

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
    });
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error in user controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
