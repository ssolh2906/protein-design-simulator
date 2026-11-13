/**
 * The curriculum: structure only.
 *
 * Titles, summaries and takeaways are per-language and live in
 * src/lib/i18n.ts, keyed by this slug. Order matters: each chapter assumes
 * the previous one.
 */

export type Chapter = {
  slug: string;
  number: number;
  minutes: number;
};

export const CHAPTERS: Chapter[] = [
  { slug: "the-experiment", number: 1, minutes: 6 },
  { slug: "raw-counts", number: 2, minutes: 8 },
  { slug: "quality-control", number: 3, minutes: 10 },
  { slug: "fitness", number: 4, minutes: 8 },
  { slug: "reproducibility", number: 5, minutes: 9 },
  { slug: "assay-conditions", number: 6, minutes: 7 },
  { slug: "landscape", number: 7, minutes: 9 },
  { slug: "epistasis", number: 8, minutes: 9 },
  { slug: "picking-hits", number: 9, minutes: 8 },
];

export const chapterBySlug = (slug: string) =>
  CHAPTERS.find((c) => c.slug === slug);

export const neighbours = (slug: string) => {
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  return {
    prev: i > 0 ? CHAPTERS[i - 1] : undefined,
    next: i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : undefined,
  };
};

export const TOTAL_MINUTES = CHAPTERS.reduce((a, c) => a + c.minutes, 0);
