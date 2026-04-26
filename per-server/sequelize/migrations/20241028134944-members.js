'use strict';
const TABLE_NAME = 'members';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },

    providerId: { type: Sequelize.INTEGER, allowNull: false },

    email: { type: Sequelize.STRING, allowNull: false, unique: true },

    name: { type: Sequelize.STRING, allowNull: false },

    status: { type: Sequelize.ENUM('free', 'premium'), allowNull: false },

    lastToken: { type: Sequelize.TEXT, allowNull: false },

    createdAt: { type: Sequelize.DATE, allowNull: false },

    updatedAt: { type: Sequelize.DATE, allowNull: false }
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME, {});
  },
};
