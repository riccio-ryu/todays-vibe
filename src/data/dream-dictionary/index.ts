import type { DreamSymbol, DreamCategory } from "./types";
import { animalDreams } from "./animals";
import { natureDreams } from "./nature";
import { peopleDreams } from "./people";
import { bodyDreams } from "./body";
import { situationDreams } from "./situations";
import { objectDreams } from "./objects";

export type { DreamSymbol, DreamCategory } from "./types";

export const DREAM_CATEGORIES: DreamCategory[] = [
  "동물",
  "자연",
  "사람·관계",
  "신체",
  "상황·행동",
  "재물·사물",
];

export const allDreamSymbols: DreamSymbol[] = [
  ...animalDreams,
  ...natureDreams,
  ...peopleDreams,
  ...bodyDreams,
  ...situationDreams,
  ...objectDreams,
];

export function getDreamBySlug(slug: string): DreamSymbol | undefined {
  return allDreamSymbols.find((d) => d.slug === slug);
}

export function getDreamsByCategory(category: DreamCategory): DreamSymbol[] {
  return allDreamSymbols.filter((d) => d.category === category);
}
