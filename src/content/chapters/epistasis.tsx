import {
  Callout,
  DataTable,
  Figure,
  Formula,
  Prose,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { ScatterPlot } from "@/components/charts/ScatterPlot";
import { Steps, Step } from "@/components/learn/Steps";
import { Predict, Quiz } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { getEpistasis, getSingles, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

export function Epistasis({ lang, takeaway }: ChapterProps) {
  const epi = getEpistasis();
  const { singles } = getSingles();
  const t = COPY[lang];

  const byLabel = new Map(singles.map((s) => [s.label, s]));
  const star = epi.positive[0];
  const [labelA, labelB] = star.label.split(" + ");
  const a = byLabel.get(labelA);
  const b = byLabel.get(labelB);
  const deadCount = epi.negative.filter((p) => p.observed === 0).length;

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="null" title={t.s1Title}>
          <Prose>{t.s1Body}</Prose>
          <Formula>expected(AB) = fitness(A) × fitness(B)</Formula>
          <Prose>{t.s1After}</Prose>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="predict" title={t.s2Title(labelA, labelB)}>
          <Prose>{t.s2Body(labelA, labelB, a?.fitness ?? 0, b?.fitness ?? 0)}</Prose>

          <div className="my-6 grid grid-cols-2 gap-3">
            <Corner
              seq="VDGV"
              caption={t.wildTypeCaption}
              fitness={1.0}
              tone="mid"
            />
            <Corner
              seq={a?.mut ?? "WDGV"}
              caption={labelA}
              fitness={a?.fitness ?? 0}
              tone="bad"
            />
            <Corner
              seq={b?.mut ?? "VDLV"}
              caption={labelB}
              fitness={b?.fitness ?? 0}
              tone="bad"
            />
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-strong)] px-4 py-3.5">
              <div className="font-mono text-[15px] tracking-[0.12em] text-[var(--ink)]">
                {star.mut}
              </div>
              <div className="mt-1.5 text-[22px] leading-none font-semibold text-[var(--ink-muted)]">
                ?
              </div>
              <div className="mt-1.5 text-[11px] text-[var(--ink-muted)]">
                {t.bothCaption}
              </div>
            </div>
          </div>

          <Predict
            lang={lang}
            question={t.s2Question(star.mut)}
            hint={t.s2Hint(star.expected)}
            min={0}
            max={3}
            step={0.01}
            initial={0.01}
            actual={star.observed}
            decimals={2}
            unit="x"
            verdictClose={t.s2Close}
            verdictFar={t.s2Far}
          >
            <div className="my-4 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--page)] px-4 py-3.5 font-mono text-[13px]">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--ink-secondary)]">
                  {t.expectedLine} = {a?.fitness.toFixed(4)} ×{" "}
                  {b?.fitness.toFixed(4)}
                </span>
                <span className="tabular font-medium text-[var(--critical)]">
                  {star.expected.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--ink-secondary)]">
                  {t.observedLine}
                </span>
                <span className="tabular font-medium text-[var(--success-text)]">
                  {star.observed.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t border-[var(--border)] pt-2">
                <span className="text-[var(--ink)]">{t.wrongBy}</span>
                <span className="tabular font-semibold text-[var(--ink)]">
                  {fmt(Math.round(star.ratio))}x
                </span>
              </div>
            </div>

            <Callout kind="key" title={t.s2KeyTitle}>
              {t.s2Key(labelA, labelB, star.input)}
            </Callout>
          </Predict>
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="greedy" title={t.s3Title}>
          <Quiz
            lang={lang}
            scenario={t.s3Scenario}
            question={t.s3Question}
            choices={t.s3Choices}
          >
            <Prose>{t.s3After(star.mut, a?.mut ?? "", b?.mut ?? "")}</Prose>

            <Callout kind="trap" title={t.s3TrapTitle}>
              {t.s3Trap}
            </Callout>
          </Quiz>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="common" title={t.s4Title(epi.n)}>
          <Figure
            title={t.figScatterTitle}
            subtitle={t.figScatterSub}
            caption={t.figScatterCaption}
          >
            <ScatterPlot
              points={epi.scatter.map((p) => ({ x: p.x, y: p.y }))}
              xLabel={t.xLabel}
              yLabel={t.yLabel}
              diagonal
              height={400}
              pointRadius={1.8}
            />
          </Figure>

          <StatGrid>
            <Stat value={fmt(epi.n)} label={t.statPairs} hint="100+ reads" />
            <Stat
              value={fmt(Math.round(star.ratio))}
              label={t.statLargest}
              tone="good"
              hint={star.label}
            />
            <Stat
              value={String(deadCount)}
              label={t.statDead}
              tone="bad"
              hint={t.statDeadHint}
            />
            <Stat value="2" label={t.statPositions} />
          </StatGrid>

          <ToolCode
            lang={lang}
            tabs={[
              {
                tool: "DiMSum",
                lang: "text",
                note: t.noteDimsum,
                url: "https://github.com/lehner-lab/DiMSum",
                code: `# DiMSum is built by the Lehner lab, whose research is
# largely about this: measuring how mutations interact.
# Its output feeds tools such as MoCHI, which fit
# energy models in which epistasis is the signal,
# not a deviation to be corrected away.`,
              },
              {
                tool: "pandas",
                lang: "python",
                note: t.notePandas,
                code: `# expected under independence, then the deviation
doubles = df[df["hd"] == 2].copy()

doubles["expected"] = doubles.apply(
    lambda r: single_fit[r["mut_a"]] * single_fit[r["mut_b"]], axis=1
)
doubles["epistasis"] = (
    np.log10(doubles["fitness"]) - np.log10(doubles["expected"])
)`,
              },
            ]}
          />
        </Step>,

        /* 5 --------------------------------------------------------- */
        <Step key="both" title={t.s5Title}>
          <div className="my-6 grid gap-4 lg:grid-cols-2">
            <PairTable
              title={t.betterThanPredicted}
              subtitle={t.betterSub}
              rows={epi.positive.slice(0, 7)}
              color="var(--success-text)"
              t={t}
              decimals={2}
            />
            <PairTable
              title={t.worseThanPredicted}
              subtitle={t.worseSub}
              rows={epi.negative.slice(0, 7)}
              color="var(--critical)"
              t={t}
              decimals={4}
            />
          </div>

          <Prose>{t.s5After}</Prose>
        </Step>,
      ]}
    />
  );
}

