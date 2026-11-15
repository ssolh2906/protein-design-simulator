"use client";

import { usePhases, PhaseButtons, PhaseCaption } from "./phases";

/**
 * Why fitness is a ratio of ratios, in four beats.
 *
 * The trap this figure exists to spring: the variant's read count more than
 * doubled, which looks like success, and it is still a worse binder than the
 * wild type. It only looks like success until you notice the wild type grew
 * faster. Selection enriches everything that survives; the question is never
 * "did it go up" but "did it go up more than the reference".
 *
 * The two forms of the formula are the same arithmetic:
 *
 *     (sel_v / sel_wt) / (in_v / in_wt)  ==  (sel_v / in_v) / (sel_wt / in_wt)
 *
 * The right-hand form is the one drawn here, because "how many times did it
 * grow" is a quantity people already have intuition for.
 */

type Row = {
  name: string;
  before: number;
  after: number;
  /** after / before. Passed in so this component does no arithmetic. */
  grow: number;
};

export function RatioOfRatios({
  variant,
  wt,
  fitness,
  stations,
  captions,
  label,
  text,
}: {
  variant: Row;
  wt: Row;
  fitness: number;
  stations: string[];
  captions: string[];
  label: string;
  text: {
    reads: string;
    growth: string;
    /** e.g. "x" so the bar reads "2.19x". */
    times: string;
    result: string;
    worse: string;
    better: string;
    /** The same calculation written the other way, as a ratio of shares. */
    alt?: string;
  };
}) {
  const { phase, pick } = usePhases(4);
  const rows = [variant, wt];
  const max = Math.max(variant.grow, wt.grow) * 1.25;
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="w-full" role="group" aria-label={label}>
      <table className="w-full border-collapse text-[13px]">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="border-b border-[var(--border-strong)]">
            <th scope="col" className="py-2 text-left text-[11px] font-semibold tracking-wider text-[var(--ink-muted)] uppercase">
              &nbsp;
            </th>
            <th scope="col" className="py-2 text-right text-[11px] font-semibold tracking-wider text-[var(--ink-muted)] uppercase">
              {text.reads}
            </th>
            <th
              scope="col"
              className={`py-2 pl-4 text-left text-[11px] font-semibold tracking-wider uppercase transition-opacity duration-500 ${
                phase >= 1 ? "text-[var(--ink-muted)]" : "opacity-0"
              }`}
            >
              {text.growth}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            // Beat 3 is the comparison, so the row that grew more leads.
            const leads = phase >= 2 && r.grow === Math.max(variant.grow, wt.grow);
            return (
              <tr key={r.name} className="border-b border-[var(--border)] last:border-0">
                <th
                  scope="row"
                  className="py-3 pr-3 text-left font-mono text-[13px] font-medium text-[var(--ink)]"
                >
                  {r.name}
                </th>

                <td className="tabular py-3 text-right whitespace-nowrap text-[var(--ink-secondary)]">
                  {fmt(r.before)}
                  <span className="mx-1.5 text-[var(--ink-muted)]">&rarr;</span>
                  <span className="font-medium text-[var(--ink)]">
                    {fmt(r.after)}
                  </span>
                </td>

                <td className="py-3 pl-4" style={{ width: "48%" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-[18px] flex-1 overflow-hidden rounded-[4px] bg-[var(--page)]">
                      <div
                        className="h-full rounded-[4px] transition-all duration-700 ease-out motion-reduce:transition-none"
                        style={{
                          width: phase >= 1 ? `${(r.grow / max) * 100}%` : "0%",
                          background: i === 0 ? "var(--series-1)" : "var(--ink-muted)",
                          opacity: phase >= 2 && !leads ? 0.45 : 1,
                          transitionDelay: `${i * 160}ms`,
                        }}
                      />
                    </div>
                    <span
                      className={`tabular w-[52px] shrink-0 text-[12px] font-medium transition-opacity duration-500 ${
                        phase >= 1 ? "text-[var(--ink)]" : "opacity-0"
                      }`}
                    >
                      {r.grow.toFixed(2)}
                      {text.times}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* The division, revealed last. */}
      <div
        className={`mt-4 rounded-xl border px-4 py-3 transition-all duration-500 ${
          phase === 3
            ? "border-[var(--border)] bg-[var(--page)] opacity-100"
            : "border-transparent opacity-0"
        }`}
      >
        <div className="tabular flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[13px] text-[var(--ink-secondary)]">
          <span>
            {variant.grow.toFixed(2)}
            {text.times}
          </span>
          <span className="text-[var(--ink-muted)]">&divide;</span>
          <span>
            {wt.grow.toFixed(2)}
            {text.times}
          </span>
          <span className="text-[var(--ink-muted)]">=</span>
          <span className="text-[18px] font-semibold text-[var(--ink)]">
            {fitness.toFixed(2)}
          </span>
          <span className="ml-1 text-[12px] font-medium text-[var(--series-2)]">
            {fitness < 1 ? text.worse : text.better}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-[var(--ink-muted)]">{text.result}</p>
        {text.alt && (
          <p className="tabular mt-1.5 border-t border-[var(--border)] pt-1.5 font-mono text-[11px] text-[var(--ink-muted)]">
            {text.alt}
          </p>
        )}
      </div>

      <PhaseButtons labels={stations} phase={phase} onPick={pick} />
      <PhaseCaption text={captions[phase]} />
    </div>
  );
}
