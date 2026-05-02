# 📅 특일 정보 조회 서비스

한국천문연구원 공공데이터 API를 활용한 특일(국경일·공휴일·기념일·24절기·잡절) 정보 조회 웹 서비스입니다.

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 데이터 출처 | [공공데이터포털 - 특일 정보제공 서비스](https://www.data.go.kr/data/15012690/openapi.do) |
| 제공 기관 | 한국천문연구원 (SC-OA-09-04) |
| 인터페이스 | REST API (JSON) |
| 아키텍처 | 계층형 아키텍처 (Layered Architecture) |

---

## 🗂 디렉토리 구조

```
holiday-app/
├── src/
│   ├── app.js                # Express 앱 인스턴스, 미들웨어 및 전역 에러 핸들러
│   ├── server.js             # 서버 구동 (포트 리스닝)
│   ├── config/
│   │   └── index.js          # 환경 변수 검증 및 외부 API 설정
│   ├── routes/
│   │   └── spcdeRoutes.js    # API 엔드포인트 정의
│   ├── controllers/
│   │   └── spcdeController.js # 요청/응답 처리 및 입력 검증
│   └── services/
│       └── spcdeService.js   # 공공데이터 API 호출 및 데이터 가공
├── public/
│   ├── index.html            # 프론트엔드 UI
│   ├── app.js                # 클라이언트 사이드 로직
│   └── style.css             # 스타일
├── .env                      # 환경 변수 (git 미포함)
├── .gitignore
└── package.json
```

---

## ⚙️ 아키텍처 설명

관심사 분리(Separation of Concerns) 원칙에 따른 **계층형 아키텍처**로 설계되었습니다.

```
[Browser] → [Routes] → [Controller] → [Service] → [공공데이터 API]
```

| 계층 | 역할 |
|------|------|
| `routes` | URL 엔드포인트와 컨트롤러 함수 연결만 담당 |
| `controllers` | req 파싱, 입력 검증, res 응답 담당. 서비스 에러를 HTTP 상태 코드로 변환 |
| `services` | 외부 API 호출 및 데이터 파싱·정규화. Express의 req/res에 독립적 |
| `config` | 환경 변수 검증 및 설정값 제공. 필수 키 누락 시 서버 구동 차단 |

`app.js`와 `server.js`를 분리하여 테스트 시 포트 충돌 없이 앱 인스턴스를 단독으로 사용할 수 있습니다.

---

## 🛠 기술 스택

- **Runtime**: Node.js
- **Framework**: Express
- **HTTP Client**: Axios
- **환경 변수 관리**: dotenv
- **Frontend**: Vanilla HTML / CSS / JavaScript

---

## 🚀 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 입력합니다.

```
SERVICE_KEY=발급받은_Decoding_키_입력
PORT=3000
NODE_ENV=development
```

> API 키는 [공공데이터포털](https://www.data.go.kr/data/15012690/openapi.do)에서 활용 신청 후 발급받을 수 있습니다.  
> 신청 후 최대 1~2시간 내 활성화됩니다.

### 3. 서버 실행

```bash
# 일반 실행
npm start

# 개발 모드 (nodemon)
npm run dev
```

### 4. 브라우저 접속

```
http://localhost:3000
```

---

## 📡 API 엔드포인트

모든 엔드포인트는 `year` (필수)와 `month` (옵션) 쿼리 파라미터를 받습니다.

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/spcde/holidays` | 국경일 조회 (제헌절 포함, isHoliday=N 가능) |
| GET | `/api/spcde/restdays` | 공휴일 조회 (실제 쉬는 날, 제헌절 제외) |
| GET | `/api/spcde/anniversaries` | 기념일 조회 |
| GET | `/api/spcde/24divisions` | 24절기 조회 (kst, sunLongitude 포함) |
| GET | `/api/spcde/sundrydays` | 잡절 조회 (단오, 한식 등) |

**요청 예시**

```
GET /api/spcde/holidays?year=2025&month=03
GET /api/spcde/24divisions?year=2025
```

**응답 예시**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "date": "2025-03-01",
      "name": "삼일절",
      "isHoliday": true,
      "dateKind": "01",
      "seq": 1
    }
  ]
}
```

**에러 응답 예시**

```json
{
  "success": false,
  "error": "유효한 year 값이 필요합니다. (2000~2100)"
}
```

---

## 📊 dateKind 분류표

| dateKind | 분류 | 예시 |
|----------|------|------|
| `01` | 국경일 | 어린이날, 광복절, 개천절 |
| `02` | 기념일 | 의병의 날, 4·19 혁명 기념일 |
| `03` | 24절기 | 청명, 경칩, 하지 |
| `04` | 잡절 | 단오, 한식 |

---

## ⚠️ 에러 핸들링

서비스 계층에서 발생 가능한 에러를 유형별로 처리합니다.

| 상황 | HTTP 상태 코드 |
|------|---------------|
| year/month 누락 또는 범위 초과 | 400 Bad Request |
| 공공데이터 API 레벨 오류 (resultCode ≠ 00) | 502 Bad Gateway |
| 공공데이터 API 응답 형식 이상 | 502 Bad Gateway |
| 응답 타임아웃 (5초 초과) | 504 Gateway Timeout |
| 네트워크 연결 실패 | 502 Bad Gateway |

---

## 🔒 보안 유의사항

- `.env` 파일은 `.gitignore`에 포함되어 있으며 **절대 저장소에 커밋하지 않습니다.**
- API 키는 서버 사이드에서만 사용되며 브라우저에 노출되지 않습니다.
