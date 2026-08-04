export default (sequelize, DataTypes) => {
  const Rfq = sequelize.define(
    "Rfq",
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
      title: {
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
      targetPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "target_price",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      targetDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "target_date",
      },
      specifications: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      status: {
        type: DataTypes.ENUM("open", "fulfilled", "cancelled"),
        allowNull: false,
        defaultValue: "open",
      },
    },
    {
      tableName: "rfqs",
      timestamps: true,
      underscored: true,
    }
  );

  Rfq.associate = (models) => {
    Rfq.belongsTo(models.BuyerProfile, {
      foreignKey: "buyerId",
      as: "buyer",
      onDelete: "CASCADE",
    });
    Rfq.hasMany(models.RfqQuote, {
      foreignKey: "rfqId",
      as: "quotes",
      onDelete: "CASCADE",
    });
  };

  return Rfq;
};
