import Link from "next/link";
import type { ReactNode } from "react";
import { chapterBySlug, neighbours } from "@/lib/chapters";
import { Takeaway } from "@/components/ui";

/**
 * Shared chrome for every chapter: heading, body, takeaway, and the
 * previous/next pair. Keeping it in one place means a chapter file holds
 * only its own content.
 */
export function ChapterFrame({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const chapter = chapterBySlug(slug);
  if (!chapter) throw new Error(`Unknown chapter: ${slug}`);
  const { prev, next } = neighbours(slug);

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 lg:px-10 lg:py-16">
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-3 text-[12px] text-[var(--ink-muted)]">
          <span className="tabular font-medium text-[var(--series-1)]">
            Chapter {chapter.number}
          </span>
          <span aria-hidden>·</span>
          <span>{chapter.minutes} min</span>
        </div>
        <h1 className="text-[32px] leading-[1.15] font-semibold tracking-tight text-[var(--ink)]">
          {chapter.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[var(--ink-secondary)]">
          {chapter.summary}
        </p>
      </header>

      {children}

      <Takeaway>{chapter.takeaway}</Takeaway>

      <nav className="mt-10 flex gap-3 border-t border-[var(--border)] pt-6">
        {prev ? (
          <Link
            href={`/chapters/${prev.slug}`}
            className="group flex-1 rounded-xl border border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface)]"
          >
            <div className="text-[11px] text-[var(--ink-muted)]">Previous</div>
            <div className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
              {prev.number}. {prev.title}
            </div>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/chapters/${next.slug}`}
            className="group flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-right transition-colors hover:bg-[var(--surface)]"
          >
            <div className="text-[11px] text-[var(--ink-muted)]">Next</div>
            <div className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
              {next.number}. {next.title}
            </div>
          </Link>
        ) : (
          <Link
            href="/data"
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-right transition-colors hover:bg-[var(--surface)]"
          >
            <div className="text-[11px] text-[var(--ink-muted)]">Finally</div>
            <div className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
              Run the pipeline yourself
            </div>
          </Link>
        )}
      </nav>
    </article>
  );
}
