import Link from "next/link";
import { CHAPTERS, TOTAL_MINUTES } from "@/lib/chapters";
import { CHAPTER_COPY, UI, href, type Lang } from "@/lib/i18n";
import { translatedCount } from "@/content/registry";
import { getRawProfile, getLandscape, getMeta, fmt } from "@/lib/data";
import { Stat, StatGrid } from "@/components/ui";

/** Home page copy, per language. Numbers come from the shared pipeline. */
const COPY = {
  en: {
    eyebrow: "A protein design walkthrough",
    h1a: "160,000 protein variants.",
    h1b: "One very messy file.",
    lead1:
      "This is a hands-on tour of a real protein engineering dataset. You start with raw sequencing read counts, exactly as they came off the machine. You finish with a shortlist of protein variants you would spend real money to make.",
    lead2:
      "Nothing here is simulated. The numbers come from a published experiment, and the mess is the mess the original authors had to deal with.",
    statRows: "Rows in the raw file",
    statRowsHint: "not 160,000",
    statStops: "Contain a stop codon",
    statStopsHint: "broken proteins",
    statQc: "Survive quality control",
    statQcHint: "matches the paper",
    statBetter: "Beat the wild type",
    whoTitle: "Who this is for",
    who1a:
      "You are new to bioinformatics, and tutorials keep handing you clean data. Real data is not clean. It has stop codons where proteins should be, variants with four reads that look like miracle hits, and a quality cutoff that somebody picked by judgement and wrote ",
    who1b: " next to.",
    who2: "Every chapter shows you the real numbers, explains the decision, and shows what the decision costs. No step is hidden behind a library call.",
    walkthrough: "The walkthrough",
    chaptersAbout: (n: number, m: number) =>
      `${n} chapters · about ${m} min`,
    sourceTitle: "Where the data comes from",
    sourceBody:
      "The library randomised four neighbouring residues of protein G domain B1 — V39, D40, G41 and V54 — and selected for binding to IgG. Read counts come from the authors' own analysis repository and are reused under",
    readPaper: "Read the paper",
    origCode: "Original analysis code",
    rerun: "Rerun this pipeline",
    translationNote: null as string | null,
  },
  ko: {
    eyebrow: "protein design 실습",
    h1a: "protein variant 160,000개.",
    h1b: "그리고 아주 지저분한 파일 하나.",
    lead1:
      "실제 protein engineering 데이터를 직접 만져보는 실습입니다. 시작은 장비에서 나온 그대로의 raw sequencing read count입니다. 끝은 실제로 돈을 들여 만들 만한 variant 후보 목록입니다.",
    lead2:
      "여기에 시뮬레이션은 없습니다. 숫자는 출판된 실험에서 나온 것이고, 이 지저분함은 원 저자들이 실제로 감당해야 했던 그 지저분함입니다.",
    statRows: "raw 파일의 행 수",
    statRowsHint: "160,000이 아님",
    statStops: "stop codon 포함",
    statStopsHint: "망가진 protein",
    statQc: "quality control 통과",
    statQcHint: "논문과 일치",
    statBetter: "wild type보다 나음",
    whoTitle: "이런 분께",
    who1a:
      "bioinformatics를 막 시작했는데, 튜토리얼마다 깨끗한 데이터만 줍니다. 실제 데이터는 깨끗하지 않습니다. protein이 있어야 할 자리에 stop codon이 있고, read가 4개뿐인데 기적의 hit처럼 보이는 variant가 있고, 누군가 감으로 정해놓고 옆에 ",
    who1b: " 이라고 적어둔 quality cutoff가 있습니다.",
    who2:
      "모든 챕터가 실제 숫자를 보여주고, 어떤 결정을 왜 내렸는지 설명하고, 그 결정이 무엇을 치르는지 보여줍니다. 라이브러리 호출 뒤에 숨긴 단계는 없습니다.",
    walkthrough: "챕터",
    chaptersAbout: (n: number, m: number) => `${n}개 챕터 · 약 ${m}분`,
    sourceTitle: "데이터 출처",
    sourceBody:
      "protein G domain B1의 이웃한 residue 네 개 — V39, D40, G41, V54 — 를 무작위화하고 IgG 결합으로 selection한 library입니다. read count는 저자들의 분석 저장소에서 가져왔고 다음 라이선스로 재사용합니다:",
    readPaper: "논문 보기",
    origCode: "원본 분석 코드",
    rerun: "파이프라인 재실행하기",
    translationNote:
      "한국어 번역은 진행 중입니다. 아직 옮기지 않은 챕터는 영어 원문이 보이고, 그 사실을 챕터 상단에 표시합니다.",
  },
} as const;

