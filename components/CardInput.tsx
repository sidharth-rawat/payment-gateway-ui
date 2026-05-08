'use client';

import { ChangeEvent } from 'react';
import type { CardType } from '@/types';
import { detectCardType, formatCardNumber, getFormattedMaxLength } from '@/utils/cardUtils';

interface CardInputProps {
  value: string;
  onChange: (formatted: string, cardType: CardType) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
}

function CardBadge({ cardType }: { cardType: CardType }) {
  const badges: Record<CardType, { label: string; className: string }> = {
    visa: { label: 'VISA', className: 'bg-blue-600 text-white' },
    mastercard: { label: 'MC', className: 'bg-red-600 text-white' },
    amex: { label: 'AMEX', className: 'bg-green-600 text-white' },
    unknown: { label: '----', className: 'bg-slate-300 text-slate-600' },
  };

  const badge = badges[cardType];
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold tracking-wider ${badge.className}`}
      aria-label={`Card type: ${cardType}`}
    >
      {badge.label}
    </span>
  );
}

export function CardInput({ value, onChange, onBlur, error, disabled }: CardInputProps) {
  const cardType = detectCardType(value);
  const maxLength = getFormattedMaxLength(cardType);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    const newCardType = detectCardType(raw);
    const formatted = formatCardNumber(raw, newCardType);
    onChange(formatted, newCardType);
  }

  const errorId = 'card-number-error';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="card-number" className="text-sm font-medium text-slate-700">
        Card Number
      </label>
      <div className="relative flex items-center">
        <input
          id="card-number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          maxLength={maxLength}
          placeholder="0000 0000 0000 0000"
          disabled={disabled}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={`w-full rounded-lg border px-4 py-2.5 pr-20 font-mono text-sm tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 ${
            error ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        />
        <div className="absolute right-3">
          <CardBadge cardType={cardType} />
        </div>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
