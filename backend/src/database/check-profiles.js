import db from "./models/index.js";

const check = async () => {
  try {
    const users = await db.User.findAll({ raw: true });
    console.log("USERS IN DB:", users);

    const suppliers = await db.SupplierProfile.findAll({ raw: true });
    console.log("SUPPLIERS IN DB:", suppliers);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.sequelize.close();
  }
};

check();
