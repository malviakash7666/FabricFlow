/** @type {import("sequelize-cli").Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("rfqs", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    buyer_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "buyer_profiles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    target_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    target_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    specifications: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    status: {
      type: Sequelize.ENUM("open", "fulfilled", "cancelled"),
      allowNull: false,
      defaultValue: "open",
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
  await queryInterface.dropTable("rfqs");
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_rfqs_status";'
  );
}
