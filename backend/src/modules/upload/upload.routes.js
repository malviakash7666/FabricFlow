import express from "express";
import multer from "multer";
import { uploadProductImage } from "./upload.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Configure multer memory storage (stores files as buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Protect: Only authenticated suppliers can upload product swatches
router.post(
  "/image",
  authenticate,
  authorize("supplier"),
  upload.single("image"),
  uploadProductImage
);

export default router;
