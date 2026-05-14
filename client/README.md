# shopping-mall-demo client

쇼핑몰 데모용 프론트엔드. **Vite + React 19 + TypeScript + Tailwind CSS v4** 기반이며, 같은 저장소의 `../server` (Express + MongoDB) API와 연동된다.

## 스택

| 영역 | 도구 |
| --- | --- |
| 번들러 / Dev server | Vite 7 |
| 프레임워크 | React 19 + TypeScript 5.9 |
| 라우팅 | React Router 7 |
| 서버 상태 | TanStack Query 5 |
| HTTP | Axios |
| 스타일 | Tailwind CSS 4 (`@tailwindcss/vite`) |
| 코드 품질 | ESLint 9 + Prettier 3 (`prettier-plugin-tailwindcss`) |

## 요구 사항

- Node.js `^20.19` 또는 `>=22.12` 권장 (Vite 7 공식 요구)
  - 현재 `20.17` 에서도 동작은 함 — 경고 메시지가 뜸. `nvm install 20.19` 등으로 업그레이드 권장.
- 백엔드 서버 (`../server`)가 `http://localhost:4000` 에 떠 있어야 API 호출이 동작.

## 빠른 시작

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 파일 (선택)
cp .env.example .env

# 3) 백엔드 서버 먼저 띄우기 (다른 터미널에서)
cd ../server && npm run dev

# 4) Vite dev server
npm run dev   # http://localhost:5173
```

브라우저에서 `http://localhost:5173` 열면 홈 → "상품 보러 가기" → `/products` 에서 백엔드의 `GET /api/products` 결과가 카드로 표시된다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Vite dev server (HMR + `/api` proxy → `http://localhost:4000`) |
| `npm run build` | `tsc -b` 타입체크 + `vite build` (`dist/`) |
| `npm run preview` | 프로덕션 빌드 결과 로컬 프리뷰 |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier (Tailwind 클래스 정렬 포함) |

## 디렉토리 구조

```
client/
├── index.html
├── vite.config.ts          # plugins: react + tailwind / alias @ → src / proxy /api → :4000
├── tsconfig.app.json       # paths: @/* → ./src/*
├── .env.example
├── .prettierrc.json
└── src/
    ├── main.tsx            # 진입점 (StrictMode + Providers + RouterProvider)
    ├── index.css           # @import "tailwindcss";
    ├── router.tsx          # createBrowserRouter
    ├── providers/
    │   └── AppProviders.tsx       # QueryClientProvider
    ├── components/
    │   └── Layout.tsx             # 헤더/푸터 + Outlet
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── ProductsPage.tsx       # /api/products 연동
    │   └── NotFoundPage.tsx
    ├── api/
    │   └── products.ts            # fetchProducts / fetchProduct
    ├── hooks/
    │   └── useProducts.ts         # useQuery wrapper
    ├── lib/
    │   └── apiClient.ts           # axios instance + 에러 메시지 정규화
    └── types/
        └── product.ts
```

## API 연동 방식

기본 흐름:

1. `apiClient` 는 `import.meta.env.VITE_API_BASE_URL ?? '/api'` 를 base 로 사용.
2. 개발 시에는 Vite proxy 가 `/api/*` 요청을 `http://localhost:4000` 으로 포워딩 → **CORS 신경 안 써도 됨**.
3. 운영 / 다른 도메인 사용 시에는 `.env` 의 `VITE_API_BASE_URL` 을 절대 URL로 지정 (예: `https://api.example.com/api`) — 이때는 서버 측 CORS 설정 필요.

```ts
// 사용 예 (src/hooks/useProducts.ts)
const { data, isLoading, isError } = useProducts({ category: 'clothing' });
```

## 환경변수

| 키 | 기본값 | 설명 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | 클라이언트가 호출할 API base URL. 미설정 시 vite proxy 경유 |
| `VITE_API_PROXY_TARGET` | `http://localhost:4000` | `vite.config.ts` 의 `/api` proxy 타겟. 백엔드 포트를 바꿀 때만 설정 |

## 다음 단계 아이디어

- 상품 상세 페이지 (`/products/:id`)
- 장바구니 (Zustand 등 클라이언트 상태)
- 인증 / 로그인 페이지
- 폼 검증 (`react-hook-form` + `zod`)
- 디자인 토큰 / 다크모드
- 테스트 (`vitest` + `@testing-library/react`)
