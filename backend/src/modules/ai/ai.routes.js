import express from "express";
import { chatWithAI, generateFabricSpec } from "./ai.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { aiRateLimiter } from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

// AI Chat Assistant endpoint (Public + Rate Limited)
router.post("/chat", aiRateLimiter, chatWithAI);

// AI Fabric Spec Autocomplete endpoint (Supplier only)
router.post("/generate-spec", authenticate, authorize("supplier"), generateFabricSpec);

export default router;
