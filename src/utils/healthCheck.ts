import http from 'node:http';
import { Client } from 'discord.js';
import { logger } from './logger.js';

export function setupHealthCheckServer(client: Client, port: number) {
    const server = http.createServer((req, res) => {
        if (req.url === '/health' && req.method === 'GET') {
            if (client.isReady()) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
            } else {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'unhealthy' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });

    server.listen(port, () => {
        logger.info(`Health check server running on port ${port}`);
    });

    return server;
} 