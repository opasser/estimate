'use strict';
const TABLE_NAME = "banners";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    scope: {
      type: Sequelize.ENUM('all', 'preview', 'member'),
      allowNull: false,
    },
    section: {
      type: Sequelize.ENUM('index-top', 'index-mid', 'index-bottom', 'custom'),
      allowNull: false,
    },
    url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    alt: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    imgPath: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    imgH: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    imgW: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME);
  },
};
