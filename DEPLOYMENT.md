# 🚀 GitHub Pages 배포 가이드

이 문서는 Chat Notion Scheduler를 GitHub Pages에 배포하는 방법을 설명합니다.

## 📋 사전 준비

- GitHub 계정
- Git 설치

## 🔧 배포 단계

### 1단계: Git 저장소 초기화

```bash
cd chat-notion-scheduler
git init
git add .
git commit -m "Initial commit: Chat Notion Scheduler"
```

### 2단계: GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단 "+" 클릭 → "New repository" 선택
3. 저장소 정보 입력:
   - **Repository name**: `chat-notion-scheduler` (원하는 이름)
   - **Description**: "채팅으로 일정을 등록하면 자동으로 Notion에 저장되는 웹 애플리케이션"
   - **Public** 선택 (GitHub Pages는 Public 저장소에서 무료)
4. "Create repository" 클릭

### 3단계: 원격 저장소 연결 및 푸시

```bash
# 원격 저장소 추가 (YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/chat-notion-scheduler.git

# 기본 브랜치를 main으로 설정
git branch -M main

# 푸시
git push -u origin main
```

### 4단계: GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 좌측 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서:
   - **Source**: "GitHub Actions" 선택
5. 자동으로 배포가 시작됩니다

### 5단계: 배포 확인

1. **Actions** 탭에서 배포 진행 상황 확인
2. 배포 완료 후 다음 URL에서 접속:
   ```
   https://YOUR_USERNAME.github.io/chat-notion-scheduler/
   ```

## 📱 모바일 접속

배포된 URL은 모바일 브라우저에서도 동일하게 작동합니다:
- iOS Safari
- Android Chrome
- 기타 모바일 브라우저

반응형 디자인으로 모바일 화면에 최적화되어 있습니다.

## 🔄 업데이트 배포

코드를 수정한 후 다시 배포하려면:

```bash
git add .
git commit -m "Update: 변경 내용 설명"
git push
```

푸시하면 자동으로 GitHub Actions가 실행되어 배포됩니다.

## 🌐 커스텀 도메인 설정 (선택사항)

자신의 도메인을 사용하려면:

1. GitHub 저장소 **Settings** → **Pages**
2. **Custom domain** 섹션에 도메인 입력
3. DNS 설정에서 CNAME 레코드 추가:
   ```
   CNAME: YOUR_USERNAME.github.io
   ```

## 🔒 보안 참고사항

### HTTPS
- GitHub Pages는 자동으로 HTTPS를 제공합니다
- **Settings** → **Pages**에서 "Enforce HTTPS" 활성화 권장

### Notion Token 보안
- 브라우저의 LocalStorage에 저장됩니다
- 각 사용자가 자신의 Token을 입력해야 합니다
- Token은 서버에 저장되지 않습니다

### 프로덕션 환경 권장사항
더 높은 보안이 필요한 경우:
1. 백엔드 서버 구축
2. 서버에서 Notion API 호출
3. 사용자 인증 시스템 구현

## 📊 사용 통계 (선택사항)

Google Analytics를 추가하려면 `index.html`에 추가:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 문제 해결

### 배포가 실패하는 경우

1. **Actions** 탭에서 오류 로그 확인
2. `.github/workflows/deploy.yml` 파일 확인
3. 저장소 **Settings** → **Actions** → **General**에서 권한 확인:
   - "Read and write permissions" 활성화

### 페이지가 표시되지 않는 경우

1. GitHub Pages 설정 확인
2. 브라우저 캐시 삭제
3. 시크릿 모드에서 접속 시도
4. 배포 완료 후 5-10분 대기

### 404 오류가 발생하는 경우

1. 저장소 이름과 URL 경로 확인
2. `index.html` 파일이 루트에 있는지 확인
3. 파일명 대소문자 확인 (GitHub Pages는 대소문자 구분)

## 📞 지원

문제가 계속되면:
- GitHub Issues에 문의
- [GitHub Pages 문서](https://docs.github.com/pages) 참조

---

배포 후 URL을 공유하여 누구나 접속할 수 있습니다! 🎉