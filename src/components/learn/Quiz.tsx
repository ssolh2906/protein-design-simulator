"use client";

import { useState, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { L } from "./labels";

/* ------------------------------------------------------------- Predict */

/**
 * Guess a number, then see the real one.
 *
 * Reading "correlation falls to 0.42" costs nothing and teaches nothing.
 * Committing to a guess first makes the gap between expectation and
 * measurement into an event the reader remembers.
 */
export function Predict({
  question,
  hint,
  min,
  max,
  step = 0.01,
  initial,
  actual,
  unit = "",
  decimals = 2,
  verdictClose,
  verdictFar,
  lang = "en",
  children,
}: {
  question: string;
  hint?: string;
  min: number;
  max: number;
  step?: number;
  initial: number;
  actual: number;
  unit?: string;
  decimals?: number;
  /**
   * Feedback strings rather than callbacks: props crossing from a server
   * component into a client one must be serializable, and a function is
   * not. "{actual}" and "{guess}" are substituted.
   */
  verdictClose?: string;
  verdictFar?: string;
  lang?: Lang;
  /** Revealed after answering: the chart, the explanation, the code. */
  children?: ReactNode;
}) {
  const [guess, setGuess] = useState(initial);
  const [done, setDone] = useState(false);
  const t = L[lang];

  const format = (v: number) => v.toFixed(decimals);
  const off = Math.abs(guess - actual);
  const span = max - min;
  const close = off <= span * 0.08;

  const fill = (tpl: string) =>
    tpl
      .replaceAll("{actual}", format(actual))
      .replaceAll("{guess}", format(guess));

  return (
    <div className="my-6 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-5">
      <div className="mb-1 text-[11px] font-semibold tracking-wider text-[var(--series-1)] uppercase">
        {t.predictEyebrow}
      </div>
      <p className="text-[15px] leading-7 font-medium text-[var(--ink)]">
        {question}
      </p>
      {hint && (
        <p className="mt-1.5 text-[13px] leading-6 text-[var(--ink-secondary)]">
          {hint}
        </p>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-baseline gap-3">
          <span className="text-[12px] text-[var(--ink-muted)]">{t.myGuess}</span>
          <span
            className="tabular text-[26px] leading-none font-semibold"
            style={{ color: done ? "var(--ink-muted)" : "var(--series-1)" }}
          >
            {format(guess)}
            {unit}
          </span>
          {done && (
            <>
              <span className="text-[var(--ink-muted)]" aria-hidden>
                →
              </span>
              <span className="text-[12px] text-[var(--ink-muted)]">{t.actual}</span>
              <span
                className="tabular text-[26px] leading-none font-semibold"
                style={{ color: "var(--success-text)" }}
              >
                {format(actual)}
                {unit}
              </span>
            </>
          )}
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={guess}
          disabled={done}
          onChange={(e) => setGuess(Number(e.target.value))}
          className="w-full accent-[var(--series-1)] disabled:opacity-60"
          aria-label={question}
        />
        <div className="flex justify-between text-[10px] text-[var(--ink-muted)]">
          <span>
            {format(min)}
            {unit}
          </span>
          <span>
            {format(max)}
            {unit}
          </span>
        </div>
      </div>

      {!done ? (
        <button
          type="button"
          onClick={() => setDone(true)}
          className="mt-4 rounded-lg bg-[var(--ink)] px-4 py-2 text-[13px] font-medium text-[var(--surface)] transition-opacity hover:opacity-85"
        >
          {t.check}
        </button>
      ) : (
        <div className="mt-4">
          <p
            className="text-[13px] leading-6 font-medium"
            style={{
              color: close ? "var(--success-text)" : "var(--serious)",
            }}
          >
            {close
              ? verdictClose
                ? fill(verdictClose)
                : t.close
              : verdictFar
                ? fill(verdictFar)
                : t.farOff}
          </p>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Quiz */

export type Choice = {
  label: string;
  /** What actually happens if you choose this, in real numbers. */
  outcome: ReactNode;
  /** "best" is defensible, "ok" works with caveats, "bad" misleads you. */
  grade: "best" | "ok" | "bad";
};

/**
 * Role-play: you are the analyst, what do you do?
 *
 * There is usually no single right answer in this material, so options are
 * graded by how defensible they are, and every option shows its real
 * consequence rather than just "correct"/"wrong".
 */
export function Quiz({
  scenario,
  question,
  choices,
  lang = "en",
  children,
}: {
  scenario?: string;
  question: string;
  choices: Choice[];
  lang?: Lang;
  /** Revealed once a choice is made: the code, the explanation. */
  children?: ReactNode;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const t = L[lang];

  const GRADE = {
    best: { color: "var(--success-text)", label: t.grade.best },
    ok: { color: "var(--serious)", label: t.grade.ok },
    bad: { color: "var(--critical)", label: t.grade.bad },
  } as const;

  return (
    <div className="my-6 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-5">
      <div className="mb-1 text-[11px] font-semibold tracking-wider text-[var(--series-1)] uppercase">
        {t.quizEyebrow}
      </div>
      {scenario && (
        <p className="mb-2 text-[13.5px] leading-6 text-[var(--ink-secondary)]">
          {scenario}
        </p>
      )}
      <p className="text-[15px] leading-7 font-medium text-[var(--ink)]">
        {question}
      </p>

      <div className="mt-4 space-y-2">
        {choices.map((c, n) => {
          const isPicked = picked === n;
          const revealed = picked !== null;
          const g = GRADE[c.grade];
          return (
            <div key={c.label}>
              <button
                type="button"
                onClick={() => setPicked(n)}
                disabled={revealed}
                className={`w-full rounded-lg border px-4 py-3 text-left text-[14px] leading-6 transition-colors ${
                  isPicked
                    ? "border-[var(--border-strong)] bg-[var(--page)] font-medium text-[var(--ink)]"
                    : revealed
                      ? "border-[var(--border)] text-[var(--ink-muted)]"
                      : "border-[var(--border)] text-[var(--ink-secondary)] hover:bg-[var(--page)]"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <span className="mt-0.5 font-mono text-[12px] opacity-60">
                    {String.fromCharCode(65 + n)}
                  </span>
                  <span>{c.label}</span>
                  {revealed && (
                    <span
                      className="ml-auto shrink-0 text-[11px] font-semibold whitespace-nowrap"
                      style={{ color: g.color }}
                    >
                      {g.label}
                    </span>
                  )}
                </span>
              </button>

              {revealed && (
                <div
                  className="mt-1 mb-2 ml-4 border-l-2 pl-3.5 text-[13px] leading-6 text-[var(--ink-secondary)]"
                  style={{ borderColor: g.color }}
                >
                  {c.outcome}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {picked !== null && <div className="mt-5">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- Reveal */

/** A plain "click to see" wrapper, for a short answer with no scoring. */
export function Reveal({
  prompt,
  buttonLabel,
  lang = "en",
  children,
}: {
  prompt: string;
  buttonLabel?: string;
  lang?: Lang;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const label = buttonLabel ?? L[lang].showAnswer;
  return (
    <div className="my-6 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-5">
      <p className="text-[15px] leading-7 font-medium text-[var(--ink)]">
        {prompt}
      </p>
      {open ? (
        <div className="mt-4">{children}</div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-lg bg-[var(--ink)] px-4 py-2 text-[13px] font-medium text-[var(--surface)] transition-opacity hover:opacity-85"
        >
          {label}
        </button>
      )}
    </div>
  );
}
