"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import { PSYCH_ENABLED } from "@/lib/psych/config";

/**
 * 홈("/")은 심테 노출 시 낮/밤 스와이프 캐러셀이라 각 패널이 자체 푸터를 갖는다.
 * 그래서 스와이프가 켜진 홈에서만 레이아웃 공유 푸터를 숨긴다.
 * (운영처럼 심테 미노출이면 홈도 일반 페이지이므로 공유 푸터를 그대로 렌더)
 */
export default function FooterGate() {
  const pathname = usePathname();
  if (pathname === "/" && PSYCH_ENABLED) return null;
  return <Footer />;
}
