export type PaymentProviderId = "card" | "naverpay" | "tosspay" | "vbank";
export type PaymentMode = "mock" | "toss";

export type PreparePaymentInput = {
  holdId: string | null;
  roomId: string;
  checkIn: string;
  checkOut: string;
  provider: PaymentProviderId;
  totalAmount: number;
  optionAmount: number;
  discountAmount: number;
  guestName: string | null;
  guestPhone: string | null;
  utmCode: string | null;
  requestOrigin: string;
};

export type PreparedPayment = {
  id: string;
  mode: PaymentMode;
  status: "ready";
  provider: PaymentProviderId;
  amount: number;
  currency: "KRW";
  orderId: string;
  orderName: string;
  holdId: string | null;
  utmCode: string | null;
  expiresAt: string;
  checkout: {
    type: "mock" | "toss-window";
    url: string | null;
    clientKey: string | null;
    method: "CARD" | "VIRTUAL_ACCOUNT" | null;
    successUrl: string;
    failUrl: string;
  };
};

export type ConfirmTossPaymentInput = {
  paymentKey: string;
  orderId: string;
  amount: number;
  idempotencyKey?: string | null;
};

function randomId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeOrderId(roomId: string) {
  const sanitizedRoomId = roomId.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 18) || "room";
  return `stay_${sanitizedRoomId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function tossMethod(provider: PaymentProviderId) {
  return provider === "vbank" ? "VIRTUAL_ACCOUNT" : "CARD";
}

function paymentMode(provider: PaymentProviderId): PaymentMode {
  if (
    (provider === "card" || provider === "tosspay" || provider === "vbank") &&
    process.env.TOSS_PAYMENTS_CLIENT_KEY &&
    process.env.TOSS_PAYMENTS_SECRET_KEY
  ) {
    return "toss";
  }

  return "mock";
}

export function preparePayment(input: PreparePaymentInput): PreparedPayment {
  const mode = paymentMode(input.provider);
  const orderId = makeOrderId(input.roomId);
  const orderName = `${input.roomId} ${input.checkIn}~${input.checkOut}`;
  const successUrl = new URL("/payments/success", input.requestOrigin);
  const failUrl = new URL("/payments/fail", input.requestOrigin);

  successUrl.searchParams.set("orderId", orderId);
  failUrl.searchParams.set("orderId", orderId);

  return {
    id: randomId("pay"),
    mode,
    status: "ready",
    provider: input.provider,
    amount: input.totalAmount,
    currency: "KRW",
    orderId,
    orderName,
    holdId: input.holdId,
    utmCode: input.utmCode,
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    checkout: {
      type: mode === "toss" ? "toss-window" : "mock",
      url: null,
      clientKey: mode === "toss" ? process.env.TOSS_PAYMENTS_CLIENT_KEY ?? null : null,
      method: mode === "toss" ? tossMethod(input.provider) : null,
      successUrl: successUrl.toString(),
      failUrl: failUrl.toString()
    }
  };
}

export async function confirmTossPayment(input: ConfirmTossPaymentInput) {
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;

  if (!secretKey) {
    return {
      mode: "mock" as const,
      status: "paid" as const,
      paymentKey: input.paymentKey,
      orderId: input.orderId,
      amount: input.amount
    };
  }

  const authorization = Buffer.from(`${secretKey}:`).toString("base64");
  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {})
    },
    body: JSON.stringify({
      paymentKey: input.paymentKey,
      orderId: input.orderId,
      amount: input.amount
    })
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      mode: "toss" as const,
      status: "failed" as const,
      error: payload
    };
  }

  return {
    mode: "toss" as const,
    status: "paid" as const,
    payment: payload
  };
}
