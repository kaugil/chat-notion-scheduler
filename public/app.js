// 설정 관리
class SettingsManager {
    constructor() {
        // 기본 설정값
        this.defaultSettings = {
            notionToken: 'ntn_X30029019488EbyrCuWlRJguEtjx5d3pNctxkoKIk8JeTq',
            databaseId: '3960b2fca5bc8097b560ea9dde3adb0f',
            enableOutlook: true,
            recipientEmail: 'ygkwon@kr.ibm.com',
            enableReminder: true
        };
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            return { ...this.defaultSettings, ...JSON.parse(saved) };
        }
        // 저장된 설정이 없으면 기본값 사용
        return { ...this.defaultSettings };
    }

    saveSettings(notionToken, databaseId, enableOutlook, recipientEmail, enableReminder) {
        this.settings = {
            notionToken,
            databaseId,
            enableOutlook,
            recipientEmail,
            enableReminder
        };
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
    }

    isConfigured() {
        return this.settings.notionToken && this.settings.databaseId;
    }

    isOutlookConfigured() {
        return this.settings.enableOutlook && this.settings.recipientEmail;
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
    }

    async createPage(schedule, recipientEmail = null) {
        try {
            console.log('Creating Notion page...');
            console.log('Schedule:', schedule);
            console.log('Recipient email:', recipientEmail ? '***' : null);

            // 먼저 데이터베이스 스키마 확인
            const dbResponse = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Notion-Version': '2022-06-28'
                }
            });

            let hasEmailProperty = false;
            let hasStatusProperty = false;

            if (dbResponse.ok) {
                const dbData = await dbResponse.json();
                hasEmailProperty = dbData.properties && dbData.properties['이메일'];
                hasStatusProperty = dbData.properties && dbData.properties['알림상태'];
                console.log('Database properties:', {
                    hasEmailProperty,
                    hasStatusProperty
                });
            }

            // Notion 속성 구성
            const properties = {
                '제목': {
                    title: [
                        {
                            text: {
                                content: schedule.title
                            }
                        }
                    ]
                },
                '날짜': {
                    date: {
                        start: schedule.date
                    }
                },
                '시간': {
                    rich_text: [
                        {
                            text: {
                                content: schedule.time || '시간 미정'
                            }
                        }
                    ]
                },
                '설명': {
                    rich_text: [
                        {
                            text: {
                                content: schedule.description
                            }
                        }
                    ]
                }
            };

            // 이메일 주소가 제공되고 속성이 존재하는 경우에만 추가
            if (recipientEmail && hasEmailProperty) {
                properties['이메일'] = {
                    email: recipientEmail
                };
            }

            if (recipientEmail && hasStatusProperty) {
                properties['알림상태'] = {
                    select: {
                        name: '대기중'
                    }
                };
            }

            const response = await fetch('https://api.notion.com/v1/pages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify({
                    parent: { database_id: this.databaseId },
                    properties: properties
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                console.error('Notion API error:', error);
                throw new Error(error.message || 'Notion API 오류');
            }

            const data = await response.json();
            console.log('Page created successfully');
            return data;

        } catch (error) {
            console.error('Notion API Error:', error);
            throw new Error(`Notion 연동 실패: ${error.message}`);
        }
    }
}

// Outlook MCP 클라이언트
class OutlookClient {
    constructor() {
        this.apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000/api/mcp'
            : '/api/mcp';
    }

    async sendEmail(to, subject, body) {
        const url = `${this.apiUrl}/outlook`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tool: 'send_email',
                    arguments: {
                        to,
                        subject,
                        body,
                        isHtml: true
                    },
                    mcpConfig: this.getMcpConfig()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Outlook API 오류');
            }

            return data;
        } catch (error) {
            console.error('Outlook API Error:', error);
            throw new Error(`Outlook 연동 실패: ${error.message}`);
        }
    }

    async scheduleReminder(scheduleTitle, scheduleDate, recipientEmail, reminderMessage) {
        const url = `${this.apiUrl}/outlook`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tool: 'schedule_reminder',
                    arguments: {
                        scheduleTitle,
                        scheduleDate,
                        recipientEmail,
                        reminderMessage
                    },
                    mcpConfig: this.getMcpConfig()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Outlook API 오류');
            }

            return data;
        } catch (error) {
            console.error('Outlook Reminder Error:', error);
            throw new Error(`알림 스케줄링 실패: ${error.message}`);
        }
    }

    getMcpConfig() {
        // MCP 서버 설정 (환경 변수는 서버 측에서 관리)
        return {
            command: 'node',
            args: ['/Users/ygkwon/Documents/IBM Bob/MCP/outlook-server/build/index.js'],
            env: {
                // 환경 변수는 서버 측 MCP 설정에서 관리
            }
        };
    }
}

