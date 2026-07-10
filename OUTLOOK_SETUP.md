# 📧 Outlook 연동 설정 가이드

chat-notion-scheduler에서 Outlook 이메일 발송 및 D-1 알림 기능을 사용하기 위한 설정 가이드입니다.

## 📋 목차

1. [사전 요구사항](#사전-요구사항)
2. [Microsoft 365 앱 등록](#1-microsoft-365-앱-등록)
3. [API 권한 설정](#2-api-권한-설정)
4. [클라이언트 시크릿 생성](#3-클라이언트-시크릿-생성)
5. [MCP 서버 설치](#4-mcp-서버-설치)
6. [MCP 설정 파일 업데이트](#5-mcp-설정-파일-업데이트)
7. [웹 앱에서 Outlook 활성화](#6-웹-앱에서-outlook-활성화)
8. [테스트](#7-테스트)

---

## 사전 요구사항

- Microsoft 365 계정 (회사 또는 학교 계정)
- Azure Portal 접근 권한
- Node.js 설치 (v18 이상)
- 관리자 권한 (API 권한 승인용)

---

## 1. Microsoft 365 앱 등록

### 1.1 Azure Portal 접속

1. [Azure Portal](https://portal.azure.com)에 로그인
2. 검색창에 "Azure Active Directory" 입력 후 선택

### 1.2 앱 등록

1. 왼쪽 메뉴에서 **"앱 등록"** 클릭
2. **"+ 새 등록"** 클릭
3. 다음 정보 입력:
   - **이름**: `Chat Notion Scheduler` (또는 원하는 이름)
   - **지원되는 계정 유형**: "이 조직 디렉터리의 계정만" 선택
   - **리디렉션 URI**: 비워두기
4. **"등록"** 클릭

### 1.3 필요한 정보 복사

등록 완료 후 **"개요"** 페이지에서 다음 정보를 복사하여 메모장에 저장:

```
애플리케이션(클라이언트) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
디렉터리(테넌트) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 2. API 권한 설정

### 2.1 권한 추가

1. 왼쪽 메뉴에서 **"API 권한"** 클릭
2. **"+ 권한 추가"** 클릭
3. **"Microsoft Graph"** 선택
4. **"애플리케이션 권한"** 선택

### 2.2 필요한 권한 추가

다음 권한을 검색하여 추가:

- ✅ `Mail.Send` - 이메일 발송
- ✅ `Calendars.ReadWrite` - 캘린더 읽기/쓰기 (선택사항)

### 2.3 관리자 동의

1. **"[조직명]에 대한 관리자 동의 허용"** 클릭
2. 확인 대화상자에서 **"예"** 클릭
3. 상태가 "허용됨"으로 변경되었는지 확인

> ⚠️ **중요**: 관리자 동의가 없으면 API 호출이 실패합니다.

---

## 3. 클라이언트 시크릿 생성

### 3.1 시크릿 생성

1. 왼쪽 메뉴에서 **"인증서 및 비밀"** 클릭
2. **"클라이언트 암호"** 탭 선택
3. **"+ 새 클라이언트 암호"** 클릭
4. 다음 정보 입력:
   - **설명**: `MCP Server Secret`
   - **만료**: 24개월 (권장)
5. **"추가"** 클릭

### 3.2 시크릿 값 복사

⚠️ **매우 중요**: 생성된 **"값"** 열의 내용을 즉시 복사하여 안전한 곳에 저장하세요. 이 페이지를 벗어나면 다시 볼 수 없습니다!

```
클라이언트 시크릿 값: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4. MCP 서버 설치

### 4.1 의존성 설치

터미널에서 다음 명령어 실행:

```bash
cd /Users/ygkwon/Documents/IBM\ Bob/MCP/outlook-server
npm install
```

### 4.2 빌드

```bash
npm run build
```

빌드가 완료되면 `build/index.js` 파일이 생성됩니다.

---

## 5. MCP 설정 파일 업데이트

### 5.1 설정 파일 열기

```bash
code ~/.bob/settings/mcp_settings.json
```

또는 직접 편집:

```bash
nano ~/.bob/settings/mcp_settings.json
```

### 5.2 Outlook 서버 추가

기존 `mcpServers` 객체에 다음 내용 추가:

```json
{
  "mcpServers": {
    "outlook": {
      "command": "node",
      "args": ["/Users/ygkwon/Documents/IBM Bob/MCP/outlook-server/build/index.js"],
      "env": {
        "MICROSOFT_CLIENT_ID": "여기에_클라이언트_ID_입력",
        "MICROSOFT_CLIENT_SECRET": "여기에_클라이언트_시크릿_입력",
        "MICROSOFT_TENANT_ID": "여기에_테넌트_ID_입력",
        "USER_EMAIL": "your-email@company.com"
      },
      "disabled": false,
      "alwaysAllow": [],
      "disabledTools": []
    }
  }
}
```

### 5.3 환경 변수 입력

위에서 복사한 정보를 입력:

- `MICROSOFT_CLIENT_ID`: 애플리케이션(클라이언트) ID
- `MICROSOFT_CLIENT_SECRET`: 클라이언트 시크릿 값
- `MICROSOFT_TENANT_ID`: 디렉터리(테넌트) ID
- `USER_EMAIL`: 이메일을 발송할 사용자의 이메일 주소

**예시:**

```json
{
  "mcpServers": {
    "outlook": {
      "command": "node",
      "args": ["/Users/ygkwon/Documents/IBM Bob/MCP/outlook-server/build/index.js"],
      "env": {
        "MICROSOFT_CLIENT_ID": "12345678-1234-1234-1234-123456789abc",
        "MICROSOFT_CLIENT_SECRET": "abcdefghijklmnopqrstuvwxyz123456789",
        "MICROSOFT_TENANT_ID": "87654321-4321-4321-4321-cba987654321",
        "USER_EMAIL": "john.doe@company.com"
      },
      "disabled": false,
      "alwaysAllow": [],
      "disabledTools": []
    }
  }
}
```

### 5.4 저장 및 확인

1. 파일 저장 (Ctrl+S 또는 :wq)
2. JSON 형식이 올바른지 확인

---

## 6. 웹 앱에서 Outlook 활성화

### 6.1 앱 접속

브라우저에서 앱 열기:
- 로컬: http://localhost:3000
- 배포: https://chat-notion-scheduler.vercel.app/

### 6.2 설정 패널 열기

1. 화면 하단의 **"⚙️ 설정"** 클릭
2. 설정 패널이 펼쳐집니다

### 6.3 Outlook 설정

**📧 Outlook 설정** 섹션에서:

1. ✅ **"Outlook 이메일 발송 활성화"** 체크
2. **"알림 받을 이메일"**에 이메일 주소 입력
   - 예: `your-email@company.com`
3. ✅ **"D-1 알림 자동 발송"** 체크 (원하는 경우)
4. **"설정 저장"** 클릭

---

## 7. 테스트

### 7.1 간단한 일정 등록

채팅창에 입력:

```
내일 오후 3시 테스트 회의
```

### 7.2 확인 사항

성공 시 다음 메시지가 표시됩니다:

```
✅ 일정이 Notion에 등록되었습니다!

📅 날짜: 2026년 7월 11일 (금)
⏰ 시간: 15:00
📝 제목: 테스트 회의
📧 Outlook 이메일이 발송되었습니다!
⏰ D-1 알림이 예약되었습니다!
```

### 7.3 이메일 확인

1. 입력한 이메일 주소의 받은편지함 확인
2. **"[일정 등록] 테스트 회의"** 제목의 이메일 확인

---

## 🔧 문제 해결

### 문제 1: "Failed to acquire access token"

**원인**: 클라이언트 ID, 시크릿, 테넌트 ID가 잘못되었거나 관리자 동의가 없음

**해결**:
1. MCP 설정 파일의 환경 변수 확인
2. Azure Portal에서 관리자 동의 상태 확인
3. 클라이언트 시크릿이 만료되지 않았는지 확인

### 문제 2: "Insufficient privileges"

**원인**: API 권한이 올바르게 설정되지 않음

**해결**:
1. Azure Portal → 앱 등록 → API 권한 확인
2. `Mail.Send` 권한이 **애플리케이션 권한**으로 추가되었는지 확인
3. 관리자 동의가 허용되었는지 확인

### 문제 3: MCP 서버가 시작되지 않음

**원인**: 빌드 오류 또는 의존성 문제

**해결**:
```bash
cd /Users/ygkwon/Documents/IBM\ Bob/MCP/outlook-server
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 문제 4: 이메일이 발송되지 않음

**원인**: USER_EMAIL이 잘못되었거나 권한 문제

**해결**:
1. MCP 설정의 `USER_EMAIL`이 실제 Microsoft 365 계정인지 확인
2. 해당 계정이 이메일 발송 권한이 있는지 확인

---

## 📚 추가 리소스

- [Microsoft Graph API 문서](https://docs.microsoft.com/graph/)
- [Azure AD 앱 등록 가이드](https://docs.microsoft.com/azure/active-directory/develop/quickstart-register-app)
- [MCP 프로토콜 문서](https://modelcontextprotocol.io/)

---

## 💡 팁

1. **보안**: 클라이언트 시크릿은 절대 공개 저장소에 커밋하지 마세요
2. **테스트**: 먼저 테스트 계정으로 설정을 완료한 후 프로덕션에 적용하세요
3. **모니터링**: Azure Portal에서 API 호출 로그를 확인할 수 있습니다
4. **만료**: 클라이언트 시크릿 만료일을 캘린더에 등록하세요

---

Made with ❤️ by Bob