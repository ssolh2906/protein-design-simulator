import { CodeBlock, Callout, Prose, Section, DataTable } from "@/components/ui";
import { getMeta, getRawProfile, getLandscape, fmt } from "@/lib/data";

export function DataEn() {
  const meta = getMeta();
  const profile = getRawProfile();
  const landscape = getLandscape();

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 lg:px-10 lg:py-16">
      <header className="mb-10">
        <h1 className="text-[32px] leading-[1.15] font-semibold tracking-tight text-[var(--ink)]">
          The data, and how to rerun it
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[var(--ink-secondary)]">
          Everything on this site is derived from one file of sequencing read
          counts by one script. Both are in the repository.
        </p>
      </header>

      <Section title="Source">
        <Prose>
          <p>
            <strong>{meta.source.paper}</strong>
          </p>
          <p>
            The experiment randomised four neighbouring residues of protein G
            domain B1 — V39, D40, G41 and V54 — and selected the library for
            binding to IgG by mRNA display. Read counts were taken from the
            authors&apos; own analysis repository, file{" "}
            <code className="rounded bg-[var(--page)] px-1 py-0.5 font-mono text-[13px] ring-1 ring-[var(--border)] ring-inset">
              result/Mutcount
            </code>
            , and are reused here under {meta.source.licence}.
          </p>
        </Prose>

        <div className="my-6 flex flex-wrap gap-4">
          <a
            href={`https://doi.org/${meta.source.doi}`}
            className="text-[14px] font-medium text-[var(--series-1)] underline underline-offset-2"
          >
            doi:{meta.source.doi}
          </a>
          <a
            href={meta.source.repo}
            className="text-[14px] font-medium text-[var(--series-1)] underline underline-offset-2"
          >
            Original analysis code
          </a>
        </div>

        <Callout kind="note" title="Please cite the original work">
          <p>
            If you use these numbers for anything beyond learning, cite the
            paper, not this site. The experiment is theirs; this is a
            walkthrough of it.
          </p>
        </Callout>
      </Section>

      <Section
        title="Does it reproduce the paper?"
        lead="Yes, and that is the check that matters."
      >
        <Prose>
          <p>
            Running the pipeline on the raw counts with the published filters
            yields <strong>{fmt(landscape.n)}</strong> variants with fitness
            values. The paper reports 149,361. The filtering and the fitness
            formula are therefore doing the same thing the original analysis
            did.
          </p>
          <p>
            If you change the read cutoff in the script, that number changes
            and no longer matches the paper. That is expected, and chapter 3
            shows exactly how it moves.
          </p>
        </Prose>
      </Section>

      <Section title="Rerun it yourself">
        <Prose>
          <p>
            The pipeline needs Python 3 and no third-party packages. It reads
            the gzipped counts and writes the JSON this site renders.
          </p>
        </Prose>

        <CodeBlock
          label="from the repository root"
          code={`python3 pipeline/build_data.py`}
        />

        <Prose>
          <p>
            It takes a few seconds and prints what it wrote. To see the raw
            file for yourself:
          </p>
        </Prose>

        <CodeBlock
          label="first rows of the raw counts"
          code={`gzip -dc data/raw/gb1_counts.tsv.gz | head -20`}
        />

        <Prose>
          <p>
            To rebuild the site after changing the data or the chapters:
          </p>
        </Prose>

        <CodeBlock
          label="build the static site"
          code={`npm install
npm run dev     # http://localhost:3000
npm run build   # static export into ./out`}
        />
      </Section>

      <Section
        title="What the pipeline writes"
        lead="Small files, deliberately. The whole dataset the site needs is under 200 KB."
      >
        <DataTable
          caption="Data files produced by the pipeline"
          rows={[
            { f: "raw-profile.json", d: "Row counts, read-depth summary, and a count of each kind of problem" },
            { f: "raw-sample.json", d: "Real rows from the file, chosen to show each problem" },
            { f: "funnel.json", d: "What each quality-control gate removed" },
            { f: "threshold-sweep.json", d: "Coverage and correlation at ten different read cutoffs" },
            { f: "worked-example.json", d: "One variant with every step of the fitness arithmetic" },
            { f: "stop-control.json", d: "Stop-codon variants used as a negative control" },
            { f: "reproducibility.json", d: "Correlation between conditions, split by read depth" },
            { f: "conditions.json", d: "How fitness differs across the three IgG concentrations" },
            { f: "singles.json", d: "All single mutants and the heatmap matrix" },
            { f: "epistasis.json", d: "Expected against measured fitness for double mutants" },
            { f: "landscape.json", d: "Distribution of fitness and the top variants" },
            { f: "winners-curse.json", d: "How well each slice of the ranking holds up" },
          ]}
          columns={[
            {
              key: "f",
              header: "File",
              width: "34%",
              render: (r) => (
                <span className="font-mono text-[12px] text-[var(--ink)]">
                  {r.f}
                </span>
              ),
            },
            { key: "d", header: "Contents", render: (r) => r.d },
          ]}
        />
      </Section>

      <Section title="The numbers in one place">
        <DataTable
          caption="Key figures from the dataset"
          rows={[
            { k: "Designed variants", v: fmt(profile.designedSpace) },
            { k: "Rows in the raw file", v: fmt(profile.rowsInFile) },
            { k: "Rows containing a stop codon", v: fmt(profile.rowsWithStopCodon) },
            { k: "Designed variants never sequenced", v: `${fmt(profile.neverObserved)} (${profile.neverObservedPct}%)` },
            { k: "Variants passing quality control", v: fmt(landscape.n) },
            { k: "Effectively dead (fitness < 0.01)", v: `${fmt(landscape.effectivelyDead)} (${landscape.effectivelyDeadPct}%)` },
            { k: "Better than wild type", v: `${fmt(landscape.betterThanWt)} (${landscape.betterThanWtPct}%)` },
            { k: "Published read-count cutoff", v: `${meta.minInput} input reads` },
            { k: "Wild-type sequence at the four sites", v: meta.wildType },
          ]}
          columns={[
            { key: "k", header: "Quantity", render: (r) => r.k },
            {
              key: "v",
              header: "Value",
              align: "right",
              render: (r) => (
                <span className="font-medium text-[var(--ink)]">{r.v}</span>
              ),
            },
          ]}
        />
      </Section>

      <Section title="Licence">
        <Prose>
          <p>
            The read counts are from a CC BY 4.0 publication and remain under
            that licence, with attribution to Wu et al. 2016. The code and
            written material on this site are MIT licensed, so you are free to
            fork it, change the chapters, and use it to teach.
          </p>
        </Prose>
      </Section>
    </article>
  );
}
