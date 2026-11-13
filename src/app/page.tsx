import Link from "next/link";
import { CHAPTERS, TOTAL_MINUTES } from "@/lib/chapters";
import { getRawProfile, getLandscape, getMeta, fmt } from "@/lib/data";
import { Stat, StatGrid } from "@/components/ui";

export default function Home() {
  const profile = getRawProfile();
  const landscape = getLandscape();
  const meta = getMeta();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-10 lg:py-20">
      <header className="mb-12">
        <p className="mb-4 text-[12px] font-medium tracking-wider text-[var(--series-1)] uppercase">
          A protein design walkthrough
        </p>
        <h1 className="text-[40px] leading-[1.1] font-semibold tracking-tight text-[var(--ink)]">
          160,000 protein variants.
          <br />
          One very messy file.
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[var(--ink-secondary)]">
          This is a hands-on tour of a real protein engineering dataset. You
          start with raw sequencing read counts, exactly as they came off the
          machine. You finish with a shortlist of protein variants you would
          spend real money to make.
        </p>
        <p className="mt-4 max-w-2xl text-[17px] leading-8 text-[var(--ink-secondary)]">
          Nothing here is simulated. The numbers come from a published
          experiment, and the mess is the mess the original authors had to
          deal with.
        </p>
      </header>

      <StatGrid>
        <Stat
          value={fmt(profile.rowsInFile)}
          label="Rows in the raw file"
          hint="not 160,000"
        />
        <Stat
          value={fmt(profile.rowsWithStopCodon)}
          label="Contain a stop codon"
          tone="warn"
          hint="broken proteins"
        />
        <Stat
          value={fmt(landscape.n)}
          label="Survive quality control"
          hint="matches the paper"
        />
        <Stat
          value={`${landscape.betterThanWtPct}%`}
          label="Beat the wild type"
          tone="good"
          hint={`${fmt(landscape.betterThanWt)} variants`}
        />
      </StatGrid>

      <section className="my-14">
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-[var(--ink)]">
          Who this is for
        </h2>
        <p className="prose-body max-w-2xl text-[15px]">
          You are new to bioinformatics, and tutorials keep handing you clean
          data. Real data is not clean. It has stop codons where proteins
          should be, variants with four reads that look like miracle hits, and
          a quality cutoff that somebody picked by judgement and wrote{" "}
          <code className="rounded bg-[var(--page)] px-1 py-0.5 font-mono text-[13px] ring-1 ring-[var(--border)] ring-inset">
            #TUNABLE
          </code>{" "}
          next to.
        </p>
        <p className="prose-body mt-4 max-w-2xl text-[15px]">
          Every chapter shows you the real numbers, explains the decision, and
          shows what the decision costs. No step is hidden behind a library
          call.
        </p>
      </section>

      <section className="my-14">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
            The walkthrough
          </h2>
          <span className="text-[12px] text-[var(--ink-muted)]">
            {CHAPTERS.length} chapters · about {TOTAL_MINUTES} min
          </span>
        </div>

        <ol className="space-y-2">
          {CHAPTERS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/chapters/${c.slug}`}
                className="group flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <span className="tabular mt-0.5 w-5 shrink-0 text-[13px] font-medium text-[var(--series-1)]">
                  {c.number}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-[var(--ink)]">
                    {c.title}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-6 text-[var(--ink-secondary)]">
                    {c.summary}
                  </span>
                </span>
                <span
                  className="mt-1 ml-auto shrink-0 self-start text-[var(--ink-muted)] transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                >
                  <svg width="14" height="14" viewBox="0 0 16 16">
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="my-14 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
          Where the data comes from
        </h2>
        <p className="mt-2 text-[14px] leading-7 text-[var(--ink-secondary)]">
          {meta.source.paper}. The library randomised four neighbouring
          residues of protein G domain B1 — V39, D40, G41 and V54 — and
          selected for binding to IgG. Read counts come from the authors&apos;
          own analysis repository and are reused under {meta.source.licence}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`https://doi.org/${meta.source.doi}`}
            className="text-[13px] font-medium text-[var(--series-1)] underline underline-offset-2"
          >
            Read the paper
          </a>
          <a
            href={meta.source.repo}
            className="text-[13px] font-medium text-[var(--series-1)] underline underline-offset-2"
          >
            Original analysis code
          </a>
          <Link
            href="/data"
            className="text-[13px] font-medium text-[var(--series-1)] underline underline-offset-2"
          >
            Rerun this pipeline
          </Link>
        </div>
      </section>
    </div>
  );
}
