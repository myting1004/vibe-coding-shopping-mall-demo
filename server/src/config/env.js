import 'dotenv/config';

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

// MONGODB_ATLAS_URL 이 채워져 있으면 Atlas 클라우드 DB 우선 사용,
// 비어 있으면 MONGO_URI(로컬) 로 폴백.
const resolveMongoUri = () => {
  const atlas = (process.env.MONGODB_ATLAS_URL ?? '').trim();
  if (atlas) return atlas;
  return required('MONGO_URI', 'mongodb://127.0.0.1:27017/shopping_mall_demo');
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: resolveMongoUri(),
  corsOrigin: (process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwt: {
    accessSecret: required(
      'JWT_ACCESS_SECRET',
      process.env.NODE_ENV === 'production' ? undefined : 'dev-access-secret-change-me'
    ),
    refreshSecret: required(
      'JWT_REFRESH_SECRET',
      process.env.NODE_ENV === 'production' ? undefined : 'dev-refresh-secret-change-me'
    ),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '14d',
  },
  cookie: {
    secure: (process.env.COOKIE_SECURE ?? 'false').toLowerCase() === 'true',
    sameSite: process.env.COOKIE_SAME_SITE ?? 'lax',
  },
  mail: {
    host: process.env.MAIL_HOST ?? '',
    port: Number(process.env.MAIL_PORT ?? 587),
    user: process.env.MAIL_USER ?? '',
    pass: process.env.MAIL_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'Shopping Mall Demo <no-reply@example.com>',
  },
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:5173',
  // PortOne V2 REST API — 결제 검증/취소 사용 시 필요. 미설정이면 검증 로직이 비활성화.
  // V2 콘솔(admin.portone.io) > 결제연동 > 식별코드·API Keys > V2 API 탭에서 발급.
  // V1 SDK + V2 채널 구성에서도 V2 REST API 로 결제건을 조회 가능.
  portone: {
    v2ApiSecret: process.env.PORTONE_V2_API_SECRET ?? '',
  },
};
