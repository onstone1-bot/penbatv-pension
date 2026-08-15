"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatWon } from "@/lib/local-quote";
import { mockDatePresets, mockOptions, mockRooms, mockVideos } from "@/lib/mock-data";

type ReservationStep = 1 | 2 | 3 | 4 | 5;
type PayMethod = "card" | "naverpay" | "tosspay" | "vbank";

const barbecueSlots = ["17:00 - 19:00", "18:00 - 21:00", "19:00 - 22:00"];

const weekAvailability = [
  { day: "8/20", label: "목", status: "reserved", price: 250000 },
  { day: "8/21", label: "금", status: "available", price: 300000 },
  { day: "8/22", label: "토", status: "few", price: 350000 },
  { day: "8/23", label: "일", status: "available", price: 250000 },
  { day: "8/24", label: "월", status: "blocked", price: 0 },
  { day: "8/25", label: "화", status: "available", price: 250000 },
  { day: "8/26", label: "수", status: "available", price: 250000 }
];

const paymentMethods: Array<{ id: PayMethod; label: string; body: string }> = [
  { id: "card", label: "신용카드", body: "카드 결제창 호출" },
  { id: "naverpay", label: "네이버페이", body: "간편결제 선택" },
  { id: "tosspay", label: "토스페이", body: "토스 결제 연결" },
  { id: "vbank", label: "가상계좌", body: "입금기한 발급" }
];

function cover(roomId: string) {
  const room = mockRooms.find((item) => item.id === roomId) ?? mockRooms[0];
  return room.images.find((image) => image.isCover)?.url ?? room.images[0]?.url ?? "/penba/sign.jpg";
}

function statusLabel(status: string) {
  return {
    available: "예약가능",
    few: "마감임박",
    reserved: "예약완료",
    blocked: "막힘"
  }[status] ?? status;
}

