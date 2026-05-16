const MIN_LENGTH = 8;

export function validatePasswordStrength(password) {
  if (typeof password !== 'string') {
    return '비밀번호를 입력해주세요.';
  }
  if (password.length < MIN_LENGTH) {
    return `비밀번호는 ${MIN_LENGTH}자 이상이어야 합니다.`;
  }
  if (!/[A-Za-z]/.test(password)) {
    return '비밀번호에는 영문자가 1개 이상 포함되어야 합니다.';
  }
  if (!/\d/.test(password)) {
    return '비밀번호에는 숫자가 1개 이상 포함되어야 합니다.';
  }
  return null;
}
