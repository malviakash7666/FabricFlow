import db from "../../database/models/index.js";

const { Order, OrderItem, CartItem, Product, BuyerProfile, SupplierProfile } = db;

// ==========================================
// Place Order (Checkout)
// ==========================================
export const placeOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.id;
    const { shippingAddress, phone, contactName } = req.body;

    if (!shippingAddress || !phone || !contactName) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Shipping address, phone, and contact name are required.",
      });
    }

    // Get Buyer Profile
    const buyer = await BuyerProfile.findOne({ where: { userId } });
    if (!buyer) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Please complete your buyer onboarding profile before checking out.",
      });
    }

    // Get Cart Items
    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
          include: [{ model: SupplierProfile, as: "supplier" }],
        },
      ],
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Your shopping cart is empty.",
      });
    }

    // Group items by supplierId
    const itemsBySupplier = {};
    for (const item of cartItems) {
      const product = item.product;
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "One of the products in your cart is no longer available.",
        });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}m, requested: ${item.quantity}m.`,
        });
      }

      const supplierId = product.supplierId;
      if (!itemsBySupplier[supplierId]) {
        itemsBySupplier[supplierId] = [];
      }
      itemsBySupplier[supplierId].push(item);
    }

    const createdOrders = [];

    // Create an order for each supplier
    for (const supplierId of Object.keys(itemsBySupplier)) {
      const items = itemsBySupplier[supplierId];

      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        totalAmount += parseFloat(item.product.price) * item.quantity;
      }

      // Create order
      const order = await Order.create(
        {
          buyerId: buyer.id,
          supplierId,
          totalAmount,
          shippingAddress,
          phone,
          contactName,
          status: "pending",
        },
        { transaction }
      );

      // Create order items & deduct stock
      for (const item of items) {
        const product = item.product;

        // Deduct stock
        product.stock -= item.quantity;
        if (product.stock === 0) {
          product.isAvailable = false;
        }
        await product.save({ transaction });

        // Create OrderItem snapshot
        await OrderItem.create(
          {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price,
            color: product.colors && product.colors.length > 0 ? product.colors[0] : null,
          },
          { transaction }
        );
      }

      createdOrders.push(order);
    }

    // Clear cart items
    await CartItem.destroy({
      where: { userId },
      transaction,
    });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Order(s) placed successfully.",
      data: createdOrders,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Place Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Buyer Orders
// ==========================================
export const getBuyerOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const buyer = await BuyerProfile.findOne({ where: { userId } });
    if (!buyer) {
      return res.status(403).json({
        success: false,
        message: "Buyer profile not found.",
      });
    }

    const orders = await Order.findAll({
      where: { buyerId: buyer.id },
      include: [
        {
          model: SupplierProfile,
          as: "supplier",
          attributes: ["id", "businessName", "phone", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["imageUrls"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get Buyer Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Supplier Orders
// ==========================================
export const getSupplierOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const supplier = await SupplierProfile.findOne({ where: { userId } });
    if (!supplier) {
      return res.status(403).json({
        success: false,
        message: "Supplier profile not found.",
      });
    }

    const orders = await Order.findAll({
      where: { supplierId: supplier.id },
      include: [
        {
          model: BuyerProfile,
          as: "buyer",
          attributes: ["id", "businessName", "phone", "businessType"],
        },
        {
          model: OrderItem,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get Supplier Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Order Details by ID
// ==========================================
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: BuyerProfile,
          as: "buyer",
          attributes: ["id", "businessName", "phone", "email", "address", "city", "state", "country"],
        },
        {
          model: SupplierProfile,
          as: "supplier",
          attributes: ["id", "businessName", "phone", "email", "address", "city", "state", "country"],
        },
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Verify participant authorization
    const buyer = await BuyerProfile.findOne({ where: { userId } });
    const supplier = await SupplierProfile.findOne({ where: { userId } });

    const isBuyerUser = buyer && order.buyerId === buyer.id;
    const isSupplierUser = supplier && order.supplierId === supplier.id;

    if (!isBuyerUser && !isSupplierUser) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Update Order Status (Supplier Only)
// ==========================================
export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ["pending", "accepted", "preparing", "ready_for_dispatch", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const supplier = await SupplierProfile.findOne({ where: { userId } });
    if (!supplier) {
      return res.status(403).json({
        success: false,
        message: "Only suppliers can manage orders.",
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Check ownership
    if (order.supplierId !== supplier.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this order.",
      });
    }

    if (status) {
      order.status = status;
    }
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
