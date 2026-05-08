'use client';

import { useEffect, useRef } from 'react';
import type { PaymentStatus, Transaction } from '@/types';

interface StatusScreenProps {
  status: Exclude<PaymentStatus, 'idle'>;
  transaction: Transaction | null;
  attemptCount: number;
  failureReason: string | undefined;
  onRetry: () => void;
  onReset: () => void;
}

const MAX_ATTEMPTS = 3;

function Spinner() {
  return (
    <div
      className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
      role="status"
      aria-label="Processing"
    />
  );
}

function SuccessIcon() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
      <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

function FailIcon() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
      <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}

function TimeoutIcon() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
      <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

export function StatusScreen({
  status,
  transaction,
  attemptCount,
  failureReason,
  onRetry,
  onReset,
}: StatusScreenProps) {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const canRetry = attemptCount < MAX_ATTEMPTS;

  // Focus primary action after result appears
  useEffect(() => {
    if (status !== 'processing') {
      primaryButtonRef.current?.focus();
    }
  }, [status]);

  const currencySymbol = transaction?.currency === 'INR' ? '₹' : '$';

  if (status === 'processing') {
    return (
      <div
        className="flex flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        <Spinner />
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">Processing Payment</p>
          <p className="mt-1 text-sm text-slate-500">Please wait, do not close this page…</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div
        className="flex flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        <SuccessIcon />
        <div className="text-center">
          <p className="text-lg font-semibold text-emerald-700">Payment Successful!</p>
          {transaction && (
            <>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {currencySymbol}{transaction.amount.toFixed(2)}
              </p>
              <p className="mt-3 text-xs text-slate-400 font-mono break-all">
                Transaction ID: {transaction.id}
              </p>
            </>
          )}
        </div>
        <button
          ref={primaryButtonRef}
          onClick={onReset}
          className="rounded-lg bg-emerald-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Make Another Payment
        </button>
      </div>
    );
  }

  // failed or timeout
  const isTimeout = status === 'timeout';
  const isExhausted = !canRetry;

  return (
    <div
      className="flex flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      {isTimeout ? <TimeoutIcon /> : <FailIcon />}

      <div className="text-center">
        <p className={`text-lg font-semibold ${isTimeout ? 'text-amber-700' : 'text-red-700'}`}>
          {isTimeout ? 'Request Timed Out' : 'Payment Failed'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {isTimeout
            ? 'The payment request took too long to respond.'
            : (failureReason ?? 'Your payment could not be processed.')}
        </p>

        {isExhausted ? (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
            Maximum retry attempts reached. Please try again later or contact support.
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-400">
            Attempt {attemptCount} of {MAX_ATTEMPTS}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {!isExhausted && (
          <button
            ref={primaryButtonRef}
            onClick={onRetry}
            className={`rounded-lg px-8 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isTimeout
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            Retry Payment (Attempt {attemptCount + 1} of {MAX_ATTEMPTS})
          </button>
        )}
        <button
          ref={isExhausted ? primaryButtonRef : undefined}
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-8 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Start New Payment
        </button>
      </div>
    </div>
  );
}
