import db from "../../database/models/index.js";

const { SupplierProfile } = db;

// ==========================================
// Create Supplier Profile
// ==========================================

export const createSupplierProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      businessName,
      businessType,
      contactPerson,
      phone,
      email,
      country,
      state,
      city,
      address,
      operatingHours,
      productCategories,
      fabricTypes,
      minimumOrderQuantity,
      description,
    } = req.body;

    // Check profile already exists

    const existingProfile = await SupplierProfile.findOne({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Supplier profile already exists",
      });
    }

    const profile = await SupplierProfile.create({
      userId,

      businessName,

      businessType,

      contactPerson,

      phone,

      email,

      country,

      state,

      city,

      address,

      operatingHours,

      productCategories,

      fabricTypes,

      minimumOrderQuantity,

      description,

      isOnboarded: true,
    });

    return res.status(201).json({
      success: true,

      message: "Supplier profile created successfully",

      data: profile,
    });
  } catch (error) {
    console.log("Create Supplier Profile Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong",
    });
  }
};

// ==========================================
// Get Supplier Profile
// ==========================================

export const getSupplierProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await SupplierProfile.findOne({
      where: {
        userId,
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,

        message: "Supplier profile not found",
      });
    }

    return res.status(200).json({
      success: true,

      data: profile,
    });
  } catch (error) {
    console.log("Get Supplier Profile Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong",
    });
  }
};

// ==========================================
// Update Supplier Profile
// ==========================================

export const updateSupplierProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await SupplierProfile.findOne({
      where: {
        userId,
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,

        message: "Supplier profile not found",
      });
    }

    await profile.update(req.body);

    return res.status(200).json({
      success: true,

      message: "Supplier profile updated successfully",

      data: profile,
    });
  } catch (error) {
    console.log("Update Supplier Profile Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong",
    });
  }
};
