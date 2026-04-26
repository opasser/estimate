'use strict';
const TABLE_NAME = 'payments';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: Sequelize.ENUM('tips', 'c2c', 'stream'),
      allowNull: false,
    },
    performerId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: 'SET NULL',
      references: {
        model: 'performers',
        key: 'id',
      },
    },
    memberId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: 'SET NULL',
      references: {
        model: 'members',
        key: 'id',
      },
    },
    streamId: {
      type: Sequelize.STRING,
      allowNull: true,
      onDelete: 'SET NULL',
      references: {
        model: 'streams',
        key: 'streamId',
      },
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    performerRate: {
      type: Sequelize.FLOAT,
      allowNull: false,
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
