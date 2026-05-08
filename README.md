# Payment Gateway UI

A production-grade Payment Gateway UI built with Next.js 16 (App Router), TypeScript, Zustand, and Tailwind CSS. Simulates a real payment flow including card validation, live card preview, retry logic, and transaction history — without any third-party payment SDK.

## Features

- **Live card preview** — updates in real time as you type
- **Card type detection** — auto-detects Visa, Mastercard, and Amex from the first digits
- **Auto-formatting** — card number formatted with spaces every 4 digits (4-6-5 for Amex)
- **Per-field validation** — errors appear on blur/change, never all at once on submit
- **Payment lifecycle** — Idle → Processing → Success / Failed / Timeout states
- **Retry logic** — up to 3 attempts per transaction, same transaction ID reused (idempotency)
- **AbortController timeout** — frontend cancels request after 6 seconds
- **Transaction history** — persisted in localStorage, survives page refresh, clickable detail view
- **Accessible** — visible labels, `aria-describedby` error linkage, focus management after state transitions
- **Responsive** — works on mobile (375px) and desktop (1280px)

## Tech Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Next.js 16 App Router | Modern React, API Routes built-in |
| Language | TypeScript (strict, no `any`) | Type safety throughout |
| State | Zustand + `persist` middleware | Minimal boilerplate, easy to justify; `persist` handles localStorage automatically |
| Styling | Tailwind CSS | Fast responsive/accessible UI, no extra setup |
| HTTP | Native `fetch` + `AbortController` | No third-party payment SDK allowed |

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:
```bash
npm run build
npm start
```

## Project Structure

```
app/
  api/pay/route.ts      Mock gateway API (60% success, 25% fail, 15% timeout)
  page.tsx              Root page — orchestrates payment flow
  layout.tsx            App shell
components/
  CardInput.tsx         Card number field with auto-format and type badge
  CardPreview.tsx       Live card visual
  CurrencyAmountInput.tsx  Amount field with INR/USD selector
  PaymentForm.tsx       Form orchestrator with touched-field validation
  StatusScreen.tsx      Processing/Success/Failed/Timeout result screens
  TransactionHistory.tsx  Persisted history list with detail panel
hooks/
  usePayment.ts         Submit logic, AbortController, retry gate, idempotency
store/
  paymentStore.ts       Zustand store (status, history, attempt count)
types/
  index.ts              All shared TypeScript interfaces and types
utils/
  cardUtils.ts          Card formatting, type detection, masking
  validation.ts         Per-field validators (name, card, expiry, CVV, amount)
  paymentApi.ts         fetch wrapper with 6-second AbortController timeout
```

## Gateway Simulation

`POST /api/pay` returns one of three outcomes, randomly:
- **60%** — `{ status: 'success' }`
- **25%** — `{ status: 'failed', failureReason: '...' }` (e.g. "Insufficient funds")
- **15%** — delayed 8 seconds (frontend times out at 6 seconds via AbortController)

## Assumptions

- Card PAN is **never sent to the server** — only the last 4 digits are transmitted. This is intentional security practice; a real gateway would tokenise the full PAN client-side using the gateway's JS library.
- Transaction history is stored in `localStorage` under the key `payment-store`. Clearing browser storage will wipe history.
- Currency conversion is cosmetic — amounts are stored as-entered with the selected currency label.
- No authentication or session management is implemented (out of scope for this demo).

## What I Would Improve Given More Time

1. **Luhn algorithm validation** — add checksum validation for card numbers before submission
2. **Animation polish** — card flip animation on preview, slide transitions between states
3. **E2E tests** — Playwright tests for the happy path, retry flow, and timeout scenario
4. **Unit tests** — Jest tests for all utility functions (validators, card formatters)
5. **Input masking library** — replace manual expiry/card formatting with a battle-tested library
6. **Real tokenisation** — integrate with an actual gateway SDK for PAN tokenisation
7. **Optimistic UI** — show instant feedback while payment is processing in the background
8. **Error boundary** — catch unexpected render errors and show a graceful fallback
