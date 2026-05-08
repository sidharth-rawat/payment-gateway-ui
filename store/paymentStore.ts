'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentStatus, Transaction } from '@/types';

interface PaymentState {
  status: PaymentStatus;
  currentTransaction: Transaction | null;
  attemptCount: number;
  history: Transaction[];
  selectedHistoryId: string | null;
  failureReason: string | undefined;
}

interface PaymentActions {
  setStatus: (status: PaymentStatus) => void;
  setCurrentTransaction: (tx: Transaction | null) => void;
  setFailureReason: (reason: string | undefined) => void;
  incrementAttempt: () => void;
  addOrUpdateHistory: (tx: Transaction) => void;
  setSelectedHistoryId: (id: string | null) => void;
  resetPayment: () => void;
}

type PaymentStore = PaymentState & PaymentActions;

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      status: 'idle',
      currentTransaction: null,
      attemptCount: 0,
      history: [],
      selectedHistoryId: null,
      failureReason: undefined,

      setStatus: (status) => set({ status }),

      setCurrentTransaction: (tx) => set({ currentTransaction: tx }),

      setFailureReason: (reason) => set({ failureReason: reason }),

      incrementAttempt: () =>
        set((state) => ({ attemptCount: state.attemptCount + 1 })),

      addOrUpdateHistory: (tx) =>
        set((state) => {
          const exists = state.history.findIndex((h) => h.id === tx.id);
          if (exists !== -1) {
            const updated = [...state.history];
            updated[exists] = tx;
            return { history: updated };
          }
          return { history: [tx, ...state.history] };
        }),

      setSelectedHistoryId: (id) => set({ selectedHistoryId: id }),

      resetPayment: () =>
        set({
          status: 'idle',
          currentTransaction: null,
          attemptCount: 0,
          failureReason: undefined,
        }),
    }),
    {
      name: 'payment-store',
      // Only persist history and selectedHistoryId across refreshes
      partialize: (state) => ({
        history: state.history,
        selectedHistoryId: state.selectedHistoryId,
      }),
    }
  )
);
