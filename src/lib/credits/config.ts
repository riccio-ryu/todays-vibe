import type { Firestore } from "firebase-admin/firestore";
import type { AccessLevel } from "@/types/menu";
import { todayKST } from "@/lib/utils/date";

// 별(⭐) 크레딧 시스템 설정.
// 항목별 "하루 N회" 대신, 권한별 일일 별을 지급하고 운세·AI 심테에서 공용 소모한다.
// admin 설정 UI(TODO 3번)가 생기기 전까지는 코드 기본값으로 동작하고,
// settings/credits 문서가 있으면 그것을 우선한다.

/** 권한별 하루 지급 별. -1 = 무제한(admin), 0 = 지급 없음(비회원 → 로그인 필요) */
export const DEFAULT_GRANTS: Record<AccessLevel, number> = {
  public: 0,
  member: 10,
  premium: 30,
  admin: -1,
};

interface MenuCostFields {
  cost?: number;
  isAI?: boolean;
  accessLevel?: AccessLevel;
}

/**
 * 항목 1회 소모 별.
 * menu.cost가 있으면 사용, 없으면 기본값: 프리미엄 3 / AI 2 / 일반 1.
 * (로직 심테는 API를 타지 않으므로 애초에 checkUsage를 거치지 않음 = 무료)
 */
export function getMenuCost(menu: MenuCostFields | undefined): number {
  if (menu?.cost !== undefined && menu.cost !== null) return menu.cost;
  if (menu?.accessLevel === "premium") return 3;
  if (menu?.isAI) return 2;
  return 1;
}

/** settings/credits 문서의 grants가 있으면 사용, 없으면 DEFAULT_GRANTS */
export async function getGrants(db: Firestore): Promise<Record<AccessLevel, number>> {
  try {
    const snap = await db.collection("settings").doc("credits").get();
    const grants = snap.data()?.grants as Partial<Record<AccessLevel, number>> | undefined;
    if (!grants) return DEFAULT_GRANTS;
    return { ...DEFAULT_GRANTS, ...grants };
  } catch {
    return DEFAULT_GRANTS;
  }
}

/** 유저 하루치 별 소모 문서 ID (daily_credits/{date}_{uid}) */
export function creditDocId(uid: string): string {
  return `${todayKST()}_${uid}`;
}
