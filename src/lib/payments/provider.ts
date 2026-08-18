export type PaymentProviderId =
  | "card"
  | "naverpay"
  | "tosspay"
  | "vbank"
  | "realtime_transfer"
  | "manual_bank_transfer";
export type PaymentMode = "mock" | "toss" | "manual";
export type EasyPayProvider = "NAVERPAY" | "TOSSPAY";

export type PreparePaymentInput = {
  holdId: string | null;
  customerId?: string | null;
  roomId: string;
  checkIn: string;
  checkOut: string;
  provider: PaymentProviderId;
  totalAmount: number;
  optionAmount: number;
  discountAmount: number;
  adultCount: number;
  childCount: number;
  optionItems: Array<{
    optionId: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    amount?: number;
  }>;
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
    type: "mock" | "toss-window" | "manual-bank-transfer";
    url: string | null;
    clientKey: string | null;
    method: "CARD" | "VIRTUAL_ACCOUNT" | "TRANSFER" | null;
    easyPay: EasyPayProvider | null;
    successUrl: string;
    failUrl: string;
    bankTransfer: {
      bankName: string;
      accountNo: string;
      holderName: string;
      depositDueHours: number;
    } | null;
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
  if (provider === "vbank") return "VIRTUAL_ACCOUNT";
  if (provider === "realtime_transfer") return "TRANSFER";
  return "CARD";
}

function paymentMode(provider: PaymentProviderId): PaymentMode {
  if (provider === "manual_bank_transfer") {
    return "manual";
  }

  if (
    (provider === "card" ||
      provider === "naverpay" ||
      provider === "tosspay" ||
      provider === "vbank" ||
      provider === "realtime_transfer") &&
    process.env.TOSS_PAYMENTS_CLIENT_KEY &&
    process.env.TOSS_PAYMENTS_SECRET_KEY
  ) {
    return "toss";
  }

  return "mock";
}

function manualBankTransfer() {
  return {
    bankName: process.env.PENBATV_BANK_NAME ?? "입금은행 미설정",
    accountNo: process.env.PENBATV_BANK_ACCOUNT_NO ?? "계좌번호 미설정",
    holderName: process.env.PENBATV_BANK_HOLDER_NAME ?? "예금주 미설정",
    depositDueHours: Number(process.env.PENBATV_BANK_DEPOSIT_DUE_HOURS ?? 24)
  };
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
      type: mode === "toss" ? "toss-window" : mode === "manual" ? "manual-bank-transfer" : "mock",
      url: null,
      clientKey: mode === "toss" ? process.env.TOSS_PAYMENTS_CLIENT_KEY ?? null : null,
      method: mode === "toss" ? tossMethod(input.provider) : null,
      easyPay: mode === "toss" ? easyPayProvider(input.provider) : null,
      successUrl: successUrl.toString(),
      failUrl: failUrl.toString(),
      bankTransfer: mode === "manual" ? manualBankTransfer() : null
    }
  };
}

function easyPayProvider(provider: PaymentProviderId): EasyPayProvider | null {
  if (provider === "naverpay") return "NAVERPAY";
  if (provider === "tosspay") return "TOSSPAY";
  return null;
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
