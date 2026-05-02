'use strict';

const app    = require('./app');
const config = require('./config');

const { port, env } = config.server;

app.listen(port, () => {
  console.log(`[Server] 환경: ${env}`);
  console.log(`[Server] 실행 중: http://localhost:${port}`);
});