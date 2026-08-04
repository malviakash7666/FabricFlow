/** @type {import("sequelize-cli").Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("supplier_profiles", {
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

    contact_person: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false,

      validate: {
        isEmail: true,
      },
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

    operating_hours: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    product_categories: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    fabric_types: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    minimum_order_quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    description: {
      type: Sequelize.TEXT,
      allowNull: true,
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
  await queryInterface.dropTable("supplier_profiles");
}