import express from "express";

import {
  createSupplierProfile,
  getSupplierProfile,
  updateSupplierProfile,
} from "./supplier.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// =====================================
// Supplier Profile Routes
// =====================================

// Create Supplier Profile
router.post(
  "/profile",
  authenticate,

  createSupplierProfile,
);

// Get Supplier Profile
router.get(
  "/profile",
  authenticate,

  getSupplierProfile,
);

// Update Supplier Profile
router.put(
  "/profile",
  authenticate,

  updateSupplierProfile,
);

export default router;
