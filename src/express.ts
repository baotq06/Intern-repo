import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Logger from './libs/logger';
import apis from './services/main';
import middlewares, { IAM } from './middlewares';
import { ExpressHandler, ProxyExpressHandler } from './interfaces/expressHandler';
import newValidator from './middlewares/paramValidator';
import defaultRoute from './middlewares/defaultRoute';
import unhandedErrorFault from './middlewares/unhandedErrorRoute';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fixApiPath from './utils/fixApiPath';
import { authenticateToken } from './middlewares/tokenValidation';





async function ExpressServer() {
  const logger = Logger.create('EXPRESS SERVER');
  const app = express();
  // setup global middleware
  app.use(helmet());
  app.use(cors());

  let excludeProxyPath = '';
  const proxyPathList: string[] = [];
  //extract proxy for global middleware config
  apis.forEach(async (api: ExpressHandler | ProxyExpressHandler) => {
    if ('proxy' in api) {
      proxyPathList.push(fixApiPath(api.path));
    }
  });
  if (proxyPathList.length > 0) {
    excludeProxyPath =
      '^\\/(?!' +
      proxyPathList
        .map((path: string) => {
          return '\\/?' + path.replace('/', '').replaceAll('/', '\\/') + '\\/?';
        })
        .join('|') +
      ').*$';
    logger.info('excludeProxyPath', excludeProxyPath);
    app.use(new RegExp(excludeProxyPath), middlewares);
  } else {
    app.use(...middlewares);
  }
  app.use(IAM);
  apis.forEach(async (api: ExpressHandler | ProxyExpressHandler) => {
    if ('proxy' in api) {
      // proxying
      const targetUrl = api.proxy;
      const proxyPath = fixApiPath(api.path);
      logger.info('REGISTERING PROXY', proxyPath, targetUrl);
      if (api.preProxyMiddlewares) {
        logger.debug('APPLY preProxyMiddlewares', proxyPath);
        app.use(`${proxyPath}`, api.preProxyMiddlewares);
      }
      app.use(
        `${proxyPath}`,
        createProxyMiddleware({
          target: targetUrl,
          changeOrigin: true,
          ws: true,
          pathRewrite(currentPath) {
            logger.debug(currentPath.replace(proxyPath + '/', '/'));

            return currentPath.replace(proxyPath + '/', '/');
          },
          onError(err, req, res, target) {
            logger.error('PROXY ERROR', target, err);
            res.writeHead(500, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({ success: false, message: err.message, code: 'PROXY_ERROR' }));
          },
        }),
      );
    } else if ('method' in api) {
      // setup apis
      const path = fixApiPath(api.path);
      const method = api.method.toLowerCase();
      //normal api register
      const funcs: RequestHandler[] = [];
      // setup custom preValidatorMiddlewares
      if (api.preValidatorMiddlewares && api.preValidatorMiddlewares.length > 0) {
        funcs.push(...api.preValidatorMiddlewares);
      }
      // setup new validator
      if (api.params) {
        funcs.push(newValidator(api.params));
      }
      // setup custom preValidatorMiddlewares
      if (api.postValidatorMiddlewares && api.postValidatorMiddlewares.length > 0) {
        funcs.push(...api.postValidatorMiddlewares);
      }
      // add handler
      funcs.push(api.action);
      // register api
      logger.info('REGISTERING', method.toUpperCase(), path);
      switch (method) {
        case 'get':
          app.get(`${path}`, ...funcs);
          break;
        case 'post':
          app.post(`${path}`, ...funcs);
          break;
        case 'delete':
          app.delete(`${path}`, ...funcs);
          break;
        case 'put':
          app.put(`${path}`, ...funcs);
          break;
        case 'patch':
          app.patch(`${path}`, ...funcs);
          break;
        default:
          app.all(`${path}`, ...funcs);
          break;
      }
    }
  });
  // async system route
  app.use(defaultRoute);
  app.use(unhandedErrorFault);
  // start server
  const expressPort = process.env.HTTP_PORT || process.env.PORT || 80;
  const server = app.listen(expressPort, () => {
    logger.info('SERVER STARTED AT', expressPort);
  });

  const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  signalTraps.map((signal) => {
    return process.on(signal, () => {
      logger.info(`${signal} signal received, closing server`);
      server.close(() => {
        logger.info('HTTP server closed');
      });
      process.exit(0);
    });
  });

  process
    .on('unhandledRejection', (reason, p) => {
      logger.error('Unhandled Rejection');
      logger.error(reason);
      logger.error('At Promise', p);
    })
    .on('uncaughtException', (err) => {
      logger.error('Uncaught Exception thrown');
      logger.error(err);
      // is not safe to resume normal operation after 'uncaughtException'
      process.exit(1);
    });
}
export default ExpressServer;
