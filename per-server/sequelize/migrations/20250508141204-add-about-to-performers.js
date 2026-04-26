'use strict';
const TABLE_NAME = 'performers';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE_NAME, 'about', {
    type: Sequelize.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'birthday', {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  });

  await queryInterface.addColumn(TABLE_NAME, 'gender', {
    type: Sequelize.ENUM('male', 'female', 'trans'),
    allowNull: true,
    defaultValue: null,
  });

  await queryInterface.addColumn(TABLE_NAME, 'bodyType', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  });

  await queryInterface.addColumn(TABLE_NAME, 'language', {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: true,
    defaultValue: null,
  });

  await queryInterface.addColumn(TABLE_NAME, 'sexualOrientation', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(TABLE_NAME, 'about');
  await queryInterface.removeColumn(TABLE_NAME, 'birthday');
  await queryInterface.removeColumn(TABLE_NAME, 'gender');
  await queryInterface.removeColumn(TABLE_NAME, 'bodyType');
  await queryInterface.removeColumn(TABLE_NAME, 'language');
  await queryInterface.removeColumn(TABLE_NAME, 'sexualOrientation');
  },
};
