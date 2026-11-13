"use client";

import { useMemo, useRef, useState } from "react";
import { Tooltip, TooltipRow, scale, niceTicks } from "./primitives";

export type Point = {
  x: number;
  y: number;
  /** Index into `groupColors`, for an ordered (not nominal) grouping. */
  g?: number;
  label?: string;
};

/**
 * Scatter plot with a nearest-point hover.
 *
 * Points are drawn small and semi-transparent because the interesting
 * feature is where the cloud is dense, not where any single point sits.
 * A diagonal reference line is drawn when the two axes share a scale.
 */
export function ScatterPlot({
  points,
  xLabel,
  yLabel,
  groupColors,
  groupLabels,
  diagonal = false,
  height = 340,
  domain,
  tickFormat = (v: number) => String(v),
  pointRadius = 2.1,
}: {
  points: Point[];
  xLabel: string;
  yLabel: string;
  groupColors?: string[];
  groupLabels?: string[];
  diagonal?: boolean;
  height?: number;
  domain?: [number, number];
  tickFormat?: (v: number) => string;
  pointRadius?: number;
}) {
  const [hover, setHover] = useState<{
    p: Point;
    cx: number;
    cy: number;
    w: number;
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const M = { top: 10, right: 12, bottom: 38, left: 48 };
  const W = 640;
  const H = height;

  const [d0, d1] = useMemo(() => {
    if (domain) return domain;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const lo = Math.min(...xs, ...ys);
    const hi = Math.max(...xs, ...ys);
    const pad = (hi - lo) * 0.04;
    return [lo - pad, hi + pad] as [number, number];
  }, [points, domain]);

  const sx = scale(d0, d1, M.left, W - M.right);
  const sy = scale(d0, d1, H - M.bottom, M.top);
  const ticks = niceTicks(d0, d1, 5);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // Convert client pixels into the SVG's own viewBox units.
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    const my = ((e.clientY - rect.top) / rect.height) * H;

    let best: Point | null = null;
    let bestD = 14 * 14; // only snap within ~14 units
    for (const p of points) {
      const dx = sx(p.x) - mx;
      const dy = sy(p.y) - my;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (best) {
      const wrapRect = wrapRef.current?.getBoundingClientRect();
      setHover({
        p: best,
        cx: e.clientX - (wrapRect?.left ?? 0),
        cy: e.clientY - (wrapRect?.top ?? 0),
        w: wrapRect?.width ?? 600,
      });
    } else {
      setHover(null);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Scatter plot of ${yLabel} against ${xLabel}, ${points.length} points`}
      >
        {/* gridlines */}
        {ticks.map((t) => (
          <g key={`g${t}`}>
            <line
              x1={sx(t)}
              x2={sx(t)}
              y1={M.top}
              y2={H - M.bottom}
              stroke="var(--grid)"
              strokeWidth={1}
            />
            <line
              x1={M.left}
              x2={W - M.right}
              y1={sy(t)}
              y2={sy(t)}
              stroke="var(--grid)"
              strokeWidth={1}
            />
          </g>
        ))}

        {/* axes */}
        <line
          x1={M.left}
          x2={W - M.right}
          y1={H - M.bottom}
          y2={H - M.bottom}
          stroke="var(--axis)"
          strokeWidth={1}
        />
        <line
          x1={M.left}
          x2={M.left}
          y1={M.top}
          y2={H - M.bottom}
          stroke="var(--axis)"
          strokeWidth={1}
        />

        {ticks.map((t) => (
          <g key={`t${t}`}>
            <text
              x={sx(t)}
              y={H - M.bottom + 15}
              textAnchor="middle"
              fontSize={10}
              fill="var(--ink-muted)"
            >
              {tickFormat(t)}
            </text>
            <text
              x={M.left - 8}
              y={sy(t) + 3.5}
              textAnchor="end"
              fontSize={10}
              fill="var(--ink-muted)"
            >
              {tickFormat(t)}
            </text>
          </g>
        ))}

        {diagonal && (
          <line
            x1={sx(d0)}
            y1={sy(d0)}
            x2={sx(d1)}
            y2={sy(d1)}
            stroke="var(--ink-muted)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
        )}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={pointRadius}
            fill={
              groupColors && p.g !== undefined
                ? groupColors[p.g]
                : "var(--series-1)"
            }
            opacity={0.5}
          />
        ))}

        {/* highlighted point gets a surface ring so it reads above the cloud */}
        {hover && (
          <circle
            cx={sx(hover.p.x)}
            cy={sy(hover.p.y)}
            r={5}
            fill={
              groupColors && hover.p.g !== undefined
                ? groupColors[hover.p.g]
                : "var(--series-1)"
            }
            stroke="var(--surface)"
            strokeWidth={2}
          />
        )}

        <text
          x={(M.left + W - M.right) / 2}
          y={H - 4}
          textAnchor="middle"
          fontSize={11}
          fill="var(--ink-muted)"
        >
          {xLabel}
        </text>
        <text
          transform={`rotate(-90 12 ${(M.top + H - M.bottom) / 2})`}
          x={12}
          y={(M.top + H - M.bottom) / 2}
          textAnchor="middle"
          fontSize={11}
          fill="var(--ink-muted)"
        >
          {yLabel}
        </text>
      </svg>

      {hover && (
        <Tooltip
          x={hover.cx}
          y={hover.cy}
          width={hover.w}
        >
          {hover.p.label && (
            <div className="mb-1 font-mono font-medium text-[var(--ink)]">
              {hover.p.label}
            </div>
          )}
          <TooltipRow label={xLabel} value={hover.p.x.toFixed(2)} />
          <TooltipRow label={yLabel} value={hover.p.y.toFixed(2)} />
          {groupLabels && hover.p.g !== undefined && (
            <TooltipRow
              label="reads"
              value={groupLabels[hover.p.g]}
              color={groupColors?.[hover.p.g]}
            />
          )}
        </Tooltip>
      )}
    </div>
  );
}
