// 설정 관리
class SettingsManager {
    constructor() {
        // 기본 설정값
        this.defaultSettings = {
            notionToken: 'ntn_X30029019488EbyrCuWlRJguEtjx5d3pNctxkoKIk8JeTq',
            databaseId: '3960b2fca5bc8097b560ea9dde3adb0f'
        };
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('notionSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        // 저장된 설정이 없으면 기본값 사용
        return { ...this.defaultSettings };
    }

    saveSettings(token, databaseId) {
        this.settings = { notionToken: token, databaseId: databaseId };
        localStorage.setItem('notionSettings', JSON.stringify(this.settings));
    }

    isConfigured() {
        return this.settings.notionToken && this.settings.databaseId;
    }

    isUsingDefault() {
        return this.settings.notionToken === this.defaultSettings.notionToken &&
               this.settings.databaseId === this.defaultSettings.databaseId;
    }
}

// 일정 파싱 클래스
class ScheduleParser {
    constructor() {
        this.datePatterns = {
            today: /오늘|today/i,
            tomorrow: /내일|tomorrow/i,
            dayAfterTomorrow: /모레/i,
            nextWeek: /다음\s*주|next\s*week/i,
            specificDate: /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
            monthDay: /(\d{1,2})월\s*(\d{1,2})일/,
            weekday: /(월|화|수|목|금|토|일)요일/
        };

        this.timePatterns = {
            ampm: /(오전|오후|am|pm)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/i,
            hour24: /(\d{1,2})시(?:\s*(\d{1,2})분)?/,
            hourMinute: /(\d{1,2}):(\d{2})/
        };

        this.weekdays = {
            '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0
        };
    }

    parse(text) {
        const date = this.parseDate(text);
        const time = this.parseTime(text);
        const title = this.extractTitle(text, date, time);

        return {
            date: date,
            time: time,
            title: title || '새 일정',
            description: text
        };
    }

    parseDate(text) {
        const now = new Date();

        // 오늘
        if (this.datePatterns.today.test(text)) {
            return this.formatDate(now);
        }

        // 내일
        if (this.datePatterns.tomorrow.test(text)) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return this.formatDate(tomorrow);
        }

        // 모레
        if (this.datePatterns.dayAfterTomorrow.test(text)) {
            const dayAfter = new Date(now);
            dayAfter.setDate(dayAfter.getDate() + 2);
            return this.formatDate(dayAfter);
        }

        // 다음 주
        if (this.datePatterns.nextWeek.test(text)) {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return this.formatDate(nextWeek);
        }

        // 특정 날짜 (YYYY년 MM월 DD일)
        const specificMatch = text.match(this.datePatterns.specificDate);
        if (specificMatch) {
            const [, year, month, day] = specificMatch;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // 월일 (MM월 DD일)
        const monthDayMatch = text.match(this.datePatterns.monthDay);
        if (monthDayMatch) {
            const [, month, day] = monthDayMatch;
            const year = now.getFullYear();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // 요일
        const weekdayMatch = text.match(this.datePatterns.weekday);
        if (weekdayMatch) {
            const targetDay = this.weekdays[weekdayMatch[1]];
            const currentDay = now.getDay();
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7;
            
            const targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() + daysToAdd);
            return this.formatDate(targetDate);
        }

        // 기본값: 오늘
        return this.formatDate(now);
    }

