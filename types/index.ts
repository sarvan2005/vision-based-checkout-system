export interface CartItem {
  name: string;
  quantity: number;
  price: number;
  confidence?: number;
  decision?: string;
}

export enum AppStateEnum {
  WELCOME = 'WELCOME',
  UPLOADING = 'UPLOADING',
  TAKING_PICTURE = 'TAKING_PICTURE',
  ANALYZING = 'ANALYZING',
  CHECKOUT = 'CHECKOUT',
  VERIFY = 'VERIFY',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  FRAUD_DETECTED = 'FRAUD_DETECTED',
  ERROR = 'ERROR',
}

export type AppState = AppStateEnum;

export interface FraudCheckResult {
  isSuspicious: boolean;
  reason: string;
}
