'use client';

import { useState } from 'react';
import type { CardType, PaymentFormValues } from '@/types';
import { PaymentForm } from '@/components/PaymentForm';
import { StatusScreen } from '@/components/StatusScreen';
import { TransactionHistory } from '@/components/TransactionHistory';
import { usePayment } from '@/hooks/usePayment';

const initialFormValues: PaymentFormValues = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  amount: '',
  currency: 'INR',
};

export default function HomePage() {
  const { status, attemptCount, currentTransaction, failureReason, submit, reset } = usePayment();
  const [lastValues, setLastValues] = useState<PaymentFormValues>(initialFormValues);
  const [lastCardType, setLastCardType] = useState<CardType>('unknown');

  function handleFormSubmit(values: PaymentFormValues, cardType: CardType) {
    setLastValues(values);
    setLastCardType(cardType);
    submit(values, cardType);
  }

  function handleRetry() {
    submit(lastValues, lastCardType);
  }

  const showForm = status === 'idle';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Secure Payment</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your payment information is encrypted and secure
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Payment area — takes 2 of 3 columns on desktop */}
          <div className="lg:col-span-2">
            {showForm ? (
              <section
                className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
                aria-label="Payment details"
              >
                <h2 className="mb-6 text-lg font-semibold text-slate-800">Enter Card Details</h2>
                <PaymentForm onSubmit={handleFormSubmit} isSubmitting={false} />
              </section>
            ) : (
              <section aria-label="Payment status" aria-live="polite">
                <StatusScreen
                  status={status as Exclude<typeof status, 'idle'>}
                  transaction={currentTransaction}
                  attemptCount={attemptCount}
                  failureReason={failureReason}
                  onRetry={handleRetry}
                  onReset={reset}
                />
              </section>
            )}
          </div>

          {/* Transaction history — 1 column on desktop */}
          <div className="lg:col-span-1">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </main>
  );
}
