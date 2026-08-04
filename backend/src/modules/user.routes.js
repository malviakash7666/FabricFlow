import express from "express";

import {
  register,
  login,
  getMe,
  logout,
  refreshToken,
} from "./user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// ======================
// Public Routes
// ======================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

router.post("/refresh-token", refreshToken);

// ======================
// Protected Routes
// ======================

// Current User
router.get("/me", authenticate, getMe);

// Logout
router.post("/logout", authenticate, logout);

export default router;
