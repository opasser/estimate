'use strict';
const TABLE_NAME = 'tag-performer';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

    performerId: {
      type: Sequelize.INTEGER, allowNull: false,
      references: { model: 'performers', key: 'id' },
      onDelete: 'CASCADE',
    },
    tagId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'tags', key: 'id' },
      onDelete: 'CASCADE',
    },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME);
  },
};
