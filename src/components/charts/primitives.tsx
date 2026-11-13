"use client";

import type { ReactNode } from "react";

/**
 * Shared chart pieces.
 *
 * All charts here are plain SVG. No chart library: the shapes are simple,
 * the bundle stays small, and every mark is inspectable.
 *
 * Conventions kept across every chart:
 *   - marks are thin, gridlines recessive, axes hairline
 *   - a 2px surface-coloured gap separates adjacent fills
 *   - text uses ink tokens, never the series colour
 *   - every chart has a hover layer and a table view beside it
 */

export function Tooltip({
  x,
  y,
  width,
  children,
}: {
  x: number;
  y: number;
  width: number;
  children: ReactNode;
}) {
  // Flip to the left of the cursor near the right edge so it never clips.
  const flip = x > width - 150;
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-raised)] px-2.5 py-2 text-[12px] leading-5 whitespace-nowrap shadow-lg"
      style={{
        left: flip ? undefined : x + 12,
        right: flip ? width - x + 12 : undefined,
        top: y + 12,
      }}
    >
      {children}
    </div>
  );
}

export function TooltipRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {color && (
        <span
          className="h-2 w-2 shrink-0 rounded-[2px]"
          style={{ background: color }}
          aria-hidden
        />
      )}
      <span className="text-[var(--ink-secondary)]">{label}</span>
      <span className="tabular ml-auto font-medium text-[var(--ink)]">
        {value}
      </span>
    </div>
  );
}

/** Legend. Always present when a chart shows two or more colours. */
export function Legend({
  items,
  title,
}: {
  items: { label: string; color: string }[];
  title?: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {title && (
        <span className="text-[11px] font-medium tracking-wide text-[var(--ink-muted)] uppercase">
          {title}
        </span>
      )}
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ background: it.color }}
            aria-hidden
          />
          <span className="tabular text-[12px] text-[var(--ink-secondary)]">
            {it.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function AxisLabel({
  children,
  orientation = "x",
}: {
  children: ReactNode;
  orientation?: "x" | "y";
}) {
  if (orientation === "y") {
    return (
      <div className="absolute top-1/2 -left-1 origin-left -translate-y-1/2 -rotate-90 text-[11px] whitespace-nowrap text-[var(--ink-muted)]">
        {children}
      </div>
    );
  }
  return (
    <div className="mt-1 text-center text-[11px] text-[var(--ink-muted)]">
      {children}
    </div>
  );
}

/** Linear scale factory. */
export function scale(d0: number, d1: number, r0: number, r1: number) {
  const span = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm >= 7.5 ? 10 : norm >= 3.5 ? 5 : norm >= 1.5 ? 2 : 1) * mag;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) {
    out.push(Math.round(v * 1e6) / 1e6);
  }
  return out;
}
