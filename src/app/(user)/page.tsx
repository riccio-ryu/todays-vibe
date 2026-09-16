import Link from "next/link";
import fortunesData from "@/data/fortunes.json";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getDailyRanking } from "@/lib/firebase/daily-rank";
import { todayKST } from "@/lib/utils/date";
import type { MenuItem } from "@/types/menu";
import HomeInteractive from "./HomeInteractive";
import QuickMenu from "@/components/home/QuickMenu";
import HeroCard from "@/components/home/HeroCard";
import PopularSection, { type RankedItem } from "@/components/home/PopularSection";
import OracleHeader from "@/components/home/OracleHeader";
import HomeSwipe from "@/components/home/HomeSwipe";
import PsychHomeBody from "@/components/home/PsychHomeBody";
import Footer from "@/components/Footer";
import { PSYCH_ENABLED } from "@/lib/psych/config";

// admin 메뉴·심테 노출/순서 변경이 재배포 없이 반영되도록 ISR (60초)
export const revalidate = 60;

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("menus").orderBy("order").get();
    if (snap.empty) return [];
    return snap.docs.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...rest } = d.data();
      return { id: d.id, ...rest } as MenuItem;
    });
  } catch {
    return [];
  }
}

async function getQuickMenuItems(allMenus: MenuItem[]): Promise<MenuItem[]> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("settings").doc("quickMenu").get();
    const ids: string[] = (snap.data()?.menuIds as string[]) ?? [];
    return ids
      .map((id) => allMenus.find((m) => m.id === id && m.ready))
      .filter(Boolean) as MenuItem[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const items = await getMenuItems();
  const { categories } = fortunesData;
  const [quickMenuItems, dailyRanking] = await Promise.all([
    getQuickMenuItems(items),
    getDailyRanking().catch(() => []),
  ]);
  const today = todayKST();

  // Firestore 데이터가 없으면 fortunes.json으로 폴백
  const fortunesAll: MenuItem[] =
    items.length > 0
      ? items
      : fortunesData.fortunes.map((f, i) => ({
          id: f.id,
          icon: f.icon,
          nameKo: f.nameKo,
          description: f.description,
          category: f.category,
          path: f.path,
          difficulty: f.difficulty,
          isAI: f.isAI,
          ready: f.ready ?? false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          accessLevel: ((f as any).isPremium ? "premium" : "public") as MenuItem["accessLevel"],
          tags: f.tags ?? [],
          color: f.color,
          order: i,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          popular: (f as any).popular as boolean | undefined,
        }));

  // 운세 그리드에선 심리 테스트 제외 (심테는 낮/밤 스와이프의 낮 패널이 담당)
  const fortunes = fortunesAll.filter((f) => f.id !== "psych-test");

  // 실시간 순위 → MenuItem 조인. 데이터 없으면 fortunes.json popular ID로 폴백
  const menuMap = new Map(fortunes.map((f) => [f.id, f]));
  const popularFallbackIds = fortunesData.fortunes
    .filter((f) => (f as { popular?: boolean }).popular)
    .map((f) => f.id);

  const rankedItems: RankedItem[] = dailyRanking.length > 0
    ? dailyRanking
        .map(({ menuId, count }, i) => {
          const item = menuMap.get(menuId);
          if (!item || !item.ready) return null;
          return { item, count, rank: i + 1 };
        })
        .filter(Boolean) as RankedItem[]
    : popularFallbackIds
        .map((id) => menuMap.get(id))
        .filter((f): f is MenuItem => !!f && f.ready)
        .slice(0, 5)
        .map((item, i) => ({ item, count: 0, rank: i + 1 }));

  const fortuneContent = (
    <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-6">
      {/* 콘텐츠 영역 배경 파티클 */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
        {[
          { x: "3%",  y: "8%",  c: "text-yellow-400/[0.06]" },
          { x: "95%", y: "5%",  c: "text-purple-400/[0.07]" },
          { x: "1%",  y: "35%", c: "text-white/[0.04]" },
          { x: "97%", y: "28%", c: "text-yellow-300/[0.05]" },
          { x: "2%",  y: "65%", c: "text-purple-300/[0.05]" },
          { x: "96%", y: "55%", c: "text-white/[0.04]" },
          { x: "4%",  y: "88%", c: "text-yellow-400/[0.04]" },
          { x: "94%", y: "82%", c: "text-purple-400/[0.05]" },
          { x: "50%", y: "2%",  c: "text-white/[0.03]" },
        ].map((p, i) => (
          <span key={i} className={`absolute text-lg ${p.c}`} style={{ left: p.x, top: p.y }}>
            {i % 3 === 0 ? "✦" : i % 3 === 1 ? "✧" : "⋆"}
          </span>
        ))}
      </div>

      {/* Header */}
      <OracleHeader />

      {/* Hero — 오늘의 운세 */}
      <HeroCard today={today} />

      {/* Quick Menu */}
      <QuickMenu items={quickMenuItems} />

      {/* 오늘 인기 운세 순위 */}
      <PopularSection rankedItems={rankedItems} />

      {/* 즐겨찾기 + 카테고리 */}
      <HomeInteractive categories={categories} fortunes={fortunes} />

      {/* 운세 사전 콘텐츠 */}
      <section className="mt-12">
        <h2 className="text-white font-semibold text-lg mb-2">운세 사전 — 읽어보는 운세</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-5">
          점을 보기 전에 상징의 의미부터 알아두면 해석이 훨씬 깊어집니다.
          타로 카드 한 장 한 장의 상징과 정방향·역방향 의미, 자주 꾸는 꿈의 전통 해몽과
          심리학적 풀이를 사전처럼 찾아볼 수 있도록 정리했습니다.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/tarot-cards"
            className="group rounded-2xl bg-white/5 border border-white/10 p-5 hover:border-purple-400/30 hover:bg-white/[0.08] transition-all"
          >
            <span className="text-2xl block mb-2">🎴</span>
            <p className="text-white/85 group-hover:text-white font-medium text-sm mb-1 transition-colors">
              타로 카드 78장 의미 사전
            </p>
            <p className="text-white/40 text-xs leading-relaxed">
              메이저 아르카나 22장부터 완드·컵·소드·펜타클 56장까지, 카드별 상징과
              연애·직업·금전운 해석 총정리
            </p>
          </Link>
          <Link
            href="/dream-dictionary"
            className="group rounded-2xl bg-white/5 border border-white/10 p-5 hover:border-purple-400/30 hover:bg-white/[0.08] transition-all"
          >
            <span className="text-2xl block mb-2">💭</span>
            <p className="text-white/85 group-hover:text-white font-medium text-sm mb-1 transition-colors">
              꿈해몽 사전 — 자주 꾸는 꿈 50가지
            </p>
            <p className="text-white/40 text-xs leading-relaxed">
              뱀꿈, 돼지꿈, 이빨 빠지는 꿈부터 쫓기는 꿈까지, 전통 해몽과 심리학 관점의
              상황별 풀이
            </p>
          </Link>
        </div>
      </section>

      {/* 서비스 소개 */}
      <section className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-white font-semibold text-base mb-3">오늘운은 이렇게 풀이합니다</h2>
        <div className="space-y-3 text-white/50 text-sm leading-relaxed">
          <p>
            오늘운은 별자리·타로·사주·주역처럼 오랜 시간 다듬어진 전통 운세 체계를 바탕으로,
            AI가 질문과 상황에 맞춘 해석을 더하는 운세 플랫폼입니다. 생년월일만 있으면 되는
            간단한 오늘의 운세부터, 카드를 직접 뽑는 타로 스프레드, 꿈 내용을 적어 풀이받는
            AI 꿈해몽까지 33가지 운세를 한곳에서 볼 수 있습니다.
          </p>
          <p>
            매일의 별자리·띠 운세는 하루 단위로 갱신되고, 타로와 사주 같은 AI 해석은 입력한
            내용에 따라 매번 새롭게 풀이됩니다. 결과는 저장하고 다시 볼 수 있으며, 마음에 드는
            운세는 즐겨찾기로 모아둘 수 있습니다.
          </p>
          <p className="text-white/35 text-xs">
            운세 해석은 재미와 자기 성찰의 참고 자료로 활용해 주세요. 중요한 결정은 언제나
            당신의 몫입니다.
          </p>
        </div>
      </section>
    </div>
  );

  // 운영: 심테 미노출 → 스와이프 없이 운세 홈만 (레이아웃 FooterGate가 푸터 렌더)
  if (!PSYCH_ENABLED) return fortuneContent;

  // 로컬 dev: 낮/밤 스와이프 캐러셀 (패널별 자체 푸터)
  return (
    <HomeSwipe
      fortunePanel={
        <>
          {fortuneContent}
          <Footer />
        </>
      }
      psychPanel={<PsychHomeBody />}
    />
  );
}
