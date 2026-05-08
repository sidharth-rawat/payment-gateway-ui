'use client';

import { ChangeEvent } from 'react';
import type { Currency } from '@/types';

interface CurrencyAmountInputProps {
  amount: string;
  currency: Currency;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: Currency) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
}

const CURRENCIES: Currency[] = ['INR', 'USD'];

export function CurrencyAmountInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  onBlur,
  error,
  disabled,
}: CurrencyAmountInputProps) {
  const errorId = 'amount-error';

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    onAmountChange(e.target.value);
  }

  function handleCurrencyChange(e: ChangeEvent<HTMLSelectElement>) {
    onCurrencyChange(e.target.value as Currency);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="amount" className="text-sm font-medium text-slate-700">
        Amount
      </label>
      <div
        className={`flex overflow-hidden rounded-lg border transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
          error ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <select
          id="currency"
          aria-label="Currency"
          value={currency}
          onChange={handleCurrencyChange}
          disabled={disabled}
          className="border-r border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          autoComplete="transaction-amount"
          value={amount}
          onChange={handleAmountChange}
          onBlur={onBlur}
          placeholder="0.00"
          min="0.01"
          step="0.01"
          disabled={disabled}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