    parseTime(text) {
        // 오전/오후 시간
        const ampmMatch = text.match(this.timePatterns.ampm);
        if (ampmMatch) {
            const [, period, hour, minute = '00'] = ampmMatch;
            let h = parseInt(hour);
            if ((period === '오후' || period.toLowerCase() === 'pm') && h !== 12) {
                h += 12;
            } else if ((period === '오전' || period.toLowerCase() === 'am') && h === 12) {
                h = 0;
            }
            return `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
        }

        // 24시간 형식
        const hour24Match = text.match(this.timePatterns.hour24);
        if (hour24Match) {
            const [, hour, minute = '00'] = hour24Match;
            return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
        }

        // HH:MM 형식
        const hourMinuteMatch = text.match(this.timePatterns.hourMinute);
        if (hourMinuteMatch) {
            const [, hour, minute] = hourMinuteMatch;
            return `${hour.padStart(2, '0')}:${minute}`;
        }

        return null;
    }

    extractTitle(text, date, time) {
        let title = text;

        // 날짜 관련 텍스트 제거
        Object.values(this.datePatterns).forEach(pattern => {
            title = title.replace(pattern, '');
        });

        // 시간 관련 텍스트 제거
        Object.values(this.timePatterns).forEach(pattern => {
            title = title.replace(pattern, '');
        });

        // 공백 정리
        title = title.trim().replace(/\s+/g, ' ');

        return title || '새 일정';
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Notion API 클라이언트
class NotionClient {
    constructor(token, databaseId) {
        this.token = token;
        this.databaseId = databaseId;
        // 로컬 개발 환경과 프로덕션 환경 구분
        this.apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000/api/notion'
            : '/api/notion';
    }

    async createPage(schedule) {
        const url = `${this.apiUrl}/pages`;

        try {
            console.log('Sending request to:', url);
            console.log('Request body:', { token: '***', databaseId: this.databaseId, schedule });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: this.token,
                    databaseId: this.databaseId,
                    schedule: schedule
                })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            // Content-Type 확인
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                throw new Error('서버가 JSON이 아닌 응답을 반환했습니다. 서버를 재시작해주세요.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Notion API 오류');
            }

            return data;
        } catch (error) {
            console.error('Notion API Error:', error);
            throw new Error(`Notion 연동 실패: ${error.message}`);
        }
    }
}

// 채팅 UI 관리
class ChatUI {
    constructor() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.settingsManager = new SettingsManager();
        this.parser = new ScheduleParser();

        this.initializeUI();
        this.attachEventListeners();
    }

    initializeUI() {
        // 저장된 설정 불러오기
        const settings = this.settingsManager.settings;
        document.getElementById('notionToken').value = settings.notionToken;
        document.getElementById('databaseId').value = settings.databaseId;
        
        // 기본 설정 사용 중이면 안내 메시지 표시
        if (this.settingsManager.isUsingDefault()) {
            this.addMessage('bot', '✅ 기본 Notion 설정이 적용되었습니다. 바로 사용하실 수 있습니다!<br>다른 Notion 계정을 사용하시려면 아래 설정을 변경해주세요.');
        }
    }

    attachEventListeners() {
        // 설정 패널 토글
        const settingsHeader = document.getElementById('settingsHeader');
        const settingsContent = document.getElementById('settingsContent');
        
        settingsHeader.addEventListener('click', () => {
            settingsHeader.classList.toggle('collapsed');
            settingsContent.classList.toggle('collapsed');
        });

        // 메시지 전송
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });

        // 설정 저장
        document.getElementById('saveSettings').addEventListener('click', () => {
            const token = document.getElementById('notionToken').value.trim();
            const databaseId = document.getElementById('databaseId').value.trim();

            if (!token || !databaseId) {
                this.addMessage('bot error', '⚠️ Notion Token과 Database ID를 모두 입력해주세요.');
                return;
            }

            this.settingsManager.saveSettings(token, databaseId);
            this.addMessage('bot success', '✅ 설정이 저장되었습니다!');
        });

        // 도움말 모달
        const modal = document.getElementById('helpModal');
        const helpLink = document.getElementById('helpLink');
        const closeBtn = document.querySelector('.close');

        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 사용자 메시지 표시
        this.addMessage('user', message);
        this.messageInput.value = '';

        // 설정 확인
        if (!this.settingsManager.isConfigured()) {
            this.addMessage('bot error', '⚠️ 먼저 Notion 설정을 완료해주세요.');
            return;
        }

        // 로딩 메시지
        const loadingId = this.addMessage('bot', '일정을 분석하고 있습니다<span class="loading"></span>');

        try {
            // 일정 파싱
            const schedule = this.parser.parse(message);

            // Notion에 등록
            const settings = this.settingsManager.settings;
            const notionClient = new NotionClient(settings.notionToken, settings.databaseId);
            await notionClient.createPage(schedule);

            // 로딩 메시지 제거
            this.removeMessage(loadingId);

            // 성공 메시지
            const dateStr = this.formatDateKorean(schedule.date);
            const timeStr = schedule.time ? ` ${schedule.time}` : '';
            this.addMessage('bot success', 
                `✅ 일정이 Notion에 등록되었습니다!\n\n` +
                `📅 날짜: ${dateStr}\n` +
                `⏰ 시간: ${schedule.time || '시간 미정'}\n` +
                `📝 제목: ${schedule.title}`
            );

        } catch (error) {
            // 로딩 메시지 제거
            this.removeMessage(loadingId);

            // 에러 메시지
            this.addMessage('bot error', `❌ 오류가 발생했습니다: ${error.message}`);
        }
    }

    addMessage(type, content) {
        const messageId = `msg-${Date.now()}`;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.id = messageId;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content.replace(/\n/g, '<br>');
        
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        // 스크롤을 최하단으로
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

        return messageId;
    }

    removeMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }

    formatDateKorean(dateStr) {
        const date = new Date(dateStr);
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = weekdays[date.getDay()];

        return `${year}년 ${month}월 ${day}일 (${weekday})`;
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ChatUI();
});

// Made with Bob
