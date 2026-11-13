"use client";

import { useState } from "react";
import type { RawRow } from "@/lib/data";

const FLAGS: Record<
  string,
  { label: string; color: string; note: string }
> = {
  wildtype: {
    label: "wild type",
    color: "var(--ink-muted)",
    note: "The reference. Every fitness value is relative to this row.",
  },
  stop: {
    label: "stop codon",
    color: "var(--critical)",
    note: "A truncated protein. Not a design candidate.",
  },
  zeroInput: {
    label: "zero input",
    color: "var(--critical)",
    note: "Seen after selection but never before it. Fitness would divide by zero.",
  },
  lowInput: {
    label: "low reads",
    color: "var(--serious)",
    note: "Too few reads to estimate a ratio with any confidence.",
  },
  dropout: {
    label: "dropout",
    color: "var(--warning)",
    note: "Present before selection, gone after it. Dead, or just missed.",
  },
  enriched: {
    label: "enriched",
    color: "var(--good)",
    note: "Went up during selection. A candidate binder.",
  },
  ordinary: {
    label: "ordinary",
    color: "var(--ink-muted)",
    note: "Nothing unusual. Most rows look like this.",
  },
};

/**
 * Real rows from the raw file, with the ability to filter to one kind of
 * problem at a time. None of these rows are invented.
 */
export function RawTable({ rows }: { rows: RawRow[] }) {
  const [filter, setFilter] = useState<string | null>(null);

  const present = Array.from(new Set(rows.map((r) => r.flag)));
  const shown = filter ? rows.filter((r) => r.flag === filter) : rows;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
            filter === null
              ? "bg-[var(--ink)] text-[var(--surface)]"
              : "border border-[var(--border)] text-[var(--ink-secondary)] hover:bg-[var(--page)]"
          }`}
        >
          All {rows.length}
        </button>
        {present.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(filter === f ? null : f)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              filter === f
                ? "bg-[var(--ink)] text-[var(--surface)]"
                : "border border-[var(--border)] text-[var(--ink-secondary)] hover:bg-[var(--page)]"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: FLAGS[f]?.color }}
              aria-hidden
            />
            {FLAGS[f]?.label ?? f}
          </button>
        ))}
      </div>

      {filter && (
        <p className="mb-3 text-[13px] leading-6 text-[var(--ink-secondary)]">
          {FLAGS[filter]?.note}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <caption className="sr-only">
            Sample of real rows from the raw read-count file
          </caption>
          <thead>
            <tr className="border-b border-[var(--border-strong)]">
              {["variant", "mut", "input", "IgG low", "IgG mid", "IgG high", ""].map(
                (h, i) => (
                  <th
                    key={h + i}
                    scope="col"
                    className={`px-3 py-2 text-[11px] font-semibold tracking-wider text-[var(--ink-muted)] uppercase ${
                      i === 0 || i === 6 ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const f = FLAGS[r.flag];
              return (
                <tr
                  key={r.mut}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-3 py-2">
                    <span className="font-mono tracking-[0.1em] tabular">
                      {r.mut.split("").map((ch, i) => (
                        <span
                          key={i}
                          style={
                            ch === "_"
                              ? {
                                  color: "var(--critical)",
                                  fontWeight: 700,
                                }
                              : { color: "var(--ink)" }
                          }
                        >
                          {ch === "_" ? "✗" : ch}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="tabular px-3 py-2 text-right text-[var(--ink-muted)]">
                    {r.hd}
                  </td>
                  <td
                    className="tabular px-3 py-2 text-right font-medium"
                    style={{
                      color:
                        r.Input === 0
                          ? "var(--critical)"
                          : r.Input < 10
                            ? "var(--serious)"
                            : "var(--ink)",
                    }}
                  >
                    {r.Input.toLocaleString()}
                  </td>
                  {(["IGG10", "IGG20", "IGG90"] as const).map((c) => (
                    <td
                      key={c}
                      className="tabular px-3 py-2 text-right text-[var(--ink-secondary)]"
                    >
                      {r[c].toLocaleString()}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <span
                      className="text-[11px] font-medium whitespace-nowrap"
                      style={{ color: f?.color }}
                    >
                      {f?.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
