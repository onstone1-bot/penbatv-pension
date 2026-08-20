import Link from "next/link";
import { confirmPreparedPayment } from "@/lib/payments/confirm";
import { getPaymentOrder } from "@/lib/payments/orders";

type PaymentSuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? null;
}

function parseAmount(value: string | null) {
  if (!value) return null;
  const amount = Number(value);
  return Number.isInteger(amount) && amount >= 0 ? amount : null;
}

function resultMode(result: Awaited<ReturnType<typeof confirmPreparedPayment>>["result"] | null) {
  return result && "mode" in result ? result.mode : "server-check";
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const query = await searchParams;
  const paymentKey = first(query.paymentKey);
  const orderId = first(query.orderId);
  const amount = parseAmount(first(query.amount));
  const canConfirm = Boolean(paymentKey && orderId && amount !== null);
  const storedOrder = orderId ? await getPaymentOrder(orderId) : null;
  const provider = storedOrder?.available && storedOrder.order ? storedOrder.order.provider : "card";
  const result = canConfirm
    ? (
        await confirmPreparedPayment({
          provider,
          paymentKey: paymentKey!,
          orderId: orderId!,
          amount: amount!,
          idempotencyKey: orderId
        })
      ).result
    : null;
  const isPaid = result?.status === "paid";
  const isWaitingDeposit = result?.status === "waiting_deposit";

  return (
    <main className="payment-result">
      <section className="result-card">
        <span className={isPaid ? "result-badge ok" : "result-badge warn"}>
          {isPaid ? "Payment confirmed" : isWaitingDeposit ? "Waiting deposit" : "Payment needs review"}
        </span>
        <h1>{isPaid ? "예약 결제가 완료되었습니다" : isWaitingDeposit ? "입금대기 예약이 접수되었습니다" : "결제 승인 확인이 필요합니다"}</h1>
        <p>
          결제 성공 redirect 값을 확인했습니다. 실제 운영에서는 결제 요청 시 서버에 저장한 금액과
          redirect 금액을 비교한 뒤 승인해야 합니다.
        </p>
        <dl>
          <dt>orderId</dt>
          <dd>{orderId ?? "-"}</dd>
          <dt>paymentKey</dt>
          <dd>{paymentKey ?? "-"}</dd>
          <dt>amount</dt>
          <dd>{amount?.toLocaleString("ko-KR") ?? "-"} KRW</dd>
          <dt>mode</dt>
          <dd>{resultMode(result)}</dd>
          <dt>provider</dt>
          <dd>{provider}</dd>
          <dt>status</dt>
          <dd>{result?.status ?? "missing query"}</dd>
        </dl>
        <div className="result-actions">
          <Link href="/stays/baebang-alps?utm_source=youtube&utm_medium=video&utm_campaign=campheaven_room_01&room=A">
            예약 화면으로
          </Link>
          <Link href="/host/rooms">운영자 화면</Link>
        </div>
      </section>
    </main>
  );
}
