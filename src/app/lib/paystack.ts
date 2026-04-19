// src/lib/paystack.ts
// Shared types and helpers for Paystack

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // in pesewas (GHS × 100)
  currency: string;
  ref: string;
  label: string;
  metadata: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  channels: string[];
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

export interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

export interface VerifyResponse {
  success: boolean;
  amount?: number;
  currency?: string;
  email?: string;
  reference?: string;
  paidAt?: string;
  message?: string;
}

export interface DonationPayload {
  reference: string;
}

// Generate a unique payment reference
export function generateRef(): string {
  return `ROLU_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

// Format amount for display
export function formatGHS(amount: number): string {
  return `₵${amount.toLocaleString("en-GH")}`;
}
