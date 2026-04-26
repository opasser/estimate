'use strict';
const TABLE_NAME = 'payments';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, 'payoutId', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'payouts',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(TABLE_NAME, 'payoutId');
  },
};
