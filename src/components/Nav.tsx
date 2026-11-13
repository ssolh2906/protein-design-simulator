"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CHAPTERS } from "@/lib/chapters";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current = CHAPTERS.find((c) =>
    pathname?.startsWith(`/chapters/${c.slug}`),
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle chapter list"
          className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[var(--ink-secondary)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path
              d="M2 4h12M2 8h12M2 12h12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <Link href="/" className="text-[13px] font-semibold text-[var(--ink)]">
          GB1 pipeline
        </Link>
        {current && (
          <span className="truncate text-[12px] text-[var(--ink-muted)]">
            / {current.number}. {current.title}
          </span>
        )}
      </div>

      {/* Sidebar */}
      <nav
        className={`${
          open ? "block" : "hidden"
        } fixed inset-x-0 top-[53px] bottom-0 z-20 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-[272px] lg:shrink-0 lg:px-5 lg:py-7`}
        aria-label="Chapters"
      >
        <Link href="/" className="hidden lg:block">
          <div className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
            The GB1 pipeline
          </div>
          <div className="mt-0.5 text-[12px] leading-5 text-[var(--ink-muted)]">
            A protein design walkthrough on real data
          </div>
        </Link>

        <ol className="mt-6 space-y-0.5">
          {CHAPTERS.map((c) => {
            const active = pathname?.startsWith(`/chapters/${c.slug}`);
            return (
              <li key={c.slug}>
                <Link
                  onClick={() => setOpen(false)}
                  href={`/chapters/${c.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex gap-2.5 rounded-lg px-2.5 py-2 text-[13px] leading-5 transition-colors ${
                    active
                      ? "bg-[var(--page)] font-medium text-[var(--ink)]"
                      : "text-[var(--ink-secondary)] hover:bg-[var(--page)]"
                  }`}
                >
                  <span
                    className={`tabular mt-px w-4 shrink-0 text-[11px] ${
                      active
                        ? "text-[var(--series-1)]"
                        : "text-[var(--ink-muted)]"
                    }`}
                  >
                    {c.number}
                  </span>
                  <span>{c.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 border-t border-[var(--border)] pt-5">
          <Link
            onClick={() => setOpen(false)}
            href="/data"
            className={`block rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
              pathname?.startsWith("/data")
                ? "bg-[var(--page)] font-medium text-[var(--ink)]"
                : "text-[var(--ink-secondary)] hover:bg-[var(--page)]"
            }`}
          >
            The data &amp; how to rerun it
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/glossary"
            className={`block rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
              pathname?.startsWith("/glossary")
                ? "bg-[var(--page)] font-medium text-[var(--ink)]"
                : "text-[var(--ink-secondary)] hover:bg-[var(--page)]"
            }`}
          >
            Glossary
          </Link>
        </div>
      </nav>
    </>
  );
}
