import Link from "next/link";
import { AuthClient } from "./AuthClient";

const roleCards = [
  {
    role: "고객",
    badge: "기본 권한",
    entry: "유튜브 설명란 링크 또는 메인홈에서 가입",
    screens: ["고객홈", "예약확인", "찜", "MY 정보관리"],
    data: "이름, 휴대폰, 예약자 정보, 찜한 숙소, 결제 내역"
  },
  {
    role: "사장님",
    badge: "입점 승인 후 부여",
    entry: "입점제안 승인 뒤 파트너 계정 생성",
    screens: ["객실 관리", "요금 관리", "사진/영상 등록", "예약 현황"],
    data: "사업자 정보, 숙소 정보, 객실/옵션, 정산 계좌, 운영 지표"
  },
  {
    role: "운영자",
    badge: "내부 관리자",
    entry: "펜바TV 운영자가 직접 계정 발급",
    screens: ["입점 승인", "전체 예약", "결제/정산", "성과 집계"],
    data: "전체 숙소, 전체 예약, 결제 상태, 유튜브 UTM 성과"
  }
];

const implementationSteps = [
  "Supabase Auth 또는 외부 OAuth로 네이버/카카오 로그인 연결",
  "profiles 테이블에 user_id, role, name, phone, status 저장",
  "역할에 따라 고객 MY, 사장님 콘솔, 운영자 콘솔로 이동",
  "예약/결제 API는 로그인 사용자와 서버 권한을 기준으로 검증"
];

export default function AuthPlanningPage() {
  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 1 Day 2</p>
          <h1>회원가입과 권한 구조 설계</h1>
          <p>
            고객은 네이버·카카오로 쉽게 가입하고, 사장님과 운영자는 승인된 권한에 따라 다른 관리 화면으로 이동하는 구조입니다.
          </p>
        </div>
        <div className="auth-device-preview" aria-label="가입 후 이동 화면 예시">
          <span>가입 완료</span>
          <b>김고객님</b>
          <small>다음 예약까지 5일 남았습니다.</small>
          <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=auth_preview&utm_campaign=baebang-alps">
            내 예약 보러가기
          </Link>
        </div>
      </section>

      <section className="auth-section">
        <div className="section-head">
          <h2>가입 방식</h2>
          <span>고객 로그인 · 역할별 이동</span>
        </div>
        <AuthClient />
      </section>

      <section className="auth-section">
        <div className="section-head">
          <h2>역할별 권한</h2>
          <span>고객 · 사장님 · 운영자</span>
        </div>
        <div className="permission-grid">
          {roleCards.map((role) => (
            <article className="permission-card" key={role.role}>
              <span>{role.badge}</span>
              <h3>{role.role}</h3>
              <p>{role.entry}</p>
              <b>접근 화면</b>
              <div>
                {role.screens.map((screen) => (
                  <small key={screen}>{screen}</small>
                ))}
              </div>
              <b>관리 데이터</b>
              <p>{role.data}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="auth-section auth-implementation-panel">
        <div>
          <h2>개발 구현 기준</h2>
          <p>
            지금 화면은 권한 구조를 이해하기 위한 설계 데모입니다. 실제 개발에서는 로그인 성공 후 서버에서 역할을 확인하고,
            허용된 화면과 API만 접근하게 해야 합니다.
          </p>
        </div>
        <ol>
          {implementationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
