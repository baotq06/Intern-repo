import { ExpressHandler, ProxyExpressHandler } from '../interfaces/expressHandler';
import healthCheckApis from './user_mongodb';
import usersMysql from './users_mysql';
import loggerCfgApis from './loggerCfg';
import demoProxy from './proxy/demo';
import demo2Proxy from './proxy/demo2';
import login from './login';
import demoApis from './authenticateTokens';

const apis: (ExpressHandler | ProxyExpressHandler)[] = [
  ...healthCheckApis,
  ...usersMysql,
  ...login,
  ...loggerCfgApis,
  ...demoProxy,
  ...demo2Proxy,
  ...demoApis
];
export default apis;
