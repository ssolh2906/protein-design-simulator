import type { ReactNode } from "react";

/* ---------------------------------------------------------------- layout */

export function Section({
  title,
  lead,
  children,
  id,
}: {
  title?: string;
  lead?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      {title && (
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h2>
      )}
      {lead && (
        <p className="mb-6 max-w-2xl text-[15px] leading-7 text-[var(--ink-secondary)]">
          {lead}
        </p>
      )}
      {children}
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="prose-body max-w-2xl text-[15px]">{children}</div>
  );
}

/* ----------------------------------------------------------------- cards */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * A figure wrapper. The caption is part of the chart, not decoration: it
 * carries the reading instruction.
 */
export function Figure({
  title,
  subtitle,
  caption,
  children,
  source,
}: {
  title: string;
  subtitle?: string;
  caption?: ReactNode;
  children: ReactNode;
  source?: string;
}) {
  return (
    <figure className="my-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <figcaption className="border-b border-[var(--border)] px-5 pt-4 pb-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[13px] leading-5 text-[var(--ink-secondary)]">
            {subtitle}
          </p>
        )}
      </figcaption>
      <div className="px-5 py-5">{children}</div>
      {(caption || source) && (
        <div className="border-t border-[var(--border)] px-5 py-3">
          {caption && (
            <p className="text-[13px] leading-6 text-[var(--ink-secondary)]">
              {caption}
            </p>
          )}
          {source && (
            <p className="mt-1 text-[12px] text-[var(--ink-muted)]">{source}</p>
          )}
        </div>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------ stat tiles */

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
  );
}

export function Stat({
  value,
  label,
  tone = "neutral",
  hint,
}: {
  value: string;
  label: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  hint?: string;
}) {
  const toneColor = {
    neutral: "var(--ink)",
    good: "var(--success-text)",
    warn: "var(--serious)",
    bad: "var(--critical)",
  }[tone];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
      <div
        className="text-[26px] leading-none font-semibold tracking-tight"
        style={{ color: toneColor }}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[12px] leading-4 font-medium text-[var(--ink-secondary)]">
        {label}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] leading-4 text-[var(--ink-muted)]">
          {hint}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- callouts */

const CALLOUT_STYLE = {
  note: { border: "var(--series-1)", label: "Note" },
  warning: { border: "var(--serious)", label: "Watch out" },
  key: { border: "var(--good)", label: "Key idea" },
  trap: { border: "var(--critical)", label: "Common mistake" },
} as const;

export function Callout({
  kind = "note",
  title,
  children,
}: {
  kind?: keyof typeof CALLOUT_STYLE;
  title?: string;
  children: ReactNode;
}) {
  const s = CALLOUT_STYLE[kind];
  return (
    <div
      className="my-6 max-w-2xl rounded-r-lg border-l-[3px] bg-[var(--surface)] py-4 pr-5 pl-4"
      style={{ borderLeftColor: s.border }}
    >
      <div
        className="mb-1.5 text-[11px] font-semibold tracking-wider uppercase"
        style={{ color: s.border }}
      >
        {title ?? s.label}
      </div>
      <div className="prose-body text-[14px] [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- table */

export function DataTable<T>({
  rows,
  columns,
  dense = false,
  caption,
}: {
  rows: T[];
  columns: {
    key: string;
    header: string;
    align?: "left" | "right";
    render: (row: T) => ReactNode;
    width?: string;
  }[];
  dense?: boolean;
  caption?: string;
}) {
  const pad = dense ? "px-3 py-1.5" : "px-3 py-2.5";
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-[var(--border-strong)]">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={{ width: c.width }}
                className={`${pad} text-[11px] font-semibold tracking-wider text-[var(--ink-muted)] uppercase ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border)] last:border-0"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`${pad} tabular text-[var(--ink-secondary)] ${
                    c.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------ small bits */

export function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-[var(--page)] px-1.5 py-0.5 font-mono text-[0.9em] text-[var(--ink)] ring-1 ring-[var(--border)] ring-inset">
      {children}
    </code>
  );
}

/** A four-letter GB1 variant, with stop codons made obvious. */
export function Variant({ seq }: { seq: string }) {
  return (
    <span className="font-mono tracking-[0.08em] tabular">
      {seq.split("").map((ch, i) => (
        <span
          key={i}
          style={ch === "_" ? { color: "var(--critical)", fontWeight: 700 } : undefined}
          title={ch === "_" ? "stop codon" : undefined}
        >
          {ch === "_" ? "✗" : ch}
        </span>
      ))}
    </span>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 max-w-2xl overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-center font-mono text-[14px] leading-7 text-[var(--ink)]">
      {children}
    </div>
  );
}

export function CodeBlock({
  code,
  label,
}: {
  code: string;
  label?: string;
}) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[var(--border)]">
      {label && (
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 font-mono text-[11px] tracking-wider text-[var(--ink-muted)] uppercase">
          {label}
        </div>
      )}
      <pre className="overflow-x-auto bg-[var(--surface)] px-4 py-4 font-mono text-[12.5px] leading-6 text-[var(--ink-secondary)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** The one-line summary that closes every chapter. */
export function Takeaway({ children }: { children: ReactNode }) {
  return (
    <div className="mt-12 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-5">
      <div className="mb-2 text-[11px] font-semibold tracking-wider text-[var(--ink-muted)] uppercase">
        Take this with you
      </div>
      <p className="max-w-2xl text-[15px] leading-7 font-medium text-[var(--ink)]">
        {children}
      </p>
    </div>
  );
}
