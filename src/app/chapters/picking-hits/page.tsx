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
import { getWinnersCurse, getLandscape, getConditions, fmt } from "@/lib/data";

export const metadata = { title: "Picking what to order" };

export default function Page() {
  const curse = getWinnersCurse();
  const landscape = getLandscape();
  const cond = getConditions();

  const top10 = curse.tiers[0];
  const top2000 = curse.tiers[curse.tiers.length - 1];
  const changed = 25 - curse.overlapOfTop25;

  return (
    <ChapterFrame slug="picking-hits">
      <Prose>
        <p>
          You have {fmt(landscape.n)} variants with fitness values, and you
          know what each number can and cannot support. Now somebody has to
          decide which handful to actually make.
        </p>
        <p>
          This is the step where an analysis becomes a decision, and sorting a
          column is not a decision.
        </p>
      </Prose>

      <Section
        title="The naive answer"
        lead="Sort by fitness, take the top 25, order the DNA."
      >
        <Figure
          title="Top 25 variants by fitness at medium IgG"
          subtitle="With read depth, and the same variants scored in the other two conditions"
          caption={
            <>
              Mostly this list is fine, which is worth saying plainly — the
              strongest binders in this library really are strong, and they
              hold up across conditions. But look at the read counts.
            </>
          }
        >
          <DataTable
            dense
            caption="Highest-fitness variants with read depth and cross-condition values"
            rows={curse.naiveTop}
            columns={[
              {
                key: "mut",
                header: "Variant",
                render: (r) => <Variant seq={r.mut} />,
              },
              {
                key: "f",
                header: "Medium IgG",
                align: "right",
                render: (r) => (
                  <span
                    style={{ color: "var(--success-text)", fontWeight: 500 }}
                  >
                    {r.igg20.toFixed(2)}x
                  </span>
                ),
              },
              {
                key: "l",
                header: "Low IgG",
                align: "right",
                render: (r) => r.igg10.toFixed(1) + "x",
              },
              {
                key: "h",
                header: "High IgG",
                align: "right",
                render: (r) => r.igg90.toFixed(1) + "x",
              },
              {
                key: "n",
                header: "Input reads",
                align: "right",
                render: (r) => (
                  <span
                    style={{
                      color: r.input < 100 ? "var(--serious)" : "var(--ink-secondary)",
                      fontWeight: r.input < 100 ? 600 : 400,
                    }}
                  >
                    {fmt(r.input)}
                  </span>
                ),
              },
            ]}
          />
        </Figure>

        <Callout kind="note" title="An honest result, not a scandal">
          <p>
            It would make a better story to say the top of this list is junk.
            It is not. Every one of the top {top10.n} variants is confirmed
            above wild type in <strong>both</strong> other conditions, and the
            median read depth at the top of the list is actually{" "}
            <em>higher</em> than the library median ({fmt(top10.medianInput)}{" "}
            against {fmt(top10.medianInputAll)}).
          </p>
          <p>
            The problem is narrower and more practical than
            &ldquo;the top is noise&rdquo;.
          </p>
        </Callout>
      </Section>

      <Section
        title="Where the list does get soft"
        lead="Confidence is not uniform down the ranking."
      >
        <Figure
          title="How well does each slice of the ranking hold up?"
          subtitle="Share of variants confirmed above wild type in both other IgG conditions"
          caption={
            <>
              The very top is solid. By rank {fmt(top2000.n)}, roughly{" "}
              {(100 - top2000.confirmedPct).toFixed(0)}% of the list fails to
              confirm — {fmt(top2000.n - top2000.confirmedInBoth)} variants
              that a single-condition ranking would have handed you as hits.
            </>
          }
        >
          <DataTable
            caption="Confirmation rate and read depth by rank tier"
            rows={curse.tiers}
            columns={[
              {
                key: "t",
                header: "Rank tier",
                render: (t) => (
                  <span className="font-medium text-[var(--ink)]">
                    {t.tier}
                  </span>
                ),
              },
              {
                key: "m",
                header: "Median fitness",
                align: "right",
                render: (t) => `${t.medianFitness.toFixed(2)}x`,
              },
              {
                key: "d",
                header: "Median reads",
                align: "right",
                render: (t) => fmt(t.medianInput),
              },
              {
                key: "lc",
                header: "Thin (<50 reads)",
                align: "right",
                render: (t) => (
                  <span
                    style={{
                      color: t.lowCoverage > 0 ? "var(--serious)" : undefined,
                    }}
                  >
                    {t.lowCoverage}
                  </span>
                ),
              },
              {
                key: "c",
                header: "Confirmed",
                align: "right",
                render: (t) => (
                  <span
                    style={{
                      color:
                        t.confirmedPct === 100
                          ? "var(--success-text)"
                          : "var(--serious)",
                      fontWeight: 500,
                    }}
                  >
                    {t.confirmedPct}%
                  </span>
                ),
              },
            ]}
          />
        </Figure>

        <Prose>
          <p>
            There is a second, quieter effect. Re-rank the library requiring at
            least {fmt(curse.deepMinInput)} input reads and{" "}
            <strong>{changed} of the top 25 change</strong>. The same data,
            filtered for confidence rather than sorted for score, hands you a
            meaningfully different shortlist.
          </p>
          <p>
            Neither list is wrong. They answer different questions. The first
            asks &ldquo;which variants scored highest?&rdquo;. The second asks
            &ldquo;which variants do I have solid evidence for?&rdquo;. If you
            are spending a budget, you want the second.
          </p>
        </Prose>
      </Section>

      <Section
        title="A shortlist you can defend"
        lead="The same library, filtered on evidence before being ranked on score."
      >
        <Figure
          title={`Top variants with at least ${fmt(curse.deepMinInput)} input reads`}
          subtitle="Deeply sequenced, confirmed in all three conditions"
          caption={
            <>
              Every row here rests on {fmt(curse.deepMinInput)}+ reads and
              agrees across three independent selections. The top fitness
              values are slightly lower than the unfiltered list. That is the
              price of only claiming what you can support.
            </>
          }
        >
          <DataTable
            dense
            caption="Deeply sequenced top variants"
            rows={curse.deepTop}
            columns={[
              {
                key: "mut",
                header: "Variant",
                render: (r) => <Variant seq={r.mut} />,
              },
              {
                key: "f",
                header: "Medium IgG",
                align: "right",
                render: (r) => (
                  <span
                    style={{ color: "var(--success-text)", fontWeight: 500 }}
                  >
                    {r.igg20.toFixed(2)}x
                  </span>
                ),
              },
              {
                key: "l",
                header: "Low IgG",
                align: "right",
                render: (r) => r.igg10.toFixed(1) + "x",
              },
              {
                key: "h",
                header: "High IgG",
                align: "right",
                render: (r) => r.igg90.toFixed(1) + "x",
              },
              {
                key: "n",
                header: "Input reads",
                align: "right",
                render: (r) => fmt(r.input),
              },
            ]}
          />
        </Figure>

        <StatGrid>
          <Stat
            value={`${curse.overlapOfTop25}/25`}
            label="Variants on both shortlists"
            hint="score-only vs evidence-first"
          />
          <Stat
            value={String(changed)}
            label="Variants that change"
            tone="warn"
            hint="by requiring depth"
          />
          <Stat
            value={`${cond.agreement[0].r.toFixed(2)}`}
            label="Cross-condition agreement"
            tone="good"
            hint="deeply sequenced variants"
          />
          <Stat
            value={`${landscape.betterThanWtPct}%`}
            label="Of the library beats wild type"
            hint={`${fmt(landscape.betterThanWt)} candidates`}
          />
        </StatGrid>
      </Section>

      <Section title="The checklist">
        <Prose>
          <p>
            Before a variant goes on an order form, it should clear all of
            these. None of them require new experiments — every one is
            answerable from the data you already have.
          </p>
        </Prose>

        <ol className="my-6 space-y-2">
          {[
            {
              q: "Does it have enough reads?",
              d: "Read depth, not fitness, is the first column to look at. A high score on 14 reads is a hypothesis, not a result.",
            },
            {
              q: "Does it replicate?",
              d: "Confirm it in an independent condition or replicate. This single check removes most of the variants that would waste your money.",
            },
            {
              q: "Is the effect bigger than the assay's floor?",
              d: "Chapter 4 put the dead-protein floor around 0.004. Differences below about 0.1 are not measurements.",
            },
            {
              q: "Is the improvement worth the number of mutations?",
              d: "A 4-mutation variant is more likely to have problems your assay never tested, such as stability or expression.",
            },
            {
              q: "Would a different analyst get the same list?",
              d: "If swapping the read cutoff reshuffles your top 25, say so in the report. It is information, not a flaw.",
            },
          ].map((c, i) => (
            <li
              key={c.q}
              className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            >
              <span className="tabular mt-0.5 w-4 shrink-0 text-[13px] font-semibold text-[var(--series-1)]">
                {i + 1}
              </span>
              <span>
                <span className="block text-[14px] font-medium text-[var(--ink)]">
                  {c.q}
                </span>
                <span className="mt-1 block text-[13.5px] leading-6 text-[var(--ink-secondary)]">
                  {c.d}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="What this walkthrough did not cover">
        <Prose>
          <p>
            Being clear about the edges of a method is part of using it. This
            walkthrough stopped short of several things a real campaign needs:
          </p>
        </Prose>
        <ul className="my-5 max-w-2xl space-y-2">
          {[
            "Imputing the missing variants. The original authors fitted a regression to estimate fitness for variants that were never observed.",
            "Confidence intervals on each fitness value, which read counts support and which would replace the depth bands used here.",
            "Training a model to predict the variants that were never measured — the step that turns a screen into a design tool.",
            "Any property other than IgG binding. Stability, expression and specificity were not measured by this assay at all.",
          ].map((t) => (
            <li
              key={t}
              className="flex gap-2.5 text-[14px] leading-6 text-[var(--ink-secondary)]"
            >
              <span
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink-muted)]"
                aria-hidden
              />
              {t}
            </li>
          ))}
        </ul>

        <Callout kind="key" title="The habit worth keeping">
          <p>
            Every chapter here followed the same pattern: look at the data,
            find a decision hiding in it, make the decision explicitly, and
            write down what it cost. That pattern is the whole job. The
            specific thresholds will change with every dataset you touch.
          </p>
        </Callout>
      </Section>
    </ChapterFrame>
  );
}
