import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",

    {
      id: {
        type: DataTypes.UUID,

        defaultValue: DataTypes.UUIDV4,

        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,

        allowNull: false,

        unique: true,

        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM("buyer", "supplier"),

        allowNull: false,

        defaultValue: "buyer",
      },

      refreshToken: {
        type: DataTypes.TEXT,

        allowNull: true,
      },
    },

    {
      tableName: "users",

      timestamps: true,

      underscored: true,
    },
  );
  User.associate = (models) => {
    User.hasOne(models.BuyerProfile, {
      foreignKey: "userId",
      as: "buyerProfile",
      onDelete: "CASCADE",
    });
    User.hasOne(models.SupplierProfile, {
      foreignKey: "userId",
      as: "supplierProfile",
      onDelete: "CASCADE",
    });
  };
  return User;
};
