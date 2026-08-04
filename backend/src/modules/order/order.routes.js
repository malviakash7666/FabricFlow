import express from "express";
import {
  placeOrder,
  getBuyerOrders,
  getSupplierOrders,
  getOrderById,
  updateOrderStatus,
} from "./order.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// General authentication required for all order routes
router.use(authenticate);

// Buyer Routes
router.post("/", authorize("buyer"), placeOrder);
router.get("/buyer", authorize("buyer"), getBuyerOrders);

// Supplier Routes
router.get("/supplier", authorize("supplier"), getSupplierOrders);
router.patch("/:id/status", authorize("supplier"), updateOrderStatus);

// Common detail route
router.get("/:id", getOrderById);

export default router;
