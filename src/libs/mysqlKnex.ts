import knex, { Knex } from 'knex';
// import { setupCSDeviceMappingModel } from '../models/sql_deviceMapping.model';
import Logger from './logger';

const logger = Logger.create('MYSQL_SETUP');

const dbConfig: Knex.Config = {
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: +process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USERNAME || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
  },
  debug: true,
  pool: { min: 2, max: 10 },
  acquireConnectionTimeout: 10000,
};

const setupMySqlSchemas = async () => {
  logger.info('setting up mysql model');
  await Promise.all([
    // merchant ladder
  ]);
  logger.info('setup mysql model done');
};

export default knex(dbConfig);
export { setupMySqlSchemas };
