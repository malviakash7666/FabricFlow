import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      colors: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      specifications: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      imageUrls: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        field: "image_urls",
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_available",
      },
      moq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
    },
    {
      tableName: "products",
      timestamps: true,
      underscored: true,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.SupplierProfile, {
      foreignKey: "supplierId",
      as: "supplier",
      onDelete: "CASCADE",
    });
    Product.hasMany(models.CartItem, {
      foreignKey: "productId",
      as: "cartItems",
      onDelete: "CASCADE",
    });
    Product.hasMany(models.OrderItem, {
      foreignKey: "productId",
      as: "orderItems",
      onDelete: "SET NULL",
    });
  };

  return Product;
};
