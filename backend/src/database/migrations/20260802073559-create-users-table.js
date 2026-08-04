"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.UUID,

      defaultValue: Sequelize.UUIDV4,

      allowNull: false,

      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING,

      allowNull: false,
    },

    email: {
      type: Sequelize.STRING,

      allowNull: false,

      unique: true,
    },

    password: {
      type: Sequelize.STRING,

      allowNull: false,
    },

    role: {
      type: Sequelize.ENUM("buyer", "supplier"),

      allowNull: false,

      defaultValue: "buyer",
    },

    refresh_token: {
      type: Sequelize.TEXT,

      allowNull: true,
    },

    created_at: {
      type: Sequelize.DATE,

      allowNull: false,

      defaultValue: Sequelize.NOW,
    },

    updated_at: {
      type: Sequelize.DATE,

      allowNull: false,

      defaultValue: Sequelize.NOW,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("users");

  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_users_role";',
  );
}
