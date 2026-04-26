'use strict';
const TABLE_NAME = "user-roles";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    roleId: {
      type: Sequelize.INTEGER, onDelete: 'CASCADE', allowNull: false,
      references: { model: 'roles', key: 'id' },
    },

    adminId: {
      type: Sequelize.INTEGER, onDelete: 'CASCADE',
      references: { model: 'admins', key: 'id' },
    },

    performerId: {
      type: Sequelize.INTEGER, onDelete: 'CASCADE',
      references: { model: 'performers', key: 'id' },
    },

    memberId: {
      type: Sequelize.INTEGER, onDelete: 'CASCADE',
      references: { model: 'members', key: 'id', }
    },

    role: {
      type: Sequelize.ENUM('admin', 'performer', 'member'),
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
    fields: ['roleId', 'memberId'],
    type: 'unique',
    name: 'user_roles_roleId_memberId_key'
  });

  await queryInterface.addConstraint(TABLE_NAME, {
    fields: ['adminId'],
    type: 'unique',
    name: 'user_roles_adminId_key'
  });

  await queryInterface.addConstraint(TABLE_NAME, {
    fields: ['performerId'],
    type: 'unique',
    name: 'user_roles_performerId_key'
  });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(TABLE_NAME, 'user_roles_roleId_memberId_key');
  await queryInterface.removeConstraint(TABLE_NAME, 'user_roles_adminId_key');
  await queryInterface.removeConstraint(TABLE_NAME, 'user_roles_performerId_key');

  await queryInterface.dropTable(TABLE_NAME);
  },
};
