import Link from "next/link";
import { Prose, Section } from "@/components/ui";

const TERMS: {
  term: string;
  short: string;
  detail: string;
  chapter?: { slug: string; n: number };
}[] = [
  {
    term: "Deep mutational scanning (DMS)",
    short: "Measuring many protein variants at once by sequencing.",
    detail:
      "Build a library of variants, apply a selection, and sequence before and after. The change in each variant's read count is its score. One experiment measures thousands to millions of variants.",
    chapter: { slug: "the-experiment", n: 1 },
  },
  {
    term: "Variant",
    short: "One specific protein sequence in the library.",
    detail:
      "In this dataset a variant is written as four letters, one per randomised position, in the order 39, 40, 41, 54. VDGV is the wild type.",
    chapter: { slug: "the-experiment", n: 1 },
  },
  {
    term: "Wild type (WT)",
    short: "The original, unmutated protein.",
    detail:
      "The reference every measurement is compared against. Its fitness is defined as 1.0, so it has no error bar by construction — a point worth remembering.",
    chapter: { slug: "fitness", n: 4 },
  },
  {
    term: "Hamming distance (HD)",
    short: "How many of the randomised positions differ from the wild type.",
    detail:
      "Ranges from 0 (wild type) to 4 (all positions changed). It is not the same as the number of DNA changes, and it only counts the four randomised sites.",
    chapter: { slug: "the-experiment", n: 1 },
  },
  {
    term: "Read count",
    short: "How many times the sequencer saw a variant.",
    detail:
      "A whole number, not a measurement with units. It depends on how much of the variant was present and on how deeply the sample was sequenced, which is why raw counts cannot be compared across samples.",
    chapter: { slug: "raw-counts", n: 2 },
  },
  {
    term: "Read depth / coverage",
    short: "How many reads support one variant.",
    detail:
      "The single most important quality number in this kind of data. Low depth does not bias a fitness value in a particular direction; it makes it random.",
    chapter: { slug: "reproducibility", n: 5 },
  },
  {
    term: "Fitness",
    short: "Enrichment during selection, relative to the wild type.",
    detail:
      "(selected_variant / selected_WT) ÷ (input_variant / input_WT). Above 1.0 means the variant did better than the wild type in this assay. It is not a general measure of protein quality.",
    chapter: { slug: "fitness", n: 4 },
  },
  {
    term: "Stop codon",
    short: "A DNA triplet that ends translation early.",
    detail:
      "Written as _ in this dataset. The result is a truncated protein. Stop codons appear because degenerate codons used to randomise a position also encode stop. They are useless as designs and valuable as negative controls.",
    chapter: { slug: "raw-counts", n: 2 },
  },
  {
    term: "Degenerate codon",
    short: "A DNA position synthesised as a mixture of bases.",
    detail:
      "The standard way to randomise a residue. No mixture encodes exactly the 20 amino acids and nothing else, so unwanted stop codons and uneven amino-acid frequencies come with the method.",
    chapter: { slug: "raw-counts", n: 2 },
  },
  {
    term: "Dropout",
    short: "A variant present before selection and absent after it.",
    detail:
      "A real measurement of failure, giving a fitness of zero. Distinct from a variant with zero input reads, which is a missing measurement rather than a result.",
    chapter: { slug: "quality-control", n: 3 },
  },
  {
    term: "Selection stringency",
    short: "How hard the selection is to pass.",
    detail:
      "Here it is set by IgG concentration. Low target concentration is stringent and spreads strong binders apart; high concentration saturates and compresses them.",
    chapter: { slug: "assay-conditions", n: 6 },
  },
  {
    term: "Dynamic range",
    short: "The span between the weakest and strongest measurable signal.",
    detail:
      "An assay that saturates has a small dynamic range at the top, so real differences between good variants become invisible. Changing the assay changes the range without changing the proteins.",
    chapter: { slug: "assay-conditions", n: 6 },
  },
  {
    term: "Fitness landscape",
    short: "The map from sequence to function.",
    detail:
      "With four positions and 20 amino acids there are 160,000 points on this one. Most real landscapes are far too large to measure, which is why small complete ones are so useful for teaching.",
    chapter: { slug: "landscape", n: 7 },
  },
  {
    term: "Epistasis",
    short: "When the effect of one mutation depends on another.",
    detail:
      "Measured as the gap between what the single mutants predict and what the combination actually does. It is the reason additive models fail on exactly the variants you most want to find.",
    chapter: { slug: "epistasis", n: 8 },
  },
  {
    term: "Sign epistasis",
    short: "A mutation that is harmful in one background and helpful in another.",
    detail:
      "The strongest form of interaction. In this dataset V39W and G41L are each lethal alone, and together they beat the wild type. No model fitted to single mutants can predict that.",
    chapter: { slug: "epistasis", n: 8 },
  },
  {
    term: "Local maximum",
    short: "A variant that cannot be improved by any single further change.",
    detail:
      "A greedy, one-step-at-a-time search stops here. Sign epistasis creates local maxima, and it is why the best variant in a library often cannot be reached one mutation at a time.",
    chapter: { slug: "epistasis", n: 8 },
  },
  {
    term: "mRNA display",
    short: "A way of keeping each protein attached to its own gene.",
    detail:
      "Each protein stays physically linked to the RNA that encodes it, so selecting proteins by binding also selects their sequences. That link is what makes counting by sequencing possible.",
    chapter: { slug: "the-experiment", n: 1 },
  },
];

export function GlossaryEn() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-10 lg:px-10 lg:py-16">
      <header className="mb-10">
        <h1 className="text-[32px] leading-[1.15] font-semibold tracking-tight text-[var(--ink)]">
          Glossary
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[var(--ink-secondary)]">
          Every term this walkthrough uses, in the sense it uses it. Where a
          word has a broader meaning elsewhere, the definition here is the
          narrow one that applies to this dataset.
        </p>
      </header>

      <Section>
        <dl className="space-y-3">
          {TERMS.map((t) => (
            <div
              key={t.term}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            >
              <dt className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-[15px] font-semibold text-[var(--ink)]">
                  {t.term}
                </span>
                {t.chapter && (
                  <Link
                    href={`/chapters/${t.chapter.slug}`}
                    className="text-[11px] font-medium text-[var(--series-1)] underline underline-offset-2"
                  >
                    chapter {t.chapter.n}
                  </Link>
                )}
              </dt>
              <dd className="mt-1.5">
                <p className="text-[14px] leading-6 font-medium text-[var(--ink)]">
                  {t.short}
                </p>
                <p className="mt-1.5 text-[13.5px] leading-6 text-[var(--ink-secondary)]">
                  {t.detail}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Prose>
        <p className="mt-8 text-[13px] text-[var(--ink-muted)]">
          Spotted something wrong or unclear? The repository is open — issues
          and corrections are welcome.
        </p>
      </Prose>
    </article>
  );
}
