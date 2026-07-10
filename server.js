const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// CORS 설정
app.use(cors());
app.use(express.json());

// 정적 파일 제공
app.use(express.static('public'));

// Notion API 프록시
app.post('/api/notion/pages', async (req, res) => {
    try {
        const { token, databaseId, schedule, recipientEmail } = req.body;

        if (!token || !databaseId || !schedule) {
            return res.status(400).json({
                error: 'Missing required fields: token, databaseId, or schedule'
            });
        }

        // 먼저 데이터베이스 스키마 확인
        const dbResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28'
            }
        });

        let hasEmailProperty = false;
        let hasStatusProperty = false;

        if (dbResponse.ok) {
            const dbData = await dbResponse.json();
            hasEmailProperty = dbData.properties && dbData.properties['이메일'];
            hasStatusProperty = dbData.properties && dbData.properties['알림상태'];
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

        const notionResponse = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: databaseId },
                properties: properties
            })
        });

        if (!notionResponse.ok) {
            const error = await notionResponse.json();
            return res.status(notionResponse.status).json({ 
                error: error.message || 'Notion API 오류' 
            });
        }

        const data = await notionResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: `서버 오류: ${error.message}` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`📱 브라우저에서 http://localhost:${PORT} 를 열어주세요.`);
});

// Made with Bob
