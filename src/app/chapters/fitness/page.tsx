import fs from "node:fs";
import path from "node:path";
import { ChapterFrame } from "@/components/ChapterFrame";
import {
  Callout,
  CodeBlock,
  Figure,
  Formula,
  Prose,
  Section,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { Histogram } from "@/components/charts/Histogram";
import { getLandscape, fmt } from "@/lib/data";

export const metadata = { title: "Computing fitness" };

type Worked = {
  mut: string;
  hd: number;
  counts: {
    variantInput: number;
    variantSelected: number;
    wtInput: number;
    wtSelected: number;
  };
  ratioBefore: number;
  ratioAfter: number;
  fitness: number;
  condition: string;
};

type Control = {
  stopN: number;
  codingN: number;
  stopMedian: number;
  codingMedian: number;
  stopBelow0_01: number;
  codingBelow0_01: number;
  stopAboveWt: number;
  stopAboveWtPct: number;
};

function load<T>(name: string): T {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "data", name), "utf8"),
  ) as T;
}

export default function Page() {
  const ex = load<Worked>("worked-example.json");
  const ctrl = load<Control>("stop-control.json");
  const landscape = getLandscape();
  const c = ex.counts;

  return (
    <ChapterFrame slug="fitness">
      <Prose>
        <p>
          You now have a clean table of read counts. This chapter turns two
          counts into one number that means something biological.
        </p>
      </Prose>

      <Section title="The idea">
        <Prose>
          <p>
            A variant that binds IgG well is captured during selection, so its
            share of the library goes up. A variant that binds badly is washed
            away, so its share goes down. Fitness measures that change in
            share.
          </p>
          <p>
            Shares, not counts. Chapter 2 showed the four samples have
            different read totals, so raw counts cannot be compared directly.
            The trick used here is to divide by the wild type, which is present
            in every sample and therefore cancels out whatever the total was.
          </p>
        </Prose>

        <Formula>
          fitness ={" "}
          <span className="text-[var(--series-1)]">
            (selected<sub>variant</sub> / selected<sub>WT</sub>)
          </span>{" "}
          ÷{" "}
          <span className="text-[var(--series-2)]">
            (input<sub>variant</sub> / input<sub>WT</sub>)
          </span>
        </Formula>

        <Prose>
          <p>
            The wild type has a fitness of exactly 1.0, by construction. Above
            1.0 is better than the original protein. Below 1.0 is worse. This
            is the formula from the original paper, not a simplification of it.
          </p>
        </Prose>
      </Section>

      <Section
        title="One variant, all the arithmetic"
        lead={`Take ${ex.mut}, an ordinary variant with ${ex.hd} mutations and enough reads to be believable.`}
      >
        <Figure
          title={`Worked example: ${ex.mut}`}
          subtitle="Medium IgG concentration. Every number here is from the file."
          caption={
            <>
              This variant made up {(ex.ratioBefore * 100).toFixed(2)}% as much
              of the library as the wild type before selection, and only{" "}
              {(ex.ratioAfter * 100).toFixed(2)}% as much afterwards. It lost
              ground, so its fitness is below 1.
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: `${ex.mut} input`, v: fmt(c.variantInput) },
                { l: `${ex.mut} selected`, v: fmt(c.variantSelected) },
                { l: "wild type input", v: fmt(c.wtInput) },
                { l: "wild type selected", v: fmt(c.wtSelected) },
              ].map((x) => (
                <div
                  key={x.l}
                  className="rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2.5"
                >
                  <div className="tabular text-[17px] font-semibold text-[var(--ink)]">
                    {x.v}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                    {x.l}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 font-mono text-[13px] leading-6">
              <Step
                label="share before selection"
                math={`${fmt(c.variantInput)} / ${fmt(c.wtInput)}`}
                result={ex.ratioBefore.toFixed(6)}
                color="var(--series-2)"
              />
              <Step
                label="share after selection"
                math={`${fmt(c.variantSelected)} / ${fmt(c.wtSelected)}`}
                result={ex.ratioAfter.toFixed(6)}
                color="var(--series-1)"
              />
              <Step
                label="fitness"
                math={`${ex.ratioAfter.toFixed(6)} / ${ex.ratioBefore.toFixed(6)}`}
                result={ex.fitness.toFixed(4)}
                color="var(--ink)"
                emphasis
              />
            </div>

            <p className="text-[13px] leading-6 text-[var(--ink-secondary)]">
              A fitness of {ex.fitness.toFixed(2)} means{" "}
              <Variant seq={ex.mut} /> bound IgG roughly{" "}
              {(100 * ex.fitness).toFixed(0)}% as well as the original protein
              in this condition.
            </p>
          </div>
        </Figure>

        <CodeBlock
          label="the same thing in code"
          code={`fitness = (variant_selected / wt_selected) / (variant_input / wt_input)

# ${ex.mut}, medium IgG
# = (${fmt(c.variantSelected)} / ${fmt(c.wtSelected)}) / (${fmt(c.variantInput)} / ${fmt(c.wtInput)})
# = ${ex.ratioAfter.toFixed(6)} / ${ex.ratioBefore.toFixed(6)}
# = ${ex.fitness.toFixed(4)}`}
        />
      </Section>

      <Section title="Two kinds of zero, one more time">
        <Prose>
          <p>
            The formula makes the asymmetry from chapter 3 concrete. The input
            count is in the <strong>denominator</strong>. The selected count is
            in the <strong>numerator</strong>.
          </p>
          <p>
            Zero selected reads gives a fitness of exactly 0. That is a real,
            meaningful answer: the variant was there and then it was gone.
          </p>
          <p>
            Zero input reads gives division by zero. There is no answer to
            report. This is why those rows had to go before the arithmetic
            started, not after.
          </p>
        </Prose>
      </Section>

      <Section
        title="Does the number mean anything? Ask the dead proteins."
        lead="Stop-codon variants cannot bind IgG. Whatever they score is the floor of this assay — a negative control measured in the same experiment, for free."
      >
        <StatGrid>
          <Stat
            value={fmt(ctrl.stopN)}
            label="Stop-codon variants scored"
            hint="cannot possibly bind"
          />
          <Stat
            value={ctrl.stopAboveWt === 0 ? "0" : fmt(ctrl.stopAboveWt)}
            label="That beat the wild type"
            tone="good"
            hint="out of all of them"
          />
          <Stat
            value={`${ctrl.stopBelow0_01}%`}
            label="Stop variants scoring under 0.01"
            hint="effectively dead"
          />
          <Stat
            value={`${ctrl.codingBelow0_01}%`}
            label="Full-length variants under 0.01"
            tone="warn"
            hint="also effectively dead"
          />
        </StatGrid>

        <Callout kind="key" title="Two things this control tells you">
          <p>
            <strong>The assay works.</strong> Not one of the{" "}
            {fmt(ctrl.stopN)} truncated proteins scored above the wild type.
            If a few hundred had, you would know the fitness values were
            partly noise and could not be trusted at the top end.
          </p>
          <p>
            <strong>Most of the design space is dead.</strong> The median
            truncated protein scores {ctrl.stopMedian}. The median full-length
            protein scores {ctrl.codingMedian} — practically the same number.
            Changing four neighbouring residues at random usually produces
            something as useless as no protein at all.
          </p>
        </Callout>

        <Callout kind="trap" title="Do not read fitness 0.004 as a measurement">
          <p>
            Down at the floor, the fitness values of a dead variant and a very
            dead variant are indistinguishable. Both are reporting &ldquo;no
            binding detected&rdquo;. Ranking variants inside that region is
            reading noise. The useful signal in this dataset is all above
            about 0.1.
          </p>
        </Callout>
      </Section>

      <Section
        title="The distribution"
        lead="All 149,361 surviving variants, on a log scale, with the wild type marked."
      >
        <Figure
          title="Fitness of every variant that passed quality control"
          subtitle="Log scale. Values are floored at 0.001 so that true zeros stay on the chart."
          caption={
            <>
              The shape is the point. There is a large pile of dead variants at
              the left, a thin spread in the middle, and a small tail to the
              right of the wild-type line.{" "}
              <strong>
                {landscape.betterThanWtPct}% of variants beat the wild type
              </strong>{" "}
              — {fmt(landscape.betterThanWt)} out of {fmt(landscape.n)}.
            </>
          }
        >
          <Histogram
            bins={landscape.histogram}
            markAt={0}
            markLabel="wild type"
            xLabel="fitness (log scale)"
          />
        </Figure>

        <StatGrid>
          <Stat value={fmt(landscape.n)} label="Variants with a fitness value" />
          <Stat
            value={`${landscape.effectivelyDeadPct}%`}
            label="Effectively dead"
            tone="bad"
            hint="fitness under 0.01"
          />
          <Stat
            value={`${landscape.betterThanWtPct}%`}
            label="Better than wild type"
            tone="good"
            hint={`${fmt(landscape.betterThanWt)} variants`}
          />
          <Stat
            value={landscape.top[0].fitness.toFixed(1) + "x"}
            label="Best variant"
            tone="good"
            hint={landscape.top[0].mut}
          />
        </StatGrid>
      </Section>
    </ChapterFrame>
  );
}

function Step({
  label,
  math,
  result,
  color,
  emphasis = false,
}: {
  label: string;
  math: string;
  result: string;
  color: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-3 rounded-lg px-3 py-2 ${
        emphasis
          ? "border border-[var(--border-strong)] bg-[var(--page)]"
          : "bg-[var(--page)]"
      }`}
    >
      <span className="w-full font-sans text-[11px] tracking-wide text-[var(--ink-muted)] uppercase sm:w-44">
        {label}
      </span>
      <span className="tabular text-[var(--ink-secondary)]">{math}</span>
      <span className="text-[var(--ink-muted)]" aria-hidden>
        =
      </span>
      <span
        className={`tabular ml-auto ${emphasis ? "text-[15px] font-semibold" : "font-medium"}`}
        style={{ color }}
      >
        {result}
      </span>
    </div>
  );
}
