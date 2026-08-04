import express from "express";
import {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./product.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Protected Supplier Routes
router.get("/my-products", authenticate, authorize("supplier"), getMyProducts);

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected Supplier Write Routes
router.post("/", authenticate, authorize("supplier"), createProduct);
router.put("/:id", authenticate, authorize("supplier"), updateProduct);
router.delete("/:id", authenticate, authorize("supplier"), deleteProduct);

export default router;
