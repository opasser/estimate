'use strict';
const TABLE_NAME = 'streams';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, 'currentViewers', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'maxViewers', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(TABLE_NAME, 'currentViewers');
  await queryInterface.removeColumn(TABLE_NAME, 'maxViewers');
  },
};
