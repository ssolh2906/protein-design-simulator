import type { ComponentType, ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

import { TheExperiment } from "./chapters/the-experiment";
import { RawCounts } from "./chapters/raw-counts";
import { QualityControl } from "./chapters/quality-control";
import { Fitness } from "./chapters/fitness";
import { Reproducibility } from "./chapters/reproducibility";
import { AssayConditions } from "./chapters/assay-conditions";
import { Landscape } from "./chapters/landscape";
import { Epistasis } from "./chapters/epistasis";
import { PickingHits } from "./chapters/picking-hits";

/**
 * Props every chapter body receives.
 *
 * `takeaway` is a slot rather than something the chapter writes itself:
 * stepped chapters place it on their final step, so it cannot print the
 * punchline on screen one.
 */
export type ChapterProps = {
  lang: Lang;
  takeaway?: ReactNode;
};

type Entry = {
  Component: ComponentType<ChapterProps>;
  /** Languages this chapter actually has copy for. */
  langs: Lang[];
  /** Renders one screen at a time and owns its own takeaway placement. */
  stepped?: boolean;
};

/**
 * Chapter bodies.
 *
 * One component per chapter, holding a COPY object keyed by language.
 * Charts, tables, step structure and every number are shared; only the
 * prose differs, so the two languages cannot disagree about the data.
 *
 * Prose is written as JSX inside that object rather than pulled from a
 * string dictionary, because these are long-form chapters with inline
 * emphasis, links and components such as <Variant seq="VDGV" />, none of
 * which survives being flattened into JSON.
 */
const CHAPTER_CONTENT: Record<string, Entry> = {
  "the-experiment": {
    Component: TheExperiment,
    langs: ["en", "ko"],
    stepped: true,
  },
  "raw-counts": { Component: RawCounts, langs: ["en", "ko"], stepped: true },
  "quality-control": {
    Component: QualityControl,
    langs: ["en", "ko"],
    stepped: true,
  },
  fitness: { Component: Fitness, langs: ["en", "ko"], stepped: true },
  reproducibility: {
    Component: Reproducibility,
    langs: ["en", "ko"],
    stepped: true,
  },
  "assay-conditions": {
    Component: AssayConditions,
    langs: ["en", "ko"],
    stepped: true,
  },
  landscape: { Component: Landscape, langs: ["en", "ko"], stepped: true },
  epistasis: { Component: Epistasis, langs: ["en", "ko"], stepped: true },
  "picking-hits": {
    Component: PickingHits,
    langs: ["en", "ko"],
    stepped: true,
  },
};

export function getChapterContent(slug: string, lang: Lang) {
  const entry = CHAPTER_CONTENT[slug];
  if (!entry) throw new Error(`No content registered for chapter: ${slug}`);
  const isTranslated = entry.langs.includes(lang);
  return {
    Content: entry.Component,
    // Fall back to English copy, and let the frame say so.
    contentLang: isTranslated ? lang : ("en" as Lang),
    isTranslated,
    stepped: entry.stepped === true,
  };
}

export const isStepped = (slug: string) =>
  CHAPTER_CONTENT[slug]?.stepped === true;

/** How many chapters have copy in a language, for the progress note. */
export const translatedCount = (lang: Lang) =>
  Object.values(CHAPTER_CONTENT).filter((e) => e.langs.includes(lang)).length;
