import { Op } from "sequelize";
import db from "../../database/models/index.js";
import axios from "axios";

const { Product, SupplierProfile } = db;

// ==========================================
// AI Assistant Chat (NLP Search, Comparison & Recommendations)
// ==========================================
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const lowerMessage = message.toLowerCase();
    let reply = "";
    let recommendedProducts = [];
    let filters = null;

    // Helper: fetch some products for recommendations
    const getRecommendations = async (whereClause = {}, limit = 5) => {
      return await Product.findAll({
        where: { isAvailable: true, ...whereClause },
        include: [{ model: SupplierProfile, as: "supplier", attributes: ["id", "businessName"] }],
        limit,
      });
    };

    // 1. Check for Product Comparison requests
    if (lowerMessage.includes("compare") || lowerMessage.includes("difference between") || lowerMessage.includes("comparison")) {
      // Find what products are in the database and see if they are in the message
      const allProducts = await Product.findAll({ where: { isAvailable: true } });
      const productsToCompare = allProducts.filter(p => 
        lowerMessage.includes(p.name.toLowerCase()) || 
        lowerMessage.includes(p.category.toLowerCase())
      );

      if (productsToCompare.length >= 2) {
        recommendedProducts = productsToCompare.slice(0, 3);
        reply = `Here is a side-by-side comparison of the fabrics you requested:

| Specification | ${productsToCompare[0].name} | ${productsToCompare[1].name} | ${productsToCompare.length > 2 ? productsToCompare[2].name : ""} |
| :--- | :--- | :--- | :--- |
| **Category** | ${productsToCompare[0].category} | ${productsToCompare[1].category} | ${productsToCompare.length > 2 ? productsToCompare[2].category : ""} |
| **Price (per meter)** | ₹${productsToCompare[0].price} | ₹${productsToCompare[1].price} | ${productsToCompare.length > 2 ? `₹${productsToCompare[2].price}` : ""} |
| **MOQ** | ${productsToCompare[0].moq}m | ${productsToCompare[1].moq}m | ${productsToCompare.length > 2 ? `${productsToCompare[2].moq}m` : ""} |
| **Colors** | ${productsToCompare[0].colors.join(", ")} | ${productsToCompare[1].colors.join(", ")} | ${productsToCompare.length > 2 ? productsToCompare[2].colors.join(", ") : ""} |
| **Stock** | ${productsToCompare[0].stock}m | ${productsToCompare[1].stock}m | ${productsToCompare.length > 2 ? `${productsToCompare[2].stock}m` : ""} |

Which of these would you like to add to your order? I can assist you with that.`;
      } else {
        reply = "I'd be happy to compare products for you! Please specify the exact names of the fabrics you would like to compare (e.g., 'compare Organic Cotton and Luxury Silk').";
      }
    }
    // 2. Check for Specific product search / filtering requests
    else if (
      lowerMessage.includes("search") || 
      lowerMessage.includes("find") || 
      lowerMessage.includes("show me") || 
      lowerMessage.includes("looking for") || 
      lowerMessage.includes("recommend") || 
      lowerMessage.includes("suggest") ||
      lowerMessage.includes("cotton") ||
      lowerMessage.includes("silk") ||
      lowerMessage.includes("denim") ||
      lowerMessage.includes("linen") ||
      lowerMessage.includes("wool") ||
      lowerMessage.includes("polyester")
    ) {
      const queryParams = {};

      // Parse Category
      if (lowerMessage.includes("cotton")) queryParams.category = "Cotton";
      else if (lowerMessage.includes("silk")) queryParams.category = "Silk";
      else if (lowerMessage.includes("denim")) queryParams.category = "Denim";
      else if (lowerMessage.includes("linen")) queryParams.category = "Linen";
      else if (lowerMessage.includes("polyester")) queryParams.category = "Polyester";
      else if (lowerMessage.includes("wool")) queryParams.category = "Wool";

      // Parse Price indicators
      let priceLimit = null;
      const priceMatch = lowerMessage.match(/(?:under|below|less than|cheaper than|budget of)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
      if (priceMatch && priceMatch[1]) {
        priceLimit = parseFloat(priceMatch[1]);
        queryParams.price = { [Op.lte]: priceLimit };
      }

      // Parse MOQ indicators
      let moqLimit = null;
      const moqMatch = lowerMessage.match(/(?:moq|minimum|order)\s*(?:under|below|less than|max)?\s*(\d+)/i);
      if (moqMatch && moqMatch[1]) {
        moqLimit = parseInt(moqMatch[1]);
        queryParams.moq = { [Op.lte]: moqLimit };
      }

      // Parse Colors
      const colors = ["white", "black", "blue", "red", "green", "yellow", "grey", "indigo", "pink", "beige", "navy", "charcoal"];
      let detectedColor = null;
      for (const col of colors) {
        if (lowerMessage.includes(col)) {
          detectedColor = col.charAt(0).toUpperCase() + col.slice(1);
          break;
        }
      }

      // Extract search keywords (strip categories, colors, numbers, and common query phrases)
      let cleanedMsg = lowerMessage
        .replace(/(?:search|find|show me|looking for|recommend|suggest|fabric|fabrics|material|materials|cotton|silk|denim|linen|polyester|wool|rupees|inr|rs|₹|moq|minimum|order|under|below|less than|cheaper than|budget of|above|over|more than|max|maximum|limit)/gi, "")
        .replace(/\d+/g, "")
        .replace(/(?:white|black|blue|red|green|yellow|grey|indigo|pink|beige|navy|charcoal)/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      // Only set search if there are actual words left
      let searchKeyword = cleanedMsg.length > 2 ? cleanedMsg : null;

      // Query database
      const whereClause = { isAvailable: true, ...queryParams };
      if (detectedColor) {
        whereClause.colors = { [Op.contains]: JSON.stringify([detectedColor]) };
      }
      if (searchKeyword) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${searchKeyword}%` } },
          { description: { [Op.iLike]: `%${searchKeyword}%` } },
        ];
      }

      recommendedProducts = await getRecommendations(whereClause, 5);

      // Structure filters for redirection
      filters = {
        category: queryParams.category || "",
        maxPrice: priceLimit || "",
        maxMoq: moqLimit || "",
        color: detectedColor || "",
        search: searchKeyword || "",
      };

      if (recommendedProducts.length > 0) {
        let pListText = recommendedProducts.map((p, idx) => `${idx + 1}. **${p.name}** (${p.category}) - ₹${p.price}/m (MOQ: ${p.moq}m)`).join("\n");
        reply = `I found these fabrics matching your requirements in the database:
        
${pListText}

I have attached these products below for your convenience. Let me know if you would like to inspect details or customize your search filters.`;
      } else {
        // Fallback search: try finding anything relevant
        recommendedProducts = await getRecommendations({}, 3);
        reply = `I couldn't find any products matching your specific query. However, here are some of our popular fabrics that you might like:
        
${recommendedProducts.map((p, idx) => `${idx + 1}. **${p.name}** - ₹${p.price}/m`).join("\n")}

Would you like to search for something else?`;
      }
    }

    // 3. Hugging Face calling or fallback chat response
    if (!reply) {
      const hfApiKey = process.env.HUGGINGFACE_API_KEY;
      if (hfApiKey) {
        try {
          const response = await axios.post(
            "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
            {
              inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>You are the AI Assistant for FabricFlow, a B2B Textile Marketplace. Answer the buyer's questions professionally. If they are asking about purchasing fabrics, suggest they look at the featured fabrics. Keep replies friendly and under 120 words.<|eot_id|><|start_header_id|>user<|end_header_id|>${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
            },
            {
              headers: { Authorization: `Bearer ${hfApiKey}` },
              timeout: 5000,
            }
          );

          if (response.data && response.data[0] && response.data[0].generated_text) {
            const fullText = response.data[0].generated_text;
            reply = fullText.split("<|start_header_id|>assistant<|end_header_id|>").pop().trim();
          }
        } catch (err) {
          console.error("HF Inference API error:", err.message);
        }
      }

      // Local fallback chat if HF not configured or failed
      if (!reply) {
        if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
          reply = "Hello! I am your FabricFlow AI Assistant. I can help you search fabrics, compare specifications, check MOQs, and recommend fabrics based on your business needs. How can I assist you today?";
        } else if (lowerMessage.includes("onboarding") || lowerMessage.includes("onboard")) {
          reply = "For onboarding, we collect your business type, interested fabric categories (like Cotton, Silk, Denim), average order quantity, and budget. This helps us customize your marketplace dashboard. Simply fill out the onboarding wizard on the screen, or tell me here what fabrics you are interested in!";
        } else if (lowerMessage.includes("help") || lowerMessage.includes("thank")) {
          reply = "You're welcome! I'm here to make fabric sourcing easy. Let me know if you need to find specific materials or compare prices.";
        } else {
          reply = "I understand you're interested in textile sourcing. You can search our marketplace for various fabrics such as Cotton, Silk, Linen, and Denim. If you have any specific query like 'compare cotton and denim' or 'show me blue fabric under 200', let me know and I'll find them immediately!";
        }
      }

      // Add general popular recommendations if no products were loaded yet
      recommendedProducts = await getRecommendations({}, 3);
    }

    return res.status(200).json({
      success: true,
      reply,
      products: recommendedProducts,
      filters,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ==========================================
// AI Fabric Specification & Copy Generator (Supplier Autocomplete)
// ==========================================
export const generateFabricSpec = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, message: "Description is required." });
    }

    const lowerDesc = description.toLowerCase();
    let replyJSON = null;

    // Call Hugging Face if configured
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (hfApiKey) {
      try {
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
          {
            inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>You are a professional B2B textile expert. Based on the user's description, generate a detailed fabric catalog record. Return ONLY a valid JSON object matching this structure:
{
  "name": "Generated Product Name",
  "category": "One of: Cotton, Silk, Denim, Linen, Polyester, Wool",
  "colors": ["List of colors"],
  "specifications": {
    "weight": "GSM weight, e.g. 180 gsm",
    "width": "Width in inches, e.g. 58 inches",
    "composition": "Composition percentages, e.g. 100% Cotton"
  },
  "price": Suggested number price in INR per meter (reasonable wholesale price),
  "moq": Suggested wholesale MOQ number in meters (usually 100-500),
  "description": "Generated professional product description (approx 40 words)"
}
Do not add any explanations, markdown code blocks, or text before or after the JSON. It must start with { and end with }.<|eot_id|><|start_header_id|>user<|end_header_id|>${description}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
          },
          {
            headers: { Authorization: `Bearer ${hfApiKey}` },
            timeout: 7000,
          }
        );

        if (response.data && response.data[0] && response.data[0].generated_text) {
          const fullText = response.data[0].generated_text;
          const rawJSON = fullText.split("<|start_header_id|>assistant<|end_header_id|>").pop().trim();
          // Clean possible markdown JSON formatting
          const cleanJSON = rawJSON.replace(/```json/g, "").replace(/```/g, "").trim();
          replyJSON = JSON.parse(cleanJSON);
        }
      } catch (err) {
        console.error("HF generate-spec API error:", err.message);
      }
    }

    // Heuristics Fallback if HF failed/unconfigured
    if (!replyJSON) {
      // Determine category
      let category = "Cotton";
      if (lowerDesc.includes("silk")) category = "Silk";
      else if (lowerDesc.includes("denim")) category = "Denim";
      else if (lowerDesc.includes("linen")) category = "Linen";
      else if (lowerDesc.includes("wool")) category = "Wool";
      else if (lowerDesc.includes("polyester")) category = "Polyester";

      // Determine Name
      let name = `Premium ${category} Fabric`;
      if (lowerDesc.includes("soft")) name = `Soft Premium ${category}`;
      if (lowerDesc.includes("heavy")) name = `Heavyweight Premium ${category}`;
      if (lowerDesc.includes("organic")) name = `Organic ${category} Twill`;

      // Determine Colors
      const colors = [];
      const colList = ["white", "black", "blue", "red", "green", "yellow", "grey", "indigo", "pink", "beige", "navy", "charcoal"];
      colList.forEach(col => {
        if (lowerDesc.includes(col)) {
          colors.push(col.charAt(0).toUpperCase() + col.slice(1));
        }
      });
      if (colors.length === 0) colors.push("Off-White", "Navy", "Charcoal");

      // Default specs based on category
      let weight = "180 gsm";
      let width = "58 inches";
      let composition = `100% ${category}`;
      let price = 150;
      let moq = 200;

      if (category === "Denim") {
        weight = "340 gsm (12oz)";
        width = "60 inches";
        composition = "99% Cotton, 1% Elastane";
        price = 210;
        moq = 300;
      } else if (category === "Silk") {
        weight = "80 gsm";
        width = "44 inches";
        composition = "100% Mulberry Silk";
        price = 450;
        moq = 100;
      } else if (category === "Linen") {
        weight = "150 gsm";
        width = "56 inches";
        composition = "100% Flax Linen";
        price = 190;
        moq = 200;
      } else if (category === "Wool") {
        weight = "280 gsm";
        width = "58 inches";
        composition = "100% Merino Wool";
        price = 500;
        moq = 150;
      }

      // Customize price / moq if mentioned in text (e.g. "under 200", "moq 100")
      const priceMatch = lowerDesc.match(/(?:under|below|around)\s*(\d+)/);
      if (priceMatch && priceMatch[1]) {
        price = parseFloat(priceMatch[1]);
      }

      replyJSON = {
        name,
        category,
        colors,
        specifications: { weight, width, composition },
        price,
        moq,
        description: `Premium grade commercial ${category.toLowerCase()} fabric, suitable for high-demand wholesale manufacturing. Features standard ${weight} construct with ${width} usable width. Formulated from premium ${composition} composition.`,
      };
    }

    return res.status(200).json({
      success: true,
      data: replyJSON,
    });
  } catch (error) {
    console.error("AI Spec Generator Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during AI specification generation.",
    });
  }
};

