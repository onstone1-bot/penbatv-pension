"use client";

import { useState } from "react";

type CashReceiptType = "none" | "personal" | "business";

type MyProfileClientProps = {
  initialName: string;
  initialPhone: string;
  initialEmail: string;
  initialNotificationEnabled: boolean;
  initialCashReceiptType: CashReceiptType;
  initialCashReceiptValue: string;
  initialDefaultAdultCount: number;
  initialDefaultChildCount: number;
  loggedIn: boolean;
};

export function MyProfileClient({
  initialName,
  initialPhone,
  initialEmail,
  initialNotificationEnabled,
  initialCashReceiptType,
  initialCashReceiptValue,
  initialDefaultAdultCount,
  initialDefaultChildCount,
  loggedIn
}: MyProfileClientProps) {
  const [message, setMessage] = useState(
    loggedIn ? "수정하면 고객 프로필과 예약 기본 설정이 DB에 저장됩니다." : "로그인 전에는 이 브라우저에 데모 정보로 저장됩니다."
  );
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      notificationEnabled: formData.get("notificationEnabled") === "on",
      cashReceiptType: String(formData.get("cashReceiptType") || "none"),
      cashReceiptValue: String(formData.get("cashReceiptValue") || ""),
      defaultAdultCount: Number(formData.get("defaultAdultCount") || 2),
      defaultChildCount: Number(formData.get("defaultChildCount") || 0)
    };

    setSaving(true);

    if (!loggedIn) {
      localStorage.setItem("penbatv.demoCustomerProfile", JSON.stringify(payload));
      setSaving(false);
      setMessage("데모 고객정보와 예약 기본 설정을 저장했습니다. 실제 저장은 네이버·카카오 로그인 후 DB에 반영됩니다.");
      return;
    }

    const response = await fetch("/api/my/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ? `저장 실패: ${result.error}` : "저장 실패: 고객정보를 다시 확인해 주세요.");
      return;
    }

    setMessage("고객정보와 예약 기본 설정이 DB에 저장되었습니다.");
  }

  return (
    <form className="my-profile-edit-form" onSubmit={saveProfile}>
      <label>
        이름
        <input name="name" defaultValue={initialName} required />
      </label>
      <label>
        휴대폰
        <input name="phone" defaultValue={initialPhone} placeholder="010-0000-0000" required />
      </label>
      <label>
        이메일
        <input name="email" type="email" defaultValue={initialEmail} placeholder="customer@example.com" />
      </label>
      <label>
        기본 성인 인원
        <input name="defaultAdultCount" type="number" min={1} max={30} defaultValue={initialDefaultAdultCount} />
      </label>
      <label>
        기본 아동 인원
        <input name="defaultChildCount" type="number" min={0} max={30} defaultValue={initialDefaultChildCount} />
      </label>
      <label>
        현금영수증
        <select name="cashReceiptType" defaultValue={initialCashReceiptType}>
          <option value="none">신청 안함</option>
          <option value="personal">개인 소득공제</option>
          <option value="business">사업자 지출증빙</option>
        </select>
      </label>
      <label>
        현금영수증 번호
        <input name="cashReceiptValue" placeholder="휴대폰 또는 사업자번호" defaultValue={initialCashReceiptValue} />
      </label>
      <label className="my-toggle-row">
        <input name="notificationEnabled" type="checkbox" defaultChecked={initialNotificationEnabled} />
        <span>예약/입실/바베큐 알림 받기</span>
      </label>
      <button type="submit" disabled={saving}>
        {saving ? "저장 중" : "회원정보 저장"}
      </button>
      <small>{message}</small>
    </form>
  );
}
