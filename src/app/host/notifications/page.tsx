import Link from "next/link";
import { notificationTemplates } from "@/lib/core-features";
import { getNotificationQueue } from "@/lib/notifications";
import type { Database } from "@/lib/supabase/database.types";

type NotificationRow = Database["public"]["Tables"]["notification_queue"]["Row"];

const csQueues = [
  { label: "입실 안내 문의", count: "2건", owner: "사장님 확인" },
  { label: "수동입금 확인", count: "1건", owner: "운영자 확인" },
  { label: "바베큐 시간 변경", count: "2건", owner: "고객 응대" }
];

const sendRules = [
  "예약 확정 알림은 결제 승인 또는 수동입금 확인 직후 발송",
  "입실 안내는 입실 전날 18시에 주소, 주차, 이용수칙 포함",
  "바베큐 리마인드는 선택한 타임슬롯 30분 전에 발송",
  "실패 건은 SMS 또는 운영자 수동 연락 대기열로 전환"
];

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  let notifications: NotificationRow[] = [];

  try {
    notifications = await getNotificationQueue(8);
  } catch {
    notifications = [];
  }

  const notificationMetrics = [
    { label: "발송 예약", value: `${notifications.filter((row) => row.status === "queued").length}건`, detail: "알림 큐 기준" },
    { label: "발송 완료", value: `${notifications.filter((row) => row.status === "sent").length}건`, detail: "Mock 발송 포함" },
    { label: "실패 대기", value: `${notifications.filter((row) => row.status === "failed").length}건`, detail: "재발송 필요" },
    { label: "템플릿", value: `${notificationTemplates.length}개`, detail: "예약/입실/바베큐" }
  ];

  return (
    <main className="ops-page">
      <section className="ops-hero proposal">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 2 Day 11</p>
          <h1>알림톡·CS 운영</h1>
          <p>
            고객 예약 완료, 입실 안내, 바베큐장 이용 시간 알림을 자동화하고 실패 건은 CS 대기열로 관리합니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {notificationMetrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <b>{metric.value}</b>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>실시간 알림 큐</h2>
          <span>예약 생성 후 자동 적재</span>
        </div>
        <div className="campaign-table">
          {notifications.map((notification) => (
            <div key={notification.id}>
              <b>{notification.template_type}</b>
              <span>{notification.recipient_name} · {notification.recipient_phone}</span>
              <span>{new Date(notification.scheduled_at).toLocaleString("ko-KR")}</span>
              <strong>{notification.status}</strong>
            </div>
          ))}
          {notifications.length === 0 && (
            <div>
              <b>알림 큐 대기 없음</b>
              <span>예약/결제 확정 후 booking_confirmed, checkin_guide, barbecue_reminder가 자동 생성됩니다.</span>
              <span>운영자 API에서 due 알림을 Mock 발송 처리합니다.</span>
              <strong>대기 0건</strong>
            </div>
          )}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>알림 템플릿</h2>
          <span>카카오 알림톡 기준</span>
        </div>
        <div className="ops-card-grid">
          {notificationTemplates.map((template) => (
            <article className="ops-card" key={template.trigger}>
              <h3>{template.title}</h3>
              <p>{template.body}</p>
              <div>
                <span>{template.sendTiming}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section owner-dashboard-grid">
        <article className="ops-card">
          <h2>CS 대기열</h2>
          <div className="operation-queue-list">
            {csQueues.map((queue) => (
              <div key={queue.label}>
                <b>{queue.label}</b>
                <span>{queue.count}</span>
                <small>{queue.owner}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="ops-card">
          <h2>발송 규칙</h2>
          <div className="task-list">
            {sendRules.map((rule) => (
              <label key={rule}>
                <input type="checkbox" defaultChecked />
                <span>{rule}</span>
              </label>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
