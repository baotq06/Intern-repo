/* eslint-disable import/first */
import * as apmAgent from 'elastic-apm-node/start';
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
apmAgent;
import cluster from 'cluster';
import os from 'os';
import ExpressServer from './express';
// import mongodb from './libs/mongodb';
// import mysql from './libs/mysql';
// import redis from './libs/redis';
import Logger from './libs/logger';
import mongodb from './libs/mongodb';
import mysql from './libs/mysql';
const serviceName =
  process.env.SERVICE_NAME || process.env.npm_package_name || 'nodejs-express-template';
const logger = Logger.create('index.ts');
async function start() {
  logger.info(`>>>>>>>>>>${serviceName.toUpperCase()}<<<<<<<<<<`);
  // >>>>>>EXPRESS
  ExpressServer();

  // >>>>>>MONGODB
  mongodb();

  // >>>>>>MYSQL
  const sqlConnection: any = await mysql;
  await sqlConnection.query('SELECT NOW()');

  // >>>>>> REDIS
  // const redisClient = redis.getClient();
  // await redisClient.setex('key', 10, 'true');
  // const bool = await redisClient.get('key') || false;
  // logger.info('redis check', bool);
}

let numOfCpu = os.cpus().length;
const clusterFlag = process.env.ENABLE_CLUSTER === 'true';
if (clusterFlag && numOfCpu > 2) {
  const max = +process.env.MAXIMUM_CLUSTER || 2;
  if (numOfCpu > max) {
    numOfCpu = max;
  }
  if (cluster.isPrimary) {
    logger.info(`Master ${process.pid} is running`);
    for (let i = 0; i < numOfCpu; i += 1) {
      cluster.fork();
    }
    // GLOBAL CATCH
    cluster.on('exit', (worker, code, signal) => {
      logger.error('Worker', worker.id, ' has exited by signal', signal, 'code', code);
      cluster.fork();
    });
  } else {
    logger.info(`Worker ${process.pid} joined`);
    start();
  }
} else {
  start();
}
