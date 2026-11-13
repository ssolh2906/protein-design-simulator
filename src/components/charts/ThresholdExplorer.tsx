"use client";

import { useState } from "react";
import type { SweepPoint } from "@/lib/data";
import { DataTable } from "@/components/ui";

/**
 * The read-depth cutoff, made tangible.
 *
 * Two measures move in opposite directions as the cutoff rises, and they are
 * on different scales. They are deliberately shown as two small multiples
 * sharing one x axis rather than one chart with two y axes, which would
 * let the crossing point be placed anywhere by choosing the scales.
 */
export function ThresholdExplorer({ sweep }: { sweep: SweepPoint[] }) {
  const published = sweep.findIndex((s) => s.isPublished);
  const [idx, setIdx] = useState(published >= 0 ? published : 0);
  const [showTable, setShowTable] = useState(false);
  const cur = sweep[idx];

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="threshold"
          className="mb-2 block text-[12px] font-medium text-[var(--ink-secondary)]"
        >
          Minimum input reads required:{" "}
          <span className="tabular font-semibold text-[var(--ink)]">
            {cur.threshold}
          </span>
          {cur.isPublished && (
            <span className="ml-2 rounded-full bg-[var(--page)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink-secondary)] ring-1 ring-[var(--border)] ring-inset">
              the published choice
            </span>
          )}
        </label>
        <input
          id="threshold"
          type="range"
          min={0}
          max={sweep.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="w-full accent-[var(--series-1)]"
          aria-valuetext={`${cur.threshold} reads`}
        />
        <div className="mt-1 flex justify-between text-[10px] text-[var(--ink-muted)]">
          {sweep.map((s, i) => (
            <span
              key={s.threshold}
              className={i === idx ? "font-semibold text-[var(--ink)]" : ""}
            >
              {s.threshold}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel
          title="Variants you keep"
          value={cur.variantsKept.toLocaleString()}
          sub={`${cur.coveragePct}% of the 160,000 designed`}
          fraction={cur.coveragePct / 100}
          color="var(--series-2)"
          direction="falls as the cutoff rises"
        />
        <Panel
          title="Agreement between conditions"
          value={`r = ${cur.overallR.toFixed(3)}`}
          sub="low IgG vs high IgG, log fitness"
          fraction={cur.overallR}
          color="var(--series-1)"
          direction="rises as the cutoff rises"
        />
      </div>

      <p className="mt-5 max-w-2xl text-[13px] leading-6 text-[var(--ink-secondary)]">
        Raising the cutoff does not make the data better. It makes the data
        you keep more trustworthy and throws the rest away. At a cutoff of{" "}
        <strong className="text-[var(--ink)]">500</strong> the correlation is
        the best it gets, and you have discarded{" "}
        <strong className="text-[var(--ink)]">
          {(100 - sweep[sweep.length - 1].coveragePct).toFixed(0)}%
        </strong>{" "}
        of the library. The published analysis chose{" "}
        <strong className="text-[var(--ink)]">10</strong> and accepted a
        noisier table in exchange for near-complete coverage.
      </p>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-4 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[12px] font-medium text-[var(--ink-secondary)] hover:bg-[var(--page)]"
      >
        {showTable ? "Hide" : "Show"} the numbers
      </button>

      {showTable && (
        <div className="mt-4 rounded-xl border border-[var(--border)] p-1">
          <DataTable
            dense
            caption="Variants kept and between-condition correlation at each input-count cutoff"
            rows={sweep}
            columns={[
              {
                key: "t",
                header: "Cutoff",
                render: (s) => (
                  <span
                    className={
                      s.isPublished ? "font-semibold text-[var(--ink)]" : ""
                    }
                  >
                    {s.threshold}
                    {s.isPublished ? "  (published)" : ""}
                  </span>
                ),
              },
              {
                key: "k",
                header: "Variants kept",
                align: "right",
                render: (s) => s.variantsKept.toLocaleString(),
              },
              {
                key: "c",
                header: "Coverage",
                align: "right",
                render: (s) => `${s.coveragePct}%`,
              },
              {
                key: "r",
                header: "Correlation r",
                align: "right",
                render: (s) => s.overallR.toFixed(3),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  value,
  sub,
  fraction,
  color,
  direction,
}: {
  title: string;
  value: string;
  sub: string;
  fraction: number;
  color: string;
  direction: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--page)] px-4 py-4">
      <div className="text-[12px] font-medium text-[var(--ink-secondary)]">
        {title}
      </div>
      <div
        className="mt-1.5 text-[28px] leading-none font-semibold tracking-tight"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[12px] text-[var(--ink-muted)]">{sub}</div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--grid)]">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.max(Math.min(fraction, 1), 0) * 100}%`,
            background: color,
          }}
        />
      </div>
      <div className="mt-2 text-[11px] text-[var(--ink-muted)]">{direction}</div>
    </div>
  );
}
