import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "STAYLINK CAMP",
  description: "유튜브 영상에서 방·사이트 예약까지 연결하는 캠핑 예약 플랫폼"
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
