/**
 * The curriculum.
 *
 * Order matters: each chapter assumes the previous one. The slug is the URL
 * segment under /chapters/.
 */

export type Chapter = {
  slug: string;
  number: number;
  title: string;
  /** One line shown in navigation and on the index card. */
  summary: string;
  /** The single idea the reader should leave with. */
  takeaway: string;
  minutes: number;
};

export const CHAPTERS: Chapter[] = [
  {
    slug: "the-experiment",
    number: 1,
    title: "The experiment",
    summary:
      "What GB1 is, what was measured, and why four positions give 160,000 variants.",
    takeaway:
      "You cannot analyse a screen you do not understand. Read the assay first.",
    minutes: 6,
  },
  {
    slug: "raw-counts",
    number: 2,
    title: "The raw counts",
    summary:
      "Open the real file. Count the rows. Discover the row count is wrong in four different ways.",
    takeaway:
      "Raw sequencing output is a table of read counts, not a table of answers.",
    minutes: 8,
  },
  {
    slug: "quality-control",
    number: 3,
    title: "Quality control",
    summary:
      "Stop codons, zero-input rows and the noise floor. Which filters are forced and which are a judgement call.",
    takeaway:
      "Every filter trades coverage for confidence. Know which one you are paying.",
    minutes: 10,
  },
  {
    slug: "fitness",
    number: 4,
    title: "Computing fitness",
    summary:
      "Turn two read counts into one enrichment ratio, normalised to the wild type.",
    takeaway:
      "Fitness is a ratio of ratios. Zero before selection and zero after selection mean opposite things.",
    minutes: 8,
  },
  {
    slug: "reproducibility",
    number: 5,
    title: "Does it reproduce?",
    summary:
      "The correlation looks fine. Split it by read depth and the bottom falls out.",
    takeaway:
      "An aggregate correlation hides where your data is worthless. Always stratify by depth.",
    minutes: 9,
  },
  {
    slug: "assay-conditions",
    number: 6,
    title: "The assay is part of the answer",
    summary:
      "The same variants, measured against three IgG concentrations, give three different numbers.",
    takeaway:
      "Fitness is a property of the protein and the assay together. Quote the condition.",
    minutes: 7,
  },
  {
    slug: "landscape",
    number: 7,
    title: "Reading the landscape",
    summary:
      "Single-mutant heatmaps, the distribution of effects, and how rare an improvement is.",
    takeaway:
      "Most of the designed space is dead. Improvement is the exception, not the goal state.",
    minutes: 9,
  },
  {
    slug: "epistasis",
    number: 8,
    title: "Epistasis",
    summary:
      "Two good mutations are not always a better one. Why a greedy search gets stuck.",
    takeaway:
      "Mutations interact. Additive models mislead exactly where the interesting variants are.",
    minutes: 9,
  },
  {
    slug: "picking-hits",
    number: 9,
    title: "Picking what to order",
    summary:
      "Turn a cleaned landscape into a shortlist you would spend real money on.",
    takeaway:
      "A hit list is a decision under uncertainty, not a sorted column.",
    minutes: 8,
  },
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