// 채팅 UI 관리
class ChatUI {
    constructor() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.settingsManager = new SettingsManager();
        this.parser = new ScheduleParser();
        this.outlookClient = new OutlookClient();
        
        // 음성 인식 초기화
        this.recognition = null;
        this.isListening = false;
        this.initializeSpeechRecognition();

        this.initializeUI();
        this.attachEventListeners();
    }

    initializeSpeechRecognition() {
        // Web Speech API 지원 확인
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('음성 인식이 지원되지 않는 브라우저입니다.');
            if (this.voiceButton) {
                this.voiceButton.style.display = 'none';
            }
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ko-KR';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceButton.classList.add('listening');
            this.addMessage('bot', '🎤 음성을 듣고 있습니다... 일정을 말씀해주세요.');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.messageInput.value = transcript;
            this.addMessage('user', `🎤 "${transcript}"`);
        };

        this.recognition.onerror = (event) => {
            console.error('음성 인식 오류:', event.error);
            let errorMessage = '음성 인식 중 오류가 발생했습니다.';
            
            switch(event.error) {
                case 'no-speech':
                    errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
                    break;
                case 'audio-capture':
                    errorMessage = '마이크를 찾을 수 없습니다. 마이크 연결을 확인해주세요.';
                    break;
                case 'not-allowed':
                    errorMessage = '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
                    break;
            }
            
            this.addMessage('bot error', `❌ ${errorMessage}`);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.voiceButton.classList.remove('listening');
        };
    }

    startVoiceRecognition() {
        if (!this.recognition) {
            this.addMessage('bot error', '❌ 이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('음성 인식 시작 오류:', error);
            this.addMessage('bot error', '❌ 음성 인식을 시작할 수 없습니다. 다시 시도해주세요.');
        }
    }

    initializeUI() {
        // 저장된 설정 불러오기
        const settings = this.settingsManager.settings;
        document.getElementById('notionToken').value = settings.notionToken;
        document.getElementById('databaseId').value = settings.databaseId;
        document.getElementById('enableOutlook').checked = settings.enableOutlook;
        document.getElementById('recipientEmail').value = settings.recipientEmail;
        document.getElementById('enableReminder').checked = settings.enableReminder;
        
        // 기본 설정 사용 중이면 안내 메시지 표시
        if (this.settingsManager.isUsingDefault()) {
            this.addMessage('bot', '✅ 기본 Notion 설정이 적용되었습니다. 바로 사용하실 수 있습니다!<br>Outlook 연동을 원하시면 설정에서 활성화해주세요.');
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

        // 음성 입력 버튼
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => this.startVoiceRecognition());
        }

        // 메시지 전송
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });

        // 설정 저장
        document.getElementById('saveSettings').addEventListener('click', () => {
            const notionToken = document.getElementById('notionToken').value.trim();
            const databaseId = document.getElementById('databaseId').value.trim();
            const enableOutlook = document.getElementById('enableOutlook').checked;
            const recipientEmail = document.getElementById('recipientEmail').value.trim();
            const enableReminder = document.getElementById('enableReminder').checked;

            if (!notionToken || !databaseId) {
                this.addMessage('bot error', '⚠️ Notion Token과 Database ID를 모두 입력해주세요.');
                return;
            }

            if (enableOutlook && !recipientEmail) {
                this.addMessage('bot error', '⚠️ Outlook을 활성화하려면 이메일 주소를 입력해주세요.');
                return;
            }

            this.settingsManager.saveSettings(notionToken, databaseId, enableOutlook, recipientEmail, enableReminder);
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
            
            // 이메일 알림이 활성화된 경우 이메일 주소 전달
            const recipientEmail = settings.enableOutlook && settings.recipientEmail ? settings.recipientEmail : null;
            await notionClient.createPage(schedule, recipientEmail);

            let successMessage = `✅ 일정이 Notion에 등록되었습니다!\n\n` +
                `📅 날짜: ${this.formatDateKorean(schedule.date)}\n` +
                `⏰ 시간: ${schedule.time || '시간 미정'}\n` +
                `📝 제목: ${schedule.title}`;

            // Notion 자동화를 통한 이메일 알림
            if (recipientEmail) {
                successMessage += '\n\n📧 Notion 자동화를 통해 이메일이 발송됩니다!';
                
                if (settings.enableReminder) {
                    successMessage += '\n⏰ D-1 알림이 Notion 자동화로 예약되었습니다!';
                }
                
                successMessage += '\n\n💡 Notion 데이터베이스에서 자동화 설정을 확인하세요.';
            }

            // 로딩 메시지 제거
            this.removeMessage(loadingId);

            // 성공 메시지
            this.addMessage('bot success', successMessage);

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
