"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CHAPTERS } from "@/lib/chapters";
import {
  CHAPTER_COPY,
  LANG_NAME,
  LOCALES,
  UI,
  href,
  type Lang,
} from "@/lib/i18n";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Derived from the URL rather than passed in, so the root layout can serve
  // both locales without being duplicated per language.
  const lang: Lang = pathname?.startsWith("/ko") ? "ko" : "en";
  const ui = UI[lang];
  const copy = CHAPTER_COPY[lang];

  const current = CHAPTERS.find((c) =>
    pathname?.startsWith(href(lang, `/chapters/${c.slug}`)),
  );

  /**
   * The same page in the other language. Swapping the prefix keeps the
   * reader on the chapter they were reading instead of dumping them at the
   * home page, which is the whole point of a language toggle.
   */
  const swapLang = (to: Lang) => {
    const path = pathname ?? "/";
    const bare =
      lang === "en" ? path : path.replace(new RegExp(`^/${lang}`), "") || "/";
    return href(to, bare === "" ? "/" : bare);
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={ui.toggleChapters}
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
        <Link
          href={href(lang, "/")}
          className="text-[13px] font-semibold text-[var(--ink)]"
        >
          GB1 pipeline
        </Link>
        {current && (
          <span className="truncate text-[12px] text-[var(--ink-muted)]">
            / {current.number}. {copy[current.slug].title}
          </span>
        )}
        <LangToggle lang={lang} swapLang={swapLang} ui={ui} className="ml-auto" />
      </div>

      {/* Sidebar */}
      <nav
        className={`${
          open ? "block" : "hidden"
        } fixed inset-x-0 top-[53px] bottom-0 z-20 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-[272px] lg:shrink-0 lg:px-5 lg:py-7`}
        aria-label={ui.chaptersAria}
      >
        <div className="hidden lg:block">
          <Link href={href(lang, "/")}>
            <div className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
              {ui.siteTitle}
            </div>
            <div className="mt-0.5 text-[12px] leading-5 text-[var(--ink-muted)]">
              {ui.siteSubtitle}
            </div>
          </Link>
          <LangToggle
            lang={lang}
            swapLang={swapLang}
            ui={ui}
            className="mt-4"
          />
        </div>

        <ol className="mt-6 space-y-0.5">
          {CHAPTERS.map((c) => {
            const target = href(lang, `/chapters/${c.slug}`);
            const active = pathname === target || pathname === `${target}/`;
            return (
              <li key={c.slug}>
                <Link
                  onClick={close}
                  href={target}
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
                  <span>{copy[c.slug].title}</span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 border-t border-[var(--border)] pt-5">
          {[
            { path: "/data", label: ui.navData },
            { path: "/glossary", label: ui.navGlossary },
          ].map((item) => {
            const target = href(lang, item.path);
            const active = pathname === target || pathname === `${target}/`;
            return (
              <Link
                key={item.path}
                onClick={close}
                href={target}
                className={`block rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                  active
                    ? "bg-[var(--page)] font-medium text-[var(--ink)]"
                    : "text-[var(--ink-secondary)] hover:bg-[var(--page)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function LangToggle({
  lang,
  swapLang,
  ui,
  className = "",
}: {
  lang: Lang;
  swapLang: (to: Lang) => string;
  ui: (typeof UI)[Lang];
  className?: string;
}) {
  return (
    <div
      className={`inline-flex rounded-lg border border-[var(--border)] p-0.5 ${className}`}
      role="group"
      aria-label={ui.languageAria}
    >
      {LOCALES.map((l) => {
        const isCurrent = l === lang;
        return isCurrent ? (
          <span
            key={l}
            aria-current="true"
            className="rounded-[5px] bg-[var(--ink)] px-2 py-1 text-[11px] font-medium text-[var(--surface)]"
          >
            {LANG_NAME[l]}
          </span>
        ) : (
          <Link
            key={l}
            href={swapLang(l)}
            hrefLang={l}
            className="rounded-[5px] px-2 py-1 text-[11px] font-medium text-[var(--ink-secondary)] hover:bg-[var(--page)]"
          >
            {LANG_NAME[l]}
          </Link>
        );
      })}
    </div>
  );
}
