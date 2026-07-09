export type PsychTestType = "diagnostic" | "snack" | "ai";
export type MBTIAxis = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export interface PsychOption {
  text: string;
  weights: Partial<Record<MBTIAxis | string, number>>;
}

export interface PsychQuestion {
  id: number;
  text: string;
  options: PsychOption[];
}

export interface PsychResult {
  title: string;
  subtitle: string;
  description: string;
  strengths: string[];
  watchOut: string[];
}

export interface PsychTestData {
  slug: string;
  title: string;
  description: string;
  source: string;
  type: PsychTestType;
  estimatedMinutes: number;
  questions: PsychQuestion[];
  results: Record<string, PsychResult>;
}
