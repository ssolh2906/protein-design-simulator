"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { L } from "./labels";

/**
 * "실제로는 이렇게 씁니다" — the code payoff shown after an answer.
 *
 * Two kinds of tab, deliberately:
 *   - what you would write yourself (pandas), so the logic is visible
 *   - what the field actually runs (Enrich2, DiMSum), so the reader knows
 *     the tool name and the exact option that corresponds to this step
 *
 * Only the lines that matter are shown. These are excerpts, not runnable
 * scripts, and the label says so.
 */

export type CodeTab = {
  /** Tool or library name, shown on the tab. */
  tool: string;
  /** One line on what this tool is, shown under the tabs. */
  note: string;
  lang: string;
  code: string;
  /** Optional link to the tool. */
  url?: string;
};

export function ToolCode({
  tabs,
  lang = "en",
  title,
}: {
  tabs: CodeTab[];
  lang?: Lang;
  title?: string;
}) {
  const [i, setI] = useState(0);
  const t = tabs[i];
  const ui = L[lang];
  const heading = title ?? ui.codeTitle;

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[var(--border)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
        <span className="mr-1 text-[11px] font-semibold tracking-wider text-[var(--ink-muted)] uppercase">
          {heading}
        </span>
        {tabs.map((tab, n) => (
          <button
            key={tab.tool}
            type="button"
            onClick={() => setI(n)}
            className={`rounded-md px-2.5 py-1 font-mono text-[12px] transition-colors ${
              n === i
                ? "bg-[var(--ink)] text-[var(--surface)]"
                : "text-[var(--ink-secondary)] ring-1 ring-[var(--border)] ring-inset hover:bg-[var(--page)]"
            }`}
          >
            {tab.tool}
          </button>
        ))}
      </div>

      <pre className="overflow-x-auto bg-[var(--surface)] px-4 py-4 font-mono text-[12.5px] leading-6 text-[var(--ink-secondary)]">
        <code>{t.code}</code>
      </pre>

      <div className="border-t border-[var(--border)] bg-[var(--page)] px-4 py-2.5">
        <p className="text-[12px] leading-5 text-[var(--ink-secondary)]">
          {t.note}
          {t.url && (
            <>
              {" "}
              <a
                href={t.url}
                className="font-medium text-[var(--series-1)] underline underline-offset-2"
              >
                {ui.repo}
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
