import type { CardType } from '@/types';

export function detectCardType(raw: string): CardType {
  const digits = raw.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

export function formatCardNumber(raw: string, cardType: CardType): string {
  const digits = raw.replace(/\D/g, '');
  if (cardType === 'amex') {
    // Amex: 4-6-5 grouping
    const part1 = digits.slice(0, 4);
    const part2 = digits.slice(4, 10);
    const part3 = digits.slice(10, 15);
    return [part1, part2, part3].filter(Boolean).join(' ');
  }
  // Standard: 4-4-4-4 grouping
  return digits.slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export function getCardMaxLength(cardType: CardType): number {
  // raw digit limit
  return cardType === 'amex' ? 15 : 16;
}

export function getFormattedMaxLength(cardType: CardType): number {
  // including spaces
  return cardType === 'amex' ? 17 : 19;
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function getLast4(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.slice(-4).padStart(4, '•');
}

export function maskCardNumber(cardNumber: string, cardType: CardType): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (cardType === 'amex') {
    const visible = digits.slice(11, 15) || '••••';
    return `•••• •••••• ${visible.padEnd(4, '•')}`;
  }
  const visible = digits.slice(12, 16) || '••••';
  return `•••• •••• •••• ${visible.padEnd(4, '•')}`;
}
