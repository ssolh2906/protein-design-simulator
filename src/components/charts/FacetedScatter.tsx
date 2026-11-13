"use client";

import { useState } from "react";
import { DEPTH_RAMP } from "@/lib/palette";
import { scale } from "./primitives";

/**
 * Small multiples: one panel per read-depth band.
 *
 * A single scatter with five colours cannot show this. Overlapping
 * semi-transparent points pile up and every band ends up reading as the same
 * dark mass, so the claim "the shallow band is noisier" would be made by the
 * caption rather than by the chart. Faceting puts each band in its own panel
 * against the same axes, where the tightening around the diagonal is visible
 * directly.
 */
export function FacetedScatter({
  panels,
  xLabel,
  yLabel,
  domain = [-3.1, 1.3],
}: {
  panels: { bin: string; n: number; r: number; points: { x: number; y: number }[] }[];
  xLabel: string;
  yLabel: string;
  domain?: [number, number];
}) {
  const [active, setActive] = useState<number | null>(null);

  const S = 168; // panel size in viewBox units
  const M = { top: 6, right: 6, bottom: 22, left: 26 };
  const sx = scale(domain[0], domain[1], M.left, S - M.right);
  const sy = scale(domain[0], domain[1], S - M.bottom, M.top);
  const ticks = [-3, -2, -1, 0, 1];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {panels.map((p, i) => (
          <figure
            key={p.bin}
            className="rounded-lg border border-[var(--border)] bg-[var(--page)] p-2 transition-opacity"
            style={{ opacity: active !== null && active !== i ? 0.55 : 1 }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <figcaption className="mb-1 px-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ background: DEPTH_RAMP[i] }}
                  aria-hidden
                />
                <span className="tabular text-[11px] font-medium text-[var(--ink)]">
                  {p.bin}
                </span>
              </div>
              <div className="tabular mt-0.5 pl-4 text-[11px] text-[var(--ink-secondary)]">
                r = {p.r.toFixed(2)}
              </div>
            </figcaption>

            <svg
              viewBox={`0 0 ${S} ${S}`}
              className="w-full"
              role="img"
              aria-label={`${p.bin} input reads: correlation ${p.r.toFixed(2)} across ${p.n} variants`}
            >
              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={sx(t)}
                    x2={sx(t)}
                    y1={M.top}
                    y2={S - M.bottom}
                    stroke="var(--grid)"
                    strokeWidth={0.8}
                  />
                  <line
                    x1={M.left}
                    x2={S - M.right}
                    y1={sy(t)}
                    y2={sy(t)}
                    stroke="var(--grid)"
                    strokeWidth={0.8}
                  />
                </g>
              ))}

              <line
                x1={sx(domain[0])}
                y1={sy(domain[0])}
                x2={sx(domain[1])}
                y2={sy(domain[1])}
                stroke="var(--ink-muted)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />

              {p.points.map((pt, j) => (
                <circle
                  key={j}
                  cx={sx(pt.x)}
                  cy={sy(pt.y)}
                  r={1.5}
                  fill={DEPTH_RAMP[i]}
                  opacity={0.55}
                />
              ))}

              <line
                x1={M.left}
                x2={S - M.right}
                y1={S - M.bottom}
                y2={S - M.bottom}
                stroke="var(--axis)"
                strokeWidth={0.8}
              />
              <line
                x1={M.left}
                x2={M.left}
                y1={M.top}
                y2={S - M.bottom}
                stroke="var(--axis)"
                strokeWidth={0.8}
              />

              {[-3, -1, 1].map((t) => (
                <g key={`lab${t}`}>
                  <text
                    x={sx(t)}
                    y={S - M.bottom + 11}
                    textAnchor="middle"
                    fontSize={8}
                    fill="var(--ink-muted)"
                  >
                    {t}
                  </text>
                  <text
                    x={M.left - 4}
                    y={sy(t) + 3}
                    textAnchor="end"
                    fontSize={8}
                    fill="var(--ink-muted)"
                  >
                    {t}
                  </text>
                </g>
              ))}
            </svg>

            <div className="tabular mt-1 px-1 text-[10px] text-[var(--ink-muted)]">
              {p.n.toLocaleString()} variants
            </div>
          </figure>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-[var(--ink-muted)]">
        <span>horizontal: {xLabel}</span>
        <span>vertical: {yLabel}</span>
      </div>
    </div>
  );
}
