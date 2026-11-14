import fs from "node:fs";
import path from "node:path";
import {
  Callout,
  Figure,
  Formula,
  Prose,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { Histogram } from "@/components/charts/Histogram";
import { Steps, Step } from "@/components/learn/Steps";
import { Predict, Quiz } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { getLandscape, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

type Worked = {
  mut: string;
  hd: number;
  counts: {
    variantInput: number;
    variantSelected: number;
    wtInput: number;
    wtSelected: number;
  };
  ratioBefore: number;
  ratioAfter: number;
  fitness: number;
};

type Control = {
  stopN: number;
  codingN: number;
  stopMedian: number;
  codingMedian: number;
  stopBelow0_01: number;
  codingBelow0_01: number;
  stopAboveWt: number;
};

function load<T>(name: string): T {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "data", name), "utf8"),
  ) as T;
}

export function Fitness({ lang, takeaway }: ChapterProps) {
  const ex = load<Worked>("worked-example.json");
  const ctrl = load<Control>("stop-control.json");
  const landscape = getLandscape();
  const c = ex.counts;
  const t = COPY[lang];

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="idea" title={t.s1Title}>
          <Prose>{t.s1Body}</Prose>

          <Formula>
            fitness ={" "}
            <span className="text-[var(--series-1)]">
              (selected<sub>variant</sub> / selected<sub>WT</sub>)
            </span>{" "}
            ÷{" "}
            <span className="text-[var(--series-2)]">
              (input<sub>variant</sub> / input<sub>WT</sub>)
            </span>
          </Formula>

          <Prose>{t.s1After}</Prose>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="worked" title={t.s2Title(ex.mut)}>
          <Prose>{t.s2Body(ex.mut, ex.hd)}</Prose>

          <Figure
            title={t.figWorkedTitle(ex.mut)}
            subtitle={t.figWorkedSub}
            caption={t.figWorkedCaption(ex.ratioBefore, ex.ratioAfter)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { l: `${ex.mut} input`, v: fmt(c.variantInput) },
                  { l: `${ex.mut} selected`, v: fmt(c.variantSelected) },
                  { l: t.wtInput, v: fmt(c.wtInput) },
                  { l: t.wtSelected, v: fmt(c.wtSelected) },
                ].map((x) => (
                  <div
                    key={x.l}
                    className="rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2.5"
                  >
                    <div className="tabular text-[17px] font-semibold text-[var(--ink)]">
                      {x.v}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                      {x.l}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 font-mono text-[13px] leading-6">
                <Row
                  label={t.rowBefore}
                  math={`${fmt(c.variantInput)} / ${fmt(c.wtInput)}`}
                  result={ex.ratioBefore.toFixed(6)}
                  color="var(--series-2)"
                />
                <Row
                  label={t.rowAfter}
                  math={`${fmt(c.variantSelected)} / ${fmt(c.wtSelected)}`}
                  result={ex.ratioAfter.toFixed(6)}
                  color="var(--series-1)"
                />
                <Row
                  label={t.rowFitness}
                  math={`${ex.ratioAfter.toFixed(6)} / ${ex.ratioBefore.toFixed(6)}`}
                  result={ex.fitness.toFixed(4)}
                  color="var(--ink)"
                  emphasis
                />
              </div>

              <p className="text-[13px] leading-6 text-[var(--ink-secondary)]">
                {t.workedConclusion(ex.mut, ex.fitness)}
              </p>
            </div>
          </Figure>

          <ToolCode
            lang={lang}
            tabs={[
              {
                tool: "Enrich2",
                lang: "python",
                note: t.noteEnrich2,
                url: "https://github.com/FowlerLab/Enrich2",
                code: `# enrich2/selection.py, calc_simple_ratios()
ratios = (
    df[c_last].values.astype("float") / df[c_last].sum(axis="index")
) / (
    df["c_0"].values.astype("float") / df["c_0"].sum(axis="index")
)

# Same shape as ours, with one difference: Enrich2 divides by the
# LIBRARY TOTAL, this dataset divides by the WILD TYPE. Both make the
# ratio comparable; dividing by WT is what pins WT to exactly 1.0.`,
              },
              {
                tool: "pandas",
                lang: "python",
                note: t.notePandas,
                code: `wt = df.loc[df["mut"] == "VDGV"].iloc[0]

df["fitness"] = (
    (df["IGG20"] / wt["IGG20"]) / (df["Input"] / wt["Input"])
)

# ${ex.mut}
# = (${fmt(c.variantSelected)} / ${fmt(c.wtSelected)}) / (${fmt(c.variantInput)} / ${fmt(c.wtInput)})
# = ${ex.fitness.toFixed(4)}`,
              },
            ]}
          />
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="zeros" title={t.s3Title}>
          <Quiz
            lang={lang}
            scenario={t.s3Scenario}
            question={t.s3Question}
            choices={t.s3Choices}
          >
            <Prose>{t.s3After}</Prose>
          </Quiz>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="control" title={t.s4Title}>
          <Prose>{t.s4Body(ctrl.stopN)}</Prose>

          <Predict
            lang={lang}
            question={t.s4Question(ctrl.stopN)}
            hint={t.s4Hint}
            min={0}
            max={2000}
            step={10}
            initial={400}
            actual={ctrl.stopAboveWt}
            decimals={0}
            verdictClose={t.s4Close}
            verdictFar={t.s4Far}
          >
            <StatGrid>
              <Stat value={fmt(ctrl.stopN)} label={t.statScored} />
              <Stat
                value={String(ctrl.stopAboveWt)}
                label={t.statBeat}
                tone="good"
              />
              <Stat
                value={`${ctrl.stopBelow0_01}%`}
                label={t.statStopDead}
              />
              <Stat
                value={`${ctrl.codingBelow0_01}%`}
                label={t.statCodingDead}
                tone="warn"
              />
            </StatGrid>

            <Callout kind="key" title={t.s4KeyTitle}>
              {t.s4Key(ctrl.stopN, ctrl.stopMedian, ctrl.codingMedian)}
            </Callout>

            <Callout kind="trap" title={t.s4TrapTitle}>
              {t.s4Trap}
            </Callout>
          </Predict>
        </Step>,

        /* 5 --------------------------------------------------------- */
        <Step key="dist" title={t.s5Title}>
          <Figure
            title={t.figDistTitle}
            subtitle={t.figDistSub}
            caption={t.figDistCaption(
              landscape.betterThanWtPct,
              landscape.betterThanWt,
              landscape.n,
            )}
          >
            <Histogram
              bins={landscape.histogram}
              markAt={0}
              markLabel={t.wildTypeMark}
              xLabel={t.xLabel}
            />
          </Figure>

          <StatGrid>
            <Stat value={fmt(landscape.n)} label={t.statWithFitness} />
            <Stat
              value={`${landscape.effectivelyDeadPct}%`}
              label={t.statDead}
              tone="bad"
              hint="< 0.01"
            />
            <Stat
              value={`${landscape.betterThanWtPct}%`}
              label={t.statBetter}
              tone="good"
              hint={fmt(landscape.betterThanWt)}
            />
            <Stat
              value={`${landscape.top[0].fitness.toFixed(1)}x`}
              label={t.statBest}
              tone="good"
              hint={landscape.top[0].mut}
            />
          </StatGrid>
        </Step>,
      ]}
    />
  );
}

