'use strict';
const TABLE_NAME = 'payouts';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    performerId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'performers',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    comment: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    amount: {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME);
  },
};
