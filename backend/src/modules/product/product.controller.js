import { Op } from "sequelize";
import db from "../../database/models/index.js";

const { Product, SupplierProfile } = db;

// ==========================================
// Create Product
// ==========================================
export const createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const supplier = await SupplierProfile.findOne({ where: { userId } });

    if (!supplier) {
      return res.status(403).json({
        success: false,
        message: "Only onboarded suppliers can list products.",
      });
    }

    const {
      name,
      category,
      description,
      colors,
      specifications,
      price,
      stock,
      imageUrls,
      moq,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Product name, category, and price are required.",
      });
    }

    const product = await Product.create({
      supplierId: supplier.id,
      name,
      category,
      description,
      colors: colors || [],
      specifications: specifications || {},
      price,
      stock: stock || 0,
      imageUrls: imageUrls || [],
      moq: moq || 100,
      isAvailable: stock > 0,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Products (Search, Filter, Paginate)
// ==========================================
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      color,
      minPrice,
      maxPrice,
      maxMoq,
      sortBy,
      order,
    } = req.query;

    const whereClause = {
      isAvailable: true,
    };

    // Text search on name or description
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Price range filters
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    // MOQ filter
    if (maxMoq) {
      whereClause.moq = { [Op.lte]: parseInt(maxMoq) };
    }

    // Color filter (using JSONB matching)
    if (color) {
      // In Sequelize, matching JSONB array elements:
      whereClause.colors = {
        [Op.contains]: [color]
      };
    }

    // Sorting
    const sortField = sortBy || "createdAt";
    const sortOrder = order || "DESC";

    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: SupplierProfile,
          as: "supplier",
          attributes: ["id", "businessName", "city", "country", "minimumOrderQuantity"],
        },
      ],
      order: [[sortField, sortOrder]],
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Supplier's Products
// ==========================================
export const getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const supplier = await SupplierProfile.findOne({ where: { userId } });

    if (!supplier) {
      return res.status(403).json({
        success: false,
        message: "Supplier profile not found.",
      });
    }

    const products = await Product.findAll({
      where: {
        supplierId: supplier.id,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get My Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Product Details By ID
// ==========================================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: SupplierProfile,
          as: "supplier",
          attributes: [
            "id",
            "businessName",
            "businessType",
            "contactPerson",
            "phone",
            "email",
            "city",
            "state",
            "country",
            "address",
            "operatingHours",
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get Product Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Update Product
// ==========================================
export const updateProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const supplier = await SupplierProfile.findOne({ where: { userId } });
    if (!supplier) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Verify ownership
    if (product.supplierId !== supplier.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this product.",
      });
    }

    const {
      name,
      category,
      description,
      colors,
      specifications,
      price,
      stock,
      imageUrls,
      moq,
      isAvailable,
    } = req.body;

    await product.update({
      name: name !== undefined ? name : product.name,
      category: category !== undefined ? category : product.category,
      description: description !== undefined ? description : product.description,
      colors: colors !== undefined ? colors : product.colors,
      specifications: specifications !== undefined ? specifications : product.specifications,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      imageUrls: imageUrls !== undefined ? imageUrls : product.imageUrls,
      moq: moq !== undefined ? moq : product.moq,
      isAvailable: isAvailable !== undefined ? isAvailable : (stock > 0),
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Delete Product
// ==========================================
export const deleteProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const supplier = await SupplierProfile.findOne({ where: { userId } });
    if (!supplier) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Verify ownership
    if (product.supplierId !== supplier.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this product.",
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
