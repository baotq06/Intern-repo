import { LoggingConfig } from '../interfaces/logCfg';
const acceptedLevel = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
const loggingConfig: LoggingConfig = {
  jsonProfile: process.env.JSON_LOGGING_PROFILE === 'true',
  level: acceptedLevel.includes(process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'debug',
};

export { loggingConfig, acceptedLevel };
