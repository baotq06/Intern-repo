import pg from 'pg'
import Logger from './logger';

const logger = Logger.create('mysql');
const dbServer = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: <number>(<unknown>process.env.MYSQL_PORT) || 5432,
  user: process.env.MYSQL_USERNAME || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const mySqlConnection = new Promise((resolve, reject) => {
  try {
    console.log(dbServer);
    resolve(
      new pg.Pool
        (dbServer)

    );
  } catch (e: any) {
    reject(e);
  }
});
const sqlConnection: any = await mySqlConnection;

export default sqlConnection;
