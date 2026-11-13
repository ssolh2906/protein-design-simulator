import {
  Callout,
  DataTable,
  Figure,
  Prose,
  Section,
  Stat,
  StatGrid,
} from "@/components/ui";
import { FacetedScatter } from "@/components/charts/FacetedScatter";
import { BarChart } from "@/components/charts/BarChart";
import { Legend } from "@/components/charts/primitives";
import { DEPTH_RAMP } from "@/lib/palette";
import { getReproducibility, fmt } from "@/lib/data";

export function ReproducibilityEn() {
  const rep = getReproducibility();
  const worst = rep.byDepth[0];
  const best = rep.byDepth[rep.byDepth.length - 1];

  return (
    <>
      <Prose>
        <p>
          You have a fitness value for every variant. Before you believe any of
          them, ask the only question that matters: if the measurement were
          repeated, would it give the same answer?
        </p>
        <p>
          This dataset lets you check. The same library was selected against
          three IgG concentrations. Low and high concentration are different
          enough to be genuinely independent selections, so agreement between
          them is real evidence, not a repeat of the same pipetting.
        </p>
      </Prose>

      <Section title="The reassuring answer">
        <StatGrid>
          <Stat
            value={`r = ${rep.overallR.toFixed(3)}`}
            label="Overall correlation"
            tone="good"
            hint="low IgG vs high IgG"
          />
          <Stat value={fmt(rep.n)} label="Variants compared" />
          <Stat
            value={`${(rep.overallR ** 2 * 100).toFixed(0)}%`}
            label="Variance explained"
            hint="r squared"
          />
          <Stat value="3" label="Selection conditions" hint="10, 20, 90" />
        </StatGrid>

        <Prose>
          <p>
            A correlation of {rep.overallR.toFixed(2)} across{" "}
            {fmt(rep.n)} variants looks like a dataset you can work with. Most
            analyses would report that number, put it in a supplementary
            figure, and move on.
          </p>
          <p>Do not move on.</p>
        </Prose>
      </Section>

      <Section
        title="Now split it by read depth"
        lead="Group the same variants by how many input reads they had, and compute the correlation inside each group."
      >
        <Figure
          title="Agreement between conditions, by sequencing depth"
          subtitle="Correlation of log fitness, low IgG against high IgG, within each read-depth band"
          caption={
            <>
              Same data, same formula, same pipeline. The only difference
              between the top bar and the bottom bar is how many times the
              sequencer happened to read that variant. Agreement rises from{" "}
              <strong>r = {worst.r.toFixed(2)}</strong> to{" "}
              <strong>r = {best.r.toFixed(2)}</strong>.
            </>
          }
        >
          <BarChart
            labelWidth={78}
            max={1}
            bars={rep.byDepth.map((b, i) => ({
              label: `${b.bin}`,
              value: b.r,
              valueLabel: b.r.toFixed(3),
              color: DEPTH_RAMP[i],
              detail: [{ label: "variants", value: fmt(b.n) }],
            }))}
          />
          <Legend
            title="input reads"
            items={rep.byDepth.map((b, i) => ({
              label: b.bin,
              color: DEPTH_RAMP[i],
            }))}
          />
        </Figure>

        <Callout kind="key" title="What the aggregate number was hiding">
          <p>
            The overall r of {rep.overallR.toFixed(2)} is an average over
            groups that behave completely differently. For the{" "}
            {fmt(worst.n)} variants with {worst.bin} input reads, the two
            conditions agree at r = {worst.r.toFixed(2)} — close to useless.
            For the {fmt(best.n)} variants with {best.bin} reads, they agree at
            r = {best.r.toFixed(2)}.
          </p>
          <p>
            Those low-depth variants are not a small corner of the dataset.
            They are {fmt(worst.n + rep.byDepth[1].n)} variants, and they all
            passed quality control.
          </p>
        </Callout>
      </Section>

      <Section
        title="The same thing as a scatter"
        lead="Every point is one variant, measured twice. Colour is read depth."
      >
        <Figure
          title="Low IgG fitness against high IgG fitness, one panel per depth band"
          subtitle={`${fmt(rep.scatter.length)} variants, sampled evenly so every band is equally visible. Same axes in every panel.`}
          caption={
            <>
              Points on the dashed line agree perfectly between the two
              conditions. Read left to right: the cloud starts as a shapeless
              smear and tightens onto the line as read depth increases. These
              are five panels rather than one five-colour scatter because
              overlapping translucent points pile up — in a single panel every
              band ends up looking equally dark, and the chart would be making
              a claim you could not actually see.
            </>
          }
          source="Values are log10 fitness, floored at 0.001."
        >
          <FacetedScatter
            panels={rep.byDepth.map((b) => ({
              bin: b.bin,
              n: b.n,
              r: b.r,
              points: rep.scatter
                .filter((p) => p.bin === b.bin)
                .map((p) => ({ x: p.x, y: p.y })),
            }))}
            xLabel="log10 fitness, low IgG"
            yLabel="log10 fitness, high IgG"
          />
        </Figure>

        <div className="my-6 rounded-xl border border-[var(--border)] p-1">
          <DataTable
            dense
            caption="Correlation and variant count by read-depth band"
            rows={rep.byDepth}
            columns={[
              {
                key: "bin",
                header: "Input reads",
                render: (b) => (
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-[2px]"
                      style={{
                        background: DEPTH_RAMP[rep.byDepth.indexOf(b)],
                      }}
                      aria-hidden
                    />
                    {b.bin}
                  </span>
                ),
              },
              {
                key: "n",
                header: "Variants",
                align: "right",
                render: (b) => fmt(b.n),
              },
              {
                key: "r",
                header: "Correlation r",
                align: "right",
                render: (b) => (
                  <span className="font-medium text-[var(--ink)]">
                    {b.r.toFixed(3)}
                  </span>
                ),
              },
              {
                key: "q",
                header: "Usable?",
                align: "right",
                render: (b) => (
                  <span
                    style={{
                      color:
                        b.r > 0.75
                          ? "var(--success-text)"
                          : b.r > 0.6
                            ? "var(--serious)"
                            : "var(--critical)",
                    }}
                  >
                    {b.r > 0.75
                      ? "yes"
                      : b.r > 0.6
                        ? "with care"
                        : "treat as a hint"}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </Section>

      <Section title="Why this happens">
        <Prose>
          <p>
            Nothing is wrong with the low-depth variants biologically. The
            problem is counting statistics.
          </p>
          <p>
            If a variant has 12 input reads, the sequencer is sampling it
            twelve times out of 89 million. The number it returns carries a
            large random component. Both the numerator and denominator of the
            fitness ratio are noisy, so the ratio is noisier still. Repeat the
            experiment and you get a different number — not because the protein
            changed, but because the dice did.
          </p>
          <p>
            With 3,000 reads the sampling error is small and the fitness value
            reflects the protein.
          </p>
        </Prose>

        <Callout kind="trap" title="The mistake this prevents">
          <p>
            Sort 149,361 variants by fitness and the top of the list will be
            crowded with variants that got there on a handful of reads. They
            are not lying on purpose. A variant with 11 input reads and a lucky
            selection count can post a spectacular ratio.
          </p>
          <p>
            Carry the read count next to every fitness value, all the way
            through to the hit list. Chapter 9 shows what happens when you do
            not.
          </p>
        </Callout>
      </Section>

      <Section title="What to do about it">
        <Prose>
          <p>There are three honest options, and they can be combined:</p>
        </Prose>
        <ul className="my-5 max-w-2xl space-y-3">
          {[
            {
              t: "Raise the cutoff",
              d: "Simple and defensible, but chapter 3 showed what it costs in coverage. You lose real variants to protect yourself from noisy ones.",
            },
            {
              t: "Keep everything, carry the uncertainty",
              d: "Report the read depth with every fitness value and weight downstream analyses by it. More work, but you keep the library.",
            },
            {
              t: "Require agreement across conditions",
              d: "Only trust a variant that looks good in more than one selection. This is the cheapest filter and it directly targets the failure mode.",
            },
          ].map((o) => (
            <li
              key={o.t}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            >
              <div className="text-[14px] font-medium text-[var(--ink)]">
                {o.t}
              </div>
              <div className="mt-1 text-[13.5px] leading-6 text-[var(--ink-secondary)]">
                {o.d}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
