import Link from "next/link";
import {
  addCalendarDays,
  buildBarbecueCalendarRow,
  buildCalendarDates,
  buildRoomCalendarRows,
  dateFromCalendarISO,
  getCalendarStay,
  normalizeCalendarAccommodationId,
  toCalendarISODate
} from "@/lib/booking-calendar-status";
import { formatWon } from "@/lib/local-quote";

type PageProps = {
  searchParams?: Promise<{
    accommodationId?: string;
    startDate?: string;
  }>;
};

const statusLegend = [
  { status: "available", label: "예약가능" },
  { status: "few", label: "잔여소량/일부가능" },
  { status: "reserved", label: "예약완료" },
  { status: "blocked", label: "마감" },
  { status: "wait", label: "예약대기" }
];

export default async function BookingCalendarStatusPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accommodationId = normalizeCalendarAccommodationId(params?.accommodationId);
  const startDate = params?.startDate ?? "2026-08-20";
  const stay = getCalendarStay(params?.accommodationId);
  const dates = buildCalendarDates(startDate);
  const roomRows = buildRoomCalendarRows(undefined, startDate);
  const barbecueRow = buildBarbecueCalendarRow(startDate);
  const currentStart = dateFromCalendarISO(dates[0]?.date ?? "2026-08-20");
  const previousISO = toCalendarISODate(addCalendarDays(currentStart, -15));
  const nextISO = toCalendarISODate(addCalendarDays(currentStart, 15));

  return (
    <main className="calendar-status-page">
      <section className="calendar-status-hero">
        <div>
          <p className="muted">DDNAYO-style Booking Calendar</p>
          <h1>{stay?.name ?? "펜바TV"} 실시간 예약 현황</h1>
          <p>
            떠나요 예약시스템처럼 날짜별 객실 상태와 요금을 한눈에 보여주고, 펜바TV 특화 기능인 바베큐장 타임슬롯 상태까지 함께
            확인합니다.
          </p>
        </div>
        <div className="calendar-status-actions">
          <Link href={`/stays/${accommodationId}?utm_source=penbatv&utm_medium=calendar_status&utm_campaign=${accommodationId}`}>
            예약 화면
          </Link>
          <Link href="/host/core-features">예약 엔진 구조</Link>
        </div>
      </section>

      <section className="calendar-status-toolbar">
        <div>
          <span>숙소</span>
          <b>{stay?.area ?? "충남 아산"} · accommodationId={params?.accommodationId ?? "87"}</b>
        </div>
        <div className="calendar-status-nav">
          <Link href={`/booking-calendar-status?accommodationId=${params?.accommodationId ?? "87"}&startDate=${previousISO}`}>
            이전 15일
          </Link>
          <strong>{dates[0]?.date} - {dates[dates.length - 1]?.date}</strong>
          <Link href={`/booking-calendar-status?accommodationId=${params?.accommodationId ?? "87"}&startDate=${nextISO}`}>
            다음 15일
          </Link>
        </div>
      </section>

      <section className="calendar-status-legend" aria-label="예약 상태 범례">
        {statusLegend.map((item) => (
          <span className={`status-dot ${item.status}`} key={item.status}>
            {item.label}
          </span>
        ))}
      </section>

      <section className="status-calendar-shell" aria-label="객실별 예약 현황 달력">
        <div className="status-calendar-grid">
          <div className="status-calendar-corner">
            <b>객실/사이트</b>
            <span>기준 인원 · 유형</span>
          </div>
          {dates.map((date) => (
            <div className="status-calendar-date" key={date.date}>
              <b>{date.day}</b>
              <span>{date.weekday}</span>
            </div>
          ))}

          {roomRows.map((row) => (
            <div className="status-calendar-row" key={row.roomId}>
              <div className="status-room-head">
                <b>{row.roomName}</b>
                <span>{row.roomType} · {row.capacity}</span>
              </div>
              {row.cells.map((cell) => (
                <Link
                  className={`status-cell ${cell.status}`}
                  href={`/stays/${accommodationId}?utm_source=penbatv&utm_medium=calendar_status&utm_campaign=${accommodationId}&room=${row.roomId}&checkIn=${cell.date}`}
                  key={`${row.roomId}-${cell.date}`}
                >
                  <b>{cell.label}</b>
                  <span>{cell.price ? formatWon(cell.price) : cell.note}</span>
                </Link>
              ))}
            </div>
          ))}

          <div className="status-calendar-row barbecue-row">
            <div className="status-room-head">
              <b>{barbecueRow.zoneName}</b>
              <span>숯·그릴 세트 · 시간대 선택</span>
            </div>
            {barbecueRow.cells.map((cell) => (
              <Link
                className={`status-cell ${cell.status}`}
                href={`/stays/${accommodationId}?utm_source=penbatv&utm_medium=bbq_calendar&utm_campaign=${accommodationId}&checkIn=${cell.date}`}
                key={`bbq-${cell.date}`}
              >
                <b>{cell.label}</b>
                <span>{cell.price ? formatWon(cell.price) : cell.note}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="calendar-status-note">
        <b>펜바TV 적용 포인트</b>
        <p>
          객실 달력은 예약 가능 여부와 요금을 먼저 보여주고, 유튜브 유입 고객은 선택한 날짜를 유지한 채 상세 예약 화면으로 이동합니다.
          바베큐장은 객실과 별도 재고로 관리해 타임슬롯 중복 예약을 차단합니다.
        </p>
      </section>
    </main>
  );
}
