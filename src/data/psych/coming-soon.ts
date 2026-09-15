import type { PsychSection } from "./types";

// 카탈로그(docs/psych-tests-catalog.md) 97종 중 아직 구현하지 않은 항목의 '준비중' placeholder.
// 목록 화면에서 흐릿하게만 노출하고 페이지·사이트맵은 만들지 않는다 (운세 `ready:false` 카드와 동일한 취급).
// Firestore(psych_tests)에는 넣지 않는다 — 넣으면 syncPsychTestsFromCode가 등록해 admin 관리 테이블이 뒤덮인다.
// 구현해서 코드 데이터가 생기면 slug가 겹치지 않더라도 이 배열에서 해당 줄을 지운다.

export interface ComingSoonPsychTest {
  /** 목록 key 전용 — 라우트를 만들지 않는다 (cs- 접두사) */
  slug: string;
  icon: string;
  title: string;
  summary: string;
  section: PsychSection;
}

/** 카탈로그 섹션 표시 순서 */
export const PSYCH_SECTION_ORDER: PsychSection[] = [
  "성격·유형",
  "감정·심리",
  "연애·관계",
  "직장·학교",
  "라이프·취향",
  "재미·바이럴",
  "MBTI 확장",
  "AI 특화",
];

export const comingSoonPsychTests: ComingSoonPsychTest[] = [
  { slug: "cs-1", icon: "🧬", title: "나의 성격 유형 테스트", summary: "5대 성격 특성 15문항으로 찾는 나의 대표 유형", section: "성격·유형" },
  { slug: "cs-10", icon: "💬", title: "단톡방 말투로 보는 성향", summary: "단톡방 말투와 답장 속도로 보는 성향", section: "성격·유형" },
  { slug: "cs-11", icon: "🎒", title: "가방·방 정리 스타일", summary: "가방과 방 정리 습관으로 보는 계획성", section: "성격·유형" },
  { slug: "cs-2", icon: "🎭", title: "숨겨진 성격 찾기", summary: "평소의 나와 스트레스 받은 나를 비교해 보는 10문항", section: "성격·유형" },
  { slug: "cs-3", icon: "🚩", title: "나는 리더형일까?", summary: "상황형 10문항으로 알아보는 나의 리더십 유형", section: "성격·유형" },
  { slug: "cs-4", icon: "⚖️", title: "감성형 vs 이성형 (T/F 탐구)", summary: "T와 F를 퍼센트 스펙트럼으로 — \"당신은 64% T\"", section: "성격·유형" },
  { slug: "cs-5", icon: "🗓️", title: "계획형 vs 즉흥형", summary: "계획형과 즉흥형 사이, 내 위치와 강점 구간", section: "성격·유형" },
  { slug: "cs-6", icon: "💗", title: "공감 능력 (EQ) 테스트", summary: "15문항으로 보는 공감 능력과 영역별 점수", section: "성격·유형" },
  { slug: "cs-7", icon: "🪞", title: "자존감 테스트", summary: "Rosenberg 척도 10문항 자존감 점검과 응원 메시지", section: "성격·유형" },
  { slug: "cs-8", icon: "🔋", title: "내향/외향 스펙트럼", summary: "12문항으로 보는 내향·외향 퍼센트", section: "성격·유형" },
  { slug: "cs-9", icon: "📐", title: "완벽주의 성향 진단", summary: "건강한 완벽주의인지 강박적 완벽주의인지", section: "성격·유형" },
  { slug: "cs-15", icon: "🌤️", title: "내 마음속 날씨", summary: "기분 키워드 3개로 그리는 오늘 마음의 날씨", section: "감정·심리" },
  { slug: "cs-16", icon: "🏷️", title: "오늘 나를 지배하는 감정", summary: "감정 태그 3개 조합으로 읽는 오늘의 감정", section: "감정·심리" },
  { slug: "cs-19", icon: "🍀", title: "행복 지수", summary: "SWLS 기반 삶의 만족도와 충족·결핍 영역", section: "감정·심리" },
  { slug: "cs-20", icon: "🌱", title: "회복 탄력성 지수", summary: "힘든 일 뒤 나의 회복 패턴과 숨은 강점", section: "감정·심리" },
  { slug: "cs-21", icon: "🛁", title: "자기 돌봄 (Self-care) 지수", summary: "최근 일주일 자기 돌봄을 4개 영역으로 점검", section: "감정·심리" },
  { slug: "cs-22", icon: "🍂", title: "내 마음의 계절", summary: "키워드 5개로 찾는 지금 내 마음의 계절", section: "감정·심리" },
  { slug: "cs-23", icon: "🛡️", title: "유리멘탈 방어 유형", summary: "악플·잔소리에 반응하는 내 멘탈 방어 유형", section: "감정·심리" },
  { slug: "cs-26", icon: "🔗", title: "집착도 테스트", summary: "10문항으로 보는 집착 레벨 5단계", section: "연애·관계" },
  { slug: "cs-27", icon: "💎", title: "이상형 분석", summary: "조건 우선순위로 만드는 내 이상형 프로필", section: "연애·관계" },
  { slug: "cs-30", icon: "🌧️", title: "이별 후유증 유형", summary: "이별 후 행동 패턴으로 보는 회복 유형과 기간", section: "연애·관계" },
  { slug: "cs-31", icon: "😉", title: "연애 플러팅 스타일", summary: "호감 표현 방식으로 보는 플러팅 스타일", section: "연애·관계" },
  { slug: "cs-32", icon: "🔥", title: "질투 마녀 테스트", summary: "질투 상황 10문항으로 보는 나의 질투 레벨", section: "연애·관계" },
  { slug: "cs-35", icon: "👀", title: "첫인상 테스트", summary: "이미지·단어 선호로 보는 내가 주는 첫인상", section: "연애·관계" },
  { slug: "cs-36", icon: "🫱", title: "사회성 테스트", summary: "사회적 상황 10문항으로 보는 사회성 스펙트럼", section: "연애·관계" },
  { slug: "cs-37", icon: "📏", title: "인간관계 거리감 테스트", summary: "관계별 편안한 거리감과 적정 인간관계 반경", section: "연애·관계" },
  { slug: "cs-38", icon: "🤝", title: "갈등 해결 스타일", summary: "갈등 상황에서 나오는 5가지 해결 패턴", section: "연애·관계" },
  { slug: "cs-39", icon: "👯", title: "단짝 친구 서사 테스트", summary: "둘이 각자 풀고 결과를 맞춰 보는 찐친 확률", section: "연애·관계" },
  { slug: "cs-40", icon: "💞", title: "AI 연애 상담", summary: "연애 고민을 쓰면 AI가 상담사처럼 분석해 줘요", section: "연애·관계" },
  { slug: "cs-42", icon: "🕸️", title: "AI 인간관계 분석", summary: "관계 상황을 쓰면 AI가 패턴과 개선 방향을 읽어줘요", section: "연애·관계" },
  { slug: "cs-44", icon: "🧩", title: "협업 스타일", summary: "DISC 모델 기반 10문항 협업 스타일", section: "직장·학교" },
  { slug: "cs-45", icon: "🗣️", title: "회의 스타일 테스트", summary: "회의에서 내가 맡는 포지션 5가지 중 하나", section: "직장·학교" },
  { slug: "cs-46", icon: "⚔️", title: "판타지 RPG 직업", summary: "업무 패턴으로 매칭하는 판타지 RPG 직업", section: "직장·학교" },
  { slug: "cs-48", icon: "🌡️", title: "스트레스 원인 분석 (직장)", summary: "직장 상황을 쓰면 AI가 스트레스 근본 원인을 짚어줘요", section: "직장·학교" },
  { slug: "cs-49", icon: "🏢", title: "AI 직장 고민 분석", summary: "직장 고민을 쓰면 AI가 현실적인 해법과 위로를", section: "직장·학교" },
  { slug: "cs-52", icon: "🏃", title: "운동 성향", summary: "운동 동기 유형과 나에게 맞는 운동 추천", section: "라이프·취향" },
  { slug: "cs-53", icon: "🌙", title: "수면 타입", summary: "수면 패턴으로 보는 크로노타입과 루틴", section: "라이프·취향" },
  { slug: "cs-54", icon: "🎯", title: "집중력 테스트", summary: "집중 패턴으로 찾는 최적의 작업 환경", section: "라이프·취향" },
  { slug: "cs-55", icon: "🦥", title: "게으름 지수", summary: "10문항으로 보는 게으름 레벨과 유형", section: "라이프·취향" },
  { slug: "cs-56", icon: "🥐", title: "호텔 조식 공략법 테스트", summary: "호텔 조식 담는 순서로 보는 완벽주의·충동성", section: "라이프·취향" },
  { slug: "cs-57", icon: "🐟", title: "붕어빵 취향 테스트", summary: "붕어빵 어디부터 먹는지, 단 한 번의 선택", section: "라이프·취향" },
  { slug: "cs-58", icon: "☕", title: "커피 취향 테스트", summary: "커피 취향과 습관으로 매칭하는 성격 유형", section: "라이프·취향" },
  { slug: "cs-60", icon: "🎧", title: "음악·영화 취향 분석", summary: "장르 선호 12문항으로 보는 감성 유형", section: "라이프·취향" },
  { slug: "cs-61", icon: "🚇", title: "지하철 빈자리 선택 테스트", summary: "지하철 빈자리 선택으로 보는 대인관계 성향", section: "라이프·취향" },
  { slug: "cs-62", icon: "🛗", title: "엘리베이터 행동 테스트", summary: "엘리베이터 앞 행동으로 보는 성격 급함 지수", section: "라이프·취향" },
  { slug: "cs-63", icon: "🍿", title: "AI 취향 분석", summary: "좋아하는 것들을 쓰면 AI가 취향 패턴을 분석", section: "라이프·취향" },
  { slug: "cs-64", icon: "🏯", title: "조선시대 직업 테스트", summary: "성향 10문항으로 매칭하는 조선시대 직업", section: "재미·바이럴" },
  { slug: "cs-66", icon: "🎬", title: "숏폼 영상 서사 테스트", summary: "내 일상을 찍는다면 어떤 장르일까", section: "재미·바이럴" },
  { slug: "cs-69", icon: "🪐", title: "행성 유형 테스트", summary: "성격 8문항으로 매칭하는 태양계 행성", section: "재미·바이럴" },
  { slug: "cs-71", icon: "🔮", title: "환생 캐릭터 테스트", summary: "다시 태어난다면 어떤 캐릭터로 환생할까", section: "재미·바이럴" },
  { slug: "cs-m-10", icon: "🧭", title: "MBTI 직업 추천", summary: "유형별 어울리는 직업과 업무 강점", section: "MBTI 확장" },
  { slug: "cs-m-2", icon: "🧠", title: "AI MBTI 예측", summary: "자기소개를 쓰면 AI가 MBTI 유형을 근거와 함께 예측", section: "MBTI 확장" },
  { slug: "cs-m-3", icon: "📅", title: "오늘의 MBTI", summary: "오늘 기분 기준 — \"오늘 당신은 ENFP 에너지\"", section: "MBTI 확장" },
  { slug: "cs-m-6", icon: "🎪", title: "친구들과 있을 때 MBTI", summary: "친목 상황에서 드러나는 나의 16유형", section: "MBTI 확장" },
  { slug: "cs-m-7", icon: "🫥", title: "숨겨진 MBTI", summary: "스트레스 상황에서 튀어나오는 진짜 유형", section: "MBTI 확장" },
  { slug: "cs-m-8", icon: "💘", title: "이상형 MBTI", summary: "내가 끌리는 유형을 역으로 분석", section: "MBTI 확장" },
  { slug: "cs-m-9", icon: "🔗", title: "MBTI 궁합", summary: "두 유형을 넣으면 일·사랑 케미를 함께", section: "MBTI 확장" },
  { slug: "cs-a-10", icon: "🌲", title: "AI 무의식의 숲", summary: "상상한 풍경을 묘사하면 AI가 무의식을 읽어요", section: "AI 특화" },
  { slug: "cs-a-11", icon: "🎤", title: "AI 가상 면접 테스트", summary: "압박 면접관 AI와 대화하고 침착도를 점수로", section: "AI 특화" },
  { slug: "cs-a-12", icon: "📜", title: "AI 인생 한 줄 시 매칭", summary: "가치관 선택으로 매칭되는 인생 한 줄", section: "AI 특화" },
  { slug: "cs-a-13", icon: "📖", title: "AI 인생 캐릭터 분석", summary: "\"당신은 어떤 이야기의 주인공인가\"", section: "AI 특화" },
  { slug: "cs-a-14", icon: "🔭", title: "AI 미래 성향 예측", summary: "현재 성향으로 그려보는 5년 후의 나", section: "AI 특화" },
  { slug: "cs-a-15", icon: "📈", title: "AI 성장 리포트", summary: "지난 결과들을 비교해 보는 나의 변화 추이", section: "AI 특화" },
  { slug: "cs-a-6", icon: "📄", title: "AI 자기소개 분석", summary: "자소서·소개글을 쓰면 AI가 인상과 개선점을", section: "AI 특화" },
  { slug: "cs-a-7", icon: "⚖️", title: "AI 장점·단점 분석", summary: "자유 입력으로 받는 객관적 강약점과 개발 방향", section: "AI 특화" },
  { slug: "cs-a-9", icon: "🎲", title: "AI 선택 장애 해결", summary: "두 선택지를 넣으면 AI가 심리학 관점으로 정리", section: "AI 특화" },
];
