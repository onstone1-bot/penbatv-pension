import Link from "next/link";

type PaymentFailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? null;
}

export default async function PaymentFailPage({ searchParams }: PaymentFailPageProps) {
  const query = await searchParams;
  const orderId = first(query.orderId);
  const code = first(query.code);
  const message = first(query.message);

  return (
    <main className="payment-result">
      <section className="result-card">
        <span className="result-badge warn">Payment failed</span>
        <h1>결제가 완료되지 않았습니다</h1>
        <p>
          결제 인증이 취소되었거나 실패했습니다. 금액은 승인되지 않았고, 예약 화면에서 다시 시도할 수
          있습니다.
        </p>
        <dl>
          <dt>orderId</dt>
          <dd>{orderId ?? "-"}</dd>
          <dt>code</dt>
          <dd>{code ?? "-"}</dd>
          <dt>message</dt>
          <dd>{message ?? "-"}</dd>
        </dl>
        <div className="result-actions">
          <Link href="/stays/baebang-alps?utm_source=youtube&utm_medium=video&utm_campaign=campheaven_room_01&room=A">
            다시 예약하기
          </Link>
          <Link href="/host/rooms">운영자 화면</Link>
        </div>
      </section>
    </main>
  );
}
