import { NextRequest, NextResponse } from 'next/server';

const FAILURE_REASONS = [
  'Insufficient funds',
  'Card declined',
  'Invalid card details',
  'Transaction limit exceeded',
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { transactionId } = body as { transactionId: string };

  const rand = Math.random();

  if (rand < 0.60) {
    return NextResponse.json({
      status: 'success',
      transactionId,
    });
  }

  if (rand < 0.85) {
    const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
    return NextResponse.json({
      status: 'failed',
      transactionId,
      failureReason: reason,
    });
  }

  // Simulate timeout: respond after 8 seconds (frontend aborts at 6s)
  await sleep(8000);
  return NextResponse.json({
    status: 'success',
    transactionId,
  });
}
