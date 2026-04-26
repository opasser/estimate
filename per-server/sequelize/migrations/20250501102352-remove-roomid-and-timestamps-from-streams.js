'use strict';
const TABLE_NAME = 'streams';

module.exports = {
  async up(queryInterface)  {
    await queryInterface.removeColumn(TABLE_NAME, 'roomId');
    await queryInterface.removeColumn(TABLE_NAME, 'createdAt');
    await queryInterface.removeColumn(TABLE_NAME, 'updatedAt');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, 'roomId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn(TABLE_NAME, 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    });

    await queryInterface.addColumn(TABLE_NAME, 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    });
  },
};
