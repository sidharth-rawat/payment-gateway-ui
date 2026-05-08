import type { CardType } from '@/types';

export function validateCardholderName(value: string): string | undefined {
  if (!value.trim()) return 'Cardholder name is required';
  if (value.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'Name contains invalid characters';
  return undefined;
}

export function validateCardNumber(value: string, cardType: CardType): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Card number is required';
  const expectedLength = cardType === 'amex' ? 15 : 16;
  if (digits.length < expectedLength) {
    return `Card number must be ${expectedLength} digits`;
  }
  return undefined;
}

export function validateExpiry(value: string): string | undefined {
  if (!value) return 'Expiry date is required';
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return 'Expiry must be in MM/YY format';

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;

  if (month < 1 || month > 12) return 'Invalid month';

  const now = new Date();
  const expiry = new Date(year, month - 1, 1);
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (expiry < startOfCurrentMonth) return 'Card has expired';
  return undefined;
}

export function validateCVV(value: string, cardType: CardType): string | undefined {
  if (!value) return 'CVV is required';
  const expectedLength = cardType === 'amex' ? 4 : 3;
  if (!/^\d+$/.test(value)) return 'CVV must contain only digits';
  if (value.length !== expectedLength) {
    return `CVV must be ${expectedLength} digits${cardType === 'amex' ? ' for Amex' : ''}`;
  }
  return undefined;
}

export function validateAmount(value: string): string | undefined {
  if (!value) return 'Amount is required';
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 'Amount must be greater than 0';
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return 'Amount must have at most 2 decimal places';
  if (num > 1_000_000) return 'Amount exceeds maximum allowed';
  return undefined;
}
