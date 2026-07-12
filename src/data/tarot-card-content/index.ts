import type { TarotCardContent } from "./types";
import { majorContent } from "./major";
import { wandsContent } from "./wands";
import { cupsContent } from "./cups";
import { swordsContent } from "./swords";
import { pentaclesContent } from "./pentacles";

export type { TarotCardContent, OrientedText } from "./types";

const allContent: Record<string, TarotCardContent> = {
  ...majorContent,
  ...wandsContent,
  ...cupsContent,
  ...swordsContent,
  ...pentaclesContent,
};

export function getCardContent(cardId: string): TarotCardContent | undefined {
  return allContent[cardId];
}
