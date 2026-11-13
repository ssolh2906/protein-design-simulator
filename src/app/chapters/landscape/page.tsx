import { ChapterFrame } from "@/components/ChapterFrame";
import {
  Callout,
  DataTable,
  Figure,
  Prose,
  Section,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { Heatmap } from "@/components/charts/Heatmap";
import { Histogram } from "@/components/charts/Histogram";
import { getSingles, getLandscape, fmt } from "@/lib/data";

export const metadata = { title: "Reading the landscape" };

export default function Page() {
  const { singles, heatmap, aaOrder } = getSingles();
  const landscape = getLandscape();

  const best = singles.slice(0, 8);
  const worst = singles.slice(-6).reverse();
  const beneficialSingles = singles.filter((s) => s.fitness > 1);

  // Which of the four positions tolerates change best?
  const byPosition = heatmap.map((row) => {
    const measured = row.cells.filter((c) => !c.isWt && c.fitness !== null);
    const tolerated = measured.filter((c) => (c.fitness ?? 0) > 0.1).length;
    return {
      position: row.position,
      wt: row.wt,
      measured: measured.length,
      tolerated,
      pct: Math.round((100 * tolerated) / Math.max(measured.length, 1)),
    };
  });

  return (
    <ChapterFrame slug="landscape">
      <Prose>
        <p>
          The data is clean, the caveats are known. Now you can do biology.
        </p>
        <p>
          A fitness landscape is just the map from sequence to function. With
          four positions and 20 amino acids each, this one is small enough to
          have been measured almost completely — which is rare, and the reason
          this dataset is a teaching standard.
        </p>
      </Prose>

      <Section
        title="Start with single mutants"
        lead="Change one position, leave the other three as the wild type. There are 76 of these, and they are the foundation for everything that follows."
      >
        <Figure
          title="Single-mutant fitness at each randomised position"
          subtitle="Medium IgG. Colour is fitness relative to the wild type; the wild-type residue is outlined."
          caption={
            <>
              The colour scale is <strong>diverging</strong>, centred on the
              wild type, because the question for every cell is better or worse
              than what we started with. Red is worse, blue is better, grey is
              about the same. Hover any cell for its fitness and read depth.
            </>
          }
          source="Hatched cells were never measured at sufficient depth."
        >
          <Heatmap rows={heatmap} aaOrder={aaOrder} />
        </Figure>

        <Callout kind="key" title="Two rows tell the whole story">
          <p>
            <strong>G41 is almost entirely red.</strong> Only 3 of 19
            substitutions keep any function. Glycine sits where the backbone
            has to bend sharply, and glycine is the only residue with no side
            chain to get in the way. This position is not available to you.
          </p>
          <p>
            <strong>D40 is mostly blue.</strong> All 19 substitutions are
            tolerated and <strong>12 of them beat the wild type</strong>. The
            best are the large aromatics: D40Y at {singles.find((s) => s.label === "D40Y")?.fitness.toFixed(2) ?? "3.76"}x,
            D40W at {singles.find((s) => s.label === "D40W")?.fitness.toFixed(2) ?? "3.51"}x, D40F at{" "}
            {singles.find((s) => s.label === "D40F")?.fitness.toFixed(2) ?? "3.33"}x. Evolution
            left a charged aspartate in a spot where a big flat ring binds IgG
            far better.
          </p>
          <p>
            That is the useful output of a heatmap: it tells you which
            positions are locked and which are open before you spend anything.
          </p>
        </Callout>

        <Figure
          title="How tolerant is each position?"
          subtitle="Share of amino-acid substitutions that keep fitness above 0.1"
        >
          <DataTable
            caption="Tolerance of each randomised position to substitution"
            rows={byPosition}
            columns={[
              {
                key: "pos",
                header: "Position",
                render: (p) => (
                  <span className="font-mono font-medium text-[var(--ink)]">
                    {p.wt}
                    {p.position}
                  </span>
                ),
              },
              {
                key: "tol",
                header: "Substitutions tolerated",
                align: "right",
                render: (p) => `${p.tolerated} of ${p.measured}`,
              },
              {
                key: "bar",
                header: "",
                render: (p) => (
                  <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-[var(--grid)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${p.pct}%`,
                        background:
                          p.pct > 40
                            ? "var(--series-3)"
                            : p.pct > 20
                              ? "var(--serious)"
                              : "var(--critical)",
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "pct",
                header: "",
                align: "right",
                render: (p) => (
                  <span className="font-medium text-[var(--ink)]">
                    {p.pct}%
                  </span>
                ),
              },
            ]}
          />
        </Figure>
      </Section>

      <Section title="The best and worst single changes">
        <div className="my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            <div className="px-4 pt-3 pb-2 text-[12px] font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
              Best single mutants
            </div>
            <DataTable
              dense
              caption="Highest-fitness single mutants"
              rows={best}
              columns={[
                {
                  key: "l",
                  header: "Mutation",
                  render: (s) => (
                    <span className="font-mono font-medium text-[var(--ink)]">
                      {s.label}
                    </span>
                  ),
                },
                {
                  key: "f",
                  header: "Fitness",
                  align: "right",
                  render: (s) => (
                    <span
                      style={{
                        color:
                          s.fitness > 1
                            ? "var(--success-text)"
                            : "var(--ink-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {s.fitness.toFixed(2)}
                    </span>
                  ),
                },
                {
                  key: "n",
                  header: "Reads",
                  align: "right",
                  render: (s) => fmt(s.input),
                },
              ]}
            />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            <div className="px-4 pt-3 pb-2 text-[12px] font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
              Worst single mutants
            </div>
            <DataTable
              dense
              caption="Lowest-fitness single mutants"
              rows={worst}
              columns={[
                {
                  key: "l",
                  header: "Mutation",
                  render: (s) => (
                    <span className="font-mono font-medium text-[var(--ink)]">
                      {s.label}
                    </span>
                  ),
                },
                {
                  key: "f",
                  header: "Fitness",
                  align: "right",
                  render: (s) => (
                    <span style={{ color: "var(--critical)", fontWeight: 500 }}>
                      {s.fitness.toFixed(4)}
                    </span>
                  ),
                },
                {
                  key: "n",
                  header: "Reads",
                  align: "right",
                  render: (s) => fmt(s.input),
                },
              ]}
            />
          </div>
        </div>

        <StatGrid>
          <Stat value={String(singles.length)} label="Single mutants measured" />
          <Stat
            value={String(beneficialSingles.length)}
            label="That beat the wild type"
            tone="good"
            hint="one change is rarely enough"
          />
          <Stat
            value={best[0].fitness.toFixed(2)}
            label="Best single mutant"
            hint={best[0].label}
          />
          <Stat
            value={landscape.top[0].fitness.toFixed(1)}
            label="Best variant overall"
            tone="good"
            hint={`${landscape.top[0].mut}, ${landscape.top[0].hd} changes`}
          />
        </StatGrid>

        <Callout kind="trap" title="The gap that makes protein design hard">
          <p>
            The best <em>single</em> mutation gives{" "}
            {best[0].fitness.toFixed(2)}x. The best variant overall gives{" "}
            {landscape.top[0].fitness.toFixed(1)}x, and it has{" "}
            {landscape.top[0].hd} mutations. You cannot reach the second by
            collecting the first.
          </p>
          <p>
            That gap is called epistasis, and it is chapter 8.
          </p>
        </Callout>
      </Section>

      <Section
        title="The shape of the whole landscape"
        lead="All 149,361 measured variants at once."
      >
        <Figure
          title="Distribution of fitness across the library"
          subtitle="Log scale, wild type marked"
          caption={
            <>
              Two features matter. The enormous spike on the left is dead
              protein — {landscape.effectivelyDeadPct}% of the library. The
              thin tail on the right of the wild-type line is the entire
              useful output of the experiment:{" "}
              {fmt(landscape.betterThanWt)} variants,{" "}
              {landscape.betterThanWtPct}% of what was measured.
            </>
          }
        >
          <Histogram
            bins={landscape.histogram}
            markAt={0}
            markLabel="wild type"
            xLabel="fitness (log scale)"
            height={240}
          />
        </Figure>

        <Prose>
          <p>
            This shape is typical, and it is worth internalising before you
            design your own library. Randomising four neighbouring positions
            does not give you a gentle spread of outcomes around the starting
            point. It gives you mostly rubble, with a few peaks.
          </p>
        </Prose>
      </Section>

      <Section title="The peaks">
        <Figure
          title="The 20 best variants in the library"
          subtitle="Medium IgG, ranked by fitness"
          caption={
            <>
              Nearly all of them carry changes at all four positions. Several
              share a pattern — a large aromatic residue at 39 and 40, a small
              one at 41 and 54 — which is a real structural signal rather than
              a coincidence. Read depth is shown because, as chapter 5 warned,
              the top of a sorted list is where thin data hides.
            </>
          }
        >
          <DataTable
            dense
            caption="Top 20 variants by fitness, with read depth"
            rows={landscape.top}
            columns={[
              {
                key: "mut",
                header: "Variant",
                render: (t) => <Variant seq={t.mut} />,
              },
              {
                key: "hd",
                header: "Changes",
                align: "right",
                render: (t) => String(t.hd),
              },
              {
                key: "f",
                header: "Fitness",
                align: "right",
                render: (t) => (
                  <span style={{ color: "var(--success-text)", fontWeight: 500 }}>
                    {t.fitness.toFixed(2)}x
                  </span>
                ),
              },
              {
                key: "n",
                header: "Input reads",
                align: "right",
                render: (t) => (
                  <span
                    style={{
                      color:
                        t.input < 50 ? "var(--serious)" : "var(--ink-secondary)",
                    }}
                  >
                    {fmt(t.input)}
                  </span>
                ),
              },
            ]}
          />
        </Figure>
      </Section>
    </ChapterFrame>
  );
}
