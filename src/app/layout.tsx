import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "펜바TV | 유튜브 펜션·바베큐 예약 플랫폼",
  description: "유튜브 영상에서 펜션 사진, 객실 선택, 예약일정, 바베큐 옵션, 결제까지 연결하는 펜바TV 웹앱"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
