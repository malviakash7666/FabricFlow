export default (sequelize, DataTypes) => {
  const RfqQuote = sequelize.define(
    "RfqQuote",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      rfqId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "rfq_id",
        references: {
          model: "rfqs",
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
      offeredPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "offered_price",
      },
      estimatedDeliveryDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "estimated_delivery_days",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "rfq_quotes",
      timestamps: true,
      underscored: true,
    }
  );

  RfqQuote.associate = (models) => {
    RfqQuote.belongsTo(models.Rfq, {
      foreignKey: "rfqId",
      as: "rfq",
      onDelete: "CASCADE",
    });
    RfqQuote.belongsTo(models.SupplierProfile, {
      foreignKey: "supplierId",
      as: "supplier",
      onDelete: "CASCADE",
    });
  };

  return RfqQuote;
};
