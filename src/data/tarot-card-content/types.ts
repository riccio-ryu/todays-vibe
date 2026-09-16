// 타로 카드 상세 페이지용 편집 콘텐츠 타입
// tarot-cards.json의 구조화 데이터(키워드, 정/역방향 요약)를 보완하는 서술형 텍스트

export type OrientedText = {
  upright: string;
  reversed: string;
};

export type TarotCardContent = {
  /** 카드 그림과 상징에 대한 해설 */
  symbolism: string;
  /** 정방향 상세 풀이 */
  uprightDetail: string;
  /** 역방향 상세 풀이 */
  reversedDetail: string;
  /** 연애운 — 메이저 카드는 JSON에 이미 있어 생략 가능 */
  love?: OrientedText;
  /** 직업운 */
  career?: OrientedText;
  /** 금전운 */
  finance?: OrientedText;
  /** 이 카드가 나왔을 때의 조언 */
  advice: string;
};
