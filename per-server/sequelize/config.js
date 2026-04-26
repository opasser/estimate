const process = require('node:process');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('node:path');

const environment = process.env.NODE_ENV;

const filePath = path.join(__dirname, '../', `.${environment}.env`);

const data = dotenv.parse(fs.readFileSync(filePath));

const config = {
  development: {
    dialect: 'postgres',
    url: data.DATABASE_URL,
  },
  test: {
    dialect: 'postgres',
    url: data.DATABASE_URL,
  },
  production: {
    dialect: 'postgres',
    url: data.DATABASE_URL,
  },
};

module.exports = config;
