import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Heroku / Vercel 같은 reverse proxy 뒤에서 req.secure / req.ip / req.protocol 를 정확히 인식.
// - express-rate-limit 가 실제 클라이언트 IP 로 카운팅 (안 켜면 한 dyno 의 모든 트래픽이 한 IP 로 묶임)
// - Secure 쿠키 발급 시 req.secure 가 정확함
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin.includes('*') ? true : env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.get('/', (req, res) => {
  res.json({ message: 'Shopping Mall Demo API', version: '0.1.0' });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
