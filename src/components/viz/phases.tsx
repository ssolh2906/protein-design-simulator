"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The shared machinery behind the stepped figures.
 *
 * Every animated figure on this site works the same way: it plays itself so
 * the reader sees the sequence once without doing anything, and it stops the
 * moment the reader takes over. A figure that keeps moving after you click it
 * is fighting you.
 *
 * Anyone who asked their system for reduced motion gets no autoplay at all;
 * the stations still work, so nothing is unreachable.
 */
export function usePhases(count: number, intervalMs = 2200) {
  const [phase, setPhase] = useState(0);
  const [reduced, setReduced] = useState(false);
  const running = useRef(true);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      if (running.current) setPhase((p) => (p + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [reduced, count, intervalMs]);

  const pick = (n: number) => {
    running.current = false; // the reader is driving now
    setPhase(n);
  };

  return { phase, pick, reduced };
}

/** The station buttons, so every stepped figure is driven the same way. */
export function PhaseButtons({
  labels,
  phase,
  onPick,
}: {
  labels: string[];
  phase: number;
  onPick: (n: number) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {labels.map((s, n) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(n)}
          aria-current={n === phase ? "step" : undefined}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            n === phase
              ? "bg-[var(--ink)] text-[var(--surface)]"
              : "text-[var(--ink-muted)] ring-1 ring-[var(--border)] ring-inset hover:bg-[var(--page)]"
          }`}
        >
          <span className="tabular mr-1 opacity-60">{n + 1}</span>
          {s}
        </button>
      ))}
    </div>
  );
}

/** The line of explanation under a stepped figure. */
export function PhaseCaption({ text }: { text: string }) {
  return (
    <p
      aria-live="polite"
      className="mt-3 min-h-[40px] text-[13.5px] leading-6 text-[var(--ink-secondary)]"
    >
      {text}
    </p>
  );
}
