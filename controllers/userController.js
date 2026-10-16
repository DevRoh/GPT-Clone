import express from "express";
import User from "../model/userSchema.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    const { name, age, email, password } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Some fields are missing" });
    }
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
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("Missing email or password");
    return res
      .status(400)
      .json({ success: false, messsage: "Some fields are missisng" });
  }

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
    res
      .status(200)
      .json({
        success: true,
        message: "Logged in successfully",
        profile: { user: user.name, age: user.age, email: user.email, usage:user.usage },
      });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
    res.clearCookie("token",{httpOnly:true,secure:false}); // here we give cookie options without maxAge
    res.status(200).json({success:true,message:"User logged out successfully"});
};

export const profile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
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
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
