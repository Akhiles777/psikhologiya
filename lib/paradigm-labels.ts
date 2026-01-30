import type { Paradigm } from "@/types/catalog";

const LABELS: Record<Paradigm, string> = {
  CBT: "КПТ",
  GESTALT: "Гештальт",
  PSYCHODYNAMIC: "Психодинамика",
  HUMANISTIC: "Гуманистическая",
  SYSTEMIC: "Системная",
  SOLUTION_FOCUSED: "Решение-фокусированная",
  EXISTENTIAL: "Экзистенциальная",
  INTEGRATIVE: "Интегративная",
  TRANSACTIONAL_ANALYSIS: "Транзактный анализ",
  COGNITIVE_BEHAVIORAL: "Когнитивно-поведенческая",
  OTHER: "Другое",
};

export function paradigmLabel(paradigm: Paradigm): string {
  return LABELS[paradigm] ?? paradigm;
}

export function allParadigms(): Paradigm[] {
  return Object.keys(LABELS) as Paradigm[];
}
