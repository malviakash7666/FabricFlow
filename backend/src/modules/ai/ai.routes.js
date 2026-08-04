import express from "express";
import { chatWithAI, generateFabricSpec } from "./ai.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// AI Chat Assistant endpoint (available to all logged-in users)
router.post("/chat", authenticate, chatWithAI);

// AI Fabric Spec Autocomplete endpoint (Supplier only)
router.post("/generate-spec", authenticate, authorize("supplier"), generateFabricSpec);

export default router;
