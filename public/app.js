'use strict';

// ── 탭 → API 엔드포인트 매핑 ──────────────────────────────
const ENDPOINT_META = {
  holidays:      { label: '국경일',  hasExtra: false },
  restdays:      { label: '공휴일',  hasExtra: false },
  anniversaries: { label: '기념일',  hasExtra: false },
  '24divisions': { label: '24절기', hasExtra: true  },
  sundrydays:    { label: '잡절',   hasExtra: true  },
};

let activeEndpoint = 'holidays';

// ── 초기화 ───────────────────────────────────────────────
function init() {
  const yearEl  = document.getElementById('year');
  const monthEl = document.getElementById('month');
  const thisYear = new Date().getFullYear();

  for (let y = thisYear - 3; y <= thisYear + 2; y++) {
    yearEl.innerHTML += `<option value="${y}" ${y === thisYear ? 'selected' : ''}>${y}년</option>`;
  }
  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, '0');
    monthEl.innerHTML += `<option value="${mm}">${m}월</option>`;
  }

  // 탭 클릭 이벤트
  document.getElementById('tabs').addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab')) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    activeEndpoint = e.target.dataset.endpoint;
  });

  document.getElementById('searchBtn').addEventListener('click', fetchData);
}

// ── API 호출 ─────────────────────────────────────────────
async function fetchData() {
  const year  = document.getElementById('year').value;
  const month = document.getElementById('month').value;
  const section = document.getElementById('result-section');

  section.innerHTML = '<p class="loading">불러오는 중...</p>';

  const query = month ? `year=${year}&month=${month}` : `year=${year}`;

  try {
    const res  = await fetch(`/api/spcde/${activeEndpoint}?${query}`);
    const json = await res.json();

    if (!json.success) {
      section.innerHTML = `<p class="error">⚠️ ${json.error}</p>`;
      return;
    }
    renderResult(json.data, year, month);
  } catch (err) {
    section.innerHTML = `<p class="error">⚠️ 네트워크 오류: ${err.message}</p>`;
  }
}

// ── 결과 렌더링 ──────────────────────────────────────────
function renderResult(data, year, month) {
  const section  = document.getElementById('result-section');
  const meta     = ENDPOINT_META[activeEndpoint];
  const subtitle = month ? `${year}년 ${parseInt(month, 10)}월` : `${year}년 전체`;

  if (data.length === 0) {
    section.innerHTML = `<p class="empty">${subtitle}에 해당하는 ${meta.label} 정보가 없습니다.</p>`;
    return;
  }

  const rows = data.map((item) => {
    const holiday = item.isHoliday
      ? '<span class="badge holiday">휴일</span>'
      : '<span class="badge">평일</span>';

    let extra = '';
    if (meta.hasExtra) {
      if (item.kst)          extra += `<span class="extra">🕐 ${item.kst}</span>`;
      if (item.sunLongitude) extra += `<span class="extra">☀️ 태양황경 ${item.sunLongitude}°</span>`;
    }

    return `
      <li class="result-item">
        <span class="date">${item.date}</span>
        <span class="name">${item.name}</span>
        ${holiday}
        ${extra}
      </li>`;
  }).join('');

  section.innerHTML = `
    <h2>${subtitle} ${meta.label} <small>(${data.length}건)</small></h2>
    <ul class="result-list">${rows}</ul>`;
}

init();