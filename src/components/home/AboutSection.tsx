const SERVICES = [
  {
    title: "별자리 운세 (Astrology)",
    desc: "서양 점성술 기반의 12별자리 운세입니다. 태어날 때 태양이 위치한 황도 12궁에 따라 성격과 기질을 분석하고, 오늘·주간·월간·연간 흐름을 확인할 수 있습니다.",
  },
  {
    title: "타로 카드 (Tarot)",
    desc: "15세기 유럽에서 시작된 78장의 덱(메이저 아르카나 22장 + 마이너 아르카나 56장)을 기반으로 합니다. 원카드부터 켈틱 크로스·보름달 배열까지 다양한 스프레드를 제공합니다.",
  },
  {
    title: "AI 사주 (四柱八字)",
    desc: "태어난 년·월·일·시의 네 기둥으로 구성된 사주를 AI가 분석합니다. 천간(天干)과 지지(地支)의 조합으로 타고난 기운과 현재 운세의 흐름을 풀어드립니다.",
  },
  {
    title: "꿈해몽 (Dream Reading)",
    desc: "꿈속 상징과 이미지를 분석합니다. 동서양의 꿈 해석 전통을 바탕으로 AI가 꿈의 의미와 메시지를 읽어드립니다. 어떤 꿈이든 자유롭게 입력해보세요.",
  },
  {
    title: "주역 (周易 · I Ching)",
    desc: "약 3,000년 역사의 동양 철학서 주역에서 64괘를 뽑아 현재 상황의 흐름을 읽습니다. 산가지 점, 효 해석을 통해 변화의 이치를 살펴볼 수 있습니다.",
  },
  {
    title: "기타 운세",
    desc: "수비학(생일 숫자 운세), 룬 문자, 오라클 카드, 이름 성명학, 궁합(연애·사업·이름·띠), 이사 방위 길흉, 직업 운세 등 다양한 운세를 제공합니다.",
  },
];

const FAQS = [
  {
    q: "운세 결과는 얼마나 정확한가요?",
    a: "오늘운의 AI 운세는 각 분야의 전통적인 해석 체계를 기반으로 분석합니다. 재미와 참고 목적으로 활용하시길 권장드리며, 중요한 의사결정은 전문가와 상담하시기 바랍니다.",
  },
  {
    q: "사주 분석에는 어떤 정보가 필요한가요?",
    a: "사주는 태어난 년·월·일·시가 필요합니다. 태어난 시간을 모르는 경우 생년월일만으로도 기본적인 분석이 가능합니다. 더 정확한 해석을 위해 마이페이지에서 생년월일을 저장해두면 편리합니다.",
  },
  {
    q: "별자리 운세는 언제 업데이트되나요?",
    a: "일별 운세는 매일 자정(KST) 기준으로 업데이트됩니다. 주간 운세는 월요일, 월간 운세는 매월 1일, 연간 운세는 매년 1월 1일에 업데이트됩니다.",
  },
  {
    q: "회원가입 없이 이용할 수 있나요?",
    a: "별자리 운세, 타로 원카드 등 대부분의 빠른 운세는 로그인 없이 이용할 수 있습니다. AI가 생성하는 심층 운세(사주, 꿈해몽 등)는 하루 이용 횟수 제한이 있으며, 로그인 시 내역 저장 기능을 이용할 수 있습니다.",
  },
];

export default function AboutSection() {
  return (
    <section className="mt-16 border-t border-white/10 pt-12 space-y-12">

      {/* 서비스 소개 */}
      <div>
        <h2 className="text-white font-bold text-xl mb-2">오늘운이란?</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          오늘운은 동양과 서양의 전통 운세 체계를 AI 기술과 결합한 운세 플랫폼입니다.
          수천 년 역사의 별자리·타로·사주·주역 등 검증된 운세 체계를 기반으로,
          AI가 개인 맞춤형 해석을 제공합니다. 매일 달라지는 별자리 운세부터
          생년월일로 풀어내는 깊이 있는 사주 분석까지, 한국 전통 운세 문화와 현대
          AI 기술이 만나는 공간입니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-white font-semibold text-sm mb-1.5">{s.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 자주 묻는 질문 */}
      <div>
        <h2 className="text-white font-bold text-xl mb-5">자주 묻는 질문</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/80 text-sm font-medium mb-1.5">Q. {faq.q}</p>
              <p className="text-white/45 text-xs leading-relaxed">A. {faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
