"use client";

import { useState } from "react";
import type { HeatmapRow } from "@/lib/data";
import { Tooltip, TooltipRow } from "./primitives";
import { fitnessColor } from "@/lib/palette";

/**
 * Single-mutant fitness heatmap: four randomised positions by 20 amino acids.
 *
 * The colour scale is diverging and centred on the wild type, because the
 * meaningful question for every cell is "better or worse than what we
 * started with", not "how big". The wild-type cell is marked rather than
 * coloured, so it cannot be mistaken for a measurement.
 */
export function Heatmap({
  rows,
  aaOrder,
}: {
  rows: HeatmapRow[];
  aaOrder: string;
}) {
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    pos: number;
    wt: string;
    aa: string;
    fitness: number | null;
    input: number | null;
  } | null>(null);

  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* amino-acid column headers */}
          <div className="mb-1 flex" style={{ paddingLeft: 58 }}>
            {aaOrder.split("").map((aa) => (
              <div
                key={aa}
                className="flex-1 text-center font-mono text-[11px] text-[var(--ink-muted)]"
              >
                {aa}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div key={row.position} className="mb-[2px] flex items-stretch">
              <div
                className="tabular flex shrink-0 items-center justify-end pr-2.5 font-mono text-[11px] text-[var(--ink-secondary)]"
                style={{ width: 58 }}
              >
                {row.wt}
                {row.position}
              </div>

              {row.cells.map((cell) => {
                const logFit =
                  cell.fitness === null
                    ? null
                    : Math.log10(Math.max(cell.fitness, 1e-3));
                return (
                  <div
                    key={cell.aa}
                    className="mr-[2px] flex-1 cursor-crosshair last:mr-0"
                    style={{ height: 34 }}
                    onMouseMove={(e) => {
                      const r =
                        e.currentTarget.parentElement?.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
                      setHover({
                        x: e.clientX - (r?.left ?? 0),
                        y: e.clientY - (r?.top ?? 0),
                        pos: row.position,
                        wt: row.wt,
                        aa: cell.aa,
                        fitness: cell.fitness,
                        input: cell.input,
                      });
                    }}
                  >
                    {cell.isWt ? (
                      // Wild type: outlined, not filled. It is the reference.
                      <div className="flex h-full items-center justify-center rounded-[3px] border-2 border-dashed border-[var(--ink-muted)]">
                        <span className="text-[9px] font-semibold tracking-wide text-[var(--ink-secondary)]">
                          WT
                        </span>
                      </div>
                    ) : cell.fitness === null ? (
                      // Never measured. Hatched, so absence is visible.
                      <div
                        className="h-full rounded-[3px]"
                        style={{
                          background:
                            "repeating-linear-gradient(45deg, var(--grid) 0 3px, transparent 3px 6px)",
                          border: "1px solid var(--grid)",
                        }}
                        title="not measured"
                      />
                    ) : (
                      <div
                        className="h-full rounded-[3px]"
                        style={{ background: fitnessColor(logFit) }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <ScaleLegend />

      {hover && (
        <Tooltip x={hover.x} y={hover.y} width={9999}>
          <div className="mb-1 font-mono font-medium text-[var(--ink)]">
            {hover.wt}
            {hover.pos}
            {hover.aa}
            {hover.aa === hover.wt && " (wild type)"}
          </div>
          {hover.fitness === null ? (
            <div className="text-[var(--ink-secondary)]">not measured</div>
          ) : (
            <>
              <TooltipRow
                label="fitness"
                value={hover.fitness.toFixed(3)}
                color={fitnessColor(Math.log10(Math.max(hover.fitness, 1e-3)))}
              />
              <TooltipRow
                label="input reads"
                value={hover.input?.toLocaleString() ?? "-"}
              />
              <div className="mt-1 text-[11px] text-[var(--ink-muted)]">
                {hover.fitness > 1
                  ? `${hover.fitness.toFixed(1)}x wild type`
                  : `${(1 / Math.max(hover.fitness, 1e-6)).toFixed(0)}x worse than wild type`}
              </div>
            </>
          )}
        </Tooltip>
      )}
    </div>
  );
}

function ScaleLegend() {
  const steps = [
    { c: "var(--div-neg-4)", l: "0.01" },
    { c: "var(--div-neg-3)", l: "0.06" },
    { c: "var(--div-neg-2)", l: "0.25" },
    { c: "var(--div-neg-1)", l: "0.7" },
    { c: "var(--div-mid)", l: "1" },
    { c: "var(--div-pos-1)", l: "1.4" },
    { c: "var(--div-pos-2)", l: "2" },
    { c: "var(--div-pos-3)", l: "3" },
    { c: "var(--div-pos-4)", l: "5+" },
  ];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-[11px] font-medium tracking-wide text-[var(--ink-muted)] uppercase">
        Fitness
      </span>
      <div className="flex items-end">
        {steps.map((s) => (
          <div key={s.l} className="flex flex-col items-center">
            <span
              className="h-3 w-7"
              style={{ background: s.c }}
              aria-hidden
            />
            <span className="tabular mt-1 text-[10px] text-[var(--ink-muted)]">
              {s.l}
            </span>
          </div>
        ))}
      </div>
      <span className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
        <span
          className="inline-block h-3 w-5 rounded-[2px]"
          style={{
            background:
              "repeating-linear-gradient(45deg, var(--grid) 0 3px, transparent 3px 6px)",
            border: "1px solid var(--grid)",
          }}
          aria-hidden
        />
        not measured
      </span>
    </div>
  );
}
