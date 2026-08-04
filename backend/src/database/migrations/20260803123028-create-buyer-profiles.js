/** @type {import("sequelize-cli").Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("buyer_profiles", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,

      references: {
        model: "users",
        key: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    business_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    business_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    industry: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    country: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    state: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    city: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    address: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    preferred_fabric_types: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    interested_categories: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    typical_order_quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    budget_min: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },

    budget_max: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },

    is_onboarded: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("buyer_profiles");
}