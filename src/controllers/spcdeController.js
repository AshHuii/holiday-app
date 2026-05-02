'use strict';

const spcdeService = require('../services/spcdeService');

// ── 입력값 검증 ─────────────────────────────────────────────
const validateParams = (year, month) => {
  const y = parseInt(year, 10);
  const m = month !== undefined ? parseInt(month, 10) : null;

  if (!year || isNaN(y) || y < 2000 || y > 2100) {
    return { valid: false, message: '유효한 year 값이 필요합니다. (2000~2100)' };
  }
  if (m !== null && (isNaN(m) || m < 1 || m > 12)) {
    return { valid: false, message: '유효한 month 값이 필요합니다. (1~12)' };
  }
  return { valid: true, year: y, month: m };
};

// ── 핸들러 팩토리 ──────────────────────────────────────────
// 오퍼레이션마다 별도 함수를 만들지 않고, 서비스 메서드를 주입받아 생성합니다.
const createHandler = (serviceMethod) => async (req, res, next) => {
  const { year, month } = req.query;
  const validated = validateParams(year, month);

  if (!validated.valid) {
    return res.status(400).json({ success: false, error: validated.message });
  }

  try {
    const data = await serviceMethod(validated.year, validated.month);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    return next(err); // 전역 에러 핸들러로 위임
  }
};

module.exports = {
  getHolidays:      createHandler(spcdeService.getHolidays),
  getRestdays:      createHandler(spcdeService.getRestdays),
  getAnniversaries: createHandler(spcdeService.getAnniversaries),
  get24Divisions:   createHandler(spcdeService.get24Divisions),
  getSundryDays:    createHandler(spcdeService.getSundryDays),
};