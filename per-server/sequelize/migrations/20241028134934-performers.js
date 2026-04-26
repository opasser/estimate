'use strict';
const TABLE_NAME = 'performers';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },

    name: { type: Sequelize.STRING, unique: true, allowNull: false },

    nickName: { type: Sequelize.STRING, unique: true, allowNull: false },

    email: { type: Sequelize.STRING, unique: true, allowNull: false },

    password: { type: Sequelize.STRING, unique: false, allowNull: false },

    lastLogin: { type: Sequelize.DATE, allowNull: true },

    avatarUrl: { type: Sequelize.STRING, allowNull: true },

    isPublic: { type: Sequelize.BOOLEAN, allowNull: false },

    createdAt: { type: Sequelize.DATE, allowNull: false },

    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME, {});
  },
};
