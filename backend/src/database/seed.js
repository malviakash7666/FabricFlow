import db from "./models/index.js";
import bcrypt from "bcrypt";

const seedDatabase = async () => {
  try {
    console.log("⏳ Connecting to database and syncing tables...");
    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: true });
    console.log("✅ Tables synced successfully.");

    console.log("⏳ Clearing existing data (Cascading delete)...");
    // Clear existing users, which will cascade delete profiles and products
    await db.User.destroy({ where: {}, cascade: true });
    console.log("✅ Database cleared.");

    console.log("⏳ Generating hashed passwords...");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("Password123", saltRounds);

    console.log("⏳ Creating users...");
    // 1. Create Buyer User
    const buyerUser = await db.User.create({
      name: "Rahul Verma",
      email: "buyer@fabricflow.com",
      password: hashedPassword,
      role: "buyer",
    });

    // 2. Create Supplier User
    const supplierUser = await db.User.create({
      name: "Amit Sharma",
      email: "supplier@fabricflow.com",
      password: hashedPassword,
      role: "supplier",
    });

    console.log("✅ Users created.");

    console.log("⏳ Creating profiles...");
    // 3. Create Buyer Profile
    const buyerProfile = await db.BuyerProfile.create({
      userId: buyerUser.id,
      businessName: "Apex Garments Ltd",
      businessType: "Garment Manufacturer",
      industry: "Apparel",
      phone: "+91 98765 43210",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      address: "402, Cotton Exchange Building, Kalbadevi, Mumbai - 400002",
      preferredFabricTypes: ["Cotton", "Linen", "Denim"],
      interestedCategories: ["Woven", "Knitted"],
      typicalOrderQuantity: 1000,
      budgetMin: 50000.0,
      budgetMax: 250000.0,
      isOnboarded: true,
    });

    // 4. Create Supplier Profile
    const supplierProfile = await db.SupplierProfile.create({
      userId: supplierUser.id,
      businessName: "Vardhman Textile Mills",
      businessType: "Textile Mill",
      contactPerson: "Amit Sharma (Sales Director)",
      phone: "+91 99999 88888",
      email: "supplier@fabricflow.com",
      country: "India",
      state: "Gujarat",
      city: "Ahmedabad",
      address: "Plot 12, GIDC Apparel Park, Khokhra, Ahmedabad - 380008",
      operatingHours: "9 AM - 6 PM",
      productCategories: ["Woven", "Denim", "Yarn Dye"],
      fabricTypes: ["Cotton", "Linen", "Denim", "Polyester"],
      minimumOrderQuantity: 200,
      description: "Vardhman Mills is one of the largest vertically integrated textile manufacturers in India, specializing in high-grade organic cotton, premium ring-spun denim, and yarn-dyed shirts.",
      isOnboarded: true,
    });

    console.log("✅ Profiles created.");

    console.log("⏳ Creating products...");
    // 5. Create Products linked to Supplier
    const productsData = [
      {
        supplierId: supplierProfile.id,
        name: "Organic Cotton Twill 220 GSM",
        category: "Cotton",
        description: "Soft, breathable organic cotton twill fabric suitable for summer pants, jackets, and structured dresses. Eco-certified dyed.",
        colors: ["Off-White", "Navy Blue", "Olive Green", "Beige"],
        specifications: {
          weight: "220 gsm",
          width: "58 inches",
          composition: "100% Organic Cotton",
        },
        price: 145.0,
        stock: 8000,
        imageUrls: ["https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600"],
        moq: 200,
        isAvailable: true,
      },
      {
        supplierId: supplierProfile.id,
        name: "Premium Ring-Spun Indigo Denim 12oz",
        category: "Denim",
        description: "Heavyweight authentic indigo dyed ring-spun denim. Classic twill structure, excellent for vintage washing styles.",
        colors: ["Indigo", "Raw Black", "Light Blue"],
        specifications: {
          weight: "340 gsm (12oz)",
          width: "60 inches",
          composition: "99% Cotton, 1% Elastane",
        },
        price: 210.0,
        stock: 5000,
        imageUrls: ["https://images.unsplash.com/photo-1582485566276-8f300ec0962b?w=600"],
        moq: 300,
        isAvailable: true,
      },
      {
        supplierId: supplierProfile.id,
        name: "Luxury Mulberry Silk Satin",
        category: "Silk",
        description: "High-shine, premium-grade pure mulberry silk satin. Smooth drape, exquisite finish. Ideal for luxury sleepwear and evening gowns.",
        colors: ["Champagne", "Ruby Red", "Emerald Green", "Classic Black"],
        specifications: {
          weight: "80 gsm (19 momme)",
          width: "44 inches",
          composition: "100% Mulberry Silk",
        },
        price: 480.0,
        stock: 1500,
        imageUrls: ["https://images.unsplash.com/photo-1590736969955-71cb94801759?w=600"],
        moq: 100,
        isAvailable: true,
      },
      {
        supplierId: supplierProfile.id,
        name: "Belgian Lightweight Flax Linen",
        category: "Linen",
        description: "Sourced Belgian flax linen, washed finish. Highly breathable and moisture-wicking, perfect for hot weather shirts and trousers.",
        colors: ["Natural Flax", "White", "Slate Grey"],
        specifications: {
          weight: "150 gsm",
          width: "56 inches",
          composition: "100% Belgian Linen",
        },
        price: 195.0,
        stock: 3000,
        imageUrls: ["https://images.unsplash.com/photo-1545048702-79362596cdc9?w=600"],
        moq: 200,
        isAvailable: true,
      },
      {
        supplierId: supplierProfile.id,
        name: "Fine Merino Wool Twill",
        category: "Wool",
        description: "Superfine merino wool twill sourced from Australian wool yards. Perfect insulation, moisture resistance, ideal for premium blazers and suits.",
        colors: ["Charcoal Grey", "Navy", "Jet Black"],
        specifications: {
          weight: "280 gsm",
          width: "58 inches",
          composition: "100% Merino Wool",
        },
        price: 550.0,
        stock: 1200,
        imageUrls: ["https://images.unsplash.com/photo-1574169208507-84376144848b?w=600"],
        moq: 150,
        isAvailable: true,
      },
    ];

    await db.Product.bulkCreate(productsData);
    console.log("✅ Products created successfully.");
    console.log("\n🚀 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n");
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  } finally {
    await db.sequelize.close();
    console.log("🔌 Database connection closed.");
  }
};

seedDatabase();
