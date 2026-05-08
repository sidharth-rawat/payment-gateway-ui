'use client';

import { useEffect, useState } from 'react';
import type { Transaction } from '@/types';
import { usePaymentStore } from '@/store/paymentStore';

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const styles: Record<Transaction['status'], string> = {
    success: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    timeout: 'bg-amber-100 text-amber-700',
  };
  const labels: Record<Transaction['status'], string> = {
    success: 'Success',
    failed: 'Failed',
    timeout: 'Timeout',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

function TransactionDetail({ transaction, onClose }: TransactionDetailProps) {
  const currencySymbol = transaction.currency === 'INR' ? '₹' : '$';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Transaction details"
    >
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Transaction Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <dl className="flex flex-col gap-3">
          <div className="flex justify-between">
            <dt className="text-sm text-slate-500">Status</dt>
            <dd><StatusBadge status={transaction.status} /></dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-slate-500">Amount</dt>
            <dd className="text-sm font-semibold text-slate-800">
              {currencySymbol}{transaction.amount.toFixed(2)} {transaction.currency}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-slate-500">Cardholder</dt>
            <dd className="text-sm text-slate-800">{transaction.cardholderName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-slate-500">Card</dt>
            <dd className="font-mono text-sm text-slate-800">•••• {transaction.last4}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-slate-500">Attempts</dt>
            <dd className="text-sm text-slate-800">{transaction.attempts}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-slate-500">Time</dt>
            <dd className="text-sm text-slate-800">{formatTimestamp(transaction.timestamp)}</dd>
          </div>
          {transaction.failureReason && (
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Reason</dt>
              <dd className="text-sm text-red-600">{transaction.failureReason}</dd>
            </div>
          )}
          <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
            <dt className="text-xs text-slate-400">Transaction ID</dt>
            <dd className="break-all font-mono text-xs text-slate-600">{transaction.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function TransactionHistory() {
  const [mounted, setMounted] = useState(false);
  const history = usePaymentStore((s) => s.history);
  const selectedId = usePaymentStore((s) => s.selectedHistoryId);
  const setSelectedHistoryId = usePaymentStore((s) => s.setSelectedHistoryId);

  // Avoid SSR/client hydration mismatch from localStorage-backed store
  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTransaction = history.find((t) => t.id === selectedId) ?? null;

  if (!mounted || history.length === 0) {
    return (
      <aside aria-label="Transaction history" className="rounded-2xl bg-slate-50 p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-700">Transaction History</h2>
        <p className="text-sm text-slate-400">No transactions yet. Complete a payment to see your history.</p>
      </aside>
    );
  }

  return (
    <aside aria-label="Transaction history">
      <h2 className="mb-4 text-base font-semibold text-slate-700">
        Transaction History
        <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
          {history.length}
        </span>
      </h2>

      <ul className="flex flex-col gap-2" role="list">
        {history.map((tx) => {
          const currencySymbol = tx.currency === 'INR' ? '₹' : '$';
          return (
            <li key={tx.id}>
              <button
                onClick={() => setSelectedHistoryId(tx.id)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Transaction ${tx.id.slice(0, 8)}, ${tx.status}, ${currencySymbol}${tx.amount.toFixed(2)}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-400">{tx.id.slice(0, 12)}…</span>
                  <StatusBadge status={tx.status} />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    {currencySymbol}{tx.amount.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">{formatTimestamp(tx.timestamp)}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedHistoryId(null)}
        />
      )}
    </aside>
  );
}
