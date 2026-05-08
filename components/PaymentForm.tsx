'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import type { CardType, Currency, PaymentFormValues, ValidationErrors } from '@/types';
import { CardInput } from './CardInput';
import { CardPreview } from './CardPreview';
import { CurrencyAmountInput } from './CurrencyAmountInput';
import { formatExpiry } from '@/utils/cardUtils';
import {
  validateAmount,
  validateCardholderName,
  validateCardNumber,
  validateCVV,
  validateExpiry,
} from '@/utils/validation';

interface PaymentFormProps {
  onSubmit: (values: PaymentFormValues, cardType: CardType) => void;
  isSubmitting: boolean;
}

const initialValues: PaymentFormValues = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  amount: '',
  currency: 'INR',
};

type TouchedFields = Record<keyof PaymentFormValues, boolean>;

const initialTouched: TouchedFields = {
  cardholderName: false,
  cardNumber: false,
  expiry: false,
  cvv: false,
  amount: false,
  currency: false,
};

export function PaymentForm({ onSubmit, isSubmitting }: PaymentFormProps) {
  const [values, setValues] = useState<PaymentFormValues>(initialValues);
  const [touched, setTouched] = useState<TouchedFields>(initialTouched);
  const [cardType, setCardType] = useState<CardType>('unknown');

  function getErrors(vals: PaymentFormValues, ct: CardType): ValidationErrors {
    return {
      cardholderName: validateCardholderName(vals.cardholderName),
      cardNumber: validateCardNumber(vals.cardNumber, ct),
      expiry: validateExpiry(vals.expiry),
      cvv: validateCVV(vals.cvv, ct),
      amount: validateAmount(vals.amount),
    };
  }

  const errors = getErrors(values, cardType);
  const isFormValid = Object.values(errors).every((e) => e === undefined);
  const visibleErrors: ValidationErrors = {
    cardholderName: touched.cardholderName ? errors.cardholderName : undefined,
    cardNumber: touched.cardNumber ? errors.cardNumber : undefined,
    expiry: touched.expiry ? errors.expiry : undefined,
    cvv: touched.cvv ? errors.cvv : undefined,
    amount: touched.amount ? errors.amount : undefined,
  };

  function markTouched(field: keyof PaymentFormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleCardNumberChange(formatted: string, newCardType: CardType) {
    setCardType(newCardType);
    setValues((prev) => ({ ...prev, cardNumber: formatted }));
    if (touched.cardNumber) {
      // re-validate automatically once touched
    }
  }

  function handleExpiryChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatExpiry(e.target.value);
    setValues((prev) => ({ ...prev, expiry: formatted }));
  }

  function handleCVVChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    const maxLen = cardType === 'amex' ? 4 : 3;
    setValues((prev) => ({ ...prev, cvv: raw.slice(0, maxLen) }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Touch all fields to show any remaining errors
    setTouched({
      cardholderName: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
      amount: true,
      currency: true,
    });
    if (!isFormValid || isSubmitting) return;
    onSubmit(values, cardType);
  }

  const cvvErrorId = 'cvv-error';
  const nameErrorId = 'name-error';
  const expiryErrorId = 'expiry-error';

  return (
    <div className="flex flex-col gap-6 text-slate-900 lg:flex-row lg:items-start">
      {/* Card Preview */}
      <div className="flex justify-center lg:justify-start">
        <CardPreview
          cardNumber={values.cardNumber}
          cardholderName={values.cardholderName}
          expiry={values.expiry}
          cardType={cardType}
        />
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-1 flex-col gap-4"
        aria-label="Payment form"
      >
        {/* Cardholder Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="cardholder-name" className="text-sm font-medium text-slate-700">
            Cardholder Name
          </label>
          <input
            id="cardholder-name"
            type="text"
            autoComplete="cc-name"
            value={values.cardholderName}
            onChange={(e) => setValues((prev) => ({ ...prev, cardholderName: e.target.value }))}
            onBlur={() => markTouched('cardholderName')}
            placeholder="Enter name"
            disabled={isSubmitting}
            aria-describedby={visibleErrors.cardholderName ? nameErrorId : undefined}
            aria-invalid={!!visibleErrors.cardholderName}
            className={`rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 ${
              visibleErrors.cardholderName
                ? 'border-red-500 bg-red-50'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          />
          {visibleErrors.cardholderName && (
            <p id={nameErrorId} role="alert" className="text-xs text-red-600">
              {visibleErrors.cardholderName}
            </p>
          )}
        </div>

        {/* Card Number */}
        <CardInput
          value={values.cardNumber}
          onChange={handleCardNumberChange}
          onBlur={() => markTouched('cardNumber')}
          error={visibleErrors.cardNumber}
          disabled={isSubmitting}
        />

        {/* Expiry + CVV row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="expiry" className="text-sm font-medium text-slate-700">
              Expiry Date
            </label>
            <input
              id="expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={values.expiry}
              onChange={handleExpiryChange}
              onBlur={() => markTouched('expiry')}
              placeholder="MM/YY"
              maxLength={5}
              disabled={isSubmitting}
              aria-describedby={visibleErrors.expiry ? expiryErrorId : undefined}
              aria-invalid={!!visibleErrors.expiry}
              className={`rounded-lg border px-4 py-2.5 font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                visibleErrors.expiry
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
            />
            {visibleErrors.expiry && (
              <p id={expiryErrorId} role="alert" className="text-xs text-red-600">
                {visibleErrors.expiry}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="cvv" className="text-sm font-medium text-slate-700">
              CVV {cardType === 'amex' && <span className="text-slate-400">(4 digits)</span>}
            </label>
            <input
              id="cvv"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={values.cvv}
              onChange={handleCVVChange}
              onBlur={() => markTouched('cvv')}
              placeholder={cardType === 'amex' ? '••••' : '•••'}
              maxLength={cardType === 'amex' ? 4 : 3}
              disabled={isSubmitting}
              aria-describedby={visibleErrors.cvv ? cvvErrorId : undefined}
              aria-invalid={!!visibleErrors.cvv}
              className={`rounded-lg border px-4 py-2.5 font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                visibleErrors.cvv
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
            />
            {visibleErrors.cvv && (
              <p id={cvvErrorId} role="alert" className="text-xs text-red-600">
                {visibleErrors.cvv}
              </p>
            )}
          </div>
        </div>

        {/* Amount + Currency */}
        <CurrencyAmountInput
          amount={values.amount}
          currency={values.currency}
          onAmountChange={(v) => setValues((prev) => ({ ...prev, amount: v }))}
          onCurrencyChange={(v) => setValues((prev) => ({ ...prev, currency: v as Currency }))}
          onBlur={() => markTouched('amount')}
          error={visibleErrors.amount}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="mt-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={!isFormValid ? 'submit-hint' : undefined}
        >
          {isSubmitting ? 'Processing…' : 'Pay Now'}
        </button>
        {!isFormValid && (
          <p id="submit-hint" className="text-center text-xs text-slate-400">
            Fill in all fields correctly to enable payment
          </p>
        )}
      </form>
    </div>
  );
}
