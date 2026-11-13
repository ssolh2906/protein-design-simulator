"use client";

import { useState } from "react";
import { Tooltip, TooltipRow, niceTicks } from "./primitives";

export type Bar = {
  label: string;
  value: number;
  color?: string;
  /** Extra lines shown in the tooltip. */
  detail?: { label: string; value: string }[];
  /** Shown at the end of the bar. */
  valueLabel?: string;
};

/**
 * Horizontal bar chart.
 *
 * Horizontal because the category labels here are words and depth ranges,
 * which read far better on the left than rotated under an x axis.
 */
export function BarChart({
  bars,
  max,
  unit = "",
  height = 26,
  gap = 10,
  labelWidth = 92,
  showAxis = true,
}: {
  bars: Bar[];
  max?: number;
  unit?: string;
  height?: number;
  gap?: number;
  labelWidth?: number;
  showAxis?: boolean;
}) {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(
    null,
  );

  const domainMax = max ?? Math.max(...bars.map((b) => b.value)) * 1.08;
  const ticks = niceTicks(0, domainMax, 4);
  const plotWidth = 100; // percent-based so the chart is fully fluid

  return (
    <div
      className="relative"
      onMouseLeave={() => setHover(null)}
    >
      {showAxis && (
        <div
          className="relative mb-1.5 h-4"
          style={{ marginLeft: labelWidth }}
          aria-hidden
        >
          {ticks.map((t) => (
            <span
              key={t}
              className="tabular absolute -translate-x-1/2 text-[10px] text-[var(--ink-muted)]"
              style={{ left: `${(t / domainMax) * plotWidth}%` }}
            >
              {t}
              {unit}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col" style={{ gap }}>
        {bars.map((b, i) => (
          <div key={b.label} className="flex items-center">
            <div
              className="shrink-0 pr-3 text-right text-[12px] leading-4 text-[var(--ink-secondary)]"
              style={{ width: labelWidth }}
            >
              {b.label}
            </div>

            <div
              className="relative flex-1"
              style={{ height }}
              onMouseMove={(e) => {
                const r = e.currentTarget
                  .closest(".relative")
                  ?.getBoundingClientRect();
                setHover({
                  i,
                  x: e.clientX - (r?.left ?? 0),
                  y: e.clientY - (r?.top ?? 0),
                });
              }}
            >
              {/* recessive gridlines behind the bar */}
              {showAxis &&
                ticks.map((t) => (
                  <span
                    key={t}
                    className="absolute top-0 bottom-0 w-px bg-[var(--grid)]"
                    style={{ left: `${(t / domainMax) * plotWidth}%` }}
                    aria-hidden
                  />
                ))}

              <div
                className="absolute top-0 bottom-0 left-0 rounded-r-[4px] transition-[width] duration-300"
                style={{
                  width: `${Math.max((b.value / domainMax) * plotWidth, 0.4)}%`,
                  background: b.color ?? "var(--series-1)",
                  opacity: hover && hover.i !== i ? 0.45 : 1,
                }}
              />

              <span
                className="tabular absolute top-1/2 -translate-y-1/2 pl-2 text-[12px] font-medium text-[var(--ink)]"
                style={{
                  left: `${Math.max((b.value / domainMax) * plotWidth, 0.4)}%`,
                }}
              >
                {b.valueLabel ?? `${b.value}${unit}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hover && (
        <Tooltip x={hover.x + labelWidth} y={hover.y} width={9999}>
          <div className="mb-1 font-medium text-[var(--ink)]">
            {bars[hover.i].label}
          </div>
          <TooltipRow
            label="value"
            value={bars[hover.i].valueLabel ?? `${bars[hover.i].value}${unit}`}
            color={bars[hover.i].color ?? "var(--series-1)"}
          />
          {bars[hover.i].detail?.map((d) => (
            <TooltipRow key={d.label} label={d.label} value={d.value} />
          ))}
        </Tooltip>
      )}
    </div>
  );
}
