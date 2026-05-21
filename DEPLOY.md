# 배포 가이드 (Deployment Guide)

이 프로젝트는 모노레포다.

- **client/** → **Vercel** (Vite + React SPA, 정적 빌드)
- **server/** → **Heroku** (Express + MongoDB)

인증이 **HttpOnly 쿠키** 기반이라 두 도메인이 분리될 때 (`*.vercel.app` ↔ `*.herokuapp.com`) **SameSite=None; Secure** 쿠키 + **정확한 CORS origin** 이 필요하다. 아래 절차를 순서대로 따른다.

---

## 0. 사전 준비물

| 항목 | 비고 |
| --- | --- |
| GitHub 계정 + 저장소 push 완료 | Vercel·Heroku 둘 다 GitHub 연동 사용 |
| MongoDB Atlas 계정 | https://www.mongodb.com/cloud/atlas (무료 M0 가능) |
| Heroku 계정 + 결제수단 | 무료 dyno 폐지 → Eco $5/mo 또는 Basic $7/mo |
| Vercel 계정 | https://vercel.com (Hobby 플랜 무료) |
| (선택) Heroku CLI | `brew tap heroku/brew && brew install heroku` |
| (선택) custom 도메인 | 있으면 cross-site cookie 문제를 회피하기 더 쉬움 |

---

## 1. MongoDB Atlas 셋업

1. https://cloud.mongodb.com → **Build a Cluster** → **M0 Free** 선택. region 은 Heroku 와 같은 대륙 (보통 AWS / us-east-1).
2. **Database Access** 메뉴 → **Add New Database User**
   - Authentication Method: Password
   - Username/Password 메모 (특수문자는 URL 인코딩 필요 — `@` → `%40` 등)
   - Built-in Role: `Read and write to any database`
3. **Network Access** 메뉴 → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`)
   - Heroku 는 동적 IP. 더 좁히고 싶으면 Heroku 의 Static IP 애드온 별도 검토.
4. **Database** 메뉴 → **Connect** → **Drivers** (Node.js) → connection string 복사
   - `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - `<password>` 자리에 실제 비밀번호 박고, 끝에 DB 이름 추가: `.../shopping_mall_demo?retryWrites=...`

---

## 2. Heroku — 서버 배포 (1차)

### 2-1. 앱 생성

```bash
# CLI
heroku login
heroku create <your-app-name>           # 예: shopping-mall-demo-api
```

또는 https://dashboard.heroku.com/new-app 에서 GUI 로.

### 2-2. 모노레포 buildpack 등록

이 저장소는 루트가 모노레포라 `server/` 만 배포해야 한다. `heroku-buildpack-monorepo` 를 사용한다.

```bash
heroku buildpacks:add -i 1 https://github.com/lstoll/heroku-buildpack-monorepo -a <your-app-name>
heroku buildpacks:add -i 2 heroku/nodejs -a <your-app-name>
heroku config:set PROJECT_PATH=server -a <your-app-name>
```

> `-i 1` / `-i 2` 는 실행 순서. monorepo 가 먼저 돌면서 `server/` 만 잘라낸 다음 nodejs buildpack 이 그 위에서 `npm install` / `npm start` 를 수행.

### 2-3. Config Vars 등록 (1차)

```bash
heroku config:set NODE_ENV=production \
  MONGODB_ATLAS_URL='mongodb+srv://...atlas connection string...' \
  CORS_ORIGIN='*' \
  JWT_ACCESS_SECRET="$(openssl rand -hex 64)" \
  JWT_REFRESH_SECRET="$(openssl rand -hex 64)" \
  JWT_ACCESS_EXPIRES_IN=15m \
  JWT_REFRESH_EXPIRES_IN=14d \
  COOKIE_SECURE=true \
  COOKIE_SAME_SITE=none \
  APP_BASE_URL='https://placeholder.vercel.app' \
  MAIL_FROM='Shopping Mall Demo <no-reply@example.com>' \
  -a <your-app-name>
```

`CORS_ORIGIN='*'` 와 `APP_BASE_URL='https://placeholder.vercel.app'` 은 Vercel 도메인이 확정되기 전 임시값. 4단계에서 정정한다.

> **메일 발송이 필요하면** `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` 도 같이 set. 운영용 SMTP (SendGrid, AWS SES, Mailgun 등) 권장.

> **PortOne 결제 검증이 필요하면** `PORTONE_V2_API_SECRET` 도 set.

### 2-4. 배포

```bash
# heroku git remote 등록 (heroku create 가 이미 등록했으면 skip)
heroku git:remote -a <your-app-name>

# 현재 브랜치를 heroku main 으로 push
git push heroku main
```

또는 Heroku Dashboard → **Deploy** 탭 → GitHub 연동 → Enable Automatic Deploys.

### 2-5. 동작 확인

```bash
curl https://<your-app-name>.herokuapp.com/
# {"message":"Shopping Mall Demo API","version":"0.1.0"}

heroku logs --tail -a <your-app-name>
# [server] listening on http://localhost:XXXXX (production)
# [mongo] connected: cluster0-shard-xxx.mongodb.net/shopping_mall_demo
```

`[mongo] connection error` 가 나면 Atlas Network Access / connection string / 비밀번호 URL 인코딩 재확인.

---

## 3. Vercel — 클라이언트 배포

### 3-1. 프로젝트 생성

1. https://vercel.com/new → GitHub 저장소 선택 → **Import**
2. **Configure Project** 화면에서:
   - **Root Directory**: `client` ← **반드시 변경**
   - **Framework Preset**: Vite (자동 감지)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `dist` (기본값)
   - **Install Command**: `npm install` (기본값)

### 3-2. Environment Variables

| Key | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://<your-app-name>.herokuapp.com/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary 콘솔 값 |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | unsigned preset 이름 |

> Vite 환경변수는 **빌드 타임에 번들에 박힘**. 값 바꾸면 반드시 재배포 (Vercel 은 env 변경 시 자동 트리거).

### 3-3. Deploy

**Deploy** 버튼 → 빌드 로그 확인 → 완료되면 `https://<project>.vercel.app` 발급. 도메인을 메모.

---

## 4. Heroku — 환경변수 정정 (Vercel 도메인 확정 후)

```bash
heroku config:set \
  CORS_ORIGIN='https://<project>.vercel.app' \
  APP_BASE_URL='https://<project>.vercel.app' \
  -a <your-app-name>
```

`heroku config:set` 은 자동으로 dyno 를 재시작한다. 30초 뒤 다시 사이트 접속.

> **여러 도메인을 허용해야 하면** 쉼표 구분: `CORS_ORIGIN='https://a.vercel.app,https://b.vercel.app'`. 코드의 `env.corsOrigin` 이 이미 split 처리함 (`server/src/config/env.js`).

> **Vercel preview deploy 도 허용하려면** Vercel 의 preview URL 패턴 (`https://<branch>-<project>.vercel.app`) 을 추가하거나, 서버 CORS 로직을 정규식 기반으로 확장 필요.

---

## 5. E2E 검증

브라우저에서 `https://<project>.vercel.app` 접속 후:

1. **회원가입** → 200 응답 확인
2. **로그인** → DevTools → Network → `/api/auth/login` 응답 헤더에:
   ```
   Set-Cookie: accessToken=...; Path=/; HttpOnly; Secure; SameSite=None
   Set-Cookie: refreshToken=...; Path=/api/auth; HttpOnly; Secure; SameSite=None
   ```
   가 모두 있어야 함.
3. **새로고침** → 로그인 유지되는지 확인 (refresh 토큰으로 access 토큰 재발급되는지)
4. **상품 목록 / 장바구니 / 주문** 동작 확인
5. **PortOne 결제 (사용하는 경우)** 테스트 결제 1건 통과

### 자주 빠지는 함정

| 증상 | 원인 / 해결 |
| --- | --- |
| 로그인은 되는데 새로고침 후 401 | 쿠키가 안 박힘. `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none` 둘 다 확인. helmet 도 영향 X (쿠키 헤더는 통과). |
| `CORS error` in console | `CORS_ORIGIN` 이 정확한지. Vercel preview URL 일 수 있음. credentials 모드에서는 `*` 사용 불가. |
| 401 무한 새로고침 | refresh 엔드포인트 자체가 401 → 로그아웃 처리. `SKIP_REFRESH_URLS` 가 `/auth/refresh` 포함해 무한루프 방지 (client/src/lib/apiClient.ts). |
| Heroku 첫 요청이 느림 | Eco dyno sleep. Basic 으로 업그레이드하거나 외부 ping (UptimeRobot 등) 으로 keepalive. |
| `H10 app crashed` | `heroku logs --tail` 확인. 대부분 환경변수 누락 (JWT secret, Mongo URL) 또는 Mongo Network Access 미설정. |
| `Mixed Content blocked` | Vercel(https) 에서 http API 호출. `VITE_API_BASE_URL` 이 https 인지 확인. |
| rate-limit 경고 로그 (ValidationError) | `app.set('trust proxy', 1)` 가 누락된 경우. 본 저장소는 app.js 에 이미 박혀 있음 ✅ |

---

## 6. 운영 팁

- **로그**: `heroku logs --tail -a <app>` / Vercel Dashboard → Deployments → Functions Logs
- **롤백**: Heroku Dashboard → Activity → Roll back. Vercel 은 이전 deployment 의 "Promote to Production".
- **시크릿 회전**: `JWT_*_SECRET` 을 바꾸면 모든 사용자 즉시 로그아웃 (의도된 동작).
- **DB 백업**: Atlas → Backup → Snapshot. M0 는 백업 제한 — 운영용이면 M10+ 권장.
- **모니터링**: Heroku Metrics 탭 (Basic 이상). Vercel 은 기본 Analytics.

---

## 7. 변경 이력

이 저장소가 배포 가능하도록 추가된 파일:

- `server/Procfile` — Heroku 가 어떤 프로세스를 띄울지 알려줌 (`web: npm start`)
- `client/vercel.json` — SPA 라우팅 rewrites
- `server/src/app.js` — `app.set('trust proxy', 1)` 한 줄 추가

각 변경의 사유는 본 문서의 해당 절에 인라인으로 설명되어 있다.