function Row({
  label,
  math,
  result,
  color,
  emphasis = false,
}: {
  label: string;
  math: string;
  result: string;
  color: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-3 rounded-lg px-3 py-2 ${
        emphasis
          ? "border border-[var(--border-strong)] bg-[var(--page)]"
          : "bg-[var(--page)]"
      }`}
    >
      <span className="w-full font-sans text-[11px] tracking-wide text-[var(--ink-muted)] uppercase sm:w-44">
        {label}
      </span>
      <span className="tabular text-[var(--ink-secondary)]">{math}</span>
      <span className="text-[var(--ink-muted)]" aria-hidden>
        =
      </span>
      <span
        className={`tabular ml-auto ${emphasis ? "text-[15px] font-semibold" : "font-medium"}`}
        style={{ color }}
      >
        {result}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["The idea", "Worked example", "Two zeros", "Does it work?", "The shape"],

    s1Title: "Turning two counts into one number",
    s1Body: (
      <>
        <p>
          A variant that binds IgG well is captured during selection, so its
          share of the library goes up. A variant that binds badly is washed
          away, so its share goes down. Fitness measures that change in share.
        </p>
        <p>
          <strong>Shares, not counts.</strong> Chapter 2 showed the four
          samples have different read totals, so raw counts cannot be compared
          directly. The trick here is to divide by the wild type, which is
          present in every sample and so cancels whatever the total was.
        </p>
      </>
    ),
    s1After: (
      <p>
        The wild type has a fitness of exactly 1.0, by construction. Above 1.0
        is better than the original protein; below is worse. This is the
        formula from the original paper, not a simplification of it.
      </p>
    ),

    s2Title: (mut: string) => `One variant, all the arithmetic: ${mut}`,
    s2Body: (mut: string, hd: number) => (
      <p>
        Take <Variant seq={mut} />, an ordinary variant with {hd} mutations and
        enough reads to be believable. Nothing about it is a special case.
      </p>
    ),
    figWorkedTitle: (mut: string) => `Worked example: ${mut}`,
    figWorkedSub: "Medium IgG. Every number here is from the file.",
    figWorkedCaption: (before: number, after: number) => (
      <>
        This variant made up {(before * 100).toFixed(2)}% as much of the
        library as the wild type before selection, and only{" "}
        {(after * 100).toFixed(2)}% as much afterwards. It lost ground, so its
        fitness is below 1.
      </>
    ),
    wtInput: "wild type input",
    wtSelected: "wild type selected",
    rowBefore: "share before selection",
    rowAfter: "share after selection",
    rowFitness: "fitness",
    workedConclusion: (mut: string, f: number) => (
      <>
        A fitness of {f.toFixed(2)} means {mut} bound IgG roughly{" "}
        {(100 * f).toFixed(0)}% as well as the original protein in this
        condition.
      </>
    ),
    noteEnrich2:
      "Enrich2's 'simple' scoring is the same calculation. Reading its source is the fastest way to see that this formula is not specific to this dataset.",
    notePandas: "Three lines, once the wild-type row is in hand.",

    s3Title: "Two kinds of zero",
    s3Scenario:
      "The formula puts the input count in the denominator and the selected count in the numerator. Both can be zero.",
    s3Question: "What does each zero mean?",
    s3Choices: [
      {
        label: "Both mean the variant failed. Both give fitness 0.",
        grade: "bad" as const,
        outcome: (
          <>
            Only one of them does. Zero in the denominator is not a small
            number — it is no number at all.
          </>
        ),
      },
      {
        label: "Zero selected gives fitness 0. Zero input gives no answer at all.",
        grade: "best" as const,
        outcome: (
          <>
            Right. Zero selected reads is a real, meaningful measurement: the
            variant was there and then it was gone. Zero input reads divides by
            zero, which is why those rows had to go before the arithmetic
            started rather than after.
          </>
        ),
      },
      {
        label: "Zero input gives fitness 0. Zero selected means it was never measured.",
        grade: "bad" as const,
        outcome: (
          <>
            Backwards. This is worth getting right, because reversing them
            deletes real failures and keeps undefined rows.
          </>
        ),
      },
    ],
    s3After: (
      <p>
        This is the asymmetry chapter 3 enforced as a filter. Here you can see
        why it was not a matter of taste: one zero is a result, the other is a
        missing denominator.
      </p>
    ),

    s4Title: "Does the number mean anything? Ask the dead proteins.",
    s4Body: (n: number) => (
      <p>
        Stop-codon variants cannot bind IgG — a truncated protein has no
        binding surface. So whatever these {fmt(n)} variants score is the floor
        of this assay. It is a negative control measured in the same
        experiment, for free.
      </p>
    ),
    s4Question: (n: number) =>
      `Of those ${fmt(n)} truncated proteins, how many scored better than the wild type?`,
    s4Hint: "If the assay is clean, the answer should be very low. If it is noisy, some will get through by luck.",
    s4Close: "{actual}. Not one of them.",
    s4Far: "{actual}. Not a single one of the truncated proteins beat the wild type.",
    statScored: "Stop-codon variants scored",
    statBeat: "That beat the wild type",
    statStopDead: "Stop variants under 0.01",
    statCodingDead: "Full-length variants under 0.01",
    s4KeyTitle: "Two things this control tells you",
    s4Key: (n: number, stopMed: number, codingMed: number) => (
      <>
        <p>
          <strong>The assay works.</strong> Not one of the {fmt(n)} truncated
          proteins scored above the wild type. If a few hundred had, you would
          know the top of the ranking was partly noise.
        </p>
        <p>
          <strong>Most of the design space is dead.</strong> The median
          truncated protein scores {stopMed}. The median full-length protein
          scores {codingMed} — practically the same number. Changing four
          neighbouring residues at random usually produces something as useless
          as no protein at all.
        </p>
      </>
    ),
    s4TrapTitle: "Do not read fitness 0.004 as a measurement",
    s4Trap: (
      <p>
        Down at the floor, a dead variant and a very dead variant are
        indistinguishable. Both report &ldquo;no binding detected&rdquo;.
        Ranking variants inside that region is reading noise. The useful signal
        here is all above about 0.1.
      </p>
    ),

    s5Title: "The shape of the result",
    figDistTitle: "Fitness of every variant that passed quality control",
    figDistSub: "Log scale. Values floored at 0.001 so true zeros stay on the chart.",
    figDistCaption: (pct: number, n: number, total: number) => (
      <>
        The shape is the point. A large pile of dead variants on the left, a
        thin spread in the middle, and a small tail to the right of the
        wild-type line. <strong>{pct}% of variants beat the wild type</strong>{" "}
        — {fmt(n)} out of {fmt(total)}.
      </>
    ),
    wildTypeMark: "wild type",
    xLabel: "fitness (log scale)",
    statWithFitness: "Variants with a fitness value",
    statDead: "Effectively dead",
    statBetter: "Better than wild type",
    statBest: "Best variant",
  },

  ko: {
    labels: ["개념", "예제 계산", "두 개의 0", "작동하나?", "분포"],

    s1Title: "count 두 개를 숫자 하나로",
    s1Body: (
      <>
        <p>
          IgG에 잘 붙는 variant는 selection에서 붙잡히니까 library 내 비중이
          올라갑니다. 못 붙는 variant는 씻겨 나가니까 비중이 내려갑니다. fitness는
          그 비중 변화를 재는 값입니다.
        </p>
        <p>
          <strong>count가 아니라 비중입니다.</strong> 2장에서 샘플 네 개의 총
          read 수가 다르다는 걸 봤습니다. 그래서 raw count는 바로 비교할 수
          없습니다. 여기서 쓰는 방법은 wild type으로 나누는 것입니다. wild type은
          모든 샘플에 들어 있으니 총 read 수가 무엇이든 약분됩니다.
        </p>
      </>
    ),
    s1After: (
      <p>
        wild type의 fitness는 정의상 정확히 1.0입니다. 1.0보다 크면 원래
        단백질보다 낫고, 작으면 못합니다. 이건 원 논문의 공식 그대로이고, 단순화한
        버전이 아닙니다.
      </p>
    ),

    s2Title: (mut: string) => `variant 하나로 전 과정 계산: ${mut}`,
    s2Body: (mut: string, hd: number) => (
      <p>
        <Variant seq={mut} />를 봅시다. mutation {hd}개짜리 평범한 variant이고,
        믿을 만한 정도의 read가 있습니다. 특수한 구석이 하나도 없는 예시입니다.
      </p>
    ),
    figWorkedTitle: (mut: string) => `예제 계산: ${mut}`,
    figWorkedSub: "중간 농도 IgG. 여기 숫자는 전부 파일에서 나온 값입니다.",
    figWorkedCaption: (before: number, after: number) => (
      <>
        이 variant는 selection 전에 wild type의 {(before * 100).toFixed(2)}%
        만큼 있었고, 후에는 {(after * 100).toFixed(2)}%만 남았습니다. 밀렸으니
        fitness가 1보다 작습니다.
      </>
    ),
    wtInput: "wild type input",
    wtSelected: "wild type selected",
    rowBefore: "selection 전 비중",
    rowAfter: "selection 후 비중",
    rowFitness: "fitness",
    workedConclusion: (mut: string, f: number) => (
      <>
        fitness {f.toFixed(2)}는, 이 조건에서 {mut}가 원래 단백질의 약{" "}
        {(100 * f).toFixed(0)}% 수준으로 IgG에 붙었다는 뜻입니다.
      </>
    ),
    noteEnrich2:
      "Enrich2의 'simple' scoring이 같은 계산입니다. 이 공식이 이 데이터에만 쓰이는 게 아니라는 걸 확인하는 가장 빠른 방법이 소스를 보는 것입니다.",
    notePandas: "wild type 행만 손에 있으면 세 줄입니다.",

    s3Title: "두 종류의 0",
    s3Scenario:
      "공식에서 input count는 분모, selected count는 분자입니다. 둘 다 0이 될 수 있습니다.",
    s3Question: "각각의 0은 무슨 뜻일까요?",
    s3Choices: [
      {
        label: "둘 다 실패했다는 뜻이다. 둘 다 fitness 0이다.",
        grade: "bad" as const,
        outcome: (
          <>
            둘 중 하나만 그렇습니다. 분모의 0은 작은 수가 아니라 아예 수가
            아닙니다.
          </>
        ),
      },
      {
        label: "selected가 0이면 fitness 0. input이 0이면 답 자체가 없다.",
        grade: "best" as const,
        outcome: (
          <>
            맞습니다. selected read 0은 실제로 의미 있는 측정입니다. 있었는데
            사라졌다는 뜻이니까요. input read 0은 0으로 나누기가 되고, 그래서 그
            행들은 계산이 시작되기 전에 빠져야 했습니다. 끝난 뒤가 아니라요.
          </>
        ),
      },
      {
        label: "input이 0이면 fitness 0. selected가 0이면 측정이 안 된 것이다.",
        grade: "bad" as const,
        outcome: (
          <>
            거꾸로입니다. 이걸 뒤집으면 실제 실패를 지우고 정의되지 않는 행을
            남기게 되니, 제대로 잡아둘 가치가 있습니다.
          </>
        ),
      },
    ],
    s3After: (
      <p>
        3장에서 filter로 강제했던 그 비대칭입니다. 여기서는 그게 왜 취향 문제가
        아니었는지 보입니다. 한쪽 0은 결과이고, 다른 쪽 0은 사라진 분모입니다.
      </p>
    ),

    s4Title: "이 숫자가 의미가 있나? 죽은 단백질에게 물어봅시다",
    s4Body: (n: number) => (
      <p>
        stop codon variant는 IgG에 붙을 수 없습니다. 잘린 단백질에는 결합면이
        없으니까요. 그러니 이 {fmt(n)}개가 받는 점수가 이 assay의 바닥입니다. 같은
        실험 안에서 공짜로 측정된 negative control입니다.
      </p>
    ),
    s4Question: (n: number) =>
      `잘린 단백질 ${fmt(n)}개 중에서, wild type보다 높은 점수를 받은 건 몇 개일까요?`,
    s4Hint: "assay가 깨끗하면 매우 낮아야 합니다. 노이즈가 많으면 운으로 통과하는 게 생깁니다.",
    s4Close: "{actual}개. 단 하나도 없습니다.",
    s4Far: "{actual}개입니다. 잘린 단백질 중 wild type을 이긴 건 단 하나도 없습니다.",
    statScored: "점수가 매겨진 stop codon variant",
    statBeat: "wild type을 이긴 수",
    statStopDead: "0.01 미만인 stop variant",
    statCodingDead: "0.01 미만인 온전한 variant",
    s4KeyTitle: "이 control이 알려주는 두 가지",
    s4Key: (n: number, stopMed: number, codingMed: number) => (
      <>
        <p>
          <strong>assay가 작동합니다.</strong> 잘린 단백질 {fmt(n)}개 중 wild
          type보다 높은 점수를 받은 게 하나도 없습니다. 몇백 개가 그랬다면, 순위
          상단이 부분적으로 노이즈라는 뜻이 됩니다.
        </p>
        <p>
          <strong>설계 공간 대부분은 죽어 있습니다.</strong> 잘린 단백질의 중앙값
          점수는 {stopMed}입니다. 온전한 단백질의 중앙값은 {codingMed}로, 사실상
          같은 숫자입니다. 이웃한 residue 네 개를 무작위로 바꾸면 보통 단백질이
          아예 없는 것만큼 쓸모없는 게 나옵니다.
        </p>
      </>
    ),
    s4TrapTitle: "fitness 0.004를 측정값으로 읽지 마세요",
    s4Trap: (
      <p>
        바닥 근처에서는 죽은 variant와 아주 죽은 variant가 구별되지 않습니다. 둘
        다 &ldquo;결합 감지 안 됨&rdquo;을 보고하는 것뿐입니다. 그 구간에서 순위를
        매기는 건 노이즈를 읽는 겁니다. 여기서 쓸모 있는 신호는 전부 0.1 위에
        있습니다.
      </p>
    ),

    s5Title: "결과의 모양",
    figDistTitle: "quality control을 통과한 모든 variant의 fitness",
    figDistSub: "log 축. 진짜 0도 차트에 남도록 0.001에서 잘랐습니다.",
    figDistCaption: (pct: number, n: number, total: number) => (
      <>
        모양 자체가 핵심입니다. 왼쪽에 죽은 variant가 크게 쌓여 있고, 가운데는
        얇게 퍼져 있고, wild type 선 오른쪽에 작은 꼬리가 있습니다.{" "}
        <strong>variant의 {pct}%가 wild type을 이깁니다.</strong> {fmt(total)}개
        중 {fmt(n)}개입니다.
      </>
    ),
    wildTypeMark: "wild type",
    xLabel: "fitness (log 축)",
    statWithFitness: "fitness 값이 있는 variant",
    statDead: "사실상 죽음",
    statBetter: "wild type보다 나음",
    statBest: "최고 variant",
  },
};
