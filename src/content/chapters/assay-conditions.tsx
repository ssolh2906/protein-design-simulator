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
import { BarChart } from "@/components/charts/BarChart";
import { Legend } from "@/components/charts/primitives";
import { getConditions, fmt } from "@/lib/data";
import { SERIES } from "@/lib/palette";

const LABEL: Record<string, string> = {
  IGG10: "Low IgG",
  IGG20: "Medium IgG",
  IGG90: "High IgG",
};



export function AssayConditionsEn() {
  const cond = getConditions();
  const low = cond.spread.find((s) => s.condition === "IGG10")!;
  const mid = cond.spread.find((s) => s.condition === "IGG20")!;
  const high = cond.spread.find((s) => s.condition === "IGG90")!;
  const top = cond.examples[0];

  return (
    <>
      <Prose>
        <p>
          Chapter 5 used the three IgG conditions to check reproducibility and
          found that they mostly agree. This chapter looks at the same three
          conditions and asks a different question: do they give the{" "}
          <em>same number</em>?
        </p>
        <p>They do not. They are not close.</p>
      </Prose>

      <Section
        title="One variant, three answers"
        lead={`${String(top.mut)} is the strongest binder in the library. Here is its fitness in each condition.`}
      >
        <div className="my-6 grid gap-3 sm:grid-cols-3">
          {(["IGG10", "IGG20", "IGG90"] as const).map((k, i) => (
            <div
              key={k}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            >
              <div className="text-[12px] font-medium text-[var(--ink-secondary)]">
                {LABEL[k]}
              </div>
              <div
                className="mt-1.5 text-[30px] leading-none font-semibold tracking-tight"
                style={{ color: SERIES[i] }}
              >
                {Number(top[k]).toFixed(1)}x
              </div>
              <div className="mt-1.5 text-[11px] text-[var(--ink-muted)]">
                better than wild type
              </div>
            </div>
          ))}
        </div>

        <Prose>
          <p>
            Same protein. Same library. Same sequencing run. Same formula. The
            answer ranges from{" "}
            <strong>{Number(top.IGG90).toFixed(1)}x</strong> to{" "}
            <strong>{Number(top.IGG10).toFixed(1)}x</strong> depending only on
            how much IgG was in the tube.
          </p>
          <p>
            If somebody tells you this variant is &ldquo;
            {Number(top.IGG10).toFixed(0)} times better than wild type&rdquo;,
            they have not told you enough to reproduce the claim.
          </p>
        </Prose>
      </Section>

      <Section title="Why the conditions differ">
        <Prose>
          <p>
            IgG concentration sets how hard the test is.
          </p>
          <p>
            <strong>At low IgG</strong> there is not much target to bind. Only
            the tightest binders get captured. Small differences in binding
            strength produce large differences in capture, so the strong
            variants spread far apart.
          </p>
          <p>
            <strong>At high IgG</strong> there is target everywhere. Almost
            anything that binds at all gets captured, including mediocre
            binders. The assay saturates and the strong variants are squashed
            together near the top.
          </p>
        </Prose>

        <Figure
          title="How far the top of the scale stretches"
          subtitle="Fitness of the best variant, and the 99th percentile, in each condition"
          caption={
            <>
              Low IgG spreads the winners across a range of{" "}
              {low.max.toFixed(0)}x. High IgG compresses the same variants into
              a range of {high.max.toFixed(1)}x. The ranking is largely
              preserved; the dynamic range is not.
            </>
          }
        >
          <BarChart
            labelWidth={96}
            unit="x"
            bars={cond.spread.map((s, i) => ({
              label: LABEL[s.condition],
              value: s.max,
              valueLabel: `${s.max.toFixed(1)}x`,
              color: SERIES[i],
              detail: [
                { label: "99th percentile", value: `${s.p99.toFixed(2)}x` },
                { label: "beat wild type", value: `${s.aboveWtPct}%` },
              ],
            }))}
          />
          <Legend
            items={cond.spread.map((s, i) => ({
              label: LABEL[s.condition],
              color: SERIES[i],
            }))}
          />
        </Figure>

        <StatGrid>
          <Stat
            value={`${low.max.toFixed(0)}x`}
            label="Best variant, low IgG"
            hint="stringent, wide range"
          />
          <Stat value={`${mid.max.toFixed(1)}x`} label="Best variant, medium IgG" />
          <Stat
            value={`${high.max.toFixed(1)}x`}
            label="Best variant, high IgG"
            hint="saturated, narrow range"
          />
          <Stat
            value={`${(low.max / high.max).toFixed(1)}x`}
            label="Difference in stretch"
            tone="warn"
            hint="low vs high"
          />
        </StatGrid>
      </Section>

      <Section
        title="The ranking mostly survives"
        lead={`Across the ${fmt(cond.deepN)} variants with at least 200 input reads, the conditions agree well on order even while disagreeing on magnitude.`}
      >
        <Figure
          title="Agreement between pairs of conditions"
          subtitle="Correlation of log fitness, deeply sequenced variants only"
          caption={
            <>
              Neighbouring conditions agree best. The two extremes, low against
              high, agree least — they are the most different tests. Note this
              is the same quantity that chapter 5 used as a reproducibility
              check, which is a reminder that
              &ldquo;reproducible&rdquo; always means
              &ldquo;reproducible under these conditions&rdquo;.
            </>
          }
        >
          <BarChart
            labelWidth={128}
            max={1}
            bars={cond.agreement.map((a, i) => ({
              label: a.pair
                .replace("IGG10", "low")
                .replace("IGG20", "medium")
                .replace("IGG90", "high"),
              value: a.r,
              valueLabel: a.r.toFixed(3),
              color: ["var(--depth-5)", "var(--depth-4)", "var(--depth-2)"][i],
            }))}
          />
        </Figure>

        <Callout kind="key" title="Rank is portable, magnitude is not">
          <p>
            This is the practical rule. If your question is{" "}
            <em>which variants should I make?</em>, the ranking is what you
            need, and it holds up across conditions. If your question is{" "}
            <em>how much better is this variant?</em>, the number belongs to
            the condition it was measured in and does not transfer.
          </p>
        </Callout>
      </Section>

      <Section
        title="The top variants, side by side"
        lead="The strongest binders in the library, scored three ways."
      >
        <Figure
          title="Fitness of the top 12 variants in all three conditions"
          subtitle="Ranked by medium IgG"
          caption={
            <>
              Read across any row and the three numbers fall steeply. Read down
              the columns and the order barely changes. That is the whole
              lesson of this chapter in one table.
            </>
          }
        >
          <DataTable
            dense
            caption="Top variants with fitness in each IgG condition"
            rows={cond.examples}
            columns={[
              {
                key: "mut",
                header: "Variant",
                render: (r) => <Variant seq={String(r.mut)} />,
              },
              {
                key: "input",
                header: "Input reads",
                align: "right",
                render: (r) => fmt(Number(r.input)),
              },
              {
                key: "l",
                header: "Low IgG",
                align: "right",
                render: (r) => (
                  <span style={{ color: SERIES[0], fontWeight: 500 }}>
                    {Number(r.IGG10).toFixed(1)}x
                  </span>
                ),
              },
              {
                key: "m",
                header: "Medium",
                align: "right",
                render: (r) => (
                  <span style={{ color: SERIES[1], fontWeight: 500 }}>
                    {Number(r.IGG20).toFixed(1)}x
                  </span>
                ),
              },
              {
                key: "h",
                header: "High IgG",
                align: "right",
                render: (r) => (
                  <span style={{ color: SERIES[2], fontWeight: 500 }}>
                    {Number(r.IGG90).toFixed(1)}x
                  </span>
                ),
              },
            ]}
          />
        </Figure>
      </Section>

      <Section title="What to write in the methods">
        <Prose>
          <p>
            A fitness value is meaningless on its own. When you report one,
            report the assay with it: what was selected for, at what
            concentration, for how long, and what the fitness is relative to.
          </p>
          <p>
            The rest of this walkthrough uses{" "}
            <strong>medium IgG</strong> as the working condition, because it
            sits between the stringent and saturated extremes. That is a
            choice, and now you know what choosing it does.
          </p>
        </Prose>
      </Section>
    </>
  );
}
