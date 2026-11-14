import {
  Callout,
  DataTable,
  Figure,
  Prose,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { BarChart } from "@/components/charts/BarChart";
import { Legend } from "@/components/charts/primitives";
import { SERIES } from "@/lib/palette";
import { Steps, Step } from "@/components/learn/Steps";
import { Quiz } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { getConditions, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

const LABEL_KEYS = ["IGG10", "IGG20", "IGG90"] as const;

export function AssayConditions({ lang, takeaway }: ChapterProps) {
  const cond = getConditions();
  const t = COPY[lang];
  const low = cond.spread.find((s) => s.condition === "IGG10")!;
  const mid = cond.spread.find((s) => s.condition === "IGG20")!;
  const high = cond.spread.find((s) => s.condition === "IGG90")!;
  const top = cond.examples[0];

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="three" title={t.s1Title(String(top.mut))}>
          <Prose>{t.s1Body}</Prose>

          <div className="my-6 grid gap-3 sm:grid-cols-3">
            {LABEL_KEYS.map((k, i) => (
              <div
                key={k}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
              >
                <div className="text-[12px] font-medium text-[var(--ink-secondary)]">
                  {t.condLabels[i]}
                </div>
                <div
                  className="mt-1.5 text-[30px] leading-none font-semibold tracking-tight"
                  style={{ color: SERIES[i] }}
                >
                  {Number(top[k]).toFixed(1)}x
                </div>
                <div className="mt-1.5 text-[11px] text-[var(--ink-muted)]">
                  {t.betterThanWt}
                </div>
              </div>
            ))}
          </div>

          <Prose>
            {t.s1After(
              String(top.mut),
              Number(top.IGG90),
              Number(top.IGG10),
            )}
          </Prose>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="why" title={t.s2Title}>
          <Quiz
            lang={lang}
            scenario={t.s2Scenario}
            question={t.s2Question}
            choices={t.s2Choices}
          >
            <Prose>{t.s2After}</Prose>

            <Figure
              title={t.figSpreadTitle}
              subtitle={t.figSpreadSub}
              caption={t.figSpreadCaption(low.max, high.max)}
            >
              <BarChart
                labelWidth={96}
                unit="x"
                bars={cond.spread.map((s, i) => ({
                  label: t.condLabels[i],
                  value: s.max,
                  valueLabel: `${s.max.toFixed(1)}x`,
                  color: SERIES[i],
                  detail: [
                    { label: "99th pct", value: `${s.p99.toFixed(2)}x` },
                    { label: "> WT", value: `${s.aboveWtPct}%` },
                  ],
                }))}
              />
              <Legend
                items={cond.spread.map((s, i) => ({
                  label: t.condLabels[i],
                  color: SERIES[i],
                }))}
              />
            </Figure>

            <StatGrid>
              <Stat
                value={`${low.max.toFixed(0)}x`}
                label={t.statLow}
                hint={t.statLowHint}
              />
              <Stat value={`${mid.max.toFixed(1)}x`} label={t.statMid} />
              <Stat
                value={`${high.max.toFixed(1)}x`}
                label={t.statHigh}
                hint={t.statHighHint}
              />
              <Stat
                value={`${(low.max / high.max).toFixed(1)}x`}
                label={t.statStretch}
                tone="warn"
              />
            </StatGrid>
          </Quiz>
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="rank" title={t.s3Title}>
          <Prose>{t.s3Body(cond.deepN)}</Prose>

          <Figure
            title={t.figAgreeTitle}
            subtitle={t.figAgreeSub}
            caption={t.figAgreeCaption}
          >
            <BarChart
              labelWidth={128}
              max={1}
              bars={cond.agreement.map((a, i) => ({
                label: a.pair
                  .replace("IGG10", t.shortLow)
                  .replace("IGG20", t.shortMid)
                  .replace("IGG90", t.shortHigh),
                value: a.r,
                valueLabel: a.r.toFixed(3),
                color: ["var(--depth-5)", "var(--depth-4)", "var(--depth-2)"][i],
              }))}
            />
          </Figure>

          <Callout kind="key" title={t.s3KeyTitle}>
            {t.s3Key}
          </Callout>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="table" title={t.s4Title}>
          <Figure
            title={t.figTopTitle}
            subtitle={t.figTopSub}
            caption={t.figTopCaption}
          >
            <DataTable
              dense
              caption={t.figTopTitle}
              rows={cond.examples}
              columns={[
                {
                  key: "mut",
                  header: t.colVariant,
                  render: (r) => <Variant seq={String(r.mut)} />,
                },
                {
                  key: "input",
                  header: t.colReads,
                  align: "right",
                  render: (r) => fmt(Number(r.input)),
                },
                ...LABEL_KEYS.map((k, i) => ({
                  key: k,
                  header: t.condLabels[i],
                  align: "right" as const,
                  render: (r: Record<string, string | number>) => (
                    <span style={{ color: SERIES[i], fontWeight: 500 }}>
                      {Number(r[k]).toFixed(1)}x
                    </span>
                  ),
                })),
              ]}
            />
          </Figure>

          <ToolCode
            lang={lang}
            tabs={[
              {
                tool: "DiMSum",
                lang: "bash",
                note: t.noteDimsum,
                url: "https://github.com/lehner-lab/DiMSum",
                code: `# Each selection condition is its own experiment in the
# design file. DiMSum keeps them separate rather than
# averaging them into a single "fitness".
#
# sample_name  experiment  selection_id  selection_replicate
# input_1      1           0             1
# iggLow_1     1           1             1
# iggHigh_2    2           1             1`,
              },
              {
                tool: "pandas",
                lang: "python",
                note: t.notePandas,
                code: `# a fitness value without its condition is not reportable
tidy = df.melt(
    id_vars=["mut", "Input"],
    value_vars=["fit_IGG10", "fit_IGG20", "fit_IGG90"],
    var_name="condition",
    value_name="fitness",
)`,
              },
            ]}
          />

          <Prose>{t.s4After}</Prose>
        </Step>,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["Three answers", "Why", "Rank survives", "In practice"],
    condLabels: ["Low IgG", "Medium IgG", "High IgG"],
    shortLow: "low",
    shortMid: "medium",
    shortHigh: "high",
    betterThanWt: "better than wild type",

    s1Title: (mut: string) => `One variant, three answers: ${mut}`,
    s1Body: (
      <>
        <p>
          Chapter 5 used the three IgG conditions to check reproducibility and
          found they mostly agree. This chapter asks a different question of
          the same three conditions: do they give the <em>same number</em>?
        </p>
        <p>They do not. They are not close.</p>
      </>
    ),
    s1After: (mut: string, lo: number, hi: number) => (
      <>
        <p>
          Same protein. Same library. Same sequencing run. Same formula. The
          answer ranges from <strong>{lo.toFixed(1)}x</strong> to{" "}
          <strong>{hi.toFixed(1)}x</strong> depending only on how much IgG was
          in the tube.
        </p>
        <p>
          If somebody tells you {mut} is &ldquo;{hi.toFixed(0)} times better
          than wild type&rdquo;, they have not told you enough to reproduce the
          claim.
        </p>
      </>
    ),

    s2Title: "Why the conditions differ",
    s2Scenario:
      "IgG concentration sets how hard the test is. At low concentration there is little target to bind; at high concentration there is target everywhere.",
    s2Question: "Which condition spreads the strong binders furthest apart?",
    s2Choices: [
      {
        label: "High IgG — more target means more signal to measure.",
        grade: "bad" as const,
        outcome: (
          <>
            More target means almost anything that binds at all gets captured,
            including mediocre binders. The assay saturates and the strong
            variants are squashed together near the top.
          </>
        ),
      },
      {
        label: "Low IgG — only the tightest binders are captured.",
        grade: "best" as const,
        outcome: (
          <>
            Correct. When target is scarce, small differences in binding
            strength produce large differences in capture, so the strong
            variants spread far apart. This is the stringent condition.
          </>
        ),
      },
      {
        label: "They spread the same. Only the average shifts.",
        grade: "bad" as const,
        outcome: (
          <>
            The dynamic range changes by more than a factor of eight between
            conditions, as the next chart shows.
          </>
        ),
      },
    ],
    s2After: (
      <p>
        Stringency is the whole mechanism. It is not a nuisance parameter to be
        averaged away — it determines what the experiment can resolve.
      </p>
    ),
    figSpreadTitle: "How far the top of the scale stretches",
    figSpreadSub: "Fitness of the best variant in each condition",
    figSpreadCaption: (lo: number, hi: number) => (
      <>
        Low IgG spreads the winners across a range of {lo.toFixed(0)}x. High
        IgG compresses the same variants into {hi.toFixed(1)}x. The ranking is
        largely preserved; the dynamic range is not.
      </>
    ),
    statLow: "Best variant, low IgG",
    statLowHint: "stringent, wide range",
    statMid: "Best variant, medium IgG",
    statHigh: "Best variant, high IgG",
    statHighHint: "saturated, narrow range",
    statStretch: "Difference in stretch",

    s3Title: "The ranking mostly survives",
    s3Body: (n: number) => (
      <p>
        Across the {fmt(n)} variants with at least 200 input reads, the
        conditions agree well on <em>order</em> even while disagreeing on
        magnitude.
      </p>
    ),
    figAgreeTitle: "Agreement between pairs of conditions",
    figAgreeSub: "Correlation of log fitness, deeply sequenced variants only",
    figAgreeCaption: (
      <>
        Neighbouring conditions agree best. The two extremes agree least —
        they are the most different tests. This is the same quantity chapter 5
        used as a reproducibility check, which is a reminder that
        &ldquo;reproducible&rdquo; always means &ldquo;reproducible under these
        conditions&rdquo;.
      </>
    ),
    s3KeyTitle: "Rank is portable, magnitude is not",
    s3Key: (
      <p>
        This is the practical rule. If your question is{" "}
        <em>which variants should I make?</em>, the ranking is what you need
        and it holds across conditions. If your question is{" "}
        <em>how much better is this variant?</em>, the number belongs to the
        condition it was measured in and does not transfer.
      </p>
    ),

    s4Title: "The top variants, side by side",
    figTopTitle: "Fitness of the top 12 variants in all three conditions",
    figTopSub: "Ranked by medium IgG",
    figTopCaption: (
      <>
        Read across any row and the three numbers fall steeply. Read down the
        columns and the order barely changes. That is the whole chapter in one
        table.
      </>
    ),
    colVariant: "Variant",
    colReads: "Input reads",
    noteDimsum:
      "Real pipelines keep conditions as separate experiments by design. Averaging them into one fitness would destroy exactly the information this chapter is about.",
    notePandas:
      "Keeping the data tidy makes the condition impossible to drop by accident, which is how unreportable numbers escape into slides.",
    s4After: (
      <>
        <p>
          A fitness value is meaningless on its own. When you report one,
          report the assay with it: what was selected for, at what
          concentration, for how long, and what the fitness is relative to.
        </p>
        <p>
          The rest of this walkthrough uses <strong>medium IgG</strong>,
          because it sits between the stringent and saturated extremes. That is
          a choice, and now you know what choosing it does.
        </p>
      </>
    ),
  },

  ko: {
    labels: ["답 세 개", "왜", "순위는 유지", "실무에서는"],
    condLabels: ["저농도 IgG", "중간 농도 IgG", "고농도 IgG"],
    shortLow: "저농도",
    shortMid: "중간",
    shortHigh: "고농도",
    betterThanWt: "wild type 대비",

    s1Title: (mut: string) => `variant 하나, 답 세 개: ${mut}`,
    s1Body: (
      <>
        <p>
          5장에서는 IgG 조건 세 개로 재현성을 확인했고, 대체로 일치한다는 걸
          봤습니다. 이 장은 같은 세 조건에 다른 질문을 합니다.{" "}
          <em>같은 숫자</em>가 나오느냐?
        </p>
        <p>안 나옵니다. 비슷하지도 않습니다.</p>
      </>
    ),
    s1After: (mut: string, lo: number, hi: number) => (
      <>
        <p>
          같은 단백질, 같은 library, 같은 sequencing, 같은 공식입니다. 그런데
          답이 <strong>{lo.toFixed(1)}배</strong>에서{" "}
          <strong>{hi.toFixed(1)}배</strong>까지 갑니다. 차이는 튜브에 IgG가
          얼마나 들었냐뿐입니다.
        </p>
        <p>
          누가 {mut}가 &ldquo;wild type보다 {hi.toFixed(0)}배 좋다&rdquo;고
          말한다면, 그 주장을 재현하기에 충분한 정보를 준 게 아닙니다.
        </p>
      </>
    ),

    s2Title: "조건이 왜 다른 답을 주나",
    s2Scenario:
      "IgG 농도가 시험의 난이도를 정합니다. 저농도에서는 붙을 대상이 적고, 고농도에서는 대상이 널려 있습니다.",
    s2Question: "강한 binder들을 가장 넓게 벌려놓는 조건은?",
    s2Choices: [
      {
        label: "고농도 IgG. 대상이 많으니 측정할 신호도 크다.",
        grade: "bad" as const,
        outcome: (
          <>
            대상이 많으면 조금이라도 붙는 건 거의 다 붙잡힙니다. 어중간한
            binder까지요. assay가 포화되고 강한 variant들이 위쪽에 뭉칩니다.
          </>
        ),
      },
      {
        label: "저농도 IgG. 가장 세게 붙는 것만 붙잡힌다.",
        grade: "best" as const,
        outcome: (
          <>
            맞습니다. 대상이 귀하면 결합력의 작은 차이가 포획량의 큰 차이로
            이어집니다. 그래서 강한 variant들이 멀리 벌어집니다. 이게 엄격한
            조건입니다.
          </>
        ),
      },
      {
        label: "벌어지는 폭은 같고 평균만 이동한다.",
        grade: "bad" as const,
        outcome: (
          <>
            조건 사이에서 dynamic range가 8배 넘게 달라집니다. 다음 차트에
            나옵니다.
          </>
        ),
      },
    ],
    s2After: (
      <p>
        엄격도(stringency)가 메커니즘 전체입니다. 평균 내서 없애버릴 성가신
        변수가 아니라, 실험이 무엇을 구분할 수 있는지를 결정하는 값입니다.
      </p>
    ),
    figSpreadTitle: "눈금 위쪽이 얼마나 늘어나는가",
    figSpreadSub: "각 조건에서 최고 variant의 fitness",
    figSpreadCaption: (lo: number, hi: number) => (
      <>
        저농도 IgG는 승자들을 {lo.toFixed(0)}배 범위로 벌려놓습니다. 고농도 IgG는
        같은 variant들을 {hi.toFixed(1)}배 안으로 압축합니다. 순위는 대체로
        유지되지만 dynamic range는 아닙니다.
      </>
    ),
    statLow: "최고 variant, 저농도",
    statLowHint: "엄격, 넓은 범위",
    statMid: "최고 variant, 중간 농도",
    statHigh: "최고 variant, 고농도",
    statHighHint: "포화, 좁은 범위",
    statStretch: "늘어난 폭의 차이",

    s3Title: "순위는 대체로 살아남습니다",
    s3Body: (n: number) => (
      <p>
        input read가 200개 이상인 variant {fmt(n)}개에서 보면, 조건들은 크기에는
        불일치하면서도 <em>순서</em>에는 잘 일치합니다.
      </p>
    ),
    figAgreeTitle: "조건 쌍별 일치도",
    figAgreeSub: "log fitness correlation, 깊게 읽힌 variant만",
    figAgreeCaption: (
      <>
        인접한 조건끼리 가장 잘 맞습니다. 양 극단이 가장 안 맞는데, 가장 다른
        시험이니까요. 5장에서 재현성 확인에 쓴 값과 같은 양입니다.
        &ldquo;재현된다&rdquo;는 말이 언제나 &ldquo;이 조건에서
        재현된다&rdquo;는 뜻임을 상기시켜 줍니다.
      </>
    ),
    s3KeyTitle: "순위는 옮길 수 있고, 크기는 못 옮깁니다",
    s3Key: (
      <p>
        실무 규칙은 이겁니다. 질문이 <em>어떤 variant를 만들까?</em>라면 필요한
        건 순위이고, 순위는 조건이 바뀌어도 버팁니다. 질문이{" "}
        <em>이 variant가 얼마나 더 좋은가?</em>라면, 그 숫자는 측정된 조건에
        속하며 옮겨지지 않습니다.
      </p>
    ),

    s4Title: "상위 variant 나란히 보기",
    figTopTitle: "상위 12개 variant의 조건별 fitness",
    figTopSub: "중간 농도 IgG 기준 정렬",
    figTopCaption: (
      <>
        아무 행이나 가로로 읽으면 숫자 세 개가 가파르게 떨어집니다. 열을 세로로
        읽으면 순서는 거의 그대로입니다. 이 표 하나가 이 챕터 전부입니다.
      </>
    ),
    colVariant: "variant",
    colReads: "input read",
    noteDimsum:
      "실제 파이프라인은 설계 단계부터 조건을 별개 실험으로 둡니다. 하나의 fitness로 평균 내면 이 챕터가 다루는 정보가 정확히 파괴됩니다.",
    notePandas:
      "tidy 형태로 두면 조건을 실수로 떨어뜨릴 수 없게 됩니다. 보고 불가능한 숫자가 슬라이드로 새어 나가는 경로가 보통 그겁니다.",
    s4After: (
      <>
        <p>
          fitness 값은 그 자체로는 의미가 없습니다. 보고할 때는 assay를 같이
          적으세요. 무엇을 기준으로 selection했는지, 농도는 얼마인지, 얼마나
          오래 했는지, 그리고 fitness가 무엇 대비인지.
        </p>
        <p>
          이 실습의 나머지는 <strong>중간 농도 IgG</strong>를 씁니다. 엄격한
          쪽과 포화된 쪽 사이에 있기 때문입니다. 이것도 선택이고, 이제 그 선택이
          무엇을 하는지 아십니다.
        </p>
      </>
    ),
  },
};
