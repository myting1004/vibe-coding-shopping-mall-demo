# shopping-mall-demo-server

쇼핑몰 데모용 API 서버. **Node.js + Express + MongoDB(Mongoose)** 조합으로 구성되어 있다.

## 요구 사항

- Node.js `>= 18` (개발 환경: Node 20)
- MongoDB `>= 6` (로컬 또는 Atlas)

## 빠른 시작

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 파일 준비
cp .env.example .env
# .env 안의 MONGO_URI / PORT / CORS_ORIGIN 을 환경에 맞게 수정

# 3) MongoDB 실행 (로컬일 경우 한 가지 예시)
#   - Homebrew: brew services start mongodb-community
#   - Docker  : docker run -d --name mongo -p 27017:27017 mongo:7

# 4) 개발 서버 실행 (nodemon)
npm run dev

# 또는 운영 모드
npm start
```

서버가 뜨면 `http://localhost:4000` 에서 접근 가능하다.

## 디렉토리 구조

```
server/
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── server.js            # 진입점 (DB 연결 + listen + graceful shutdown)
    ├── app.js               # Express 앱 구성 (미들웨어 + 라우트)
    ├── config/
    │   ├── env.js           # dotenv 로드 + 환경변수 검증
    │   └── db.js            # mongoose 연결
    ├── routes/
    │   ├── index.js         # /api 루트
    │   └── productRoutes.js # /api/products
    ├── controllers/
    │   └── productController.js
    ├── models/
    │   └── Product.js
    └── middlewares/
        └── errorHandler.js  # 404 + 공통 에러 핸들러
```

## 기본 엔드포인트

| Method | Path | 설명 |
| --- | --- | --- |
| GET    | `/`                       | API 정보 |
| GET    | `/api/health`             | 헬스 체크 |
| GET    | `/api/products`           | 상품 목록 (`?category=`, `?q=` 지원) |
| POST   | `/api/products`           | 상품 생성 |
| GET    | `/api/products/:id`       | 상품 단건 조회 |
| PATCH  | `/api/products/:id`       | 상품 수정 |
| DELETE | `/api/products/:id`       | 상품 삭제 |

### 빠른 테스트 예시

```bash
# 헬스 체크
curl http://localhost:4000/api/health

# 상품 생성
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트 상품","price":12900,"stock":10,"category":"clothing"}'

# 상품 목록
curl http://localhost:4000/api/products
```

## 환경변수

| 키 | 기본값 | 설명 |
| --- | --- | --- |
| `PORT` | `4000` | 서버 포트 |
| `NODE_ENV` | `development` | 실행 모드 |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/shopping_mall_demo` | MongoDB 접속 URI |
| `CORS_ORIGIN` | `*` | 허용 Origin (쉼표 구분). `*` 또는 미설정 시 전체 허용 |

## 다음 단계 아이디어

- 카테고리/주문/회원 모델 추가
- 인증 (JWT) 미들웨어
- 입력 검증 라이브러리 (`zod` / `joi`)
- 테스트 도구 (`vitest` / `jest` + `supertest`)
