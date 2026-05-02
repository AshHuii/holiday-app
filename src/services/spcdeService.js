'use strict';

const axios = require('axios');
const config = require('../config');

const { baseUrl, serviceKey, timeout } = config.api;

// ── 오퍼레이션 정의 테이블 ────────────────────────────────────
// 새 오퍼레이션 추가 시 이 테이블만 수정하면 됩니다.
const OPERATIONS = {
  holiday:     { path: 'getHoliDeInfo',       label: '국경일' },
  restday:     { path: 'getRestDeInfo',        label: '공휴일' },
  anniversary: { path: 'getAnniversaryInfo',   label: '기념일' },
  divisions24: { path: 'get24DivisionsInfo',   label: '24절기' },
  sundry:      { path: 'getSundryDayInfo',     label: '잡절'   },
};

// ── 헬퍼: statusCode를 부착한 Error 생성 ────────────────────
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// ── 헬퍼: 공공데이터 응답 body에서 items 배열 추출 ───────────
const parseItems = (responseData) => {
  const header = responseData?.response?.header;
  const body   = responseData?.response?.body;

  if (!header || !body) {
    throw createError('공공데이터 API 응답 형식이 올바르지 않습니다.', 502);
  }

  // resultCode '00' 이 아니면 API 레벨 오류
  if (header.resultCode !== '00') {
    const msg = header.resultMsg || '알 수 없는 API 오류';
    throw createError(`공공데이터 API 오류: ${msg}`, 502);
  }

  // 해당 기간 데이터 없음 → 빈 배열 반환 (오류 아님)
  if (!body.items || body.items === '') return [];

  const { item } = body.items;
  if (!item) return [];

  // 단건: 객체 / 복수건: 배열 → 항상 배열로 정규화
  return Array.isArray(item) ? item : [item];
};

// ── 헬퍼: 날짜 문자열 포맷 변환 (20190301 → 2019-03-01) ──────
const formatDate = (locdate) =>
  String(locdate).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

// ── 헬퍼: 아이템 공통 필드 정규화 ────────────────────────────
const normalizeItem = (item) => {
  const base = {
    date:      formatDate(item.locdate),
    name:      item.dateName,
    isHoliday: item.isHoliday === 'Y',
    dateKind:  item.dateKind,
    seq:       item.seq,
  };

  // 24절기·잡절에만 존재하는 추가 필드
  if (item.kst !== undefined)          base.kst          = item.kst.trim();
  if (item.sunLongitude !== undefined) base.sunLongitude = item.sunLongitude;

  return base;
};

// ── 핵심 조회 함수 ───────────────────────────────────────────
/**
 * @param {string} operationKey  - OPERATIONS 키 (예: 'holiday')
 * @param {number} year          - 조회 연도
 * @param {number|null} month    - 조회 월 (null 이면 월 파라미터 생략 → 연간 조회)
 * @returns {Promise<Array>}
 */
const fetchSpcdeInfo = async (operationKey, year, month = null) => {
  const operation = OPERATIONS[operationKey];
  if (!operation) {
    throw createError(`지원하지 않는 오퍼레이션: ${operationKey}`, 400);
  }

  const url = `${baseUrl}/${operation.path}`;
  const params = {
    serviceKey,
    solYear: year,
    _type: 'json',
    numOfRows: 50, // 기념일처럼 건수가 많은 오퍼레이션 대비
  };

  // 월이 제공된 경우에만 파라미터 추가 (가이드 문서상 옵션)
  if (month !== null) {
    params.solMonth = String(month).padStart(2, '0');
  }

  let response;
  try {
    response = await axios.get(url, { params, timeout });
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw createError('공공데이터 API 응답 시간이 초과되었습니다.', 504);
    }
    throw createError('공공데이터 API에 연결할 수 없습니다.', 502);
  }

  const items = parseItems(response.data);
  return items.map(normalizeItem);
};

// ── 오퍼레이션별 래퍼 함수 (컨트롤러에서 호출하는 인터페이스) ─
module.exports = {
  getHolidays:     (year, month) => fetchSpcdeInfo('holiday',     year, month),
  getRestdays:     (year, month) => fetchSpcdeInfo('restday',     year, month),
  getAnniversaries:(year, month) => fetchSpcdeInfo('anniversary', year, month),
  get24Divisions:  (year, month) => fetchSpcdeInfo('divisions24', year, month),
  getSundryDays:   (year, month) => fetchSpcdeInfo('sundry',      year, month),
  OPERATIONS, // 프론트에 메뉴 목록 제공 시 재사용
};