"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { mockRooms } from "@/lib/mock-data";
import { formatWon } from "@/lib/local-quote";

type RequestStatus = "확인필요" | "결제대기" | "확정";

const reservationRequests: Array<{
  id: string;
  guest: string;
  roomId: string;
  date: string;
  channel: string;
  amount: number;
  status: RequestStatus;
}> = [
  {
    id: "RQ-2401",
    guest: "김민지",
    roomId: "A",
    date: "2026-08-20 - 2026-08-22",
    channel: "YouTube campheaven_room_01",
    amount: 620000,
    status: "확인필요"
  },
  {
    id: "RQ-2402",
    guest: "박준호",
    roomId: "B",
    date: "2026-08-28 - 2026-08-29",
    channel: "Naver keyword",
    amount: 275000,
    status: "결제대기"
  },
  {
    id: "RQ-2403",
    guest: "이서연",
    roomId: "A",
    date: "2026-09-05 - 2026-09-07",
    channel: "Direct",
    amount: 700000,
    status: "확정"
  }
];

const blockedDays = [
  { roomId: "A", date: "2026-08-24", reason: "청소/시설 점검" },
  { roomId: "B", date: "2026-08-30", reason: "프라이빗 행사" }
];

const operationChecklist = [
  "예약요청 접수 후 10분 안에 가능 여부 확인",
  "결제 링크 발송 전 객실/날짜/인원 재확인",
  "성수기 날짜는 바로결제 모드 우선 노출",
  "유튜브 캠페인별 전환 예약을 매일 확인"
];

export function HostRoomsClient() {
  const [rooms, setRooms] = useState(mockRooms);

  const requestCount = reservationRequests.filter((request) => request.status === "확인필요").length;
  const waitingPaymentCount = reservationRequests.filter((request) => request.status === "결제대기").length;
  const confirmedAmount = reservationRequests
    .filter((request) => request.status === "확정")
    .reduce((sum, request) => sum + request.amount, 0);

  const roomNameById = useMemo(
    () => new Map(rooms.map((room) => [room.id, room.name])),
    [rooms]
  );

  function hideRoom(roomId: string) {
    setRooms((current) => current.filter((room) => room.id !== roomId));
  }

  return (
    <main>
      <section className="panel">
        <p className="muted">Week 3 Host Console</p>
        <h1>예약 운영 콘솔</h1>
        <p className="muted">
          유튜브 유입 예약을 운영자가 확인하고, 객실 노출·예약요청·차단일·결제대기 상태를 한 화면에서 관리합니다.
        </p>
        <div className="host-nav">
          <Link href="/host/properties">펜션 입점 등록</Link>
          <Link href="/host/rate-calendar">요금·옵션 설정</Link>
          <Link href="/host/core-features">핵심 기능</Link>
          <Link href="/host/reservation-payment">예약 결제 프로그램</Link>
          <Link href="/host/make24-benchmark">입점 제안</Link>
          <Link href="/host/design-benchmark">디자인 선택</Link>
          <Link href="/">입점 펜션 목록</Link>
          <Link href="/host/launch-plan">런칭 가이드</Link>
        </div>
      </section>

      <section className="host-dashboard-grid" aria-label="예약 운영 요약">
        <div className="host-metric">
          <span>확인 필요</span>
          <b>{requestCount}건</b>
        </div>
        <div className="host-metric">
          <span>결제 대기</span>
          <b>{waitingPaymentCount}건</b>
        </div>
        <div className="host-metric">
          <span>확정 매출</span>
          <b>{formatWon(confirmedAmount)}</b>
        </div>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>예약 요청함</h2>
          <span>네이버예약 벤치마킹 흐름</span>
        </div>
        <div className="request-list">
          {reservationRequests.map((request) => (
            <article className="request-card" key={request.id}>
              <div>
                <span className={`status-badge ${request.status === "확인필요" ? "urgent" : ""}`}>
                  {request.status}
                </span>
                <h3>{request.guest}</h3>
                <p>
                  {roomNameById.get(request.roomId) ?? request.roomId} · {request.date}
                </p>
                <small>{request.channel}</small>
              </div>
              <strong>{formatWon(request.amount)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>방·사이트 관리</h2>
          <span>{rooms.length}개 노출 중</span>
        </div>
        <div className="host-grid">
          {rooms.map((room) => (
            <article className="host-card" key={room.id}>
              <h2>{room.name}</h2>
              <p className="muted">{room.description}</p>
              <div className="host-meta">
                <span>기본 {formatWon(room.basePrice)}</span>
                <span>주말 +{formatWon(room.weekendExtra)}</span>
                <span>기준 {room.standardCapacity}인</span>
                <span>이미지 {room.images.length}장</span>
                <span>요금 {room.rates.length}개</span>
              </div>
              <div className="host-actions">
                <button type="button">요금 수정</button>
                <button type="button">차단일 추가</button>
                <button type="button" onClick={() => hideRoom(room.id)}>
                  화면에서 숨기기
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>예약 차단일</h2>
          <span>청소·점검·행사</span>
        </div>
        <div className="block-list">
          {blockedDays.map((block) => (
            <div className="block-row" key={`${block.roomId}-${block.date}`}>
              <b>{block.date}</b>
              <span>{roomNameById.get(block.roomId) ?? block.roomId}</span>
              <small>{block.reason}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>운영 체크리스트</h2>
          <span>3주차 기준</span>
        </div>
        <div className="check-list">
          {operationChecklist.map((item) => (
            <label key={item}>
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>
    </main>
  );
}
