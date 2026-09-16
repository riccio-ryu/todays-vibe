// 홈 Hero 카드(오늘의 운세) 문구 설정 — Firestore settings/heroCard 문서 형태

export interface HeroCardSettings {
  notLoggedInText: string;
  noBirthInfoText: string;
}

export const DEFAULT_HERO_SETTINGS: HeroCardSettings = {
  notLoggedInText: "로그인하면 오늘의 운세 점수를 확인할 수 있어요",
  noBirthInfoText: "생년월일을 저장하면 AI가 맞춤 운세를 드려요",
};
