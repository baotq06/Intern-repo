import winston, { Logger, format, Logform } from 'winston';
import lodashPkg from 'lodash';
const { isObject, trimEnd } = lodashPkg;
import { SPLAT } from 'triple-beam';
const { combine, timestamp, printf, colorize, errors, align } = format;
import { loggingConfig } from '../constants/logCfg';
const serviceName =
  process.env.SERVICE_NAME || process.env.npm_package_name || 'nodejs-express-template';
function formatObject(param: any) {
  if (param && param.stack) {
    if (param.ctx && param.type) {
      return JSON.stringify(
        {
          code: param.code,
          type: param.type,
          data: param.data,
        },
        null,
        2,
      );
    }

    return JSON.stringify(param);
  }
  if (isObject(param)) {
    return JSON.stringify(param, null, 2);
  }

  return param;
}
const all = () =>
  format(
    (
      info: any,
      // opts: any
    ) => {
      const splat = info[SPLAT] || [];

      const isSplatTypeMessage =
        typeof info.message === 'string' &&
        (info.message.includes('%s') || info.message.includes('%d') || info.message.includes('%j'));
      if (isSplatTypeMessage) {
        return info;
      }
      let message = formatObject(info.message);
      const rest = splat.map(formatObject).join(' ');
      message = trimEnd(`${message} ${rest}`);

      return {
        ...info,
        message,
      };
    },
  )({ serviceName });
const printJSON = (info: Logform.TransformableInfo) => JSON.stringify(info);
const printLine = (info: Logform.TransformableInfo) =>
  `[${info.timestamp}] ${info.level}  \x1b[34m${info.label}\u001b[39m : ${info.message} ${
    info.stack ? `\n${info.stack}` : ''
  }`;
function resolveFormat(jsonProfile: boolean) {
  return jsonProfile
    ? combine(
        errors({ stack: true }),
        timestamp(),
        format((info) => ({
          ...info,
          level: info.level.toUpperCase(),
        }))(),
        all(),
        align(),
        printf(printJSON),
      )
    : combine(
        errors({ stack: true }),
        timestamp(),
        format((info) => ({
          ...info,
          level: info.level.toUpperCase(),
        }))(),
        all(),
        align(),
        colorize(),
        printf(printLine),
      );
}
const customTransport = [new winston.transports.Console()];
export default class CustomLogger {
  private static customLogger: Logger;
  static create(label: string) {
    if (!this.customLogger) {
      this.customLogger = winston.createLogger({
        level: loggingConfig.level,
        defaultMeta: {
          'service.name': serviceName.toUpperCase(),
        },
        format: resolveFormat(loggingConfig.jsonProfile),
        transports: customTransport,
      });
    }

    return this.customLogger.child({ label: label.toUpperCase() });
  }
  static changeLogLevel(level: string) {
    this.customLogger.transports[0].level = level;
  }
}
