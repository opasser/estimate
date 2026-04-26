'use strict';
const TABLE_NAME = 'members';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, 'lang', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'en',
  });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(TABLE_NAME, 'lang');
  },
};