export function Home({ lang }: { lang: Lang }) {
  const profile = getRawProfile();
  const landscape = getLandscape();
  const meta = getMeta();
  const t = COPY[lang];
  const chapterCopy = CHAPTER_COPY[lang];
  const ui = UI[lang];
  const done = translatedCount(lang);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-10 lg:py-20">
      <header className="mb-12">
        <p className="mb-4 text-[12px] font-medium tracking-wider text-[var(--series-1)] uppercase">
          {t.eyebrow}
        </p>
        <h1 className="text-[40px] leading-[1.1] font-semibold tracking-tight text-[var(--ink)]">
          {t.h1a}
          <br />
          {t.h1b}
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[var(--ink-secondary)]">
          {t.lead1}
        </p>
        <p className="mt-4 max-w-2xl text-[17px] leading-8 text-[var(--ink-secondary)]">
          {t.lead2}
        </p>
      </header>

      {t.translationNote && done < CHAPTERS.length && (
        <div
          className="mb-10 rounded-xl border-l-[3px] bg-[var(--surface)] py-4 pr-5 pl-4"
          style={{ borderLeftColor: "var(--serious)" }}
        >
          <div
            className="mb-1.5 text-[11px] font-semibold tracking-wider uppercase"
            style={{ color: "var(--serious)" }}
          >
            {done} / {CHAPTERS.length}
          </div>
          <p className="text-[14px] leading-6 text-[var(--ink-secondary)]">
            {t.translationNote}
          </p>
        </div>
      )}

      <StatGrid>
        <Stat
          value={fmt(profile.rowsInFile)}
          label={t.statRows}
          hint={t.statRowsHint}
        />
        <Stat
          value={fmt(profile.rowsWithStopCodon)}
          label={t.statStops}
          tone="warn"
          hint={t.statStopsHint}
        />
        <Stat value={fmt(landscape.n)} label={t.statQc} hint={t.statQcHint} />
        <Stat
          value={`${landscape.betterThanWtPct}%`}
          label={t.statBetter}
          tone="good"
          hint={`${fmt(landscape.betterThanWt)} variants`}
        />
      </StatGrid>

      <section className="my-14">
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-[var(--ink)]">
          {t.whoTitle}
        </h2>
        <p className="prose-body max-w-2xl text-[15px]">
          {t.who1a}
          <code className="rounded bg-[var(--page)] px-1 py-0.5 font-mono text-[13px] ring-1 ring-[var(--border)] ring-inset">
            #TUNABLE
          </code>
          {t.who1b}
        </p>
        <p className="prose-body mt-4 max-w-2xl text-[15px]">{t.who2}</p>
      </section>

      <section className="my-14">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
            {t.walkthrough}
          </h2>
          <span className="text-[12px] text-[var(--ink-muted)]">
            {t.chaptersAbout(CHAPTERS.length, TOTAL_MINUTES)}
          </span>
        </div>

        <ol className="space-y-2">
          {CHAPTERS.map((c) => (
            <li key={c.slug}>
              <Link
                href={href(lang, `/chapters/${c.slug}`)}
                className="group flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <span className="tabular mt-0.5 w-5 shrink-0 text-[13px] font-medium text-[var(--series-1)]">
                  {c.number}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-[var(--ink)]">
                    {chapterCopy[c.slug].title}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-6 text-[var(--ink-secondary)]">
                    {chapterCopy[c.slug].summary}
                  </span>
                </span>
                <span
                  className="mt-1 ml-auto shrink-0 self-start text-[var(--ink-muted)] transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                >
                  <svg width="14" height="14" viewBox="0 0 16 16">
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="my-14 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
          {t.sourceTitle}
        </h2>
        <p className="mt-2 text-[14px] leading-7 text-[var(--ink-secondary)]">
          {meta.source.paper}. {t.sourceBody} {meta.source.licence}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`https://doi.org/${meta.source.doi}`}
            className="text-[13px] font-medium text-[var(--series-1)] underline underline-offset-2"
          >
            {t.readPaper}
          </a>
          <a
            href={meta.source.repo}
            className="text-[13px] font-medium text-[var(--series-1)] underline underline-offset-2"
          >
            {t.origCode}
          </a>
          <Link
            href={href(lang, "/data")}
            className="text-[13px] font-medium text-[var(--series-1)] underline underline-offset-2"
          >
            {t.rerun}
          </Link>
        </div>
        <p className="mt-3 text-[12px] text-[var(--ink-muted)]">
          {ui.siteSubtitle}
        </p>
      </section>
    </div>
  );
}
