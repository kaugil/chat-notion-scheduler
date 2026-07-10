# 📧 Outlook 연동 대안 가이드

Azure AD 접근 권한이 없는 경우의 대안 방법입니다.

## 🚫 문제 상황

회사 메일 계정으로 Azure Portal의 Azure Active Directory에 접근할 수 없는 경우:
- "권한이 없습니다" 오류
- Azure AD 메뉴가 보이지 않음
- 앱 등록 메뉴 접근 불가

## ✅ 해결 방법

### 방법 1: IT 관리자에게 요청 (권장)

회사 IT 관리자에게 다음을 요청하세요:

#### 요청 내용

```
제목: Microsoft Graph API 앱 등록 요청

안녕하세요,

업무 자동화를 위해 Microsoft Graph API를 사용하는 애플리케이션을 개발 중입니다.
다음 설정을 도와주실 수 있을까요?

1. Azure AD 앱 등록
   - 앱 이름: Chat Notion Scheduler
   - 지원 계정: 조직 내부만

2. API 권한 (애플리케이션 권한)
   - Mail.Send: 이메일 발송용
   - Calendars.ReadWrite: 캘린더 관리용 (선택)

3. 클라이언트 시크릿 생성
   - 만료: 24개월

4. 필요한 정보
   - 애플리케이션(클라이언트) ID
   - 디렉터리(테넌트) ID
   - 클라이언트 시크릿 값

5. 사용 목적
   - Notion 일정 등록 시 자동 이메일 알림
   - 일정 D-1 자동 알림 발송

감사합니다.
```

#### IT 관리자가 제공할 정보

```
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MICROSOFT_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
USER_EMAIL=your-email@company.com
```

이 정보를 받으면 [OUTLOOK_SETUP.md의 5단계](OUTLOOK_SETUP.md#5-mcp-설정-파일-업데이트)부터 진행하세요.

---

### 방법 2: 개인 Microsoft 계정 사용

회사 승인을 기다리는 동안 개인 계정으로 테스트할 수 있습니다.

#### 2.1 개인 Microsoft 계정 생성

1. [Microsoft 계정 생성](https://signup.live.com/)
2. Outlook.com 이메일 주소 생성 (예: yourname@outlook.com)

#### 2.2 Azure Portal 접근

1. [Azure Portal](https://portal.azure.com) 접속
2. 개인 Microsoft 계정으로 로그인
3. "무료 계정 만들기" 클릭
4. Azure 무료 계정 생성 (신용카드 필요하지만 과금 없음)

#### 2.3 앱 등록

개인 계정으로는 Azure AD 대신 **"Microsoft Entra ID"** 사용:

1. Azure Portal → "Microsoft Entra ID" 검색
2. "앱 등록" → "새 등록"
3. [OUTLOOK_SETUP.md](OUTLOOK_SETUP.md)의 1-4단계 진행

⚠️ **주의**: 개인 계정은 테스트용으로만 사용하고, 실제 업무에는 회사 계정을 사용하세요.

---

### 방법 3: SMTP를 통한 간단한 이메일 발송

Azure AD 접근이 어려운 경우, SMTP를 사용하는 간단한 버전으로 구현할 수 있습니다.

#### 장단점

**장점:**
- Azure AD 설정 불필요
- 간단한 구현
- 대부분의 이메일 서비스 지원

**단점:**
- D-1 알림 기능 제한적 (서버 필요)
- Microsoft Graph API 기능 사용 불가
- 보안성 낮음 (앱 비밀번호 필요)

#### 구현 방법

이 방법을 원하시면 말씀해주세요. SMTP 기반 버전으로 수정해드리겠습니다.

---

### 방법 4: 기존 기능만 사용

Outlook 연동 없이 Notion 연동만 사용:

1. 설정 패널에서 "Outlook 이메일 발송 활성화" 체크 해제
2. Notion 연동만으로 일정 관리
3. Notion에서 직접 알림 설정

---

## 🔍 권한 확인 방법

### 현재 권한 확인

1. [Azure Portal](https://portal.azure.com) 접속
2. 우측 상단 프로필 아이콘 클릭
3. "내 권한 보기" 클릭

### 필요한 권한

다음 중 하나가 있어야 앱 등록 가능:
- **전역 관리자** (Global Administrator)
- **애플리케이션 관리자** (Application Administrator)
- **클라우드 애플리케이션 관리자** (Cloud Application Administrator)

권한이 없다면 IT 관리자에게 요청해야 합니다.

---

## 📝 IT 관리자용 설정 가이드

IT 관리자가 이 문서를 보시는 경우, 다음 단계로 설정할 수 있습니다:

### 1. 앱 등록

```
Azure Portal → Azure Active Directory → 앱 등록 → 새 등록

이름: Chat Notion Scheduler
계정 유형: 이 조직 디렉터리의 계정만
리디렉션 URI: (비워두기)
```

### 2. API 권한

```
API 권한 → 권한 추가 → Microsoft Graph → 애플리케이션 권한

추가할 권한:
- Mail.Send
- Calendars.ReadWrite (선택)

관리자 동의 허용 클릭
```

### 3. 클라이언트 시크릿

```
인증서 및 비밀 → 새 클라이언트 암호

설명: MCP Server Secret
만료: 24개월
```

### 4. 정보 제공

다음 정보를 사용자에게 안전하게 전달:
- 애플리케이션(클라이언트) ID
- 디렉터리(테넌트) ID
- 클라이언트 시크릿 값

---

## 💡 추천 순서

1. **먼저 시도**: IT 관리자에게 요청 (방법 1)
2. **테스트용**: 개인 Microsoft 계정 사용 (방법 2)
3. **대안**: SMTP 이메일 발송 (방법 3)
4. **최소 기능**: Notion만 사용 (방법 4)

---

## 🆘 추가 도움

더 궁금한 사항이 있으시면 말씀해주세요:
- SMTP 버전으로 변경
- 다른 이메일 서비스 연동
- 대안 솔루션 제안

---

Made with ❤️ by Bob