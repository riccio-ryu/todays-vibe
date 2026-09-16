// 심리 테스트 노출 스위치.
// 기본: 로컬 개발(dev)에서만 노출, 운영(production)에서는 미노출.
// 운영에서도 켜고 싶으면 환경변수 NEXT_PUBLIC_PSYCH_ENABLED=true 설정.
export const PSYCH_ENABLED =
  process.env.NEXT_PUBLIC_PSYCH_ENABLED === "true" ||
  process.env.NODE_ENV === "development";
