'use strict';
const TABLE_NAME = 'streams';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, "privateWith", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, "roomId", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, "privacy", {
    type: Sequelize.ENUM("public", "private"),
    allowNull: true,
  });

  await queryInterface.sequelize.query(
    `UPDATE "streams" SET "privacy" = 'public' WHERE "privacy" IS NULL;`
  );

  await queryInterface.changeColumn(TABLE_NAME, "privacy", {
    type: Sequelize.ENUM("public", "private"),
    allowNull: false,
  });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(TABLE_NAME, "privateWith");
  await queryInterface.removeColumn(TABLE_NAME, "roomId");
  await queryInterface.removeColumn(TABLE_NAME, "privacy");
  },
};
