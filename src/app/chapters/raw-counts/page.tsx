import { ChapterFrame } from "@/components/ChapterFrame";
import {
  Callout,
  CodeBlock,
  Figure,
  Mono,
  Prose,
  Section,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { RawTable } from "@/components/RawTable";
import { getRawProfile, getRawSample, fmt } from "@/lib/data";

export const metadata = { title: "The raw counts" };

export default function Page() {
  const profile = getRawProfile();
  const sample = getRawSample();

  const stops = profile.pathologies.find((p) => p.id === "stop")!;
  const zeroInput = profile.pathologies.find((p) => p.id === "zeroInput")!;
  const lowInput = profile.pathologies.find((p) => p.id === "lowInput")!;
  const dropout = profile.pathologies.find((p) => p.id === "dropout")!;

  return (
    <ChapterFrame slug="raw-counts">
      <Prose>
        <p>
          Here is the first thing you do with any dataset: open it and count
          the rows. Here is the second thing: work out why the count is wrong.
        </p>
      </Prose>

      <CodeBlock
        label="what the file looks like"
        code={`mut   HD  Input   IGG10   IGG20   IGG90
VDGV  0   92735   247431  338346  398449
SSGE  3   1365    35      44      129
FR_R  4   10      0       0       0
AEEA  4   8       0       1       2
...   ${fmt(profile.rowsInFile)} rows`}
      />

      <Prose>
        <p>
          Six columns. One row per variant. Every value is a count of
          sequencing reads — a whole number, not a measurement with units.
          That is the entire input to this analysis.
        </p>
      </Prose>

      <Section title="Problem one: the row count is too high">
        <Prose>
          <p>
            The library was designed with {fmt(profile.designedSpace)}{" "}
            variants. The file has {fmt(profile.rowsInFile)} rows. There are{" "}
            <strong>{fmt(profile.rowsInFile - profile.designedSpace)} more
            rows than designed variants</strong>.
          </p>
          <p>
            Look at the row <Mono>FR_R</Mono> in the extract above. That
            underscore is a <strong>stop codon</strong>. The ribosome stops
            there and the protein ends early.
          </p>
          <p>
            Stop codons appear because of how the library was built. To
            randomise a position you use a degenerate codon — a mixture of
            DNA bases at each of the three positions. No mixture encodes
            exactly the 20 amino acids and nothing else. Stop codons come along
            for free.
          </p>
          <p>
            With a stop allowed at each of the four positions, the real space
            is 21 × 21 × 21 × 21 = {fmt(profile.spaceWithStops)}, which is
            comfortably more than the row count.
          </p>
        </Prose>

        <StatGrid>
          <Stat value={fmt(profile.rowsInFile)} label="Rows in the file" />
          <Stat
            value={fmt(stops.count)}
            label="Contain a stop codon"
            tone="bad"
            hint={`${stops.pct}% of rows`}
          />
          <Stat
            value={fmt(profile.rowsCodingOnly)}
            label="Full-length proteins"
            hint="the real candidates"
          />
          <Stat
            value={fmt(profile.neverObserved)}
            label="Designed but never seen"
            tone="warn"
            hint={`${profile.neverObservedPct}% missing`}
          />
        </StatGrid>

        <Callout kind="key" title="Stop codons are not useless">
          <p>
            You will remove them from the design candidates. Do not delete them
            before you look at them. A truncated GB1 cannot bind IgG, so stop
            variants tell you what a <em>definitely dead</em> variant scores in
            this assay. That is a free negative control, measured in the same
            experiment. Chapter 4 uses it.
          </p>
        </Callout>
      </Section>

      <Section title="Problem two: the row count is also too low">
        <Prose>
          <p>
            {fmt(profile.neverObserved)} designed variants, or{" "}
            {profile.neverObservedPct}% of the library, have no row at all.
            Sequencing never saw them.
          </p>
          <p>
            A missing row is not the same as a zero. A zero is a measurement:
            you looked and found nothing. A missing row means you never looked,
            or the variant was never built. If you treat missing variants as
            zeros you will record them as dead proteins, which is a claim the
            experiment never made.
          </p>
        </Prose>
      </Section>

      <Section title="Problem three: the counts are wildly uneven">
        <Prose>
          <p>
            The wild type <Variant seq="VDGV" /> has{" "}
            {fmt(Number(profile.wildType.Input))} input reads. The median
            variant has {fmt(profile.inputCount.median)}. Some have one. Some
            have none.
          </p>
          <p>
            This matters because fitness is a ratio. A variant with 4 input
            reads and 8 selected reads has the same ratio as one with 4,000 and
            8,000. The two numbers are not equally believable, and nothing in
            the ratio itself tells you which is which.
          </p>
        </Prose>

        <StatGrid>
          <Stat value={fmt(profile.inputCount.min)} label="Fewest input reads" tone="bad" />
          <Stat value={fmt(profile.inputCount.median)} label="Median input reads" />
          <Stat value={fmt(profile.inputCount.p75)} label="75th percentile" />
          <Stat value={fmt(profile.inputCount.max)} label="Most input reads" hint="the wild type" />
        </StatGrid>
      </Section>

      <Section title="Problem four: the samples are different sizes">
        <Prose>
          <p>
            The four sequencing samples do not have the same total number of
            reads. The input library has{" "}
            {fmt(profile.libraryTotals.Input)} reads in total; the selected
            samples have between {fmt(Math.min(
              profile.libraryTotals.IGG10,
              profile.libraryTotals.IGG20,
              profile.libraryTotals.IGG90,
            ))}{" "}
            and {fmt(Math.max(
              profile.libraryTotals.IGG10,
              profile.libraryTotals.IGG20,
              profile.libraryTotals.IGG90,
            ))}.
          </p>
          <p>
            So a raw count cannot be compared across columns. 100 reads out of
            89 million is not the same share as 100 reads out of 45 million.
            Every count has to be turned into a proportion before anything is
            compared. Chapter 4 does this by dividing through by the wild type,
            which is in every sample.
          </p>
        </Prose>
      </Section>

      <Section
        title="Look at the real rows"
        lead="These are genuine rows from the file, chosen so that each problem is visible. Filter by the kind of problem."
      >
        <Figure
          title="A sample of the raw file"
          subtitle={`${sample.length} real rows. ✗ marks a stop codon.`}
          caption={
            <>
              Every row here came out of the file unchanged. Notice that the{" "}
              <strong>dropout</strong> rows have plenty of input reads and zero
              after selection — those are real measurements of failure. The{" "}
              <strong>zero input</strong> rows are the opposite: they have
              selected reads but no input reads, which should be impossible and
              is the signature of a sequencing or assignment error.
            </>
          }
          source="Wu et al. 2016, eLife 5:e16965, result/Mutcount"
        >
          <RawTable rows={sample} />
        </Figure>
      </Section>

      <Section title="The four problems, counted">
        <div className="my-6 space-y-2">
          {[stops, zeroInput, lowInput, dropout].map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            >
              <span className="tabular text-[18px] font-semibold text-[var(--ink)]">
                {fmt(p.count)}
              </span>
              <span className="text-[13px] font-medium text-[var(--ink)]">
                {p.label}
              </span>
              <span className="tabular text-[12px] text-[var(--ink-muted)]">
                {p.pct}% of rows
              </span>
              <span className="w-full text-[13px] leading-6 text-[var(--ink-secondary)]">
                {p.why}
              </span>
            </div>
          ))}
        </div>

        <Callout kind="warning" title="None of this is an error in the data">
          <p>
            Every one of these is the normal output of a working experiment.
            Degenerate codons make stop codons. Libraries are uneven. Sequencers
            miss things. The job is not to find the clean version of this file.
            There is no clean version. The job is to decide what to do about
            each problem and to say what you decided.
          </p>
        </Callout>
      </Section>
    </ChapterFrame>
  );
}
