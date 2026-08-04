/** @type {import("sequelize-cli").Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("rfq_quotes", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    rfq_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "rfqs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    supplier_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "supplier_profiles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    offered_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    estimated_delivery_days: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "pending",
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
  await queryInterface.dropTable("rfq_quotes");
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_rfq_quotes_status";'
  );
}
