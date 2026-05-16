import { env } from '../config/env.js';
import { sendMail } from '../config/mailer.js';

export function sendVerificationEmail({ to, name, token }) {
  const link = `${env.appBaseUrl}/verify-email?token=${encodeURIComponent(token)}`;
  return sendMail({
    to,
    subject: '[Shopping Mall Demo] 이메일 인증을 완료해주세요',
    text: `안녕하세요 ${name} 님,\n\n아래 링크를 클릭해 이메일 인증을 완료해주세요. (24시간 유효)\n\n${link}\n\n링크가 동작하지 않으면 토큰을 직접 입력해주세요: ${token}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>이메일 인증</h2>
        <p>안녕하세요 <b>${name}</b> 님,</p>
        <p>아래 버튼을 눌러 이메일 인증을 완료해주세요. (24시간 유효)</p>
        <p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">이메일 인증하기</a></p>
        <p style="font-size:12px;color:#666;">버튼이 동작하지 않으면 이 링크를 사용하세요:<br/><code>${link}</code></p>
      </div>
    `,
  });
}

export function sendPasswordResetEmail({ to, name, token }) {
  const link = `${env.appBaseUrl}/password-reset/confirm?token=${encodeURIComponent(token)}`;
  return sendMail({
    to,
    subject: '[Shopping Mall Demo] 비밀번호 재설정',
    text: `안녕하세요 ${name} 님,\n\n비밀번호 재설정을 요청하셨습니다. 아래 링크를 30분 안에 열어 새 비밀번호를 등록해주세요.\n\n${link}\n\n요청하신 적이 없다면 이 메일을 무시하셔도 됩니다.`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>비밀번호 재설정</h2>
        <p>안녕하세요 <b>${name}</b> 님,</p>
        <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 30분 안에 클릭해주세요.</p>
        <p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">비밀번호 재설정하기</a></p>
        <p style="font-size:12px;color:#666;">요청하신 적이 없다면 이 메일을 무시하셔도 됩니다.</p>
      </div>
    `,
  });
}
