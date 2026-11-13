import {
  Callout,
  DataTable,
  Figure,
  Mono,
  Prose,
  Section,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { BarChart } from "@/components/charts/BarChart";
import { DEPTH_RAMP } from "@/lib/palette";
import { getRawProfile, getMeta, fmt } from "@/lib/data";

export function TheExperimentEn() {
  const profile = getRawProfile();
  const meta = getMeta();
  const wt = profile.wildType;

  return (
    <>
      <Prose>
        <p>
          Before you touch a single number, you need to know what the numbers
          are. An analysis of an assay you do not understand is guesswork with
          extra steps.
        </p>
      </Prose>

      <Section title="The protein">
        <Prose>
          <p>
            <strong>GB1</strong> is the B1 domain of protein G, from{" "}
            <em>Streptococcus</em>. It is small — 56 amino acids — it folds on
            its own, and it binds to the constant region of antibodies
            (IgG). Those three properties make it one of the most studied
            proteins in biophysics. It is small enough to test exhaustively and
            stable enough to survive being mutated.
          </p>
          <p>
            Binding to IgG is the <strong>function</strong> here. When this
            walkthrough says a variant is &ldquo;better&rdquo;, it means it
            bound IgG more tightly than the original protein did. It does not
            mean the protein is better in any other sense.
          </p>
        </Prose>
      </Section>

      <Section title="The four positions">
        <Prose>
          <p>
            The authors did not mutate all 56 residues. They picked{" "}
            <strong>four</strong>: V39, D40, G41 and V54. These four sit next
            to each other in the folded structure, even though V54 is far away
            in the sequence. Side chains that touch each other are the ones
            most likely to interact, so this is where interesting combined
            effects should appear.
          </p>
          <p>
            Each position was randomised to all 20 amino acids. That gives
            20 × 20 × 20 × 20 ={" "}
            <strong>{fmt(profile.designedSpace)}</strong> designed variants.
          </p>
        </Prose>

        <Callout kind="note" title="How a variant is written">
          <p>
            Every variant in this dataset is four letters, one per randomised
            position, in the order 39, 40, 41, 54. The original protein has
            valine, aspartate, glycine and valine at those positions, so the
            wild type is <Variant seq="VDGV" />.
          </p>
          <p>
            <Variant seq="WDGV" /> is V39W: one change. <Variant seq="WWLG" />{" "}
            differs at all four. A <Mono>_</Mono> in the string means a stop
            codon, which you will meet in chapter 2.
          </p>
        </Callout>
      </Section>

      <Section
        title="The assay"
        lead="The whole library is tested at once, and sequencing counts who survived."
      >
        <Prose>
          <p>
            This is a <strong>selection</strong>, not 160,000 separate
            experiments. The steps are:
          </p>
        </Prose>

        <ol className="my-6 max-w-2xl space-y-3">
          {[
            {
              n: 1,
              t: "Build the library",
              d: "Synthesise DNA with all four positions randomised. Every variant is present, but not in equal amounts — this unevenness matters later.",
            },
            {
              n: 2,
              t: "Sequence the input",
              d: "Count how many reads each variant has before any selection. This is the Input column.",
            },
            {
              n: 3,
              t: "Select for binding",
              d: "Display the proteins and pull down the ones that stick to IgG. Variants that bind well are enriched; variants that do not are washed away.",
            },
            {
              n: 4,
              t: "Sequence again",
              d: "Count each variant after selection. Three IgG concentrations were used, giving three selected columns.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            >
              <span className="tabular mt-0.5 w-4 shrink-0 text-[13px] font-semibold text-[var(--series-1)]">
                {s.n}
              </span>
              <span>
                <span className="block text-[14px] font-medium text-[var(--ink)]">
                  {s.t}
                </span>
                <span className="mt-1 block text-[13.5px] leading-6 text-[var(--ink-secondary)]">
                  {s.d}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <Callout kind="key" title="The core idea">
          <p>
            A variant that binds well goes <em>up</em> in frequency from input
            to selected. A variant that binds badly goes <em>down</em>. The
            whole analysis is built on comparing two read counts for the same
            variant.
          </p>
        </Callout>
      </Section>

      <Section title="The three selection conditions">
        <Prose>
          <p>
            The same library was selected against three concentrations of IgG.
            Low concentration is the hard test: only the best binders are
            captured, so differences between them are large. High concentration
            is easy: almost anything that binds at all gets captured, so
            differences shrink.
          </p>
          <p>
            Treat these as three views of the same library, not as three
            repeats of the same measurement. Chapter 6 shows how much the
            choice changes the answer.
          </p>
        </Prose>

        <Figure
          title="Columns in the raw file"
          subtitle="What each column holds, and the wild-type values"
        >
          <DataTable
            caption="Column descriptions with wild-type read counts"
            rows={[
              {
                col: "mut",
                what: "The four-letter variant",
                wt: String(wt.mut),
              },
              {
                col: "HD",
                what: "Hamming distance: how many of the 4 sites differ from VDGV",
                wt: "0",
              },
              {
                col: "Input",
                what: "Reads before selection",
                wt: fmt(Number(wt.Input)),
              },
              {
                col: "IGG10",
                what: "Reads after selection, low IgG (most stringent)",
                wt: fmt(Number(wt.IGG10)),
              },
              {
                col: "IGG20",
                what: "Reads after selection, medium IgG",
                wt: fmt(Number(wt.IGG20)),
              },
              {
                col: "IGG90",
                what: "Reads after selection, high IgG (least stringent)",
                wt: fmt(Number(wt.IGG90)),
              },
            ]}
            columns={[
              {
                key: "col",
                header: "Column",
                width: "22%",
                render: (r) => (
                  <span className="font-mono font-medium text-[var(--ink)]">
                    {r.col}
                  </span>
                ),
              },
              { key: "what", header: "Meaning", render: (r) => r.what },
              {
                key: "wt",
                header: "Wild type",
                align: "right",
                width: "18%",
                render: (r) => r.wt,
              },
            ]}
          />
        </Figure>
      </Section>

      <Section
        title="How much of the space was actually seen"
        lead="The library was designed to contain every variant. Sequencing found most of them, but not all, and not evenly."
      >
        <Figure
          title="Variants observed, by number of mutations"
          subtitle="Against the number that exist at each Hamming distance from the wild type"
          caption={
            <>
              Coverage is close to complete at every distance. The gap is small
              in percentage terms but it is not zero, and the variants that are
              missing are not missing at random — chapter 3 returns to this.
            </>
          }
        >
          <BarChart
            labelWidth={116}
            unit="%"
            max={100}
            bars={profile.hammingDistribution
              .filter((h) => h.hd > 0)
              .map((h, i) => ({
                label: `${h.hd} mutation${h.hd > 1 ? "s" : ""}`,
                value: Number(((100 * h.observed) / h.possible).toFixed(1)),
                valueLabel: `${((100 * h.observed) / h.possible).toFixed(1)}%`,
                color: DEPTH_RAMP[i + 1],
                detail: [
                  { label: "observed", value: fmt(h.observed) },
                  { label: "possible", value: fmt(h.possible) },
                ],
              }))}
          />
        </Figure>

        <StatGrid>
          <Stat
            value={fmt(profile.designedSpace)}
            label="Variants designed"
            hint="20 to the power of 4"
          />
          <Stat
            value={fmt(profile.rowsInFile)}
            label="Rows in the file"
            hint="more than designed"
          />
          <Stat
            value={fmt(profile.neverObserved)}
            label="Never sequenced"
            tone="warn"
            hint={`${profile.neverObservedPct}% of the design`}
          />
          <Stat
            value={`${profile.depthImbalance.ratio}x`}
            label="Deepest vs shallowest sample"
            hint="read totals differ"
          />
        </StatGrid>

        <Callout kind="trap" title="More rows than variants">
          <p>
            The file has {fmt(profile.rowsInFile)} rows but only{" "}
            {fmt(profile.designedSpace)} variants were designed. That is not a
            mistake in your reading of the file. Chapter 2 opens the file and
            finds out why.
          </p>
        </Callout>
      </Section>

      <Section title="Source">
        <Prose>
          <p>
            {meta.source.paper}. The read counts used here come from the
            authors&apos; own analysis repository, reused under{" "}
            {meta.source.licence}.
          </p>
        </Prose>
      </Section>
    </>
  );
}
