'use strict';
const TABLE_NAME = "banners";

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, 'locale', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn(TABLE_NAME, 'locale');
  }
};
