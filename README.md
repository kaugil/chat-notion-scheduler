# 📅 Chat Notion Scheduler

채팅으로 일정을 등록하면 자동으로 Notion에 저장되는 웹 애플리케이션입니다.

## ✨ 주요 기능

- 💬 **자연어 일정 입력**: "내일 오후 3시 회의"처럼 자연스럽게 입력
- 📝 **자동 파싱**: 날짜, 시간, 제목을 자동으로 분석
- 🔄 **Notion 자동 연동**: 입력한 일정이 즉시 Notion 데이터베이스에 저장
- 🇰🇷 **한국어 지원**: 한국어 날짜/시간 표현 완벽 지원
- 🎨 **직관적인 UI**: 채팅 인터페이스로 쉽고 빠른 일정 등록

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
cd chat-notion-scheduler
npm install
```

### 2. 서버 실행

```bash
npm start
```

브라우저가 자동으로 열리며 `http://localhost:3000`에서 앱이 실행됩니다.

### 3. Notion 설정

1. **Notion Integration 생성**
   - [Notion Integrations 페이지](https://www.notion.so/my-integrations) 방문
   - "New integration" 클릭
   - 이름 입력 후 "Submit" 클릭
   - 생성된 "Internal Integration Token" 복사

2. **데이터베이스 생성**
   - Notion에서 새 페이지 생성
   - `/database` 입력 후 "Table - Inline" 선택
   - 다음 속성 추가:
     - **제목** (Title)
     - **날짜** (Date)
     - **시간** (Text)
     - **설명** (Text)

3. **데이터베이스 연결**
   - 페이지 우측 상단 "..." → "Add connections" → 생성한 Integration 선택
   - 페이지 URL에서 Database ID 복사
     - 예: `https://notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **앱에서 설정**
   - 앱의 설정 패널에 Token과 Database ID 입력
   - "설정 저장" 클릭

## 📖 사용 방법

### 지원하는 날짜 표현

- **상대적 날짜**
  - `오늘`, `내일`, `모레`
  - `다음 주`, `다음주`
  - `월요일`, `화요일`, `수요일`, `목요일`, `금요일`, `토요일`, `일요일`

- **절대적 날짜**
  - `2026년 7월 5일`
  - `7월 5일`

### 지원하는 시간 표현

- **오전/오후 형식**
  - `오전 9시`, `오후 3시`
  - `오전 9시 30분`, `오후 3시 45분`

- **24시간 형식**
  - `14시`, `9시`
  - `14시 30분`, `9시 45분`

- **콜론 형식**
  - `14:30`, `09:45`

### 입력 예시

```
내일 오후 3시 회의
→ 날짜: 2026년 7월 4일, 시간: 15:00, 제목: 회의

2026년 7월 10일 오전 10시 프로젝트 발표
→ 날짜: 2026년 7월 10일, 시간: 10:00, 제목: 프로젝트 발표

다음주 월요일 저녁 7시 저녁 약속
→ 날짜: 2026년 7월 7일, 시간: 19:00, 제목: 저녁 약속

금요일 14:30 팀 미팅
→ 날짜: 2026년 7월 4일, 시간: 14:30, 제목: 팀 미팅
```

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Notion API v1
- **Storage**: LocalStorage (설정 저장)

## 📁 프로젝트 구조

```
chat-notion-scheduler/
├── public/
│   ├── index.html      # 메인 HTML
│   ├── app.js          # 애플리케이션 로직
│   └── styles.css      # 스타일시트
├── package.json        # 프로젝트 설정
├── README.md          # 프로젝트 문서
├── QUICKSTART.md      # 빠른 시작 가이드
└── .gitignore         # Git 제외 파일
```

## 🔒 보안 참고사항

- Notion Token은 브라우저의 LocalStorage에 저장됩니다
- 프로덕션 환경에서는 백엔드 서버를 통해 API 호출을 프록시하는 것을 권장합니다
- Token을 공유하거나 공개 저장소에 커밋하지 마세요

## 🤝 기여하기

이슈나 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스

MIT License

## 🙋‍♂️ 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.

---

Made with ❤️ by Bob