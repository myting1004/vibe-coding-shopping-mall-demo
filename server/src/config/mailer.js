import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporterPromise = null;
let lastInfo = null;

async function buildTransporter() {
  if (env.mail.host && env.mail.user && env.mail.pass) {
    return nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.port === 465,
      auth: { user: env.mail.user, pass: env.mail.pass },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  console.log('[mailer] Ethereal test account created:');
  console.log(`  user: ${testAccount.user}`);
  console.log(`  pass: ${testAccount.pass}`);
  console.log(`  smtp: ${testAccount.smtp.host}:${testAccount.smtp.port}`);
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = buildTransporter();
  }
  return transporterPromise;
}

export async function sendMail({ to, subject, text, html }) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: env.mail.from,
    to,
    subject,
    text,
    html,
  });
  lastInfo = info;
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[mailer] preview: ${previewUrl}`);
  }
  return { info, previewUrl: previewUrl || null };
}

export function getLastMailInfo() {
  return lastInfo;
}
