import express from "express";

import {
  createBuyerProfile,
  getBuyerProfile,
  updateBuyerProfile,
} from "./buyerProfile.controller.js";

import {
  authenticate,
 
} from "../../middleware/auth.middleware.js";

const router = express.Router();

// ============================
// Buyer Profile Routes
// ============================

// Create Buyer Profile
router.post(
  "/profile",
  authenticate,
 
  createBuyerProfile,
);

// Get Buyer Profile
router.get("/profile", authenticate, getBuyerProfile);

// Update Buyer Profile
router.put(
  "/profile",
  authenticate,

  updateBuyerProfile,
);

export default router;
