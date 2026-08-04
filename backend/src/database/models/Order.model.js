import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      buyerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "buyer_id",
        references: {
          model: "buyer_profiles",
          key: "id",
        },
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "supplier_id",
        references: {
          model: "supplier_profiles",
          key: "id",
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: "total_amount",
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "accepted",
          "preparing",
          "ready_for_dispatch",
          "completed"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "shipping_address",
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "contact_name",
      },
      trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "tracking_number",
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      underscored: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.BuyerProfile, {
      foreignKey: "buyerId",
      as: "buyer",
      onDelete: "CASCADE",
    });
    Order.belongsTo(models.SupplierProfile, {
      foreignKey: "supplierId",
      as: "supplier",
      onDelete: "CASCADE",
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: "orderId",
      as: "items",
      onDelete: "CASCADE",
    });
  };

  return Order;
};
