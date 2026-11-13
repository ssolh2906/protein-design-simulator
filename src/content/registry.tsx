import type { ComponentType } from "react";
import type { Lang } from "@/lib/i18n";

import { TheExperimentEn } from "./chapters/the-experiment";
import { RawCountsEn } from "./chapters/raw-counts";
import { QualityControlEn } from "./chapters/quality-control";
import { QualityControlKo } from "./chapters/quality-control.ko";
import { FitnessEn } from "./chapters/fitness";
import { ReproducibilityEn } from "./chapters/reproducibility";
import { AssayConditionsEn } from "./chapters/assay-conditions";
import { LandscapeEn } from "./chapters/landscape";
import { EpistasisEn } from "./chapters/epistasis";
import { PickingHitsEn } from "./chapters/picking-hits";

/**
 * Chapter bodies, by slug and language.
 *
 * Prose is duplicated per language rather than pulled from a string
 * dictionary. The chapters are long-form writing with inline emphasis,
 * links and components such as <Variant seq="VDGV" />, none of which
 * survives being flattened into JSON. Charts, tables and every number stay
 * shared, so the two languages cannot disagree about the data.
 *
 * A missing language falls back to English, and the frame shows a notice.
 */
const CHAPTER_CONTENT: Record<string, Partial<Record<Lang, ComponentType>>> = {
  "the-experiment": { en: TheExperimentEn },
  "raw-counts": { en: RawCountsEn },
  "quality-control": { en: QualityControlEn, ko: QualityControlKo },
  fitness: { en: FitnessEn },
  reproducibility: { en: ReproducibilityEn },
  "assay-conditions": { en: AssayConditionsEn },
  landscape: { en: LandscapeEn },
  epistasis: { en: EpistasisEn },
  "picking-hits": { en: PickingHitsEn },
};

export function getChapterContent(slug: string, lang: Lang) {
  const entry = CHAPTER_CONTENT[slug];
  if (!entry) throw new Error(`No content registered for chapter: ${slug}`);
  const translated = entry[lang];
  if (translated) return { Content: translated, isTranslated: true };
  const fallback = entry.en;
  if (!fallback) throw new Error(`No English fallback for chapter: ${slug}`);
  return { Content: fallback, isTranslated: false };
}

/** Which chapters exist in a language, for a progress note in the UI. */
export const translatedCount = (lang: Lang) =>
  Object.values(CHAPTER_CONTENT).filter((e) => e[lang]).length;
