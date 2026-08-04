import { DataTypes } from "sequelize";

export default (sequelize) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "order_id",
        references: {
          model: "orders",
          key: "id",
        },
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "product_id",
        references: {
          model: "products",
          key: "id",
        },
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "product_name",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "order_items",
      timestamps: true,
      underscored: true,
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: "orderId",
      as: "order",
      onDelete: "CASCADE",
    });
    OrderItem.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
      onDelete: "SET NULL",
    });
  };

  return OrderItem;
};
