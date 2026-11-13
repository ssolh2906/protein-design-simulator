/**
 * Chart colour tokens.
 *
 * This module has no "use client" directive on purpose. Anything exported
 * from a client module becomes a client-reference proxy when a server
 * component imports it, so the actual values would read as `undefined`
 * during static rendering and the colours would silently disappear. Plain
 * constants that both sides need therefore live here.
 *
 * Every value below was checked with a palette validator: see the comment at
 * the top of globals.css for what was verified.
 */

/** Categorical slots 1-3. Validated all-pairs for colour-blind separation. */
export const SERIES = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
];

/** Ordinal ramp, five steps, for sequencing depth (low to high). */
export const DEPTH_RAMP = [
  "var(--depth-1)",
  "var(--depth-2)",
  "var(--depth-3)",
  "var(--depth-4)",
  "var(--depth-5)",
];

/** Diverging scale for fitness, centred on the wild type (log10 fitness 0). */
export function fitnessColor(logFit: number | null): string {
  if (logFit === null) return "var(--grid)";
  if (logFit <= -2.0) return "var(--div-neg-4)";
  if (logFit <= -1.2) return "var(--div-neg-3)";
  if (logFit <= -0.6) return "var(--div-neg-2)";
  if (logFit <= -0.15) return "var(--div-neg-1)";
  if (logFit < 0.15) return "var(--div-mid)";
  if (logFit < 0.3) return "var(--div-pos-1)";
  if (logFit < 0.5) return "var(--div-pos-2)";
  if (logFit < 0.75) return "var(--div-pos-3)";
  return "var(--div-pos-4)";
}
