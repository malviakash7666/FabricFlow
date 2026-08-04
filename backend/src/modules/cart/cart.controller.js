import db from "../../database/models/index.js";

const { CartItem, Product, SupplierProfile } = db;

// ==========================================
// Get Cart Items
// ==========================================
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: SupplierProfile,
              as: "supplier",
              attributes: ["id", "businessName"],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Add Item to Cart
// ==========================================
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID and a positive quantity are required.",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock}m available.`,
      });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: { userId, productId },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Insufficient stock. Current cart: ${cartItem.quantity}m, available: ${product.stock}m.`,
        });
      }
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        userId,
        productId,
        quantity,
      });
    }

    // Fetch complete cart item with product details for response
    const completeItem = await CartItem.findByPk(cartItem.id, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: SupplierProfile,
              as: "supplier",
              attributes: ["id", "businessName"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Item added to cart.",
      data: completeItem,
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Update Cart Item Quantity
// ==========================================
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "A positive quantity is required.",
      });
    }

    const cartItem = await CartItem.findOne({
      where: { id, userId },
      include: [{ model: Product, as: "product" }],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${cartItem.product.stock}m available.`,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    // Fetch complete cart item
    const completeItem = await CartItem.findByPk(cartItem.id, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: SupplierProfile,
              as: "supplier",
              attributes: ["id", "businessName"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated.",
      data: completeItem,
    });
  } catch (error) {
    console.error("Update Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Remove Item from Cart
// ==========================================
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cartItem = await CartItem.findOne({
      where: { id, userId },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart.",
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Clear Cart
// ==========================================
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await CartItem.destroy({
      where: { userId },
    });

    return res.status(200).json({
      success: true,
      message: "Cart cleared.",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
