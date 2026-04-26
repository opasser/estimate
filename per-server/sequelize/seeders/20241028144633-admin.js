'use strict';

const { CryptService } = require('../../src/crypt/crypt.service');
const cryptService = new CryptService();

module.exports = {
  up: async (queryInterface) => {
    const hashedPassword = await cryptService.getHashedPassword('bunny_admin');

    const admin = [
      {
        name: 'bunny_admin',
        email: 'admin@bunny.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('admins', admin);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('admin', null, {});
  },
};
