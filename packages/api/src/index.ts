/**
 * 三端共享的接口类型。阶段 2 接入 tRPC 后，这里会导出路由类型。
 */

export type Channel = 'ios' | 'android' | 'stripe' | 'promptpay';
export type EntitlementKey = 'premium';

export interface EntitlementState {
  key: EntitlementKey;
  active: boolean;
  source: Channel | null;
  expiresAt: string | null;
}

export interface MeResponse {
  userId: string;
  email: string | null;
  locale: string;
  entitlements: EntitlementState[];
  credits: { report: number; compatibility: number };
}

export interface HealthResponse {
  ok: boolean;
  env: string;
  engine: string;
  sunModel: string;
  time: string;
}

/** RevenueCat Webhook 事件里后端关心的字段 */
export interface RevenueCatEvent {
  type:
    | 'INITIAL_PURCHASE'
    | 'RENEWAL'
    | 'CANCELLATION'
    | 'UNCANCELLATION'
    | 'EXPIRATION'
    | 'BILLING_ISSUE'
    | 'PRODUCT_CHANGE'
    | 'TRANSFER';
  app_user_id: string;
  entitlement_ids: string[] | null;
  store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'RC_BILLING' | string;
  expiration_at_ms: number | null;
}
