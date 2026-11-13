import { ChapterFrame } from "@/components/ChapterFrame";
import {
  Callout,
  CodeBlock,
  Figure,
  Mono,
  Prose,
  Section,
} from "@/components/ui";
import { ThresholdExplorer } from "@/components/charts/ThresholdExplorer";
import { getFunnel, getSweep, fmt } from "@/lib/data";

export const metadata = { title: "Quality control" };

export default function Page() {
  const { steps, minInput } = getFunnel();
  const sweep = getSweep();
  const start = steps[0].kept;
  const end = steps[steps.length - 1].kept;

  return (
    <ChapterFrame slug="quality-control">
      <Prose>
        <p>
          Quality control is where most of the thinking happens, and where most
          tutorials wave their hands. Four filters take this dataset from{" "}
          {fmt(start)} rows to {fmt(end)}. Two of them are forced by
          arithmetic. Two are judgement calls.
        </p>
        <p>
          Knowing which is which is the skill.
        </p>
      </Prose>

      <Section
        title="The funnel"
        lead="Each gate, what it removes, and why."
      >
        <Figure
          title="From raw rows to analysable variants"
          subtitle={`${fmt(start)} rows in, ${fmt(end)} variants out`}
          caption={
            <>
              The bar width is proportional to rows surviving. The large drop
              is stop codons, which is not a quality problem at all — those
              rows were never design candidates. The cutoff at the end is the
              only step that a different analyst might reasonably set
              differently.
            </>
          }
        >
          <div className="space-y-1">
            {steps.map((s, i) => {
              const width = (s.kept / start) * 100;
              const isForced = s.forced === true;
              const isChoice = s.forced === false;
              return (
                <div key={i}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-[var(--ink)]">
                      {s.step}
                      {isForced && (
                        <span className="ml-2 rounded-full bg-[var(--page)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--ink-secondary)] uppercase ring-1 ring-[var(--border)] ring-inset">
                          forced
                        </span>
                      )}
                      {isChoice && (
                        <span
                          className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ring-inset"
                          style={{
                            color: "var(--serious)",
                            borderColor: "var(--serious)",
                          }}
                        >
                          judgement call
                        </span>
                      )}
                    </span>
                    <span className="tabular shrink-0 text-[12px] text-[var(--ink-secondary)]">
                      {fmt(s.kept)}
                      {s.removed > 0 && (
                        <span className="ml-2 text-[var(--critical)]">
                          −{fmt(s.removed)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-[4px] bg-[var(--page)]">
                    <div
                      className="h-full rounded-r-[4px]"
                      style={{
                        width: `${width}%`,
                        background:
                          i === 0
                            ? "var(--depth-1)"
                            : i === 1
                              ? "var(--depth-2)"
                              : i === 2
                                ? "var(--depth-3)"
                                : i === 3
                                  ? "var(--depth-4)"
                                  : "var(--depth-5)",
                      }}
                    />
                  </div>
                  {s.why && (
                    <p className="mt-1.5 mb-3 text-[12.5px] leading-5 text-[var(--ink-muted)]">
                      {s.why}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Figure>
      </Section>

      <Section title="The forced filters">
        <Prose>
          <p>
            <strong>Stop codons.</strong> A truncated GB1 is not a candidate
            for a protein you want to make. Removing them is not a quality
            decision, it is a definition of the question. Keep them aside as a
            negative control, then take them out of the design set.
          </p>
          <p>
            <strong>Zero input reads.</strong> Fitness divides by the input
            count. Dividing by zero does not give you a big number, it gives
            you nothing. These {fmt(steps[2].removed)} rows cannot produce a
            value no matter how much you want one.
          </p>
        </Prose>

        <Callout kind="note" title="Zero before and zero after are opposites">
          <p>
            <Mono>Input = 0</Mono> means the measurement is undefined. The row
            goes.
          </p>
          <p>
            <Mono>IGG20 = 0</Mono> means the variant was there before selection
            and gone after it. That is a real result — a fitness of zero — and
            the row stays. Removing dropouts would delete exactly the dead
            variants and make the library look much better than it is.
          </p>
        </Callout>
      </Section>

      <Section
        title="The judgement call"
        lead="How many input reads are enough? There is no correct answer, and the original authors knew it."
      >
        <Prose>
          <p>
            The published analysis keeps variants with at least{" "}
            <strong>{minInput}</strong> input reads. Here is the line from the
            authors&apos; own script:
          </p>
        </Prose>

        <CodeBlock
          label="script/Mapper5_NW.py, from the original paper"
          code={`if DNAcount >= 10: #TUNABLE`}
        />

        <Prose>
          <p>
            That comment is the most honest thing in the whole repository. The
            cutoff is not derived from theory. Somebody chose 10, knew it was a
            choice, and said so.
          </p>
          <p>
            Move the slider and watch what the choice buys and what it costs.
          </p>
        </Prose>

        <Figure
          title="What the read-count cutoff costs you"
          subtitle="Coverage of the designed library against agreement between two independent selection conditions"
          caption={
            <>
              The two quantities move in opposite directions, and they are on
              different scales, so they are shown as two panels sharing one
              control rather than as one chart with two vertical axes. A
              two-axis version of this chart could be made to put the crossover
              anywhere.
            </>
          }
        >
          <ThresholdExplorer sweep={sweep} />
        </Figure>

        <Callout kind="key" title="What the shape of this trade-off tells you">
          <p>
            Going from no cutoff to 10 reads costs about{" "}
            {(sweep[0].coveragePct - sweep[4].coveragePct).toFixed(1)} points
            of coverage and buys about{" "}
            {(sweep[4].overallR - sweep[0].overallR).toFixed(3)} of
            correlation. Going from 10 to 500 costs another{" "}
            {(sweep[4].coveragePct - sweep[sweep.length - 1].coveragePct).toFixed(
              0,
            )}{" "}
            points of coverage and buys{" "}
            {(sweep[sweep.length - 1].overallR - sweep[4].overallR).toFixed(3)}.
          </p>
          <p>
            The first step is cheap. The rest get expensive fast. That is the
            usual shape, and it is why a low cutoff plus honest reporting of
            read depth beats a high cutoff that quietly throws away three
            quarters of your library.
          </p>
        </Callout>
      </Section>

      <Section title="What you should write down">
        <Prose>
          <p>
            Whatever you choose, the filter decisions have to travel with the
            data. A fitness table with no record of its cutoff is not
            reproducible, and the number is not interpretable by anyone else.
          </p>
          <p>At minimum, record:</p>
        </Prose>

        <ul className="my-5 max-w-2xl space-y-2">
          {[
            "How many rows you started with.",
            "Each filter, in order, and how many rows it removed.",
            "The read-count cutoff, stated as a number.",
            "How you treated zeros before selection, and zeros after it.",
            "How many designed variants are missing entirely.",
          ].map((t) => (
            <li
              key={t}
              className="flex gap-2.5 text-[14px] leading-6 text-[var(--ink-secondary)]"
            >
              <span
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--series-1)]"
                aria-hidden
              />
              {t}
            </li>
          ))}
        </ul>
      </Section>
    </ChapterFrame>
  );
}
