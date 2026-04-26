'use strict';
const TABLE_NAME = 'performers';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, 'paymentRate', {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100,
    },
  });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(TABLE_NAME, 'paymentRate');
  },
};
