export type AccessLevel = "public" | "member" | "premium" | "admin";

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

/** 회원등급별 하루 사용 횟수 제한. -1 = 무제한, 0 = 사용불가, n = n회/일 */
export interface UsageLimits {
  public: number;
  member: number;
  premium: number;
  admin: number;
}

export interface MenuItem {
  id: string;
  icon: string;
  nameKo: string;
  description: string;
  category: string;
  path: string;
  difficulty: string;
  isAI: boolean;
  ready: boolean;
  accessLevel: AccessLevel;
  tags: string[];
  color: string;
  order: number;
  usageLimits?: UsageLimits;
  /** 별(⭐) 크레딧 소모량. 미설정 시 기본값(프리미엄 3 / AI 2 / 일반 1) */
  cost?: number;
  popular?: boolean;
}
