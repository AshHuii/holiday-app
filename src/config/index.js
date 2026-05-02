'use strict';

require('dotenv').config();

const REQUIRED_KEYS = ['SERVICE_KEY'];
REQUIRED_KEYS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[Config] 필수 환경 변수 누락: ${key}`);
    process.exit(1);
  }
});

const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  api: {
    serviceKey: process.env.SERVICE_KEY,
    baseUrl: 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService',
    timeout: 5000,
  },
};

module.exports = config;