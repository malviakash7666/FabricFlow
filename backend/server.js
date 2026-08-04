import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import db from "./src/database/models/index.js";

import userRoutes from "./src/modules/user.routes.js";
import buyerRoutes from "./src/modules/buyerProfile/buyerProfile.routes.js";
import suplierRoutes from "./src/modules/supplier/supplier.routes.js";
import productRoutes from "./src/modules/product/product.routes.js";
import cartRoutes from "./src/modules/cart/cart.routes.js";
import orderRoutes from "./src/modules/order/order.routes.js";
import aiRoutes from "./src/modules/ai/ai.routes.js";
import rfqRoutes from "./src/modules/rfq/rfq.routes.js";

dotenv.config();

const app = express();

// =====================
// Middleware Setup
// =====================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// =====================
// Health Check Route
// =====================

app.get("/", (req, res) => {
  res.json({
    message: "Textile Marketplace API Running 🚀",
    environment: process.env.NODE_ENV,
  });
});

// =====================
// Database Connection
// =====================

const connectDatabase = async () => {
  try {
    await db.sequelize.authenticate();

    console.log("✅ PostgreSQL Database Connected Successfully");

    // Development me tables sync karne ke liye
    if (process.env.NODE_ENV === "development") {
      await db.sequelize.sync({
        alter: true,
      });

      console.log("✅ Database Tables Synced");
    }
  } catch (error) {
    console.log("❌ Database Connection Failed:", error.message);

    process.exit(1);
  }
};

// APi Routes 
app.use("/api/users", userRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/suppliers", suplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/rfq", rfqRoutes);

// =====================
// Server Start
// =====================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);

    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
