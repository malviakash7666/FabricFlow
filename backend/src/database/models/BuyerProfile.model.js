export default (sequelize, DataTypes) => {
  const BuyerProfile = sequelize.define(
    "BuyerProfile",
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
        field: "user_id",
      },

      businessName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "business_name",
      },

      businessType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "business_type",
      },

      industry: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
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

      preferredFabricTypes: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        field: "preferred_fabric_types",
      },

      interestedCategories: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        field: "interested_categories",
      },

      typicalOrderQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "typical_order_quantity",
      },

      budgetMin: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: "budget_min",
      },

      budgetMax: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: "budget_max",
      },

      isOnboarded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_onboarded",
      },
    },
    {
      tableName: "buyer_profiles",
      underscored: true,
      timestamps: true,
    },
  );

  BuyerProfile.associate = (models) => {
    BuyerProfile.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
    BuyerProfile.hasMany(models.Order, {
      foreignKey: "buyerId",
      as: "orders",
      onDelete: "CASCADE",
    });
  };

  return BuyerProfile;
};
