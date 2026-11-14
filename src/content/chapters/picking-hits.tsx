import {
  Callout,
  DataTable,
  Figure,
  Prose,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { Steps, Step } from "@/components/learn/Steps";
import { Predict, Quiz } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { getWinnersCurse, getLandscape, getConditions, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

type HitRow = {
  mut: string;
  input: number;
  igg10: number;
  igg20: number;
  igg90: number;
};

export function PickingHits({ lang, takeaway }: ChapterProps) {
  const curse = getWinnersCurse();
  const landscape = getLandscape();
  const cond = getConditions();
  const t = COPY[lang];

  const top10 = curse.tiers[0];
  const top2000 = curse.tiers[curse.tiers.length - 1];
  const changed = 25 - curse.overlapOfTop25;

  const hitColumns = [
    {
      key: "mut",
      header: t.colVariant,
      render: (r: HitRow) => <Variant seq={r.mut} />,
    },
    {
      key: "f",
      header: t.colMedium,
      align: "right" as const,
      render: (r: HitRow) => (
        <span style={{ color: "var(--success-text)", fontWeight: 500 }}>
          {r.igg20.toFixed(2)}x
        </span>
      ),
    },
    {
      key: "l",
      header: t.colLow,
      align: "right" as const,
      render: (r: HitRow) => `${r.igg10.toFixed(1)}x`,
    },
    {
      key: "h",
      header: t.colHigh,
      align: "right" as const,
      render: (r: HitRow) => `${r.igg90.toFixed(1)}x`,
    },
    {
      key: "n",
      header: t.colReads,
      align: "right" as const,
      render: (r: HitRow) => (
        <span
          style={{
            color: r.input < 100 ? "var(--serious)" : "var(--ink-secondary)",
            fontWeight: r.input < 100 ? 600 : 400,
          }}
        >
          {fmt(r.input)}
        </span>
      ),
    },
  ];

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="naive" title={t.s1Title}>
          <Prose>{t.s1Body(landscape.n)}</Prose>

          <Figure
            title={t.figNaiveTitle}
            subtitle={t.figNaiveSub}
            caption={t.figNaiveCaption}
          >
            <DataTable
              dense
              caption={t.figNaiveTitle}
              rows={curse.naiveTop}
              columns={hitColumns}
            />
          </Figure>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="trust" title={t.s2Title}>
          <Prose>{t.s2Body}</Prose>

          <Predict
            lang={lang}
            question={t.s2Question}
            hint={t.s2Hint}
            min={0}
            max={100}
            step={1}
            initial={60}
            actual={top10.confirmedPct}
            decimals={0}
            unit="%"
            verdictClose={t.s2Close}
            verdictFar={t.s2Far}
          >
            <Callout kind="note" title={t.s2NoteTitle}>
              {t.s2Note(top10.n, top10.medianInput, top10.medianInputAll)}
            </Callout>

            <Figure
              title={t.figTiersTitle}
              subtitle={t.figTiersSub}
              caption={t.figTiersCaption(
                top2000.n,
                100 - top2000.confirmedPct,
                top2000.n - top2000.confirmedInBoth,
              )}
            >
              <DataTable
                caption={t.figTiersTitle}
                rows={curse.tiers}
                columns={[
                  {
                    key: "t",
                    header: t.colTier,
                    render: (x) => (
                      <span className="font-medium text-[var(--ink)]">
                        {x.tier}
                      </span>
                    ),
                  },
                  {
                    key: "m",
                    header: t.colMedianFitness,
                    align: "right",
                    render: (x) => `${x.medianFitness.toFixed(2)}x`,
                  },
                  {
                    key: "d",
                    header: t.colMedianReads,
                    align: "right",
                    render: (x) => fmt(x.medianInput),
                  },
                  {
                    key: "lc",
                    header: t.colThin,
                    align: "right",
                    render: (x) => (
                      <span
                        style={{
                          color:
                            x.lowCoverage > 0 ? "var(--serious)" : undefined,
                        }}
                      >
                        {x.lowCoverage}
                      </span>
                    ),
                  },
                  {
                    key: "c",
                    header: t.colConfirmed,
                    align: "right",
                    render: (x) => (
                      <span
                        style={{
                          color:
                            x.confirmedPct === 100
                              ? "var(--success-text)"
                              : "var(--serious)",
                          fontWeight: 500,
                        }}
                      >
                        {x.confirmedPct}%
                      </span>
                    ),
                  },
                ]}
              />
            </Figure>
          </Predict>
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="defend" title={t.s3Title}>
          <Quiz
            lang={lang}
            scenario={t.s3Scenario(curse.deepMinInput, changed)}
            question={t.s3Question}
            choices={t.s3Choices}
          >
            <Figure
              title={t.figDeepTitle(curse.deepMinInput)}
              subtitle={t.figDeepSub}
              caption={t.figDeepCaption(curse.deepMinInput)}
            >
              <DataTable
                dense
                caption={t.figDeepTitle(curse.deepMinInput)}
                rows={curse.deepTop}
                columns={hitColumns}
              />
            </Figure>

            <StatGrid>
              <Stat
                value={`${curse.overlapOfTop25}/25`}
                label={t.statOverlap}
              />
              <Stat value={String(changed)} label={t.statChanged} tone="warn" />
              <Stat
                value={cond.agreement[0].r.toFixed(2)}
                label={t.statAgreement}
                tone="good"
              />
              <Stat
                value={`${landscape.betterThanWtPct}%`}
                label={t.statBetter}
                hint={fmt(landscape.betterThanWt)}
              />
            </StatGrid>

            <ToolCode
              lang={lang}
              tabs={[
                {
                  tool: "DiMSum",
                  lang: "bash",
                  note: t.noteDimsum,
                  url: "https://github.com/lehner-lab/DiMSum",
                  code: `# The evidence filter is a pipeline setting, not a
# spreadsheet step done at the end.
DiMSum \\
  --fitnessMinInputCountAny 500 \\
  --fitnessMinOutputCountAll 0`,
                },
                {
                  tool: "pandas",
                  lang: "python",
                  note: t.notePandas,
                  code: `# filter on evidence FIRST, then rank on score
candidates = df[
    (df["Input"] >= 500)
    & (df["fit_IGG10"] > 1.0)
    & (df["fit_IGG20"] > 1.0)
    & (df["fit_IGG90"] > 1.0)
].sort_values("fit_IGG20", ascending=False)

candidates.head(25).to_csv("order_list.csv", index=False)`,
                },
              ]}
            />
          </Quiz>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="checklist" title={t.s4Title}>
          <Prose>{t.s4Body}</Prose>

          <ol className="my-6 space-y-2">
            {t.checklist.map((c, i) => (
              <li
                key={c.q}
                className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
              >
                <span className="tabular mt-0.5 w-4 shrink-0 text-[13px] font-semibold text-[var(--series-1)]">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-[var(--ink)]">
                    {c.q}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-6 text-[var(--ink-secondary)]">
                    {c.d}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Step>,

        /* 5 --------------------------------------------------------- */
        <Step key="limits" title={t.s5Title}>
          <Prose>{t.s5Body}</Prose>

          <ul className="my-5 max-w-2xl space-y-2">
            {t.notCovered.map((x) => (
              <li
                key={x}
                className="flex gap-2.5 text-[14px] leading-6 text-[var(--ink-secondary)]"
              >
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink-muted)]"
                  aria-hidden
                />
                {x}
              </li>
            ))}
          </ul>

          <Callout kind="key" title={t.s5KeyTitle}>
            {t.s5Key}
          </Callout>
        </Step>,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["The naive list", "Can you trust it?", "A defensible list", "Checklist", "What we skipped"],

    s1Title: "Sort by fitness, take the top 25",
    s1Body: (n: number) => (
      <>
        <p>
          You have {fmt(n)} variants with fitness values, and you know what
          each number can and cannot support. Now somebody has to decide which
          handful to actually make.
        </p>
        <p>
          This is where an analysis becomes a decision, and sorting a column is
          not a decision. Start with the obvious answer anyway.
        </p>
      </>
    ),
    figNaiveTitle: "Top 25 variants by fitness at medium IgG",
    figNaiveSub: "With read depth, and the same variants in the other two conditions",
    figNaiveCaption: (
      <>
        Mostly this list is fine, which is worth saying plainly — the strongest
        binders in this library really are strong. But look at the read counts
        in the last column.
      </>
    ),
    colVariant: "Variant",
    colMedium: "Medium IgG",
    colLow: "Low IgG",
    colHigh: "High IgG",
    colReads: "Input reads",

    s2Title: "How much of that list survives a second opinion?",
    s2Body: (
      <p>
        Every variant in the table has a value in two other conditions. Take
        the top 10 by medium IgG and check how many are also above wild type in{" "}
        <em>both</em> of the others.
      </p>
    ),
    s2Question: "Of the top 10, how many confirm in both other conditions?",
    s2Hint: "Chapter 5 found correlation between conditions is only 0.72 overall.",
    s2Close: "{actual}%. The very top of this list is solid.",
    s2Far: "{actual}%. The very top of this list is solid — which is not the story you might expect after chapter 5.",
    s2NoteTitle: "An honest result, not a scandal",
    s2Note: (n: number, med: number, all: number) => (
      <>
        <p>
          It would make a better story to say the top of this list is junk. It
          is not. All {n} of the top variants confirm in both other conditions,
          and the median read depth at the top is actually <em>higher</em> than
          the library median ({fmt(med)} against {fmt(all)}).
        </p>
        <p>
          The problem is narrower and more practical than &ldquo;the top is
          noise&rdquo;.
        </p>
      </>
    ),
    figTiersTitle: "How well does each slice of the ranking hold up?",
    figTiersSub: "Share confirmed above wild type in both other IgG conditions",
    figTiersCaption: (n: number, failPct: number, failN: number) => (
      <>
        The very top is solid. By rank {fmt(n)}, roughly {failPct.toFixed(0)}%
        of the list fails to confirm — {fmt(failN)} variants that a
        single-condition ranking would have handed you as hits.
      </>
    ),
    colTier: "Rank tier",
    colMedianFitness: "Median fitness",
    colMedianReads: "Median reads",
    colThin: "Thin (<50 reads)",
    colConfirmed: "Confirmed",

    s3Title: "Two lists, two questions",
    s3Scenario: (minReads: number, changed: number) =>
      `Re-rank the library requiring at least ${fmt(minReads)} input reads, and ${changed} of the top 25 change. Same data, different filter.`,
    s3Question: "Which list do you send to the DNA synthesis order?",
    s3Choices: [
      {
        label: "The score-only list. It has the highest fitness values.",
        grade: "ok" as const,
        outcome: (
          <>
            Defensible if your goal is to find the ceiling of what the library
            contains. But some of those values rest on tens of reads, and you
            are about to spend money on each one.
          </>
        ),
      },
      {
        label: "The evidence-first list. Filter on read depth and agreement, then rank.",
        grade: "best" as const,
        outcome: (
          <>
            Yes. The top fitness values are slightly lower, and that is the
            price of only claiming what you can support. Every row rests on
            deep sequencing and agrees across three independent selections.
          </>
        ),
      },
      {
        label: "Neither alone. Send the overlap, and flag the rest as untested.",
        grade: "best" as const,
        outcome: (
          <>
            Also good, and often what happens in practice. The overlap is the
            high-confidence core; the variants unique to each list are a
            second tier you can label honestly rather than hide.
          </>
        ),
      },
    ],
    figDeepTitle: (n: number) => `Top variants with at least ${fmt(n)} input reads`,
    figDeepSub: "Deeply sequenced, confirmed in all three conditions",
    figDeepCaption: (n: number) => (
      <>
        Every row here rests on {fmt(n)}+ reads and agrees across three
        independent selections. The top fitness values are slightly lower than
        the unfiltered list. That is the price of only claiming what you can
        support.
      </>
    ),
    statOverlap: "On both shortlists",
    statChanged: "Variants that change",
    statAgreement: "Cross-condition agreement",
    statBetter: "Of library beats wild type",
    noteDimsum:
      "Putting the evidence threshold in the pipeline rather than in a final spreadsheet means it is recorded, versioned and applied the same way every run.",
    notePandas:
      "Order matters: filter on evidence first, then sort on score. Sorting first and trimming afterwards gives a different, worse list.",

    s4Title: "The checklist",
    s4Body: (
      <p>
        Before a variant goes on an order form, it should clear all of these.
        None require new experiments — every one is answerable from the data
        you already have.
      </p>
    ),
    checklist: [
      {
        q: "Does it have enough reads?",
        d: "Read depth, not fitness, is the first column to look at. A high score on 14 reads is a hypothesis, not a result.",
      },
      {
        q: "Does it replicate?",
        d: "Confirm it in an independent condition or replicate. This single check removes most of the variants that would waste your money.",
      },
      {
        q: "Is the effect bigger than the assay's floor?",
        d: "Chapter 4 put the dead-protein floor around 0.004. Differences below about 0.1 are not measurements.",
      },
      {
        q: "Is the improvement worth the number of mutations?",
        d: "A 4-mutation variant is more likely to have problems your assay never tested, such as stability or expression.",
      },
      {
        q: "Would a different analyst get the same list?",
        d: "If swapping the read cutoff reshuffles your top 25, say so in the report. It is information, not a flaw.",
      },
    ],

    s5Title: "What this walkthrough did not cover",
    s5Body: (
      <p>
        Being clear about the edges of a method is part of using it. This
        walkthrough stopped short of several things a real campaign needs:
      </p>
    ),
    notCovered: [
      "Imputing the missing variants. The original authors fitted a regression to estimate fitness for variants never observed.",
      "Confidence intervals on each fitness value, which read counts support and which would replace the depth bands used here.",
      "Training a model to predict variants that were never measured — the step that turns a screen into a design tool.",
      "Any property other than IgG binding. Stability, expression and specificity were not measured by this assay at all.",
    ],
    s5KeyTitle: "The habit worth keeping",
    s5Key: (
      <p>
        Every chapter followed the same pattern: look at the data, find a
        decision hiding in it, make the decision explicitly, and write down
        what it cost. That pattern is the whole job. The specific thresholds
        will change with every dataset you touch.
      </p>
    ),
  },

  ko: {
    labels: ["단순 목록", "믿을 수 있나", "방어 가능한 목록", "체크리스트", "다루지 않은 것"],

    s1Title: "fitness로 정렬해서 상위 25개",
    s1Body: (n: number) => (
      <>
        <p>
          fitness 값이 붙은 variant가 {fmt(n)}개 있고, 각 숫자가 무엇을 뒷받침할
          수 있고 없는지도 압니다. 이제 누군가는 실제로 어느 몇 개를 만들지
          정해야 합니다.
        </p>
        <p>
          분석이 의사결정이 되는 지점이고, 열 하나를 정렬하는 건 의사결정이
          아닙니다. 그래도 뻔한 답부터 시작해봅시다.
        </p>
      </>
    ),
    figNaiveTitle: "중간 농도 IgG fitness 상위 25개",
    figNaiveSub: "read depth와 다른 두 조건의 값을 같이 표시",
    figNaiveCaption: (
      <>
        이 목록은 대체로 괜찮습니다. 이건 분명히 말해둘 가치가 있어요. 이
        library에서 가장 센 binder들은 실제로 셉니다. 다만 마지막 열의 read 수를
        보세요.
      </>
    ),
    colVariant: "variant",
    colMedium: "중간 농도",
    colLow: "저농도",
    colHigh: "고농도",
    colReads: "input read",

    s2Title: "이 목록 중 몇 개가 재검증을 통과할까?",
    s2Body: (
      <p>
        표의 모든 variant는 다른 두 조건에도 값이 있습니다. 중간 농도 기준 상위
        10개를 가져와서, 나머지 <em>두 조건 모두에서</em> wild type을 넘는 게
        몇 개인지 봅시다.
      </p>
    ),
    s2Question: "상위 10개 중 다른 두 조건 모두에서 확인되는 건 몇 %일까요?",
    s2Hint: "5장에서 조건 간 correlation이 전체적으로 0.72였습니다.",
    s2Close: "{actual}%. 이 목록의 최상단은 탄탄합니다.",
    s2Far: "{actual}%입니다. 최상단은 탄탄합니다. 5장 이후 예상하셨을 이야기와는 다르죠.",
    s2NoteTitle: "정직한 결과이지 스캔들이 아닙니다",
    s2Note: (n: number, med: number, all: number) => (
      <>
        <p>
          이 목록 상단이 쓰레기라고 하면 이야기가 더 재미있겠지만, 아닙니다. 상위{" "}
          {n}개가 전부 다른 두 조건에서도 확인되고, 상단의 read depth 중앙값은
          오히려 library 중앙값보다 <em>높습니다</em> ({fmt(med)} 대 {fmt(all)}).
        </p>
        <p>
          문제는 &ldquo;상단이 노이즈다&rdquo;보다 더 좁고 더 실무적입니다.
        </p>
      </>
    ),
    figTiersTitle: "순위 구간별로 얼마나 버티는가",
    figTiersSub: "다른 두 IgG 조건 모두에서 wild type을 넘은 비율",
    figTiersCaption: (n: number, failPct: number, failN: number) => (
      <>
        최상단은 탄탄합니다. 순위 {fmt(n)}위쯤 가면 약 {failPct.toFixed(0)}%가
        확인에 실패합니다. 조건 하나로만 순위를 냈다면 hit로 넘겨줬을 variant가{" "}
        {fmt(failN)}개라는 뜻입니다.
      </>
    ),
    colTier: "순위 구간",
    colMedianFitness: "fitness 중앙값",
    colMedianReads: "read 중앙값",
    colThin: "얇음 (<50)",
    colConfirmed: "확인됨",

    s3Title: "목록 두 개, 질문 두 개",
    s3Scenario: (minReads: number, changed: number) =>
      `input read ${fmt(minReads)}개 이상을 요구하고 다시 순위를 내면 상위 25개 중 ${changed}개가 바뀝니다. 같은 데이터, 다른 filter입니다.`,
    s3Question: "DNA 합성 주문서에 어느 목록을 보내시겠습니까?",
    s3Choices: [
      {
        label: "점수만 본 목록. fitness 값이 가장 높으니까.",
        grade: "ok" as const,
        outcome: (
          <>
            library가 담고 있는 천장을 찾는 게 목적이라면 방어 가능합니다. 다만
            그 값들 중 일부는 read 수십 개에 기대고 있고, 이제 거기에 하나씩 돈을
            쓰려는 참입니다.
          </>
        ),
      },
      {
        label: "증거 우선 목록. read depth와 조건 간 일치로 거른 뒤 순위를 낸다.",
        grade: "best" as const,
        outcome: (
          <>
            맞습니다. 최상단 fitness 값이 조금 낮아지는데, 그게 뒷받침할 수 있는
            것만 주장하는 대가입니다. 모든 행이 깊은 sequencing에 기대고, 독립적인
            selection 세 개에서 일치합니다.
          </>
        ),
      },
      {
        label: "둘 다 아님. 교집합을 보내고 나머지는 미검증으로 표시한다.",
        grade: "best" as const,
        outcome: (
          <>
            이것도 좋고, 실무에서 자주 이렇게 합니다. 교집합이 고신뢰 핵심이고,
            각 목록에만 있는 variant는 숨기는 대신 정직하게 2군으로 표시할 수
            있습니다.
          </>
        ),
      },
    ],
    figDeepTitle: (n: number) => `input read ${fmt(n)}개 이상인 상위 variant`,
    figDeepSub: "깊게 읽혔고, 세 조건 모두에서 확인됨",
    figDeepCaption: (n: number) => (
      <>
        여기 모든 행은 read {fmt(n)}개 이상에 기대고, 독립적인 selection 세
        개에서 일치합니다. 최상단 fitness 값이 거르지 않은 목록보다 조금 낮은데,
        그게 뒷받침할 수 있는 것만 주장하는 대가입니다.
      </>
    ),
    statOverlap: "양쪽 목록에 다 있음",
    statChanged: "바뀌는 variant",
    statAgreement: "조건 간 일치도",
    statBetter: "wild type을 넘는 비율",
    noteDimsum:
      "증거 기준을 마지막 스프레드시트가 아니라 파이프라인에 넣으면, 기록되고 버전이 남고 매 실행마다 같은 방식으로 적용됩니다.",
    notePandas:
      "순서가 중요합니다. 증거로 먼저 거르고 그다음 점수로 정렬하세요. 정렬 먼저 하고 나중에 잘라내면 다른, 더 나쁜 목록이 나옵니다.",

    s4Title: "체크리스트",
    s4Body: (
      <p>
        variant가 주문서에 오르기 전에 이걸 전부 통과해야 합니다. 새 실험이
        필요한 항목은 하나도 없습니다. 전부 이미 가진 데이터로 답할 수 있습니다.
      </p>
    ),
    checklist: [
      {
        q: "read가 충분한가?",
        d: "fitness가 아니라 read depth가 가장 먼저 볼 열입니다. read 14개에서 나온 높은 점수는 결과가 아니라 가설입니다.",
      },
      {
        q: "재현되는가?",
        d: "독립적인 조건이나 반복으로 확인하세요. 이 확인 하나가 돈을 낭비할 variant 대부분을 걸러냅니다.",
      },
      {
        q: "효과가 assay의 바닥보다 큰가?",
        d: "4장에서 죽은 단백질의 바닥을 0.004 근처로 봤습니다. 0.1 아래의 차이는 측정이 아닙니다.",
      },
      {
        q: "개선 폭이 mutation 개수만큼의 값을 하는가?",
        d: "mutation 4개짜리 variant는 assay가 시험하지 않은 문제를 가질 확률이 더 높습니다. 안정성이나 발현 같은 것들요.",
      },
      {
        q: "다른 분석자가 같은 목록을 낼까?",
        d: "read cutoff를 바꿨을 때 상위 25개가 뒤섞인다면, 보고서에 그렇게 적으세요. 결함이 아니라 정보입니다.",
      },
    ],

    s5Title: "이 실습이 다루지 않은 것",
    s5Body: (
      <p>
        방법의 경계를 분명히 하는 것도 그 방법을 쓰는 일의 일부입니다. 이 실습은
        실제 캠페인에 필요한 것 몇 가지를 다루지 않았습니다:
      </p>
    ),
    notCovered: [
      "빠진 variant의 보간. 원 저자들은 관측되지 않은 variant의 fitness를 추정하려고 regression을 적합시켰습니다.",
      "각 fitness 값의 신뢰구간. read count가 뒷받침하는 값이고, 여기서 쓴 depth 구간을 대체했을 것입니다.",
      "측정되지 않은 variant를 예측하는 모델 학습. screen을 design 도구로 바꾸는 단계입니다.",
      "IgG 결합 외의 성질. 안정성, 발현, 특이성은 이 assay가 전혀 측정하지 않았습니다.",
    ],
    s5KeyTitle: "가져갈 습관",
    s5Key: (
      <p>
        모든 챕터가 같은 패턴이었습니다. 데이터를 보고, 그 안에 숨은 결정을 찾고,
        그 결정을 명시적으로 내리고, 무엇을 치렀는지 적는다. 이 패턴이 일 전체
        입니다. 구체적인 기준값은 만지는 데이터마다 달라집니다.
      </p>
    ),
  },
};
