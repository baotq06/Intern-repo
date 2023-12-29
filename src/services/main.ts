import { ExpressHandler, ProxyExpressHandler } from '../interfaces/expressHandler';
import healthCheckApis from './user_mongodb';
import usersMysql from './users_mysql';
import loggerCfgApis from './loggerCfg';
import demoProxy from './proxy/demo';
import demo2Proxy from './proxy/demo2';
import login_uuid from './login';
import demoApis from './authenticateTokens';
import paginateAPI from './panging';

const apis: (ExpressHandler | ProxyExpressHandler)[] = [
  ...healthCheckApis,
  ...usersMysql,
  ...login_uuid,
  ...loggerCfgApis,
  ...demoProxy,
  ...demo2Proxy,
  ...demoApis,
  ...paginateAPI,
];

export default apis;
