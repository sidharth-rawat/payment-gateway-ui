export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'timeout';
export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';
export type Currency = 'INR' | 'USD';

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  last4: string;
  expiry: string;
  amount: number;
  currency: Currency;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: Exclude<PaymentStatus, 'idle' | 'processing'>;
  timestamp: string;
  attempts: number;
  failureReason?: string;
  last4: string;
  cardholderName: string;
}

export interface PaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export interface ValidationErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  amount?: string;
}

export interface GatewayResponse {
  status: 'success' | 'failed';
  transactionId: string;
  failureReason?: string;
}
