const nodemailer = require('nodemailer');

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {};
    const allowed = ['YES', 'NO', "I'LL THINK ABOUT IT"];

    if (!allowed.includes(body.response)) {
      return response.status(400).json({ ok: false, error: 'Invalid response' });
    }

    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
    const dateType = typeof body.dateType === 'string' ? body.dateType.slice(0, 120) : '';
    const dateNote = typeof body.dateNote === 'string' ? body.dateNote.slice(0, 240) : '';
    const timestamp = new Date().toISOString();

    const recipient = process.env.EMAIL_TO || 'georgeabisola3@gmail.com';
    const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!smtpConfigured) {
      console.warn(`[notification skipped] ${body.response} at ${timestamp} (SMTP not configured)`);
      return response.status(200).json({ ok: true, sent: false, response: body.response, dateType, dateNote });
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
        `Selected response: ${body.response}`,
        `Message: ${dateNote || 'No message provided'}`,
        `Date preference: ${dateType || 'Not provided'}`,
        'Survey answers:',
        ...Object.entries(answers).map(([question, answer]) => `- ${question}: ${answer}`),
        `Date/time of response: ${timestamp}`,
      ].join('\n'),
    });

    return response.status(200).json({ ok: true, sent: true, response: body.response, dateType, dateNote });
  } catch (error) {
    console.error('respond api error:', error);
    return response.status(500).json({ ok: false, error: 'Unable to record response' });
  }
};
