"use client";

import { useState } from "react";
import { Tooltip, TooltipRow, scale } from "./primitives";

/**
 * Distribution of fitness on a log scale.
 *
 * A single series, so no legend box: the title names it. The wild-type
 * position is marked with a reference line, because "where is 1.0" is the
 * only question a reader actually asks of this chart.
 */
export function Histogram({
  bins,
  markAt = 0,
  markLabel = "wild type",
  xLabel,
  height = 220,
}: {
  bins: { logFitness: number; count: number }[];
  markAt?: number;
  markLabel?: string;
  xLabel: string;
  height?: number;
}) {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(
    null,
  );

  const W = 640;
  const H = height;
  const M = { top: 12, right: 14, bottom: 36, left: 52 };

  const xs = bins.map((b) => b.logFitness);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const maxCount = Math.max(...bins.map((b) => b.count));

  const sx = scale(x0, x1, M.left, W - M.right);
  const sy = scale(0, maxCount, H - M.bottom, M.top);
  const barW = Math.max((W - M.left - M.right) / bins.length - 2, 1);

  const xTicks = [-3, -2, -1, 0, 1];

  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Histogram of ${xLabel}`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={M.left}
            x2={W - M.right}
            y1={sy(maxCount * f)}
            y2={sy(maxCount * f)}
            stroke="var(--grid)"
            strokeWidth={1}
          />
        ))}

        {bins.map((b, i) => {
          const h = Math.max(sy(0) - sy(b.count), b.count > 0 ? 1 : 0);
          return (
            <rect
              key={i}
              x={sx(b.logFitness) - barW / 2}
              y={sy(b.count)}
              width={barW}
              height={h}
              rx={2}
              fill="var(--series-1)"
              opacity={hover && hover.i !== i ? 0.45 : 0.95}
              onMouseMove={(e) => {
                const r = (
                  e.currentTarget.ownerSVGElement?.parentElement
                )?.getBoundingClientRect();
                setHover({
                  i,
                  x: e.clientX - (r?.left ?? 0),
                  y: e.clientY - (r?.top ?? 0),
                });
              }}
            />
          );
        })}

        {/* wild-type reference */}
        <line
          x1={sx(markAt)}
          x2={sx(markAt)}
          y1={M.top}
          y2={H - M.bottom}
          stroke="var(--ink)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text
          x={sx(markAt) + 5}
          y={M.top + 10}
          fontSize={10}
          fill="var(--ink-secondary)"
        >
          {markLabel}
        </text>

        <line
          x1={M.left}
          x2={W - M.right}
          y1={H - M.bottom}
          y2={H - M.bottom}
          stroke="var(--axis)"
        />

        {xTicks
          .filter((t) => t >= x0 && t <= x1)
          .map((t) => (
            <text
              key={t}
              x={sx(t)}
              y={H - M.bottom + 15}
              textAnchor="middle"
              fontSize={10}
              fill="var(--ink-muted)"
            >
              {t === 0 ? "1" : `10^${t}`}
            </text>
          ))}

        {[0, 0.5, 1].map((f) => (
          <text
            key={f}
            x={M.left - 8}
            y={sy(maxCount * f) + 3.5}
            textAnchor="end"
            fontSize={10}
            fill="var(--ink-muted)"
          >
            {Math.round(maxCount * f).toLocaleString()}
          </text>
        ))}

        <text
          x={(M.left + W - M.right) / 2}
          y={H - 3}
          textAnchor="middle"
          fontSize={11}
          fill="var(--ink-muted)"
        >
          {xLabel}
        </text>
      </svg>

      {hover && (
        <Tooltip x={hover.x} y={hover.y} width={9999}>
          <TooltipRow
            label="fitness"
            value={`~${Math.pow(10, bins[hover.i].logFitness).toPrecision(2)}`}
            color="var(--series-1)"
          />
          <TooltipRow
            label="variants"
            value={bins[hover.i].count.toLocaleString()}
          />
        </Tooltip>
      )}
    </div>
  );
}
