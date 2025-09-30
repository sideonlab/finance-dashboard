# 재무 데이터 시각화 분석 서비스

누구나 쉽게 이해할 수 있는 재무 데이터 시각화 서비스입니다.

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenDART API 키 (2단계에서 사용)
OPENDART_API_KEY=your_opendart_api_key_here

# Gemini API 키 (3단계에서 사용)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📋 개발 단계

### ✅ 1단계: 검색 기능
- [x] corp.xml 파일을 JSON으로 파싱
- [x] 회사명 검색 API 구현
- [x] 검색 UI 컴포넌트 개발
- [x] 실시간 검색 (디바운스 적용)

### ✅ 2단계: 시각화
- [x] OpenDART API 연동
- [x] 재무 데이터 차트 구현 (Chart.js)
- [x] 반응형 대시보드
- [x] 재무상태표 도넛 차트
- [x] 손익계산서 막대 차트
- [x] 연도별/보고서별 데이터 조회

### ✅ 3단계: AI 분석
- [x] Google Gemini AI SDK 연동
- [x] 재무 데이터 AI 분석 엔진
- [x] 사용자 친화적 인사이트 제공
- [x] 강점/약점 자동 분석
- [x] 투자 추천 및 위험 요소 분석
- [x] 탭 기반 차트/AI 분석 전환

## 🛠 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **API**: Next.js API Routes
- **데이터**: OpenDART API
- **AI**: Google Gemini API

## 📁 프로젝트 구조

```
finance-app/
├── src/
│   ├── app/
│   │   ├── api/search/route.ts    # 검색 API
│   │   └── page.tsx               # 메인 페이지
│   ├── components/
│   │   └── CompanySearch.tsx      # 검색 컴포넌트
│   └── types/
│       └── company.ts             # 타입 정의
├── public/data/
│   └── companies.json             # 회사 데이터
├── scripts/
│   └── parseCorpData.js           # XML 파싱 스크립트
└── corp.xml                       # 원본 회사 데이터
```

## 🔍 검색 기능

- **회사명 검색**: 한글 회사명으로 검색
- **영문명 검색**: 영문 회사명으로 검색  
- **종목코드 검색**: 6자리 종목코드로 검색
- **실시간 검색**: 타이핑과 동시에 결과 표시
- **자동완성**: 드롭다운 형태의 검색 결과

## 📊 데이터 소스

- **회사 정보**: OpenDART corp.xml (3,864개 회사)
- **재무 데이터**: OpenDART API
- **AI 분석**: Google Gemini API