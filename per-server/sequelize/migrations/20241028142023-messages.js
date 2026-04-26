'use strict';
const TABLE_NAME = 'messages';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    streamId: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'streams',
        key: 'streamId',
      },
      onDelete: 'CASCADE',
    },

    participantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    nickName: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    role: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    private: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    privacy: {
      type: Sequelize.ENUM('private', 'public'),
      allowNull: false,
    },

    privateWith: { type: Sequelize.STRING, allowNull: true },

    createdAt: { type: Sequelize.DATE, allowNull: false },

    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME, {});
  },
};
