'use client';

import { useRef, useCallback } from 'react';
import type { CardType, PaymentFormValues, Transaction } from '@/types';
import { usePaymentStore } from '@/store/paymentStore';
import { submitPayment, TimeoutError } from '@/utils/paymentApi';
import { getLast4 } from '@/utils/cardUtils';

const MAX_ATTEMPTS = 3;
const MIN_PROCESSING_MS = 2000;

export function usePayment() {
  const transactionIdRef = useRef<string | null>(null);

  const {
    status,
    attemptCount,
    currentTransaction,
    failureReason,
    setStatus,
    setCurrentTransaction,
    setFailureReason,
    incrementAttempt,
    addOrUpdateHistory,
    resetPayment,
  } = usePaymentStore();

  const submit = useCallback(
    async (values: PaymentFormValues, _cardType: CardType) => {
      // Generate transactionId only on first attempt
      if (!transactionIdRef.current) {
        transactionIdRef.current = crypto.randomUUID();
      }

      const transactionId = transactionIdRef.current;
      const amount = parseFloat(values.amount);
      const last4 = getLast4(values.cardNumber);

      setStatus('processing');
      incrementAttempt();

      const currentAttempt = usePaymentStore.getState().attemptCount;

      const [result] = await Promise.allSettled([
        submitPayment({
          transactionId,
          cardholderName: values.cardholderName,
          last4,
          expiry: values.expiry,
          amount,
          currency: values.currency,
        }),
        new Promise<void>((resolve) => setTimeout(resolve, MIN_PROCESSING_MS)),
      ]);

      if (result.status === 'rejected') {
        const err = result.reason;
        const isTimeout = err instanceof TimeoutError;
        const newStatus = isTimeout ? 'timeout' : 'failed';
        const reason = isTimeout ? undefined : 'An unexpected error occurred';

        const tx: Transaction = {
          id: transactionId,
          amount,
          currency: values.currency,
          status: newStatus,
          timestamp: new Date().toISOString(),
          attempts: currentAttempt,
          failureReason: reason,
          last4,
          cardholderName: values.cardholderName,
        };

        setStatus(newStatus);
        setFailureReason(reason);
        setCurrentTransaction(tx);
        addOrUpdateHistory(tx);
        return;
      }

      const data = result.value;

      if (data.status === 'success') {
        const tx: Transaction = {
          id: transactionId,
          amount,
          currency: values.currency,
          status: 'success',
          timestamp: new Date().toISOString(),
          attempts: currentAttempt,
          last4,
          cardholderName: values.cardholderName,
        };
        setStatus('success');
        setFailureReason(undefined);
        setCurrentTransaction(tx);
        addOrUpdateHistory(tx);
      } else {
        const reason = data.failureReason ?? 'Payment declined';
        const tx: Transaction = {
          id: transactionId,
          amount,
          currency: values.currency,
          status: 'failed',
          timestamp: new Date().toISOString(),
          attempts: currentAttempt,
          failureReason: reason,
          last4,
          cardholderName: values.cardholderName,
        };
        setStatus('failed');
        setFailureReason(reason);
        setCurrentTransaction(tx);
        addOrUpdateHistory(tx);
      }
    },
    [setStatus, setCurrentTransaction, setFailureReason, incrementAttempt, addOrUpdateHistory]
  );

  const retry = useCallback(
    (values: PaymentFormValues, _cardType: CardType) => {
      if (attemptCount >= MAX_ATTEMPTS) return;
      submit(values, cardType);
    },
    [attemptCount, submit]
  );

  const reset = useCallback(() => {
    transactionIdRef.current = null;
    resetPayment();
  }, [resetPayment]);

  return {
    status,
    attemptCount,
    currentTransaction,
    failureReason,
    canRetry: attemptCount < MAX_ATTEMPTS,
    submit,
    retry,
    reset,
  };
}
