"use client";

import { useEffect, useMemo, useState } from "react";
import { createBookingDraft, serializeBookingDraft, type BookingDraft } from "@/lib/booking-draft";
import { isYoutubeCampaign } from "@/lib/utm";

type Props = {
  accommodationId: string;
  roomId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

export function StayLandingClient(props: Props) {
  const [savedDraft, setSavedDraft] = useState<BookingDraft | null>(null);
  const draft = useMemo(() => createBookingDraft(props), [props]);
  const isYoutube = isYoutubeCampaign(props.utmCampaign);

  useEffect(() => {
    localStorage.setItem("staylink.bookingDraft", serializeBookingDraft(draft));
    setSavedDraft(draft);

    void fetch("/api/utm-events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventName: "landing_view",
        utmCode: draft.utmCode,
        roomId: draft.roomId,
        metadata: {
          accommodationId: draft.accommodationId,
          utmSource: draft.utmSource,
          utmMedium: draft.utmMedium
        }
      })
    }).catch(() => undefined);
  }, [draft]);

  return (
    <main>
      <section className="panel">
        <p className="muted">{isYoutube ? "YouTube campaign landing" : "Stay landing"}</p>
        <h1>예약 연결 준비 완료</h1>
        <p>
          유튜브 링크에서 들어온 캠페인 코드와 방·사이트 선택값을 예약 draft에 저장했습니다.
          다음 단계에서 실제 숙소 홈/상세 화면을 이 값으로 열면 됩니다.
        </p>
        <dl>
          <dt>숙소</dt>
          <dd>{props.accommodationId}</dd>
          <dt>방·사이트</dt>
          <dd>{props.roomId ?? "미지정"}</dd>
          <dt>캠페인</dt>
          <dd>{props.utmCampaign ?? "없음"}</dd>
        </dl>
        <p className="muted">
          저장 상태: {savedDraft ? "로컬 예약 draft 저장됨" : "저장 중"}
        </p>
      </section>
    </main>
  );
}
