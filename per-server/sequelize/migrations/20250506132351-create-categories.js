'use strict';
const TABLE_NAME = 'categories';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    url: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    thumbnail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    seoTitle: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    seoDescription: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    seoKeywords: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    seoH1: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: { type: Sequelize.DATE, allowNull: false },

    updatedAt: { type: Sequelize.DATE, allowNull: false }
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME);
  },
};
