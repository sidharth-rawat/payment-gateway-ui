'use client';

import type { CardType } from '@/types';
import { maskCardNumber } from '@/utils/cardUtils';

interface CardPreviewProps {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cardType: CardType;
}

const gradients: Record<CardType, string> = {
  visa: 'from-blue-600 via-blue-700 to-blue-900',
  mastercard: 'from-red-500 via-orange-600 to-red-800',
  amex: 'from-emerald-500 via-teal-600 to-emerald-800',
  unknown: 'from-slate-500 via-slate-600 to-slate-800',
};

function ChipSVG() {
  return (
    <svg width="46" height="36" viewBox="0 0 46 36" fill="none" aria-hidden="true">
      <rect width="46" height="36" rx="4" fill="#D4AF37" />
      <rect x="14" y="0" width="18" height="36" fill="#C9A227" />
      <rect x="0" y="12" width="46" height="12" fill="#C9A227" />
      <rect x="14" y="12" width="18" height="12" fill="#B8941C" />
    </svg>
  );
}

export function CardPreview({ cardNumber, cardholderName, expiry, cardType }: CardPreviewProps) {
  const gradient = gradients[cardType];
  const masked = maskCardNumber(cardNumber, cardType);
  const displayName = cardholderName.trim().toUpperCase() || 'FULL NAME';
  const displayExpiry = expiry || 'MM/YY';

  return (
    <div
      className={`relative w-full max-w-sm rounded-2xl bg-linear-to-br ${gradient} p-6 text-white shadow-2xl transition-all duration-300`}
      aria-label="Card preview"
      role="img"
    >
      {/* Decorative circles */}
      <div className="absolute right-0 top-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-white/5" />
      <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-4 translate-y-4 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <ChipSVG />
          <span className="text-lg font-bold tracking-widest opacity-90">
            {cardType === 'unknown' ? '' : cardType.toUpperCase()}
          </span>
        </div>

        <div
          className="font-mono text-xl tracking-[0.2em] whitespace-nowrap overflow-hidden transition-all duration-200"
          aria-label={`Card number ending in ${masked.slice(-4)}`}
        >
          {masked}
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-widest opacity-70">Card Holder</span>
            <span className="max-w-45 truncate text-sm font-semibold tracking-wider">
              {displayName}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 text-right">
            <span className="text-xs uppercase tracking-widest opacity-70">Expires</span>
            <span className="font-mono text-sm font-semibold">{displayExpiry}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
