export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
        res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: `서버 오류: ${error.message}` 
        });
    }
}

// Made with Bob
