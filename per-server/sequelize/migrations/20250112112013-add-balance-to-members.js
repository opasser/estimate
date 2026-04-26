'use strict';
const TABLE_NAME = 'members';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, 'balance', {
    type: Sequelize.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0,
  });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(TABLE_NAME, 'balance');
  },
};
