"use client";

import { useState, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { L } from "./labels";

/**
 * A chapter as a sequence of screens, one at a time.
 *
 * Long scrolling pages ask the reader to supply their own momentum. A step
 * sequence supplies it instead: one idea per screen, visible progress, and
 * an explicit action to continue. Every step is rendered on the server and
 * kept in the DOM, so nothing is fetched on navigation.
 */
export function Steps({
  steps,
  labels,
  takeaway,
  lang = "en",
}: {
  steps: ReactNode[];
  /** Short title per step, shown in the progress rail. */
  labels: string[];
  /** Shown only on the final step, so it cannot spoil the earlier ones. */
  takeaway?: ReactNode;
  lang?: Lang;
}) {
  const [i, setI] = useState(0);
  const t = L[lang];
  const last = steps.length - 1;

  const go = (n: number) => {
    setI(n);
    // Put the new step at the top of the viewport, where the old one started.
    if (typeof window !== "undefined") {
      document
        .getElementById("step-top")
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  };

  return (
    <div>
      <span id="step-top" className="block scroll-mt-20" aria-hidden />

      {/* Progress rail */}
      <nav
        className="mb-8 flex flex-wrap gap-1.5"
        aria-label={t.stepsAria}
      >
        {labels.map((label, n) => {
          const done = n < i;
          const current = n === i;
          return (
            <button
              key={n}
              type="button"
              onClick={() => go(n)}
              aria-current={current ? "step" : undefined}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                current
                  ? "bg-[var(--ink)] text-[var(--surface)]"
                  : done
                    ? "bg-[var(--page)] text-[var(--ink-secondary)] ring-1 ring-[var(--border)] ring-inset"
                    : "text-[var(--ink-muted)] ring-1 ring-[var(--border)] ring-inset hover:bg-[var(--page)]"
              }`}
            >
              <span className="tabular mr-1 opacity-60">{n + 1}</span>
              {label}
            </button>
          );
        })}
      </nav>

      <div className="min-h-[300px]">{steps[i]}</div>

      {i === last && takeaway}

      <div className="mt-10 flex items-center gap-3 border-t border-[var(--border)] pt-5">
        <button
          type="button"
          onClick={() => go(Math.max(0, i - 1))}
          disabled={i === 0}
          className="rounded-lg border border-[var(--border)] px-3.5 py-2 text-[13px] font-medium text-[var(--ink-secondary)] transition-colors hover:bg-[var(--page)] disabled:pointer-events-none disabled:opacity-35"
        >
          {t.prev}
        </button>

        <span className="tabular text-[12px] text-[var(--ink-muted)]">
          {i + 1} / {steps.length}
        </span>

        {i < last ? (
          <button
            type="button"
            onClick={() => go(i + 1)}
            className="ml-auto rounded-lg bg-[var(--ink)] px-4 py-2 text-[13px] font-medium text-[var(--surface)] transition-opacity hover:opacity-85"
          >
            {t.next}
          </button>
        ) : (
          <span className="ml-auto text-[12px] font-medium text-[var(--success-text)]">
            {t.chapterDone}
          </span>
        )}
      </div>
    </div>
  );
}

/** One screen inside a Steps sequence. */
export function Step({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {title && (
        <h2 className="mb-4 text-[22px] leading-tight font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