function Corner({
  seq,
  caption,
  fitness,
  tone,
}: {
  seq: string;
  caption: string;
  fitness: number;
  tone: "good" | "bad" | "mid";
}) {
  const color =
    tone === "good"
      ? "var(--success-text)"
      : tone === "bad"
        ? "var(--critical)"
        : "var(--ink-secondary)";
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
      <div className="font-mono text-[15px] tracking-[0.12em] text-[var(--ink)]">
        {seq}
      </div>
      <div
        className="tabular mt-1.5 text-[22px] leading-none font-semibold"
        style={{ color }}
      >
        {fitness >= 1 ? `${fitness.toFixed(2)}x` : fitness.toFixed(4)}
      </div>
      <div className="mt-1.5 text-[11px] text-[var(--ink-muted)]">{caption}</div>
    </div>
  );
}

type Pair = {
  mut: string;
  label: string;
  expected: number;
  observed: number;
};

function PairTable({
  title,
  subtitle,
  rows,
  color,
  t,
  decimals,
}: {
  title: string;
  subtitle: string;
  rows: Pair[];
  color: string;
  t: { colPair: string; colExpected: string; colMeasured: string };
  decimals: number;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
      <div className="px-4 pt-3 pb-1 text-[12px] font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
        {title}
      </div>
      <p className="px-4 pb-2 text-[12px] leading-5 text-[var(--ink-secondary)]">
        {subtitle}
      </p>
      <DataTable
        dense
        caption={title}
        rows={rows}
        columns={[
          {
            key: "l",
            header: t.colPair,
            render: (p) => (
              <span className="font-mono text-[12px] text-[var(--ink)]">
                {p.label}
              </span>
            ),
          },
          {
            key: "e",
            header: t.colExpected,
            align: "right",
            render: (p) => p.expected.toFixed(4),
          },
          {
            key: "o",
            header: t.colMeasured,
            align: "right",
            render: (p) => (
              <span style={{ color, fontWeight: 500 }}>
                {p.observed.toFixed(decimals)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["The null model", "Two dead mutations", "Why greedy fails", "How common", "Both directions"],

    s1Title: "The simplest guess about combining mutations",
    s1Body: (
      <>
        <p>
          Chapter 7 ended on a gap. The best single mutation gives about 3.8x.
          The best variant in the library gives 8.8x and carries four changes.
          Something happens when mutations are combined that you cannot see by
          looking at them one at a time.
        </p>
        <p>
          Start with the simplest guess. If two mutations do not interact, each
          should multiply fitness by its own factor, independently.
        </p>
      </>
    ),
    s1After: (
      <p>
        Compare that expectation with what was measured. If the two agree, the
        mutations are independent. If they disagree, they interact — and the
        size of the disagreement is the size of the interaction.
      </p>
    ),

    s2Title: (a: string, b: string) => `${a} and ${b}`,
    s2Body: (a: string, b: string, fa: number, fb: number) => (
      <>
        <p>
          Here are two single mutants. <strong>{a}</strong> scores{" "}
          {fa.toFixed(4)} — about {(fa * 100).toFixed(0)}% of wild-type
          binding. <strong>{b}</strong> scores {fb.toFixed(4)}.
        </p>
        <p>
          Both are <strong>dead</strong>. Either one on its own destroys the
          protein.
        </p>
      </>
    ),
    wildTypeCaption: "wild type",
    bothCaption: "both mutations",
    s2Question: (mut: string) =>
      `So what does ${mut}, carrying both mutations, score?`,
    s2Hint: (expected: number) =>
      `Multiplying the two singles predicts ${expected.toFixed(4)}. Wild type is 1.0.`,
    s2Close: "{actual}x. You were not fooled.",
    s2Far: "{actual}x — better than the wild type. Two individually lethal mutations, together, produce a protein that beats the original.",
    expectedLine: "expected",
    observedLine: "observed",
    wrongBy: "wrong by",
    s2KeyTitle: "This is sign epistasis",
    s2Key: (a: string, b: string, input: number) => (
      <>
        <p>
          The effect of a mutation <em>changes sign</em> depending on what else
          is present. {a} is lethal in the wild-type background and beneficial
          in the {b} background.
        </p>
        <p>
          With {fmt(input)} input reads this is not a thin-data artefact. And
          no model fitted to single mutants can predict it: measure all 76
          single mutants perfectly and this combination still looks like the
          worst idea in the library.
        </p>
      </>
    ),

    s3Title: "Why a greedy search gets stuck",
    s3Scenario:
      "The obvious way to improve a protein: try every single mutation, keep the best, then try every mutation on top of that. Each step must improve on the last.",
    s3Question: "Can that strategy ever reach the variant you just saw?",
    s3Choices: [
      {
        label: "Yes, it just needs more rounds.",
        grade: "bad" as const,
        outcome: (
          <>
            No number of rounds helps. Every route to it passes through a
            single mutant that is dead, and a strategy that requires each step
            to improve will never take that step.
          </>
        ),
      },
      {
        label: "No. Every path to it goes downhill first.",
        grade: "best" as const,
        outcome: (
          <>
            Exactly. To get there from wild type you must pass through one of
            the two single mutants, and both are dead ends under a
            strictly-improving rule. The path to the peak runs downhill first.
          </>
        ),
      },
      {
        label: "Only if you start from a different wild type.",
        grade: "ok" as const,
        outcome: (
          <>
            True in a narrow sense, and it is the reason directed evolution
            campaigns sometimes restart from a different parent. But you
            usually do not get to choose your starting protein.
          </>
        ),
      },
    ],
    s3After: (mut: string, a: string, b: string) => (
      <>
        <p>
          To reach <Variant seq={mut} /> from the wild type you must pass
          through <Variant seq={a} /> or <Variant seq={b} />, and both are dead
          ends.
        </p>
        <p>
          This is exactly the finding the original paper was written about. Its
          title is{" "}
          <em>
            &ldquo;Adaptation in protein fitness landscapes is facilitated by
            indirect paths&rdquo;
          </em>
          . The indirect paths are routes like this one, through variants that
          look like failures.
        </p>
      </>
    ),
    s3TrapTitle: "What this means for your own screens",
    s3Trap: (
      <>
        <p>
          If you run one round of single mutants, pick the winners, and combine
          only those, you will systematically miss the best variants in your
          library. The winners of round one are not the building blocks of the
          best variant of round three.
        </p>
        <p>
          This is the argument for combinatorial libraries over stepwise
          optimisation, and for models that can represent interactions rather
          than adding up single-mutant effects.
        </p>
      </>
    ),

    s4Title: (n: number) => `How common is this? All ${fmt(n)} double mutants`,
    figScatterTitle: "Predicted fitness against measured fitness for double mutants",
    figScatterSub: "Both axes log10. The dashed line is where a non-interacting model would be right.",
    figScatterCaption: (
      <>
        If mutations were independent, every point would sit on the dashed
        line. They do not. Points above do better than predicted, points below
        do worse. The spread is the honest picture of how far an additive model
        is from the truth, and it is wide in both directions.
      </>
    ),
    xLabel: "log10 expected fitness (singles multiplied)",
    yLabel: "log10 measured fitness",
    statPairs: "Double mutants analysed",
    statLargest: "Largest underestimate",
    statDead: "Predicted alive, measured dead",
    statDeadHint: "of the 12 worst cases",
    statPositions: "Positions involved in each pair",
    noteDimsum:
      "Interaction is not a nuisance in this field; for some labs it is the measurement. Pipelines are built to preserve it rather than average it away.",
    notePandas:
      "Epistasis as a residual: measured minus predicted, in log space so the deviation is symmetric.",

    s5Title: "Both directions matter",
    betterThanPredicted: "Better than predicted",
    betterSub: "Mutations that rescue each other.",
    worseThanPredicted: "Worse than predicted",
    worseSub: "Mutations that are only tolerable alone.",
    colPair: "Pair",
    colExpected: "Expected",
    colMeasured: "Measured",
    s5After: (
      <p>
        Notice that <strong>G41</strong> appears on both lists. The position
        that is almost completely intolerant on its own is also the one
        involved in the largest rescues and the largest collapses. Rigid
        positions are where interactions live.
      </p>
    ),
  },

  ko: {
    labels: ["기준 모델", "죽은 mutation 둘", "greedy가 막히는 이유", "얼마나 흔한가", "양방향"],

    s1Title: "mutation을 합칠 때의 가장 단순한 가정",
    s1Body: (
      <>
        <p>
          7장은 격차로 끝났습니다. 최고의 single mutation은 약 3.8배입니다.
          library 최고 variant는 8.8배이고 변경이 네 군데입니다. mutation을
          합쳤을 때 하나씩 봐서는 보이지 않는 무언가가 일어납니다.
        </p>
        <p>
          가장 단순한 가정부터 시작합니다. 두 mutation이 상호작용하지 않는다면,
          각자 자기 배수만큼 fitness를 독립적으로 곱해야 합니다.
        </p>
      </>
    ),
    s1After: (
      <p>
        그 예상값과 실제 측정값을 비교합니다. 둘이 맞으면 독립입니다. 안 맞으면
        상호작용이 있고, 어긋난 크기가 상호작용의 크기입니다.
      </p>
    ),

    s2Title: (a: string, b: string) => `${a}와 ${b}`,
    s2Body: (a: string, b: string, fa: number, fb: number) => (
      <>
        <p>
          single mutant 두 개가 있습니다. <strong>{a}</strong>는{" "}
          {fa.toFixed(4)}, wild type 결합의 약 {(fa * 100).toFixed(0)}%입니다.{" "}
          <strong>{b}</strong>는 {fb.toFixed(4)}입니다.
        </p>
        <p>
          둘 다 <strong>죽었습니다</strong>. 어느 쪽이든 하나만으로 단백질이
          망가집니다.
        </p>
      </>
    ),
    wildTypeCaption: "wild type",
    bothCaption: "둘 다 적용",
    s2Question: (mut: string) =>
      `그러면 둘 다 가진 ${mut}는 몇 점일까요?`,
    s2Hint: (expected: number) =>
      `두 single을 곱하면 ${expected.toFixed(4)}이 예상됩니다. wild type이 1.0입니다.`,
    s2Close: "{actual}배입니다. 안 속으셨네요.",
    s2Far: "{actual}배입니다. wild type보다 좋습니다. 각각은 치명적인 mutation 둘이 합쳐지자 원본보다 나은 단백질이 됐습니다.",
    expectedLine: "예상",
    observedLine: "실측",
    wrongBy: "오차 배수",
    s2KeyTitle: "이게 sign epistasis입니다",
    s2Key: (a: string, b: string, input: number) => (
      <>
        <p>
          mutation의 효과가 함께 있는 것에 따라 <em>부호가 바뀝니다</em>. {a}는
          wild type 배경에서는 치명적이고, {b} 배경에서는 이롭습니다.
        </p>
        <p>
          input read가 {fmt(input)}개라 얇은 데이터 때문에 생긴 허상이 아닙니다.
          그리고 single mutant로 학습한 어떤 모델도 이걸 예측할 수 없습니다.
          single mutant 76개를 완벽히 측정해도 이 조합은 여전히 library에서 가장
          나쁜 아이디어로 보입니다.
        </p>
      </>
    ),

    s3Title: "greedy search가 막히는 이유",
    s3Scenario:
      "단백질을 개선하는 뻔한 방법: single mutation을 전부 해보고 최고를 남기고, 그 위에 다시 전부 해보고. 매 단계가 직전보다 나아야 합니다.",
    s3Question: "이 전략으로 방금 본 variant에 도달할 수 있을까요?",
    s3Choices: [
      {
        label: "네. 라운드를 더 돌리면 됩니다.",
        grade: "bad" as const,
        outcome: (
          <>
            라운드를 아무리 늘려도 안 됩니다. 거기로 가는 모든 경로가 죽은
            single mutant를 지나야 하는데, 매 단계가 나아져야 하는 전략은 그
            걸음을 절대 떼지 않습니다.
          </>
        ),
      },
      {
        label: "아니요. 모든 경로가 먼저 내리막입니다.",
        grade: "best" as const,
        outcome: (
          <>
            정확합니다. wild type에서 거기로 가려면 두 single mutant 중 하나를
            반드시 지나야 하는데, 엄격한 개선 규칙 아래서는 둘 다 막다른
            길입니다. 봉우리로 가는 길이 먼저 내리막입니다.
          </>
        ),
      },
      {
        label: "다른 wild type에서 출발하면 가능합니다.",
        grade: "ok" as const,
        outcome: (
          <>
            좁은 의미로는 맞고, directed evolution에서 다른 부모로 다시
            시작하기도 하는 이유이기도 합니다. 다만 보통은 출발 단백질을 고를 수
            있는 입장이 아닙니다.
          </>
        ),
      },
    ],
    s3After: (mut: string, a: string, b: string) => (
      <>
        <p>
          wild type에서 <Variant seq={mut} />에 가려면 <Variant seq={a} /> 또는{" "}
          <Variant seq={b} />를 지나야 하는데, 둘 다 막다른 길입니다.
        </p>
        <p>
          원 논문이 쓰인 이유가 정확히 이 발견입니다. 제목이{" "}
          <em>
            &ldquo;Adaptation in protein fitness landscapes is facilitated by
            indirect paths&rdquo;
          </em>
          입니다. 여기서 간접 경로란 이런 길, 실패처럼 보이는 variant를 지나는
          길입니다.
        </p>
      </>
    ),
    s3TrapTitle: "내 screen에서는 무슨 뜻인가",
    s3Trap: (
      <>
        <p>
          single mutant 한 라운드를 돌리고, 승자를 뽑고, 그것들만 조합하면,
          library에서 가장 좋은 variant를 체계적으로 놓칩니다. 1라운드의 승자가
          3라운드 최고 variant의 부품이 아닙니다.
        </p>
        <p>
          단계적 최적화보다 combinatorial library를 쓰라는 근거이고, single
          mutant 효과를 더하는 대신 상호작용을 표현할 수 있는 모델을 쓰라는
          근거입니다.
        </p>
      </>
    ),

    s4Title: (n: number) => `얼마나 흔한가: double mutant ${fmt(n)}개 전부`,
    figScatterTitle: "double mutant의 예상 fitness 대 실측 fitness",
    figScatterSub: "두 축 모두 log10. 점선은 상호작용이 없는 모델이 맞는 지점입니다.",
    figScatterCaption: (
      <>
        mutation이 독립이라면 모든 점이 점선 위에 있어야 합니다. 그렇지 않습니다.
        점선 위쪽은 예상보다 잘한 것, 아래쪽은 못한 것입니다. 이 퍼짐이 additive
        model이 진실에서 얼마나 떨어져 있는지를 정직하게 보여주고, 양방향으로
        넓습니다.
      </>
    ),
    xLabel: "log10 예상 fitness (single 곱)",
    yLabel: "log10 실측 fitness",
    statPairs: "분석된 double mutant",
    statLargest: "최대 과소예측",
    statDead: "살았다고 예측, 실제로 죽음",
    statDeadHint: "최악 12건 중",
    statPositions: "각 쌍에 관여한 자리 수",
    noteDimsum:
      "이 분야에서 상호작용은 성가신 요소가 아닙니다. 어떤 연구실에서는 그게 측정 대상 자체입니다. 파이프라인도 평균 내서 없애지 않고 보존하도록 만들어져 있습니다.",
    notePandas:
      "epistasis를 잔차로 봅니다. 실측에서 예측을 뺀 값이고, 편차가 대칭이 되도록 log 공간에서 계산합니다.",

    s5Title: "양쪽 방향 다 중요합니다",
    betterThanPredicted: "예상보다 좋음",
    betterSub: "서로를 살려주는 mutation.",
    worseThanPredicted: "예상보다 나쁨",
    worseSub: "혼자일 때만 견딜 만한 mutation.",
    colPair: "쌍",
    colExpected: "예상",
    colMeasured: "실측",
    s5After: (
      <p>
        <strong>G41</strong>이 양쪽 목록에 다 나온다는 데 주목하세요. 혼자서는
        거의 아무것도 허용하지 않는 자리가, 가장 큰 구조(rescue)와 가장 큰
        붕괴에도 함께 관여합니다. 경직된 자리가 상호작용이 사는 곳입니다.
      </p>
    ),
  },
};
