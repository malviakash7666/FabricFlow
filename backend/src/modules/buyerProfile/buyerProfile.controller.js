import db from "../../database/models/index.js";

const { BuyerProfile } = db;

// ==========================================
// Create Buyer Profile
// ==========================================

export const createBuyerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      businessName,
      businessType,
      industry,
      phone,
      country,
      state,
      city,
      address,
      preferredFabricTypes,
      interestedCategories,
      typicalOrderQuantity,
      budgetMin,
      budgetMax,
    } = req.body;

    const existingProfile = await BuyerProfile.findOne({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Buyer profile already exists.",
      });
    }

    const profile = await BuyerProfile.create({
      userId,
      businessName,
      businessType,
      industry,
      phone,
      country,
      state,
      city,
      address,
      preferredFabricTypes,
      interestedCategories,
      typicalOrderQuantity,
      budgetMin,
      budgetMax,
      isOnboarded: true,
    });

    return res.status(201).json({
      success: true,
      message: "Buyer profile created successfully.",
      data: profile,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Buyer Profile
// ==========================================

export const getBuyerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await BuyerProfile.findOne({
      where: {
        userId,
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Update Buyer Profile
// ==========================================

export const updateBuyerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await BuyerProfile.findOne({
      where: {
        userId,
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found.",
      });
    }

    await profile.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Buyer profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
