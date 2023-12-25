/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
module.exports = {
  serviceName:
    process.env.SERVICE_NAME || process.env.npm_package_name || 'nodejs-express-template',
  serverUrl: process.env.ELASTIC_APM_SERVER_URLS,
  active: process.env.ELASTIC_APM_ENABLED === 'true',
  environment: process.env.ELASTIC_APM_ENVIRONMENT,
  captureBody: 'all',
  logUncaughtExceptions: process.env.ELASTIC_APM_LOG_UNCAUGHT_EXCEPTIONS === 'true',
};
