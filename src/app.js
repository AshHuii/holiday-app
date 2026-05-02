'use strict';

const express = require('express');
const spcdeRoutes = require('./routes/spcdeRoutes');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// 모든 특일 API는 /api/spcde 하위로 그룹화
app.use('/api/spcde', spcdeRoutes);

// ── 전역 에러 핸들러 ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status  = err.statusCode || 500;
  const message = err.message   || '서버 내부 오류가 발생했습니다.';

  if (status === 500) console.error('[Unhandled Error]', err);

  res.status(status).json({ success: false, error: message });
});

module.exports = app;