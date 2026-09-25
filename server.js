const path = require('path');
const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const recipient = 'georgeabisola3@gmail.com';
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10000) reject(new Error('Payload too large'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function notify({ responseType, answers, dateType, dateNote, timestamp }) {
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (!smtpConfigured) {
    console.warn(`[notification skipped] ${responseType} at ${timestamp} (SMTP is not configured)`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: recipient,
    subject: 'Princess responded to your website ❤️',
    text: [
      'Princess has responded to your date request.',
      `Selected response: ${responseType}`,
      'Name: Princess',
      `Date preference: ${dateType || 'Not provided'}`,
      `Date note: ${dateNote || 'Not provided'}`,
      'Survey answers:',
      ...Object.entries(answers || {}).map(([question, answer]) => `- ${question}: ${answer}`),
      `Date/time of response: ${timestamp}`,
    ].join('\n'),
  });
  return true;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'POST' && url.pathname === '/api/respond') {
    try {
      const body = JSON.parse(await readBody(request));
      const allowed = ['YES', 'NO', "I'LL THINK ABOUT IT"];
      if (!allowed.includes(body.response)) return sendJson(response, 400, { ok: false, error: 'Invalid response' });
      const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
      const dateType = typeof body.dateType === 'string' ? body.dateType.slice(0, 120) : '';
      const dateNote = typeof body.dateNote === 'string' ? body.dateNote.slice(0, 120) : '';
      const timestamp = new Date().toISOString();
      const sent = await notify({ responseType: body.response, answers, dateType, dateNote, timestamp });
      return sendJson(response, 200, { ok: true, sent });
    } catch (error) {
      console.error(error);
      return sendJson(response, 500, { ok: false, error: 'Unable to record response' });
    }
  }

  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.normalize(path.join(root, requested));
  if (!filePath.startsWith(root)) return sendJson(response, 403, { error: 'Forbidden' });
  fs.readFile(filePath, (error, data) => {
    if (error) return sendJson(response, 404, { error: 'Not found' });
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(data);
  });
});

server.listen(port, () => console.log(`Princess experience running at http://localhost:${port}`));
