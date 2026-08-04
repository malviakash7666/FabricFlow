import express from "express";
import {
  createRfq,
  getBuyerRfqs,
  getRfqBoard,
  submitQuote,
  getSupplierQuotes,
  acceptQuote,
} from "./rfq.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// ============================
// Buyer Sourcing Request Routes
// ============================
router.post("/", authenticate, authorize("buyer"), createRfq);
router.get("/my-rfqs", authenticate, authorize("buyer"), getBuyerRfqs);
router.post("/quotes/:quoteId/accept", authenticate, authorize("buyer"), acceptQuote);

// ============================
// Supplier Bidding Board Routes
// ============================
router.get("/board", authenticate, authorize("supplier"), getRfqBoard);
router.post("/:id/quote", authenticate, authorize("supplier"), submitQuote);
router.get("/my-quotes", authenticate, authorize("supplier"), getSupplierQuotes);

export default router;
