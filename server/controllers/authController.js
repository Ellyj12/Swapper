import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { validationResult } from "express-validator";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};



export const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      statusCode: 400,
      name: "ValidationError",
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.param,
        message: e.msg,
      })),
    });
  }

  try {
    const { name, email, password, username } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next({ statusCode: 400, message: "Email already exists" });
    }

    const userNameExists = await User.findOne({ username });
    if (userNameExists) {
      return next({ statusCode: 400, message: "Username already exists" });
    }

    const user = await User.create({ name, email, password, username });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};



export const loginUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const user =
      (await User.findOne({ email })) || (await User.findOne({ username }));

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error); 
    }
  } catch (err) {
    next(err); 
  }
};
