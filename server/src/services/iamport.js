// PortOne V2 REST API 클라이언트.
//
// V1 SDK(iamport.js / IMP.request_pay) 로 결제하더라도 PortOne 콘솔의 채널이
// V2 채널(channel-key-xxx)이면 결제건이 V2 시스템에 기록되어 V1 REST API 로는
// 조회되지 않음(404 '존재하지 않는 결제정보'). V2 REST API 는 V1/V2 결제건 모두
// 조회 가능하므로 이쪽으로 통일.
//
// V1 ↔ V2 식별자 매핑:
//   V1 SDK 의 merchant_uid  ↔  V2 의 paymentId(= 응답 `id`, URL path 의 식별자)
//   V1 SDK 의 imp_uid       ↔  V2 의 transactionId(PortOne 내부 트랜잭션 ID)
//
//   따라서 V2 결제 조회/취소 시 path 에는 merchant_uid 를 넣어야 함.
//   imp_uid 를 넣으면 PAYMENT_NOT_FOUND.
//
// 인증: Authorization 헤더에 'PortOne <V2_API_SECRET>' — 토큰 발급 단계 없음.
// 파일명은 호출부 호환을 위해 iamport.js 유지(내부 구현만 V2 로 전환).

import { env } from "../config/env.js";

const PORTONE_V2_BASE = "https://api.portone.io";

function ensureCredentials() {
  if (!env.portone.v2ApiSecret) {
    const err = new Error(
      "PortOne V2 API Secret 이 설정되지 않았습니다. server/.env 의 PORTONE_V2_API_SECRET 을 확인하세요.",
    );
    err.status = 503;
    err.code = "PORTONE_NOT_CONFIGURED";
    throw err;
  }
}

async function callPortone(path, { method = "GET", body } = {}) {
  ensureCredentials();
  const url = `${PORTONE_V2_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `PortOne ${env.portone.v2ApiSecret}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }
  }

  if (!res.ok) {
    console.error("[portone] V2 API 호출 실패", {
      url,
      method,
      httpStatus: res.status,
      type: parsed?.type,
      message: parsed?.message,
    });
    const err = new Error(
      `PortOne V2 API ${res.status} ${res.statusText} — ${parsed?.message ?? "no body"}`,
    );
    err.status =
      res.status === 401 || res.status === 403
        ? 503
        : res.status === 404
          ? 404
          : 502;
    err.code = parsed?.type ?? "PORTONE_HTTP_ERROR";
    err.upstreamStatus = res.status;
    err.upstreamBody = parsed;
    throw err;
  }

  return parsed;
}

// V2 status → V1 호환 status 매핑.
// V2: 'READY' | 'PENDING' | 'VIRTUAL_ACCOUNT_ISSUED' | 'PAID' |
//     'FAILED' | 'PARTIAL_CANCELLED' | 'CANCELLED' | 'PAY_PENDING'
function statusV2toV1(s) {
  switch (s) {
    case "PAID":
      return "paid";
    case "CANCELLED":
    case "PARTIAL_CANCELLED":
      return "cancelled";
    case "FAILED":
      return "failed";
    case "READY":
    case "PENDING":
    case "PAY_PENDING":
    case "VIRTUAL_ACCOUNT_ISSUED":
      return "ready";
    default:
      return String(s ?? "").toLowerCase();
  }
}

// V2 응답을 controller 가 기대하는 V1 형태로 정규화.
function normalizePayment(v2) {
  if (!v2 || typeof v2 !== "object") return null;
  return {
    status: statusV2toV1(v2.status),
    imp_uid: v2.transactionId ?? null,
    merchant_uid: v2.id ?? null,
    amount: v2.amount?.total ?? 0,
    paid_at: v2.paidAt ? Math.floor(new Date(v2.paidAt).getTime() / 1000) : 0,
    pay_method: v2.method?.type ?? null,
    raw: v2,
  };
}

// GET /payments/{paymentId} — paymentId 는 V1 의 merchant_uid 와 동일.
export async function getPayment(merchantUid) {
  if (!merchantUid) throw new Error("merchantUid 가 필요합니다.");
  const v2 = await callPortone(`/payments/${encodeURIComponent(merchantUid)}`);
  const normalized = normalizePayment(v2);
  if (!normalized) {
    const err = new Error("결제 정보를 찾을 수 없습니다.");
    err.status = 404;
    err.code = "PORTONE_PAYMENT_NOT_FOUND";
    throw err;
  }
  return normalized;
}

// POST /payments/{paymentId}/cancel — body 의 reason 필수.
export async function cancelPayment(merchantUid, reason = "주문 검증 실패") {
  if (!merchantUid) throw new Error("merchantUid 가 필요합니다.");
  const v2 = await callPortone(
    `/payments/${encodeURIComponent(merchantUid)}/cancel`,
    {
      method: "POST",
      body: { reason },
    },
  );
  return v2;
}
