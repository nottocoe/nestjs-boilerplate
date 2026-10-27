const { config } = require('dotenv');
const { resolve } = require('path');
const { defineConfig } = require('prisma/config');

const envPathRoot = resolve(__dirname, '../../../.env');
config({ path: envPathRoot });

const host = process.env.DATABASE_HOST || 'localhost';
const port = process.env.DATABASE_PORT || '5432';
const database = process.env.DATABASE_NAME;
const user = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const sslMode = process.env.DATABASE_SSL === 'true' ? 'no-verify' : 'disable';

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=${sslMode}`;

module.exports = defineConfig({
  datasource: {
    url: connectionString,
  },
});
