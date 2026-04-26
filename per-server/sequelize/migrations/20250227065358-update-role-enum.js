'use strict';
const TABLE_NAME = 'messages';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(TABLE_NAME, 'role', {
    type: Sequelize.ENUM('member', 'performer', 'tips-action'),
    allowNull: false,
  });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(TABLE_NAME, 'role', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  },
};
