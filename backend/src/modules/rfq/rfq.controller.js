import db from "../../database/models/index.js";

const { Rfq, RfqQuote, BuyerProfile, SupplierProfile } = db;

// ==========================================
// Create RFQ (Buyer Only)
// ==========================================
export const createRfq = async (req, res) => {
  try {
    const userId = req.user.id;
    const buyer = await BuyerProfile.findOne({ where: { userId } });

    if (!buyer) {
      return res.status(403).json({
        success: false,
        message: "Only onboarded buyers can post sourcing requests.",
      });
    }

    const {
      title,
      category,
      description,
      targetPrice,
      quantity,
      targetDate,
      specifications,
    } = req.body;

    if (!title || !category || !targetPrice || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Title, category, target price, and quantity are required.",
      });
    }

    const rfq = await Rfq.create({
      buyerId: buyer.id,
      title,
      category,
      description,
      targetPrice,
      quantity,
      targetDate,
      specifications: specifications || {},
      status: "open",
    });

    return res.status(201).json({
      success: true,
      message: "Sourcing request posted successfully.",
      data: rfq,
    });
  } catch (error) {
    console.error("Create RFQ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Buyer's Posted RFQs with Quotes
// ==========================================
export const getBuyerRfqs = async (req, res) => {
  try {
    const userId = req.user.id;
    const buyer = await BuyerProfile.findOne({ where: { userId } });

    if (!buyer) {
      return res.status(403).json({
        success: false,
        message: "Buyer profile not found.",
      });
    }

    const rfqs = await Rfq.findAll({
      where: { buyerId: buyer.id },
      include: [
        {
          model: RfqQuote,
          as: "quotes",
          include: [
            {
              model: SupplierProfile,
              as: "supplier",
              attributes: ["id", "businessName", "phone", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: rfqs,
    });
  } catch (error) {
    console.error("Get Buyer RFQs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Open RFQs Board (Supplier Only)
// ==========================================
export const getRfqBoard = async (req, res) => {
  try {
    const rfqs = await Rfq.findAll({
      where: { status: "open" },
      include: [
        {
          model: BuyerProfile,
          as: "buyer",
          attributes: ["id", "businessName", "city", "state"],
        },
        {
          model: RfqQuote,
          as: "quotes",
          attributes: ["id", "supplierId"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: rfqs,
    });
  } catch (error) {
    console.error("Get RFQ Board Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Submit Quote on RFQ (Supplier Only)
// ==========================================
export const submitQuote = async (req, res) => {
  try {
    const userId = req.user.id;
    const supplier = await SupplierProfile.findOne({ where: { userId } });

    if (!supplier) {
      return res.status(403).json({
        success: false,
        message: "Only onboarded suppliers can submit quotes.",
      });
    }

    const rfqId = req.params.id;
    const rfq = await Rfq.findByPk(rfqId);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "Sourcing request not found.",
      });
    }

    if (rfq.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This sourcing request is no longer open for quotes.",
      });
    }

    const { offeredPrice, estimatedDeliveryDays, notes } = req.body;

    if (!offeredPrice || !estimatedDeliveryDays) {
      return res.status(400).json({
        success: false,
        message: "Offered price and estimated delivery timeline are required.",
      });
    }

    // Check duplicate quote
    const existingQuote = await RfqQuote.findOne({
      where: { rfqId, supplierId: supplier.id },
    });

    if (existingQuote) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a quote for this sourcing request.",
      });
    }

    const quote = await RfqQuote.create({
      rfqId,
      supplierId: supplier.id,
      offeredPrice,
      estimatedDeliveryDays,
      notes,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Quote submitted successfully.",
      data: quote,
    });
  } catch (error) {
    console.error("Submit Quote Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Get Supplier's Submitted Quotes (Supplier Only)
// ==========================================
export const getSupplierQuotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const supplier = await SupplierProfile.findOne({ where: { userId } });

    if (!supplier) {
      return res.status(403).json({
        success: false,
        message: "Supplier profile not found.",
      });
    }

    const quotes = await RfqQuote.findAll({
      where: { supplierId: supplier.id },
      include: [
        {
          model: Rfq,
          as: "rfq",
          include: [
            {
              model: BuyerProfile,
              as: "buyer",
              attributes: ["id", "businessName", "city", "state"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: quotes,
    });
  } catch (error) {
    console.error("Get Supplier Quotes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// Accept Quote (Buyer Only)
// ==========================================
export const acceptQuote = async (req, res) => {
  try {
    const userId = req.user.id;
    const buyer = await BuyerProfile.findOne({ where: { userId } });

    if (!buyer) {
      return res.status(403).json({
        success: false,
        message: "Buyer profile not found.",
      });
    }

    const { quoteId } = req.params;

    const quote = await RfqQuote.findByPk(quoteId, {
      include: [{ model: Rfq, as: "rfq" }],
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    if (quote.rfq.buyerId !== buyer.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this request.",
      });
    }

    if (quote.rfq.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This sourcing request is already closed or fulfilled.",
      });
    }

    // Accept selected quote, reject all other quotes for this RFQ, and mark RFQ as fulfilled
    await quote.update({ status: "accepted" });

    await RfqQuote.update(
      { status: "rejected" },
      {
        where: {
          rfqId: quote.rfqId,
          id: { [db.Sequelize.Op.ne]: quoteId },
        },
      }
    );

    await quote.rfq.update({ status: "fulfilled" });

    return res.status(200).json({
      success: true,
      message: "Quote accepted successfully. Other bids have been rejected.",
    });
  } catch (error) {
    console.error("Accept Quote Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
