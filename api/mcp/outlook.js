import { spawn } from 'child_process';

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
        const { tool, arguments: toolArgs, mcpConfig } = req.body;

        if (!tool || !toolArgs || !mcpConfig) {
            return res.status(400).json({ 
                error: 'Missing required fields: tool, arguments, or mcpConfig' 
            });
        }

        // MCP 서버 실행 및 도구 호출
        const result = await callMcpTool(tool, toolArgs, mcpConfig);
        
        res.status(200).json(result);

    } catch (error) {
        console.error('MCP API error:', error);
        res.status(500).json({ 
            error: `MCP 호출 오류: ${error.message}` 
        });
    }
}

/**
 * MCP 도구 호출 함수
 */
async function callMcpTool(tool, toolArgs, mcpConfig) {
    return new Promise((resolve, reject) => {
        const { command, args, env } = mcpConfig;
        
        // MCP 서버 프로세스 시작
        const mcpProcess = spawn(command, args, {
            env: { ...process.env, ...env },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        let responseReceived = false;

        // 타임아웃 설정 (30초)
        const timeout = setTimeout(() => {
            if (!responseReceived) {
                mcpProcess.kill();
                reject(new Error('MCP 서버 응답 시간 초과'));
            }
        }, 30000);

        mcpProcess.stdout.on('data', (data) => {
            stdout += data.toString();
            
            // JSON-RPC 응답 파싱 시도
            try {
                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (line.trim() && line.includes('"result"')) {
                        const response = JSON.parse(line);
                        if (response.result) {
                            responseReceived = true;
                            clearTimeout(timeout);
                            mcpProcess.kill();
                            resolve(response.result);
                            return;
                        }
                    }
                }
            } catch (e) {
                // JSON 파싱 실패는 무시하고 계속 데이터 수집
            }
        });

        mcpProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        mcpProcess.on('error', (error) => {
            clearTimeout(timeout);
            reject(new Error(`MCP 프로세스 오류: ${error.message}`));
        });

        mcpProcess.on('close', (code) => {
            clearTimeout(timeout);
            if (!responseReceived) {
                if (code !== 0) {
                    reject(new Error(`MCP 서버 종료 코드: ${code}\nStderr: ${stderr}`));
                } else {
                    reject(new Error('MCP 서버로부터 응답을 받지 못했습니다'));
                }
            }
        });

        // JSON-RPC 요청 전송
        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
                name: tool,
                arguments: toolArgs
            }
        };

        mcpProcess.stdin.write(JSON.stringify(request) + '\n');
        mcpProcess.stdin.end();
    });
}

// Made with Bob