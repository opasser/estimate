'use strict';
const TABLE_NAME = 'images';

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
      allowNull: false,
      onDelete: 'CASCADE',
    },
    thumbnailPath: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    imagePath: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    thumbH: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    thumbW: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    imgH: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    imgW: {
      type: Sequelize.INTEGER,
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

  await queryInterface.addConstraint(TABLE_NAME, {
    fields: ['performerId'],
    type: 'foreign key',
    name: 'fk_images_performer',
    references: {
      table: 'performers',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('images');
  },
};
