import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth/current-user";
import { mockPartnerProperties } from "@/lib/platform-data";
import { formatWon } from "@/lib/local-quote";
import { getCustomerReservations } from "@/lib/customer-reservations";
import { MyProfileClient } from "./MyProfileClient";

export const dynamic = "force-dynamic";

type MyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? null;
}

function bookingStatusLabel(status: string, paymentStatus: string) {
  if (status === "confirmed" && paymentStatus === "paid") return "예약확정";
  if (status === "hold") return "입금대기";
  if (status === "cancelled") return "예약취소";
  return "확인중";
}

const myMenus = [
  "예약자 정보 수정",
  "결제수단 관리",
  "현금영수증 정보",
  "알림 수신 설정",
  "찜한 숙소",
  "최근 본 영상"
];

const notificationRules = [
  "예약 완료 즉시 알림톡",
  "입실 하루 전 안내",
  "바베큐장 이용 1시간 전 안내",
  "결제 실패 또는 환불 상태 알림"
];

export default async function MyPage({ searchParams }: MyPageProps) {
  const query = await searchParams;
  const currentCustomer = await getCurrentCustomer();
  const profile = currentCustomer?.profile ?? null;
  const user = currentCustomer?.user ?? null;
  const phone = first(query.phone) ?? profile?.phone ?? user?.phone ?? null;
  const displayName = profile?.name ?? user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "고객";
  const provider = profile?.provider ?? user?.app_metadata?.provider ?? "guest";
  const profileItems = [
    { label: "예약자", value: displayName },
    { label: "연락처", value: phone ?? "로그인 후 자동 입력" },
    { label: "이메일", value: profile?.email ?? user?.email ?? "미등록" },
    { label: "가입방식", value: provider === "kakao" ? "카카오" : provider === "custom:naver" || provider === "naver" ? "네이버" : "비로그인" }
  ];
  const reservationResult = await getCustomerReservations({
    customerId: profile?.id ?? null,
    guestPhone: phone,
    limit: 10
  });
  const reservations = reservationResult.reservations;
  const favorites = mockPartnerProperties.slice(0, 3);

  return (
    <main className="my-page">
      <section className="my-hero">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 2 Day 8-14</p>
          <h1>내 예약과 회원정보</h1>
          <p>
            네이버·카카오 로그인 후 저장된 고객 프로필과 예약 현황, 찜한 숙소, 알림 설정을 관리하는 화면입니다.
          </p>
        </div>
        <div className="my-profile-card">
          <span>MY</span>
          <b>{displayName}님</b>
          <small>{user ? "로그인 세션 확인됨" : "로그인하면 예약자 정보가 자동 저장됩니다"}</small>
          {user ? <Link href="/auth/signout">로그아웃</Link> : <Link href="/auth">네이버·카카오 로그인</Link>}
        </div>
      </section>

      <section className="my-section my-layout">
        <article className="my-panel">
          <div className="section-head">
            <h2>예약자 프로필</h2>
            <span>기본 입력값 저장</span>
          </div>
          <div className="profile-field-grid">
            {profileItems.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </div>
            ))}
          </div>
          <MyProfileClient
            initialName={displayName}
            initialPhone={phone ?? ""}
            initialEmail={profile?.email ?? user?.email ?? ""}
            loggedIn={Boolean(user)}
          />
          <Link className="my-inline-action" href="/auth">로그인/정보 연결</Link>
        </article>

        <article className="my-panel">
          <div className="section-head">
            <h2>관리 메뉴</h2>
            <span>고객 MY 기능</span>
          </div>
          <div className="my-menu-grid">
            {myMenus.map((menu) => (
              <button type="button" key={menu}>
                {menu}
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="my-section">
        <div className="section-head">
          <h2>내 예약</h2>
          <span>예약 확인 · 결제 상태 · 변경 요청</span>
        </div>
        {profile?.id ? (
          <p className="request-note">로그인 고객 ID와 저장된 예약자 정보 기준으로 예약을 조회했습니다.</p>
        ) : phone ? (
          <p className="request-note">휴대폰 번호 {phone} 기준으로 예약을 조회했습니다.</p>
        ) : (
          <p className="request-note">로그인하면 고객 DB 프로필과 연결된 예약만 표시됩니다.</p>
        )}
        <div className="my-reservation-list">
          {reservations.map((reservation) => (
            <article key={reservation.id}>
              <span>{bookingStatusLabel(reservation.status, reservation.paymentStatus)}</span>
              <div>
                <b>{reservation.stayName}</b>
                <small>{reservation.bookingNo}</small>
              </div>
              <p>
                {reservation.roomName}
                <br />
                {reservation.checkIn} - {reservation.checkOut}
                <br />
                결제수단 {reservation.paymentProvider ?? "확인중"}
              </p>
              <strong>{formatWon(reservation.totalAmount)}</strong>
              <Link href={`/stays/${reservation.accommodationId}?utm_source=penbatv&utm_medium=my_reservation&utm_campaign=${reservation.accommodationId}`}>
                예약 상세
              </Link>
            </article>
          ))}
          {reservations.length === 0 && (
            <article>
              <span>예약없음</span>
              <div>
                <b>조회된 예약이 없습니다</b>
                <small>회원가입/본인인증 연동 후 고객별 예약만 표시합니다.</small>
              </div>
              <p>유튜브 영상에서 들어온 숙소 화면에서 예약을 진행하면 이곳에 예약 내역이 표시됩니다.</p>
              <strong>{formatWon(0)}</strong>
              <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=my_empty&utm_campaign=baebang-alps">
                예약하러 가기
              </Link>
            </article>
          )}
        </div>
      </section>

      <section className="my-section my-layout">
        <article className="my-panel">
          <div className="section-head">
            <h2>찜한 숙소</h2>
            <span>다음 예약 후보</span>
          </div>
          <div className="favorite-stay-list">
            {favorites.map((stay) => (
              <Link href={`/stays/${stay.id}?utm_source=penbatv&utm_medium=my_favorite&utm_campaign=${stay.id}`} key={stay.id}>
                <span style={{ backgroundImage: `url(${stay.heroUrl})` }} />
                <div>
                  <b>{stay.name}</b>
                  <small>{stay.area}</small>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="my-panel">
          <div className="section-head">
            <h2>알림 설정</h2>
            <span>카카오 알림톡 기준</span>
          </div>
          <div className="notification-rule-list">
            {notificationRules.map((rule) => (
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
