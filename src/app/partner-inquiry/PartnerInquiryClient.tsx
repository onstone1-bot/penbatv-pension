"use client";

import { useState } from "react";

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "saving"; message: string }
  | { status: "success"; message: string; inquiryId: string }
  | { status: "error"; message: string };

export function PartnerInquiryClient() {
  const [state, setState] = useState<SubmitState>({
    status: "idle",
    message: "문의 내용을 입력하면 운영자 입점관리 화면에 접수됩니다."
  });

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ status: "saving", message: "입점 문의를 접수하는 중입니다." });

    const response = await fetch("/api/partner-inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        stayName: formData.get("stayName"),
        area: formData.get("area"),
        ownerName: formData.get("ownerName"),
        ownerPhone: formData.get("ownerPhone"),
        email: formData.get("email"),
        operationType: formData.get("operationType"),
        roomCount: Number(formData.get("roomCount") || 0),
        bbqType: formData.get("bbqType"),
        externalChannels: formData.getAll("externalChannels"),
        message: formData.get("message"),
        source: "partner_inquiry_page"
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ? `접수 실패: ${JSON.stringify(payload.error)}` : "접수에 실패했습니다."
      });
      return;
    }

    setState({
      status: "success",
      message: "입점 문의가 접수되었습니다. 운영자 입점관리 화면에서 확인할 수 있습니다.",
      inquiryId: payload.inquiry.id
    });
  }

  return (
    <article className="partner-inquiry-form">
      <h2>문의 접수</h2>
      <form onSubmit={submitInquiry}>
        <label>
          펜션명
          <input name="stayName" defaultValue="배방알프스" required />
        </label>
        <label>
          지역
          <input name="area" defaultValue="충남 아산 배방" required />
        </label>
        <label>
          대표자명
          <input name="ownerName" placeholder="김대표" />
        </label>
        <label>
          연락처
          <input name="ownerPhone" placeholder="010-0000-0000" required />
        </label>
        <label>
          이메일
          <input name="email" type="email" placeholder="owner@example.com" />
        </label>
        <label>
          운영 형태
          <select name="operationType" defaultValue="pension_bbq">
            <option value="pension_bbq">펜션 + 바베큐장</option>
            <option value="pension">펜션</option>
            <option value="bbq">바베큐장</option>
            <option value="glamping">글램핑</option>
          </select>
        </label>
        <label>
          객실 수
          <input name="roomCount" type="number" min={0} defaultValue={2} />
        </label>
        <label>
          바베큐 운영
          <input name="bbqType" defaultValue="개별 바베큐장 / 숯불세트" />
        </label>
        <fieldset>
          <legend>현재 사용 중인 외부 채널</legend>
          {["네이버예약", "야놀자", "여기어때", "수기관리"].map((channel) => (
            <label key={channel}>
              <input name="externalChannels" type="checkbox" value={channel} defaultChecked={channel === "네이버예약"} />
              <span>{channel}</span>
            </label>
          ))}
        </fieldset>
        <label>
          문의 내용
          <textarea name="message" defaultValue="유튜브 촬영과 예약결제 입점을 상담하고 싶습니다." />
        </label>
        <button type="submit" disabled={state.status === "saving"}>
          {state.status === "saving" ? "접수 중" : "입점 문의 접수"}
        </button>
      </form>
      <small className={`partner-inquiry-message ${state.status}`}>{state.message}</small>
      {state.status === "success" && <code>문의번호 {state.inquiryId}</code>}
    </article>
  );
}
