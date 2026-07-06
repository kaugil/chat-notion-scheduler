# 🚀 빠른 시작 가이드

Chat Notion Scheduler를 5분 안에 시작하세요!

## 📋 사전 준비

- Node.js 설치 (v14 이상)
- Notion 계정
- 웹 브라우저

## 🎯 3단계로 시작하기

### 1단계: 프로젝트 설치 및 실행

```bash
# 프로젝트 디렉토리로 이동
cd chat-notion-scheduler

# 의존성 설치
npm install

# 서버 실행
npm start
```

브라우저가 자동으로 열리고 `http://localhost:3000`에서 앱이 실행됩니다.

### 2단계: Notion Integration 설정 (2분)

#### 2-1. Integration 생성

1. [Notion Integrations 페이지](https://www.notion.so/my-integrations) 접속
2. **"+ New integration"** 클릭
3. 다음 정보 입력:
   - **Name**: `Chat Scheduler` (원하는 이름)
   - **Associated workspace**: 사용할 워크스페이스 선택
4. **"Submit"** 클릭
5. 생성된 **"Internal Integration Token"** 복사 (나중에 사용)
   - 형식: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 2-2. 데이터베이스 생성

1. Notion에서 **새 페이지** 생성
2. 페이지 이름: `일정 관리` (원하는 이름)
3. 페이지 내에서 `/database` 입력
4. **"Table - Inline"** 선택
5. 다음 **4개 속성** 추가:

| 속성 이름 | 속성 타입 | 설명 |
|---------|---------|------|
| 제목 | Title | 일정 제목 (기본 제공) |
| 날짜 | Date | 일정 날짜 |
| 시간 | Text | 일정 시간 |
| 설명 | Text | 일정 설명 |

#### 2-3. Integration 연결

1. 데이터베이스 페이지 우측 상단 **"..."** 클릭
2. **"Add connections"** 선택
3. 앞서 생성한 Integration 선택 (예: `Chat Scheduler`)
4. **"Confirm"** 클릭

#### 2-4. Database ID 복사

1. 데이터베이스 페이지의 **URL 복사**
   - 예: `https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
2. URL에서 `?` 앞의 32자리 ID 복사
   - 예: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3단계: 앱에서 설정 입력

1. 브라우저에서 열린 앱 하단의 **"⚙️ Notion 설정"** 패널 확인
2. **Notion Integration Token** 입력 (2-1에서 복사한 값)
3. **Database ID** 입력 (2-4에서 복사한 값)
4. **"설정 저장"** 클릭
5. ✅ "설정이 저장되었습니다!" 메시지 확인

## 🎉 첫 일정 등록하기

이제 채팅창에 일정을 입력해보세요!

### 예시 1: 간단한 일정
```
내일 오후 3시 회의
```

### 예시 2: 구체적인 일정
```
2026년 7월 10일 오전 10시 프로젝트 발표
```

### 예시 3: 요일 기반 일정
```
금요일 저녁 7시 저녁 약속
```

입력 후 **"전송"** 버튼을 클릭하면:
1. 일정이 자동으로 분석됩니다
2. Notion 데이터베이스에 저장됩니다
3. 성공 메시지가 표시됩니다

## 🔍 문제 해결

### "⚠️ 먼저 Notion 설정을 완료해주세요" 오류

- **원인**: Token이나 Database ID가 입력되지 않음
- **해결**: 3단계의 설정을 다시 확인하고 입력

### "❌ Notion 연동 실패" 오류

**가능한 원인:**

1. **Token이 잘못됨**
   - Integration 페이지에서 Token을 다시 복사
   - `secret_`로 시작하는지 확인

2. **Database ID가 잘못됨**
   - URL에서 32자리 ID를 정확히 복사했는지 확인
   - 하이픈(-)이나 공백이 포함되지 않았는지 확인

3. **Integration이 데이터베이스에 연결되지 않음**
   - 2-3 단계를 다시 수행
   - 데이터베이스 페이지에서 "Connections"에 Integration이 표시되는지 확인

4. **데이터베이스 속성이 올바르지 않음**
   - 데이터베이스에 다음 속성이 있는지 확인:
     - 제목 (Title)
     - 날짜 (Date)
     - 시간 (Text)
     - 설명 (Text)

### 브라우저 콘솔 확인

문제가 계속되면:
1. 브라우저에서 **F12** 키 누르기
2. **Console** 탭 확인
3. 빨간색 오류 메시지 확인

## 💡 팁

### 설정 저장 위치
- 설정은 브라우저의 LocalStorage에 저장됩니다
- 브라우저를 닫아도 설정이 유지됩니다
- 다른 브라우저에서는 다시 설정해야 합니다

### 여러 데이터베이스 사용
- 다른 Database ID를 입력하면 다른 데이터베이스에 저장할 수 있습니다
- 업무용/개인용 데이터베이스를 분리해서 사용 가능

### 모바일에서 사용
- 모바일 브라우저에서도 동일하게 작동합니다
- 반응형 디자인으로 모바일에 최적화되어 있습니다

## 📚 더 알아보기

- [README.md](README.md) - 전체 문서
- [Notion API 문서](https://developers.notion.com/)
- [지원하는 날짜/시간 표현](README.md#지원하는-날짜-표현)

## 🆘 도움이 필요하신가요?

앱 내 **"💡 Notion 설정 방법 보기"** 링크를 클릭하면 상세한 설정 가이드를 볼 수 있습니다.

---

즐거운 일정 관리 되세요! 📅✨