const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Notion API 프록시 엔드포인트
app.post('/api/notion/pages', async (req, res) => {
    try {
        const { token, databaseId, schedule } = req.body;

        if (!token || !databaseId || !schedule) {
            return res.status(400).json({ 
                error: 'Missing required fields: token, databaseId, or schedule' 
            });
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
                properties: {
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
                }
            })
        });

        if (!notionResponse.ok) {
            const error = await notionResponse.json();
            return res.status(notionResponse.status).json({ 
                error: error.message || 'Notion API 오류' 
            });
        }

        const data = await notionResponse.json();
        res.json(data);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: `서버 오류: ${error.message}` 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// 모든 경로를 index.html로 리다이렉트 (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Open http://localhost:${PORT} in your browser`);
});

// Made with Bob
