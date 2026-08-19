"use client";

import { useState } from "react";

const inquiryStatuses = [
  { value: "received", label: "문의접수" },
  { value: "consulting", label: "상담중" },
  { value: "filming", label: "촬영협의" },
  { value: "onboarding", label: "입점준비" },
  { value: "open", label: "오픈" },
  { value: "rejected", label: "보류" }
] as const;

type Props = {
  inquiryId: string;
  initialStatus: string;
};

export function PartnerInquiryStatusClient({ inquiryId, initialStatus }: Props) {
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [operatorNote, setOperatorNote] = useState("");
  const [message, setMessage] = useState("운영자 토큰 입력 후 상태를 변경할 수 있습니다.");
  const [saving, setSaving] = useState(false);

  async function updateStatus() {
    if (!adminToken) {
      setMessage("운영자 토큰을 먼저 입력해 주세요.");
      return;
    }

    setSaving(true);
    setMessage("입점문의 상태를 저장하는 중입니다.");

    const response = await fetch(`/api/admin/partner-inquiries/${inquiryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": adminToken,
        "x-penbatv-role": "operator"
      },
      body: JSON.stringify({
        status,
        operatorNote,
        contacted: status !== "received"
      })
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(payload.error ? `저장 실패: ${payload.error}` : "상태 저장에 실패했습니다.");
      return;
    }

    setMessage("입점문의 상태가 운영 DB에 저장되었습니다.");
  }

  return (
    <div className="partner-inquiry-admin-action">
      <input
        aria-label="운영자 토큰"
        placeholder="운영자 토큰"
        type="password"
        value={adminToken}
        onChange={(event) => setAdminToken(event.target.value)}
      />
      <select aria-label="입점문의 상태" value={status} onChange={(event) => setStatus(event.target.value)}>
        {inquiryStatuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <input
        aria-label="운영자 메모"
        placeholder="운영 메모"
        value={operatorNote}
        onChange={(event) => setOperatorNote(event.target.value)}
      />
      <button type="button" disabled={saving} onClick={updateStatus}>
        {saving ? "저장 중" : "상태 저장"}
      </button>
      <small>{message}</small>
    </div>
  );
}
