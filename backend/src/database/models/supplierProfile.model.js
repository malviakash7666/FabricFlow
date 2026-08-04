import { DataTypes } from "sequelize";

export default (sequelize) => {
  const SupplierProfile = sequelize.define(
    "SupplierProfile",
    {
      id: {
        type: DataTypes.UUID,

        defaultValue: DataTypes.UUIDV4,

        primaryKey: true,
      },

      userId: {
        type: DataTypes.UUID,

        allowNull: false,

        unique: true,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",

        onDelete: "CASCADE",
      },

      businessName: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      businessType: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      contactPerson: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,

        allowNull: false,

        validate: {
          isEmail: true,
        },
      },

      country: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      state: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      city: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      address: {
        type: DataTypes.TEXT,

        allowNull: false,
      },

      operatingHours: {
        type: DataTypes.STRING,

        allowNull: true,
      },

      productCategories: {
        type: DataTypes.JSONB,

        allowNull: false,

        defaultValue: [],
      },

      fabricTypes: {
        type: DataTypes.JSONB,

        allowNull: false,

        defaultValue: [],
      },

      minimumOrderQuantity: {
        type: DataTypes.INTEGER,

        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,

        allowNull: true,
      },

      isOnboarded: {
        type: DataTypes.BOOLEAN,

        defaultValue: false,
      },
    },

    {
      tableName: "supplier_profiles",

      timestamps: true,

      underscored: true,
    },
  );

  SupplierProfile.associate = (models) => {
    SupplierProfile.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    SupplierProfile.hasMany(models.Product, {
      foreignKey: "supplierId",
      as: "products",
      onDelete: "CASCADE",
    });
    SupplierProfile.hasMany(models.Order, {
      foreignKey: "supplierId",
      as: "orders",
      onDelete: "CASCADE",
    });
  };

  return SupplierProfile;
};