export function ReservationPaymentClient() {
  const [step, setStep] = useState<ReservationStep>(1);
  const [dateId, setDateId] = useState(mockDatePresets[1]?.id ?? mockDatePresets[0]?.id);
  const [calendarIndex, setCalendarIndex] = useState(2);
  const [roomId, setRoomId] = useState(mockRooms[0]?.id ?? "A");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["bbq"]);
  const [slot, setSlot] = useState(barbecueSlots[1]);
  const [method, setMethod] = useState<PayMethod>("card");
  const [guestName, setGuestName] = useState("김민지");
  const [guestPhone, setGuestPhone] = useState("010-1234-5678");

  const selectedDate = mockDatePresets.find((item) => item.id === dateId) ?? mockDatePresets[0];
  const selectedRoom = mockRooms.find((item) => item.id === roomId) ?? mockRooms[0];
  const selectedVideos = mockVideos.filter((video) => video.roomId === selectedRoom.id);
  const roomAmount = selectedRoom.basePrice + selectedRoom.weekendExtra;
  const optionAmount = mockOptions
    .filter((option) => selectedOptions.includes(option.id))
    .reduce((sum, option) => sum + option.price, 0);
  const youtubeDiscount = 10000;
  const totalAmount = Math.max(0, roomAmount + optionAmount - youtubeDiscount);

  const stepTitle = useMemo(
    () =>
      ({
        1: "일정 선택",
        2: "객실 선택",
        3: "사진·영상 확인",
        4: "옵션·결제",
        5: "예약 완료"
      })[step],
    [step]
  );

  function toggleOption(optionId: string) {
    setSelectedOptions((current) =>
      current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    );
  }

  function nextStep() {
    setStep((current) => Math.min(5, current + 1) as ReservationStep);
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1) as ReservationStep);
  }

  return (
    <main className="reservation-system-page">
      <section className="guide-hero reservation-payment-hero">
        <div>
          <p className="muted">PenBa TV Booking Checkout</p>
          <h1>예약결제 시스템 우선 구현</h1>
          <p>
            유튜브에서 들어온 고객이 일정 선택, 객실 선택, 내부·외부 사진과 영상 확인, 옵션 선택,
            결제까지 자연스럽게 이어지는 고객용 예약 흐름입니다.
          </p>
        </div>
        <div className="host-nav">
          <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=reservation_payment&utm_campaign=checkout">
            고객 홈
          </Link>
          <Link href="/booking-calendar-status?accommodationId=baebang-alps">예약 현황</Link>
          <Link href="/host/rooms">객실 등록</Link>
        </div>
      </section>

      <section className="checkout-shell">
        <aside className="checkout-summary">
          <span className="checkout-kicker">현재 단계</span>
          <h2>{stepTitle}</h2>
          <div className="checkout-steps" aria-label="예약결제 단계">
            {[1, 2, 3, 4, 5].map((item) => (
              <button
                className={step >= item ? "on" : ""}
                key={item}
                type="button"
                onClick={() => setStep(item as ReservationStep)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="checkout-receipt">
            <div>
              <span>일정</span>
              <b>{selectedDate.label}</b>
            </div>
            <div>
              <span>객실</span>
              <b>{selectedRoom.name}</b>
            </div>
            <div>
              <span>바베큐</span>
              <b>{slot}</b>
            </div>
            <div>
              <span>객실 요금</span>
              <b>{formatWon(roomAmount)}</b>
            </div>
            <div>
              <span>옵션</span>
              <b>{formatWon(optionAmount)}</b>
            </div>
            <div>
              <span>유튜브 유입 할인</span>
              <b>-{formatWon(youtubeDiscount)}</b>
            </div>
            <strong>
              <span>총 결제금액</span>
              <b>{formatWon(totalAmount)}</b>
            </strong>
          </div>
        </aside>

        <section className="checkout-panel">
          {step === 1 && (
            <>
              <div className="section-head">
                <h2>일정 선택</h2>
                <span>예약 가능 여부 먼저 확인</span>
              </div>
              <div className="checkout-calendar">
                {weekAvailability.map((day, index) => {
                  const isDisabled = day.status === "reserved" || day.status === "blocked";
                  const isSelected = index === calendarIndex;
                  return (
                    <button
                      className={`${day.status} ${isSelected ? "selected" : ""}`}
                      disabled={isDisabled}
                      key={day.day}
                      type="button"
                      onClick={() => {
                        setCalendarIndex(index);
                        setDateId(mockDatePresets[Math.min(index, mockDatePresets.length - 1)].id);
                      }}
                    >
                      <span>{day.label}</span>
                      <b>{day.day}</b>
                      <small>{statusLabel(day.status)}</small>
                      {day.price > 0 && <em>{formatWon(day.price)}</em>}
                    </button>
                  );
                })}
              </div>
              <div className="availability-summary available">
                <span>선택 일정</span>
                <b>{selectedDate.label}</b>
                <small>선택한 일정은 예약 가능하며 결제 전 15분 선점 처리됩니다.</small>
              </div>
              <button className="primary-action" type="button" onClick={nextStep}>
                객실 선택으로 이동
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="section-head">
                <h2>객실 선택</h2>
                <span>내부·외부 사진을 같이 확인</span>
              </div>
              <div className="checkout-room-grid">
                {mockRooms.map((room) => (
                  <button
                    className={room.id === roomId ? "checkout-room-card active" : "checkout-room-card"}
                    key={room.id}
                    type="button"
                    onClick={() => setRoomId(room.id)}
                  >
                    <span className="checkout-room-cover" style={{ backgroundImage: `url(${cover(room.id)})` }} />
                    <span className="checkout-room-copy">
                      <em>{room.type === "private_house" ? "독채" : "글램핑"}</em>
                      <b>{room.name}</b>
                      <small>
                        기준 {room.standardCapacity}인 · 최대 {room.maxCapacity}인 · {formatWon(room.basePrice)}~
                      </small>
                    </span>
                  </button>
                ))}
              </div>
              <button className="primary-action" type="button" onClick={nextStep}>
                사진·영상 확인
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="section-head">
                <h2>{selectedRoom.name} 사진·영상 확인</h2>
                <span>예약 전 검증 화면</span>
              </div>
              <div className="checkout-media-grid">
                {selectedRoom.images.map((image) => (
                  <article className="checkout-photo-card" key={image.url}>
                    <div style={{ backgroundImage: `url(${image.url})` }} />
                    <span>{image.caption}</span>
                  </article>
                ))}
              </div>
              <div className="checkout-video-grid">
                {selectedVideos.map((video) => (
                  <a className="checkout-video-card" href={video.url} key={video.code} target="_blank" rel="noreferrer">
                    <span style={{ backgroundImage: `url(${video.thumbnailUrl ?? cover(selectedRoom.id)})` }}>
                      PLAY
                    </span>
                    <b>{video.title}</b>
                    <small>{video.category === "interior" ? "내부" : video.category === "exterior" ? "외부" : "전체"}</small>
                  </a>
                ))}
              </div>
              <button className="primary-action" type="button" onClick={nextStep}>
                옵션·결제로 이동
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <div className="section-head">
                <h2>옵션과 결제</h2>
                <span>결제 전 최종 확인</span>
              </div>
              <div className="checkout-form-grid">
                <label>
                  <span>예약자 이름</span>
                  <input value={guestName} onChange={(event) => setGuestName(event.target.value)} />
                </label>
                <label>
                  <span>휴대폰 번호</span>
                  <input value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} />
                </label>
              </div>
              <div className="checkout-slot-row">
                {barbecueSlots.map((item) => (
                  <button className={slot === item ? "active" : ""} key={item} type="button" onClick={() => setSlot(item)}>
                    {item}
                  </button>
                ))}
              </div>
              <div className="checkout-option-list">
                {mockOptions.map((option) => (
                  <label key={option.id}>
                    <input
                      checked={selectedOptions.includes(option.id)}
                      type="checkbox"
                      onChange={() => toggleOption(option.id)}
                    />
                    <span>
                      <b>{option.name}</b>
                      <small>{option.description}</small>
                    </span>
                    <strong>{formatWon(option.price)}</strong>
                  </label>
                ))}
              </div>
              <div className="checkout-pay-methods">
                {paymentMethods.map((item) => (
                  <button
                    className={method === item.id ? "active" : ""}
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                  >
                    <b>{item.label}</b>
                    <small>{item.body}</small>
                  </button>
                ))}
              </div>
              <button className="primary-action" type="button" onClick={nextStep}>
                {paymentMethods.find((item) => item.id === method)?.label}로 결제하기
              </button>
            </>
          )}

          {step === 5 && (
            <div className="checkout-done">
              <span>예약 완료</span>
              <h2>예약과 결제 요청이 접수되었습니다.</h2>
              <p>
                {guestName}님, {selectedRoom.name} / {selectedDate.label} 예약 건이 생성되었습니다.
                실제 결제 연동 시 이 단계에서 결제 승인번호와 알림톡 발송 상태가 함께 저장됩니다.
              </p>
              <b>PB-20260822-001</b>
              <strong>{formatWon(totalAmount)}</strong>
              <div className="penba-actions">
                <button className="hero-action" type="button" onClick={() => setStep(1)}>
                  새 예약 테스트
                </button>
                <Link className="ghost-action" href="/booking-calendar-status?accommodationId=baebang-alps">
                  예약 현황 보기
                </Link>
              </div>
            </div>
          )}

          {step > 1 && step < 5 && (
            <button className="checkout-back" type="button" onClick={previousStep}>
              이전 단계
            </button>
          )}
        </section>
      </section>
    </main>
  );
}
