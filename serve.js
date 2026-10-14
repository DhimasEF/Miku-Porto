// Tiny dependency-free local server for this static portfolio.
// Run with: node serve.js, then open http://127.0.0.1:4173/
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mp3': 'audio/mpeg',
    '.osu': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
};

http.createServer((request, response) => {
    let pathname;
    try {
        pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
        response.writeHead(400).end('Bad request');
        return;
    }

    const filePath = path.resolve(root, `.${pathname}`);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError) {
            response.writeHead(statError.code === 'ENOENT' ? 404 : 500).end('Not found');
            return;
        }
        const resolvedPath = stats.isDirectory() ? path.join(filePath, 'index.html') : filePath;
        fs.stat(resolvedPath, (fileError, fileStats) => {
            if (fileError || !fileStats.isFile()) {
                response.writeHead(fileError?.code === 'ENOENT' ? 404 : 500).end('Not found');
                return;
            }

            const headers = {
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-store',
                'Content-Type': mimeTypes[path.extname(resolvedPath).toLowerCase()] || 'application/octet-stream'
            };
            const range = request.headers.range;
            if (range) {
                const match = range.match(/^bytes=(\d*)-(\d*)$/);
                if (!match || (!match[1] && !match[2])) {
                    response.writeHead(416, { 'Content-Range': `bytes */${fileStats.size}` }).end();
                    return;
                }
                const suffixLength = Number(match[2]);
                const start = match[1] ? Number(match[1]) : Math.max(0, fileStats.size - suffixLength);
                const end = match[2] && match[1]
                    ? Math.min(Number(match[2]), fileStats.size - 1)
                    : fileStats.size - 1;
                if (start >= fileStats.size || start > end) {
                    response.writeHead(416, { 'Content-Range': `bytes */${fileStats.size}` }).end();
                    return;
                }
                headers['Content-Length'] = end - start + 1;
                headers['Content-Range'] = `bytes ${start}-${end}/${fileStats.size}`;
                response.writeHead(206, headers);
                if (request.method === 'HEAD') response.end();
                else fs.createReadStream(resolvedPath, { start, end }).pipe(response);
                return;
            }

            headers['Content-Length'] = fileStats.size;
            response.writeHead(200, headers);
            if (request.method === 'HEAD') response.end();
            else fs.createReadStream(resolvedPath).pipe(response);
        });
    });
}).listen(4173, '127.0.0.1', () => {
    console.log('Portfolio available at http://127.0.0.1:4173/ (Ctrl+C to stop)');
});
