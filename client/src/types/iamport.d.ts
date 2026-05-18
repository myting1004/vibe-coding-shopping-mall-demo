// PortOne(iamport) SDK 글로벌 타입 선언.
// cdn.iamport.kr/v1/iamport.js 가 로드되면 window.IMP 에 객체가 주입된다.

export interface IamportRequestPayParams {
  pg?: string;
  pay_method?:
    | 'card'
    | 'trans'
    | 'vbank'
    | 'phone'
    | 'samsung'
    | 'kpay'
    | 'kakaopay'
    | 'payco'
    | 'lpay'
    | 'ssgpay'
    | 'tosspay';
  merchant_uid: string;
  name?: string;
  amount: number;
  buyer_email?: string;
  buyer_name?: string;
  buyer_tel?: string;
  buyer_addr?: string;
  buyer_postcode?: string;
  m_redirect_url?: string;
  app_scheme?: string;
  digital?: boolean;
  vbank_due?: string;
}

export interface IamportResponse {
  success: boolean;
  imp_uid: string | null;
  merchant_uid: string;
  pay_method?: string;
  paid_amount?: number;
  status?: string;
  name?: string;
  pg_provider?: string;
  pg_tid?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_tel?: string;
  buyer_addr?: string;
  buyer_postcode?: string;
  paid_at?: number;
  receipt_url?: string;
  error_code?: string | null;
  error_msg?: string | null;
}

export interface IMPInstance {
  init: (accountId: string) => void;
  request_pay: (
    params: IamportRequestPayParams,
    callback: (rsp: IamportResponse) => void
  ) => void;
}

declare global {
  interface Window {
    IMP?: IMPInstance;
  }
}
