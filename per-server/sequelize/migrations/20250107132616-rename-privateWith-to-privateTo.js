'use strict';
const TABLE_NAME = 'messages';

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn(TABLE_NAME, 'privateWith', 'privateTo');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('messages', 'privateTo', 'privateWith');
  },
};
