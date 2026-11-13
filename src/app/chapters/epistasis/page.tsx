import { ChapterFrame } from "@/components/ChapterFrame";
import {
  Callout,
  DataTable,
  Figure,
  Formula,
  Prose,
  Section,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { ScatterPlot } from "@/components/charts/ScatterPlot";
import { getEpistasis, getSingles, fmt } from "@/lib/data";

export const metadata = { title: "Epistasis" };

export default function Page() {
  const epi = getEpistasis();
  const { singles } = getSingles();
  const byLabel = new Map(singles.map((s) => [s.label, s]));

  // The strongest case of positive epistasis in the dataset, taken straight
  // from the data rather than chosen by hand.
  const star = epi.positive[0];
  const [labelA, labelB] = star.label.split(" + ");
  const a = byLabel.get(labelA);
  const b = byLabel.get(labelB);

  const dead = epi.negative.filter((p) => p.observed === 0).length;

  return (
    <ChapterFrame slug="epistasis">
      <Prose>
        <p>
          Chapter 7 ended on a gap. The best single mutation gives about 3.8x.
          The best variant in the library gives 8.8x and carries four changes.
          Something happens when mutations are combined that you cannot see by
          looking at them one at a time.
        </p>
        <p>That something is epistasis, and this dataset shows it at its most extreme.</p>
      </Prose>

      <Section title="The null model">
        <Prose>
          <p>
            Start with the simplest guess. If two mutations do not interact,
            each should multiply fitness by its own factor, independently. A
            mutation that halves binding and a mutation that doubles it should
            cancel out.
          </p>
        </Prose>

        <Formula>
          expected(AB) = fitness(A) × fitness(B)
        </Formula>

        <Prose>
          <p>
            Compare that expectation with what was actually measured. If the
            two agree, the mutations are independent. If they disagree, they
            interact — and the size of the disagreement is the size of the
            interaction.
          </p>
        </Prose>
      </Section>

      <Section
        title="The case that breaks the model"
        lead={`The strongest interaction in the library, and it is not subtle.`}
      >
        <Figure
          title={`${labelA} and ${labelB}: two dead mutations that rescue each other`}
          subtitle="Each box is a real variant with its measured fitness at medium IgG"
          caption={
            <>
              Read the two single mutants first. Both are{" "}
              <strong>dead</strong> — around 2% and 3% of wild-type binding.
              Either one on its own destroys the protein. Put them together and
              the result is{" "}
              <strong>{star.observed.toFixed(2)}x the wild type</strong>. The
              multiplicative model predicted {star.expected.toFixed(4)}. It was
              wrong by a factor of {fmt(Math.round(star.ratio))}.
            </>
          }
          source={`${fmt(star.input)} input reads, so this is not a thin-data artefact.`}
        >
          <div className="mx-auto max-w-lg">
            <div className="grid grid-cols-2 gap-3">
              <Corner
                seq="VDGV"
                caption="wild type"
                fitness={1.0}
                tone="mid"
              />
              <Corner
                seq={a ? a.mut : "WDGV"}
                caption={labelA}
                fitness={a?.fitness ?? 0}
                tone="bad"
              />
              <Corner
                seq={b ? b.mut : "VDLV"}
                caption={labelB}
                fitness={b?.fitness ?? 0}
                tone="bad"
              />
              <Corner
                seq={star.mut}
                caption="both mutations"
                fitness={star.observed}
                tone="good"
              />
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--page)] px-4 py-3.5 font-mono text-[13px]">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--ink-secondary)]">
                  expected = {a?.fitness.toFixed(4)} × {b?.fitness.toFixed(4)}
                </span>
                <span className="tabular font-medium text-[var(--critical)]">
                  {star.expected.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--ink-secondary)]">observed</span>
                <span className="tabular font-medium text-[var(--success-text)]">
                  {star.observed.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t border-[var(--border)] pt-2">
                <span className="text-[var(--ink)]">wrong by</span>
                <span className="tabular font-semibold text-[var(--ink)]">
                  {fmt(Math.round(star.ratio))}x
                </span>
              </div>
            </div>
          </div>
        </Figure>

        <Callout kind="key" title="Why this is the important case">
          <p>
            This is <strong>sign epistasis</strong>: the effect of a mutation
            changes sign depending on what else is present.{" "}
            {labelA} is lethal in the wild-type background and beneficial in
            the {labelB} background.
          </p>
          <p>
            No model fitted to single mutants can predict this variant. Measure
            all 76 single mutants perfectly and this combination still looks
            like the worst idea in the library.
          </p>
        </Callout>
      </Section>

      <Section
        title="Why a greedy search gets stuck"
        lead="This is not a curiosity. It is the central practical problem in protein engineering."
      >
        <Prose>
          <p>
            The obvious way to improve a protein is to take one step at a time:
            try every single mutation, keep the best, then try every mutation
            on top of that, and so on. Each step must improve on the last.
          </p>
          <p>
            That strategy can never reach <Variant seq={star.mut} />. To get
            there from the wild type you must pass through{" "}
            <Variant seq={a?.mut ?? "WDGV"} /> or{" "}
            <Variant seq={b?.mut ?? "VDLV"} />, and both of those are dead
            ends. The path to the peak runs downhill first.
          </p>
          <p>
            This is exactly the finding the original paper was written about.
            Its title is{" "}
            <em>
              &ldquo;Adaptation in protein fitness landscapes is facilitated by
              indirect paths&rdquo;
            </em>
            . The indirect paths are routes like this one, which go through
            variants that look like failures.
          </p>
        </Prose>

        <Callout kind="trap" title="What this means for your own screens">
          <p>
            If you run one round of single mutants, pick the winners, and
            combine only those, you will systematically miss the best variants
            in your library. The winners of round one are not the building
            blocks of the best variant of round three.
          </p>
          <p>
            This is the argument for combinatorial libraries over stepwise
            optimisation, and the argument for models that can represent
            interactions rather than adding up single-mutant effects.
          </p>
        </Callout>
      </Section>

      <Section
        title="How common is this?"
        lead={`All ${fmt(epi.n)} well-measured double mutants, expectation against measurement.`}
      >
        <Figure
          title="Predicted fitness against measured fitness for double mutants"
          subtitle="Both axes log10. The dashed line is where a non-interacting model would be right."
          caption={
            <>
              If mutations were independent, every point would sit on the
              dashed line. They do not. Points above the line do better than
              predicted; points below do worse. The spread is the honest
              picture of how far an additive model is from the truth, and it
              is wide in both directions.
            </>
          }
        >
          <ScatterPlot
            points={epi.scatter.map((p) => ({ x: p.x, y: p.y }))}
            xLabel="log10 expected fitness (singles multiplied)"
            yLabel="log10 measured fitness"
            diagonal
            height={400}
            pointRadius={1.8}
          />
        </Figure>

        <StatGrid>
          <Stat value={fmt(epi.n)} label="Double mutants analysed" hint="100+ reads" />
          <Stat
            value={fmt(Math.round(star.ratio))}
            label="Largest underestimate"
            tone="good"
            hint={star.label}
          />
          <Stat
            value={String(dead)}
            label="Predicted alive, measured dead"
            tone="bad"
            hint="of the 12 worst cases"
          />
          <Stat value="2" label="Positions involved" hint="in every pair here" />
        </StatGrid>
      </Section>

      <Section title="Both directions matter">
        <div className="my-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            <div className="px-4 pt-3 pb-1 text-[12px] font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
              Better than predicted
            </div>
            <p className="px-4 pb-2 text-[12px] leading-5 text-[var(--ink-secondary)]">
              Mutations that rescue each other.
            </p>
            <DataTable
              dense
              caption="Double mutants with the strongest positive epistasis"
              rows={epi.positive.slice(0, 7)}
              columns={[
                {
                  key: "l",
                  header: "Pair",
                  render: (p) => (
                    <span className="font-mono text-[12px] text-[var(--ink)]">
                      {p.label}
                    </span>
                  ),
                },
                {
                  key: "e",
                  header: "Expected",
                  align: "right",
                  render: (p) => p.expected.toFixed(4),
                },
                {
                  key: "o",
                  header: "Measured",
                  align: "right",
                  render: (p) => (
                    <span
                      style={{ color: "var(--success-text)", fontWeight: 500 }}
                    >
                      {p.observed.toFixed(2)}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            <div className="px-4 pt-3 pb-1 text-[12px] font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
              Worse than predicted
            </div>
            <p className="px-4 pb-2 text-[12px] leading-5 text-[var(--ink-secondary)]">
              Mutations that are only tolerable alone.
            </p>
            <DataTable
              dense
              caption="Double mutants with the strongest negative epistasis"
              rows={epi.negative.slice(0, 7)}
              columns={[
                {
                  key: "l",
                  header: "Pair",
                  render: (p) => (
                    <span className="font-mono text-[12px] text-[var(--ink)]">
                      {p.label}
                    </span>
                  ),
                },
                {
                  key: "e",
                  header: "Expected",
                  align: "right",
                  render: (p) => p.expected.toFixed(4),
                },
                {
                  key: "o",
                  header: "Measured",
                  align: "right",
                  render: (p) => (
                    <span style={{ color: "var(--critical)", fontWeight: 500 }}>
                      {p.observed.toFixed(4)}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>

        <Prose>
          <p>
            Notice that <strong>G41</strong> appears on both lists. A position
            that is almost completely intolerant on its own is also the
            position involved in the largest rescues and the largest collapses.
            Rigid positions are where interactions live.
          </p>
        </Prose>
      </Section>
    </ChapterFrame>
  );
}

function Corner({
  seq,
  caption,
  fitness,
  tone,
}: {
  seq: string;
  caption: string;
  fitness: number;
  tone: "good" | "bad" | "mid";
}) {
  const color =
    tone === "good"
      ? "var(--success-text)"
      : tone === "bad"
        ? "var(--critical)"
        : "var(--ink-secondary)";
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
      <div className="font-mono text-[15px] tracking-[0.12em] text-[var(--ink)]">
        {seq}
      </div>
      <div
        className="tabular mt-1.5 text-[22px] leading-none font-semibold"
        style={{ color }}
      >
        {fitness >= 1 ? `${fitness.toFixed(2)}x` : fitness.toFixed(4)}
      </div>
      <div className="mt-1.5 text-[11px] text-[var(--ink-muted)]">{caption}</div>
    </div>
  );
}
