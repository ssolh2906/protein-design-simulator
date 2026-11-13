import Link from "next/link";
import { chapterBySlug, neighbours } from "@/lib/chapters";
import { CHAPTER_COPY, UI, href, type Lang } from "@/lib/i18n";
import { getChapterContent } from "@/content/registry";
import { Takeaway } from "@/components/ui";

/**
 * Shared chrome for every chapter in every language: heading, body,
 * takeaway, and the previous/next pair. The body itself comes from the
 * content registry, which falls back to English when a translation is
 * missing and tells us so.
 */
export function ChapterFrame({ slug, lang }: { slug: string; lang: Lang }) {
  const chapter = chapterBySlug(slug);
  if (!chapter) throw new Error(`Unknown chapter: ${slug}`);

  const copy = CHAPTER_COPY[lang][slug];
  const ui = UI[lang];
  const { prev, next } = neighbours(slug);
  const { Content, isTranslated } = getChapterContent(slug, lang);

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 lg:px-10 lg:py-16">
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-3 text-[12px] text-[var(--ink-muted)]">
          <span className="tabular font-medium text-[var(--series-1)]">
            {ui.chapterLabel(chapter.number)}
          </span>
          <span aria-hidden>·</span>
          <span>{ui.minutes(chapter.minutes)}</span>
        </div>
        <h1 className="text-[32px] leading-[1.15] font-semibold tracking-tight text-[var(--ink)]">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[var(--ink-secondary)]">
          {copy.summary}
        </p>
      </header>

      {!isTranslated && (
        <div
          className="mb-10 rounded-xl border-l-[3px] bg-[var(--surface)] py-4 pr-5 pl-4"
          style={{ borderLeftColor: "var(--serious)" }}
        >
          <div
            className="mb-1.5 text-[11px] font-semibold tracking-wider uppercase"
            style={{ color: "var(--serious)" }}
          >
            {ui.notTranslated}
          </div>
          <p className="text-[14px] leading-6 text-[var(--ink-secondary)]">
            {ui.notTranslatedBody}
          </p>
        </div>
      )}

      <Content />

      <Takeaway label={ui.takeaway}>{copy.takeaway}</Takeaway>

      <nav className="mt-10 flex gap-3 border-t border-[var(--border)] pt-6">
        {prev ? (
          <Link
            href={href(lang, `/chapters/${prev.slug}`)}
            className="group flex-1 rounded-xl border border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface)]"
          >
            <div className="text-[11px] text-[var(--ink-muted)]">
              {ui.previous}
            </div>
            <div className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
              {prev.number}. {CHAPTER_COPY[lang][prev.slug].title}
            </div>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={href(lang, `/chapters/${next.slug}`)}
            className="group flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-right transition-colors hover:bg-[var(--surface)]"
          >
            <div className="text-[11px] text-[var(--ink-muted)]">{ui.next}</div>
            <div className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
              {next.number}. {CHAPTER_COPY[lang][next.slug].title}
            </div>
          </Link>
        ) : (
          <Link
            href={href(lang, "/data")}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-right transition-colors hover:bg-[var(--surface)]"
          >
            <div className="text-[11px] text-[var(--ink-muted)]">
              {ui.finally_}
            </div>
            <div className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
              {ui.runPipeline}
            </div>
          </Link>
        )}
      </nav>
    </article>
  );
}
