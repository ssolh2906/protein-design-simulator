import { UI, type Lang } from "@/lib/i18n";

/** Shown above English content served under a non-English locale. */
export function NotTranslated({ lang }: { lang: Lang }) {
  if (lang === "en") return null;
  const ui = UI[lang];
  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 lg:px-10 lg:pt-16">
      <div
        className="rounded-xl border-l-[3px] bg-[var(--surface)] py-4 pr-5 pl-4"
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
    </div>
  );
}
