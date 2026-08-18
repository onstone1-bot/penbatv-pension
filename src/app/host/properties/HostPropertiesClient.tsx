"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  adPlanLabels,
  mockPartnerProperties,
  partnerStatusLabels,
  reservationModeLabels,
  type AdPlan,
  type PartnerProperty,
  type PartnerStatus,
  type ReservationMode
} from "@/lib/platform-data";
import { formatWon } from "@/lib/local-quote";

type PropertyForm = {
  name: string;
  area: string;
  address: string;
  concept: string;
  ownerName: string;
  ownerPhone: string;
  roomCount: number;
  minPrice: number;
  adPlan: AdPlan;
  reservationMode: ReservationMode;
  commissionRate: number;
  tags: string;
  status: PartnerStatus;
  featuredVideoUrl: string;
  featuredVideoTitle: string;
  adminToken: string;
};

const defaultHeroUrl =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80";

const initialForm: PropertyForm = {
  name: "",
  area: "",
  address: "",
  concept: "",
  ownerName: "",
  ownerPhone: "",
  roomCount: 1,
  minPrice: 120000,
  adPlan: "basic",
  reservationMode: "request",
  commissionRate: 8,
  tags: "바비큐, 가족, 유튜브",
  status: "review",
  featuredVideoUrl: "",
  featuredVideoTitle: "펜바TV 단독 촬영 영상",
  adminToken: ""
};

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `stay-${Date.now()}`;
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function HostPropertiesClient() {
  const [properties, setProperties] = useState<PartnerProperty[]>(mockPartnerProperties);
  const [form, setForm] = useState<PropertyForm>(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const preview = useMemo<PartnerProperty>(() => {
    const id = slugify(form.name || form.area);

    return {
      id,
      name: form.name || "신규 펜션명",
      area: form.area || "지역 입력",
      address: form.address,
      concept: form.concept || "숙소의 핵심 매력을 한 문장으로 입력하세요.",
      rating: 0,
      reviewCount: 0,
      heroUrl: defaultHeroUrl,
      ownerName: form.ownerName || "대표자",
      ownerPhone: form.ownerPhone || "연락처",
      roomCount: form.roomCount,
      minPrice: form.minPrice,
      adPlan: form.adPlan,
      reservationMode: form.reservationMode,
      commissionRate: form.commissionRate,
      status: form.status,
      tags: splitTags(form.tags),
      featuredVideoUrl: form.featuredVideoUrl,
      featuredVideoTitle: form.featuredVideoTitle || "펜바TV 단독 촬영 영상",
      videoLinks: [
        {
          title: form.featuredVideoTitle || "펜바TV 단독 촬영 영상",
          url: form.featuredVideoUrl || "https://www.youtube.com/results?search_query=펜션+바베큐",
          tag: "대표 영상",
          duration: "0:30",
          description: "사장님이 등록한 유튜브 링크를 예약 화면으로 연결합니다."
        }
      ]
    };
  }, [form]);

  function updateField<K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitProperty() {
    if (!form.name.trim() || !form.area.trim() || !form.ownerName.trim() || !form.ownerPhone.trim()) {
      setMessage("펜션명, 지역, 대표자, 연락처는 필수입니다.");
      return;
    }

    setIsSaving(true);
    const nextProperty = preview;
    setProperties((current) => [nextProperty, ...current.filter((property) => property.id !== nextProperty.id)]);

    if (form.adminToken.trim()) {
      try {
        const response = await fetch("/api/host/accommodations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": form.adminToken.trim(),
            "x-penbatv-role": "host"
          },
          body: JSON.stringify({
            id: nextProperty.id,
            name: nextProperty.name,
            area: nextProperty.area,
            address: nextProperty.address,
            concept: nextProperty.concept,
            heroUrl: nextProperty.heroUrl,
            ownerName: nextProperty.ownerName,
            ownerPhone: nextProperty.ownerPhone,
            roomCount: nextProperty.roomCount,
            minPrice: nextProperty.minPrice,
            adPlan: nextProperty.adPlan,
            reservationMode: nextProperty.reservationMode,
            commissionRate: nextProperty.commissionRate,
            tags: nextProperty.tags,
            featuredVideoUrl: nextProperty.featuredVideoUrl,
            featuredVideoTitle: nextProperty.featuredVideoTitle,
            status: nextProperty.status
          })
        });

        if (!response.ok) throw new Error("API registration failed.");
        setMessage("입점 펜션이 등록되었습니다. Supabase 숙소 기본 정보 저장까지 시도했습니다.");
      } catch {
        setMessage("화면에는 등록했습니다. 관리자 API 토큰 또는 Supabase 연결은 다시 확인해주세요.");
      }
    } else {
      setMessage("입점 펜션 초안을 화면에 등록했습니다. 관리자 API 토큰을 넣으면 DB 저장까지 시도합니다.");
    }

    setForm(initialForm);
    setIsSaving(false);
  }

  return (
    <main>
      <section className="panel">
        <p className="muted">Partner Onboarding</p>
        <h1>펜션 입점 등록</h1>
        <p className="muted">
          광고 노출, 예약 방식, 결제 수수료, 객실 수를 같은 포맷으로 입력해 여러 펜션을 운영할 수 있게 준비합니다.
        </p>
        <div className="host-nav">
          <Link href="/">입점 펜션 목록</Link>
          <Link href="/host/rooms">예약 운영 콘솔</Link>
          <Link href="/host/launch-plan">런칭 가이드</Link>
        </div>
      </section>

      <section className="onboarding-layout">
        <div className="property-form">
          <h2>기본 정보 입력</h2>
          <label>
            <span>펜션명</span>
            <input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label>
            <span>지역</span>
            <input value={form.area} onChange={(event) => updateField("area", event.target.value)} />
          </label>
          <label>
            <span>주소</span>
            <input value={form.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>
          <label>
            <span>소개 문구</span>
            <textarea value={form.concept} onChange={(event) => updateField("concept", event.target.value)} />
          </label>

          <div className="form-grid">
            <label>
              <span>대표자</span>
              <input value={form.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} />
            </label>
            <label>
              <span>연락처</span>
              <input value={form.ownerPhone} onChange={(event) => updateField("ownerPhone", event.target.value)} />
            </label>
            <label>
              <span>객실 수</span>
              <input
                type="number"
                min={0}
                value={form.roomCount}
                onChange={(event) => updateField("roomCount", Number(event.target.value))}
              />
            </label>
            <label>
              <span>최저가</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.minPrice}
                onChange={(event) => updateField("minPrice", Number(event.target.value))}
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              <span>광고 상품</span>
              <select value={form.adPlan} onChange={(event) => updateField("adPlan", event.target.value as AdPlan)}>
                <option value="basic">기본 노출</option>
                <option value="youtube_boost">유튜브 광고 연동</option>
                <option value="premium">프리미엄 추천</option>
              </select>
            </label>
            <label>
              <span>예약 방식</span>
              <select
                value={form.reservationMode}
                onChange={(event) => updateField("reservationMode", event.target.value as ReservationMode)}
              >
                <option value="request">예약요청</option>
                <option value="instant">바로결제</option>
                <option value="hybrid">요청+바로결제</option>
              </select>
            </label>
            <label>
              <span>수수료율</span>
              <input
                type="number"
                min={0}
                max={30}
                value={form.commissionRate}
                onChange={(event) => updateField("commissionRate", Number(event.target.value))}
              />
            </label>
            <label>
              <span>노출 상태</span>
              <select value={form.status} onChange={(event) => updateField("status", event.target.value as PartnerStatus)}>
                <option value="draft">초안</option>
                <option value="review">검수중</option>
                <option value="active">노출중</option>
                <option value="paused">중지</option>
              </select>
            </label>
          </div>

          <label>
            <span>태그</span>
            <input value={form.tags} onChange={(event) => updateField("tags", event.target.value)} />
          </label>
          <label>
            <span>유튜브 링크</span>
            <input
              value={form.featuredVideoUrl}
              onChange={(event) => updateField("featuredVideoUrl", event.target.value)}
              placeholder="https://youtube.com/shorts/..."
            />
          </label>
          <label>
            <span>영상 제목</span>
            <input
              value={form.featuredVideoTitle}
              onChange={(event) => updateField("featuredVideoTitle", event.target.value)}
            />
          </label>
          <label>
            <span>관리자 API 토큰</span>
            <input
              value={form.adminToken}
              onChange={(event) => updateField("adminToken", event.target.value)}
              placeholder="선택 입력"
            />
          </label>

          {message && <p className="status-note">{message}</p>}
          <button className="primary-action" disabled={isSaving} onClick={submitProperty}>
            입점 펜션 등록
          </button>
        </div>

        <aside className="property-preview">
          <h2>등록 미리보기</h2>
          <article className="property-card">
            <div className="property-image" style={{ backgroundImage: `url(${preview.heroUrl})` }} />
            <div className="property-body">
              <div className="property-title">
                <div>
                  <span>{preview.area}</span>
                  <h3>{preview.name}</h3>
                </div>
                <b>{partnerStatusLabels[preview.status]}</b>
              </div>
              <p>{preview.concept}</p>
              <div className="video-register-preview">
                <span>펜바TV 영상</span>
                <b>{preview.featuredVideoTitle}</b>
                <small>{preview.featuredVideoUrl || "유튜브 링크 등록 대기"}</small>
              </div>
              <div className="property-tags">
                {preview.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <dl className="property-format">
                <div>
                  <dt>광고</dt>
                  <dd>{adPlanLabels[preview.adPlan]}</dd>
                </div>
                <div>
                  <dt>예약</dt>
                  <dd>{reservationModeLabels[preview.reservationMode]}</dd>
                </div>
                <div>
                  <dt>수수료</dt>
                  <dd>{preview.commissionRate}%</dd>
                </div>
              </dl>
            </div>
          </article>
        </aside>
      </section>

      <section className="market-section">
        <div className="section-head">
          <h2>등록된 입점 펜션</h2>
          <span>{properties.length}곳</span>
        </div>
        <div className="property-table">
          {properties.map((property) => (
            <div className="property-row" key={property.id}>
              <b>{property.name}</b>
              <span>{property.area}</span>
              <span>{adPlanLabels[property.adPlan]}</span>
              <span>{reservationModeLabels[property.reservationMode]}</span>
              <strong>{formatWon(property.minPrice)}~</strong>
              <Link href={`/stays/${property.id}`}>예약 화면</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
