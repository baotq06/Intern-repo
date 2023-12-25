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
  try {
  logger.info('setting up mysql model');
  // await Promise.all([]);
  const result = await knex(dbConfig).raw('select (1+1) as test ');
  logger.info('result mysql: ', result?.[0]);
  logger.info('setup mysql model done');
  } catch (err: any) {
    logger.error('setup mysql schema failed: ', err.message);
  }
};

export default knex(dbConfig);
export { setupMySqlSchemas };
