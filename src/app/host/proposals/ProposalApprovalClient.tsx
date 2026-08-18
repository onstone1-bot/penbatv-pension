"use client";

import { useState } from "react";

type ApprovalStatus = "active" | "hidden" | "suspended";

type ApprovalProperty = {
  id: string;
  name: string;
  area: string;
  status: ApprovalStatus;
  roomCount: number;
  createdAt: string;
};

const statusLabels: Record<ApprovalStatus, string> = {
  active: "승인/오픈",
  hidden: "보류",
  suspended: "중지"
};

export function ProposalApprovalClient({ properties }: { properties: ApprovalProperty[] }) {
  const [items, setItems] = useState(properties);
  const [adminToken, setAdminToken] = useState("");
  const [message, setMessage] = useState("운영자 토큰을 입력하면 입점 상태를 변경할 수 있습니다.");

  async function updateStatus(id: string, status: ApprovalStatus) {
    if (!adminToken.trim()) {
      setMessage("운영자 토큰을 먼저 입력해 주세요.");
      return;
    }

    setMessage("입점 상태를 저장하는 중입니다.");

    const response = await fetch(`/api/admin/accommodations/${id}/approval`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": adminToken,
        "x-penbatv-role": "operator"
      },
      body: JSON.stringify({
        status,
        note: "운영자 입점 승인 관리 화면에서 변경"
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(payload.error ?? "상태 저장에 실패했습니다.");
      return;
    }

    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    setMessage(`${payload.accommodation?.name ?? id} 상태를 ${statusLabels[status]}로 변경했습니다.`);
  }

  return (
    <section className="ops-section">
      <div className="section-head">
        <h2>운영자 입점 승인</h2>
        <span>실제 숙소 상태 변경</span>
      </div>

      <div className="host-token-row">
        <label htmlFor="proposal-admin-token">
          <span>운영자 토큰</span>
          <input
            id="proposal-admin-token"
            type="password"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            placeholder="STAYLINK_ADMIN_API_TOKEN"
          />
        </label>
        <p>{message}</p>
      </div>

      <div className="proposal-list approval">
        {items.map((property) => (
          <article key={property.id}>
            <span>{statusLabels[property.status]}</span>
            <div>
              <h3>{property.name}</h3>
              <small>
                {property.area} · 객실 {property.roomCount}개 · 등록 {property.createdAt.slice(0, 10)}
              </small>
            </div>
            <p>사장님 등록자료 검수 후 고객홈 노출 상태를 운영자가 결정합니다.</p>
            <b>{property.id}</b>
            <div className="approval-actions">
              <button type="button" onClick={() => updateStatus(property.id, "active")}>
                승인
              </button>
              <button type="button" onClick={() => updateStatus(property.id, "hidden")}>
                보류
              </button>
              <button type="button" onClick={() => updateStatus(property.id, "suspended")}>
                중지
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
