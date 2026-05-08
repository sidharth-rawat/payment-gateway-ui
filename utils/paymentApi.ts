import type { GatewayResponse, PaymentPayload } from '@/types';

export class TimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

const TIMEOUT_MS = 6000;

export async function submitPayment(payload: PaymentPayload): Promise<GatewayResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new NetworkError(`Server error: ${response.status}`);
    }

    const data: GatewayResponse = await response.json();
    return data;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new TimeoutError();
    }
    if (err instanceof TimeoutError || err instanceof NetworkError) {
      throw err;
    }
    throw new NetworkError('An unexpected network error occurred');
  } finally {
    clearTimeout(timeoutId);
  }
}
