'use strict';
const TABLE_NAME = 'streams';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },

    streamId: {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false
    },

    status: {
      type: Sequelize.ENUM('active', 'finished'),
      allowNull: false
    },

    startTime: {
      type: Sequelize.DATE,
      allowNull: false
    },

    endTime: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    },

    performerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'performers',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    createdAt: { type: Sequelize.DATE, allowNull: false },

    updatedAt: { type: Sequelize.DATE, allowNull: false }
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME, {});
  },
};
