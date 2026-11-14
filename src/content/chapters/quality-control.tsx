import { Callout, CodeBlock, Figure, Mono, Prose } from "@/components/ui";
import { ThresholdExplorer } from "@/components/charts/ThresholdExplorer";
import { Steps, Step } from "@/components/learn/Steps";
import { Quiz } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { getFunnel, getSweep, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

export function QualityControl({ lang, takeaway }: ChapterProps) {
  const { steps, minInput } = getFunnel();
  const sweep = getSweep();
  const start = steps[0].kept;
  const end = steps[steps.length - 1].kept;
  const t = COPY[lang];

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="funnel" title={t.s1Title}>
          <Prose>{t.s1Body(start, end)}</Prose>

          <Figure
            title={t.figTitle}
            subtitle={t.figSub(start, end)}
            caption={t.figCaption}
          >
            <div className="space-y-1">
              {steps.map((s, i) => {
                const width = (s.kept / start) * 100;
                return (
                  <div key={i}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium text-[var(--ink)]">
                        {t.stepLabels[i]}
                        {s.forced === true && (
                          <span className="ml-2 rounded-full bg-[var(--page)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--ink-secondary)] ring-1 ring-[var(--border)] ring-inset">
                            {t.badgeForced}
                          </span>
                        )}
                        {s.forced === false && (
                          <span
                            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ring-1 ring-inset"
                            style={{
                              color: "var(--serious)",
                              borderColor: "var(--serious)",
                            }}
                          >
                            {t.badgeChoice}
                          </span>
                        )}
                      </span>
                      <span className="tabular shrink-0 text-[12px] text-[var(--ink-secondary)]">
                        {fmt(s.kept)}
                        {s.removed > 0 && (
                          <span className="ml-2 text-[var(--critical)]">
                            −{fmt(s.removed)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-6 w-full overflow-hidden rounded-[4px] bg-[var(--page)]">
                      <div
                        className="h-full rounded-r-[4px]"
                        style={{
                          width: `${width}%`,
                          background: `var(--depth-${Math.min(i + 1, 5)})`,
                        }}
                      />
                    </div>
                    {t.stepWhy[i] && (
                      <p className="mt-1.5 mb-3 text-[12.5px] leading-5 text-[var(--ink-muted)]">
                        {t.stepWhy[i]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Figure>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="forced" title={t.s2Title}>
          <Quiz
            lang={lang}
            scenario={t.s2Scenario}
            question={t.s2Question}
            choices={t.s2Choices}
          >
            <Prose>{t.s2Body(steps[2].removed)}</Prose>

            <Callout kind="note" title={t.s2NoteTitle}>
              {t.s2Note}
            </Callout>

            <ToolCode
              lang={lang}
              tabs={[
                {
                  tool: "DiMSum",
                  lang: "bash",
                  note: t.noteDimsumA,
                  url: "https://github.com/lehner-lab/DiMSum",
                  code: `# input and output counts are filtered separately,
# because they fail in different ways
DiMSum \\
  --fitnessMinInputCountAny 10 \\
  --fitnessMinOutputCountAny 0`,
                },
                {
                  tool: "pandas",
                  lang: "python",
                  note: t.notePandasA,
                  code: `# forced: the ratio is undefined, not small
df = df[df["Input"] > 0]

# NOT this — it deletes exactly the dead variants
# df = df[df["IGG20"] > 0]`,
                },
              ]}
            />
          </Quiz>
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="tunable" title={t.s3Title}>
          <Prose>{t.s3Body(minInput)}</Prose>

          <CodeBlock
            label={t.s3CodeLabel}
            code={`if DNAcount >= 10: #TUNABLE`}
          />

          <Prose>{t.s3After}</Prose>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="play" title={t.s4Title}>
          <Prose>{t.s4Body}</Prose>

          <Figure
            title={t.figSweepTitle}
            subtitle={t.figSweepSub}
            caption={t.figSweepCaption}
          >
            <ThresholdExplorer sweep={sweep} />
          </Figure>

          <Callout kind="key" title={t.s4KeyTitle}>
            {t.s4Key(
              sweep[0].coveragePct - sweep[4].coveragePct,
              sweep[4].overallR - sweep[0].overallR,
              sweep[4].coveragePct - sweep[sweep.length - 1].coveragePct,
              sweep[sweep.length - 1].overallR - sweep[4].overallR,
            )}
          </Callout>
        </Step>,

        /* 5 --------------------------------------------------------- */
        <Step key="record" title={t.s5Title}>
          <Prose>{t.s5Body}</Prose>

          <ul className="my-5 max-w-2xl space-y-2">
            {t.s5List.map((x) => (
              <li
                key={x}
                className="flex gap-2.5 text-[14px] leading-6 text-[var(--ink-secondary)]"
              >
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--series-1)]"
                  aria-hidden
                />
                {x}
              </li>
            ))}
          </ul>

          <ToolCode
            lang={lang}
            tabs={[
              {
                tool: "DiMSum",
                lang: "text",
                note: t.noteDimsumB,
                url: "https://github.com/lehner-lab/DiMSum",
                code: `# DiMSum writes a report with the counts at each stage,
# so the filter decisions travel with the data by default.
#
#   fitnessMinInputCountAll   0
#   fitnessMinInputCountAny   10
#   fitnessMinOutputCountAll  0
#   fitnessMinOutputCountAny  0`,
              },
              {
                tool: "pandas",
                lang: "python",
                note: t.notePandasB,
                code: `funnel = []
def gate(df, mask, name):
    funnel.append({"step": name, "kept": int(mask.sum()),
                   "removed": int((~mask).sum())})
    return df[mask]

df = gate(df, ~df["mut"].str.contains("_", regex=False), "drop stop codons")
df = gate(df, df["Input"] > 0,  "drop zero input")
df = gate(df, df["Input"] >= 10, "require 10+ input reads")

pd.DataFrame(funnel).to_csv("qc_funnel.csv", index=False)`,
              },
            ]}
          />
        </Step>,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["The funnel", "Forced", "#TUNABLE", "Try it", "Write it down"],

    s1Title: "Four filters, two kinds of decision",
    s1Body: (start: number, end: number) => (
      <>
        <p>
          Quality control is where most of the thinking happens, and where most
          tutorials wave their hands. Four filters take this dataset from{" "}
          {fmt(start)} rows to {fmt(end)}.
        </p>
        <p>
          <strong>Two of them are forced by arithmetic. Two are judgement
          calls.</strong> Knowing which is which is the skill.
        </p>
      </>
    ),
    figTitle: "From raw rows to analysable variants",
    figSub: (start: number, end: number) =>
      `${fmt(start)} rows in, ${fmt(end)} variants out`,
    figCaption: (
      <>
        Bar width is proportional to rows surviving. The large drop is stop
        codons, which is not a quality problem at all — those rows were never
        design candidates. The cutoff at the end is the only step a different
        analyst might reasonably set differently.
      </>
    ),
    stepLabels: [
      "Sequenced rows in the raw file",
      "Drop variants containing a stop codon",
      "Drop variants with zero input reads",
      "Require at least 10 input reads",
      "Fitness computed",
    ],
    stepWhy: [
      undefined,
      "A truncated protein cannot be a design candidate.",
      "Fitness divides by the input count. Zero makes it undefined, not small.",
      "Below this the enrichment ratio is mostly sampling noise.",
      "fitness = (selected/selected_WT) / (input/input_WT)",
    ],
    badgeForced: "forced",
    badgeChoice: "judgement call",

    s2Title: "The two forced filters",
    s2Scenario:
      "Two kinds of row have a zero in them: some have zero reads before selection, others have zero reads after it.",
    s2Question: "Should both kinds be removed?",
    s2Choices: [
      {
        label: "Yes. A zero count is unusable either way.",
        grade: "bad" as const,
        outcome: (
          <>
            This quietly deletes <strong>exactly the dead variants</strong>.
            Zero reads after selection means the variant was there and then was
            wiped out — that is a real result, fitness zero. Remove those rows
            and the library looks far healthier than it is.
          </>
        ),
      },
      {
        label: "Only the ones with zero reads before selection.",
        grade: "best" as const,
        outcome: (
          <>
            Correct, and the reason is arithmetic rather than taste. The input
            count is the denominator. Zero there makes fitness{" "}
            <em>undefined</em>, not small. Zero after selection is in the
            numerator and gives a perfectly meaningful zero.
          </>
        ),
      },
      {
        label: "Neither. Keep everything and let the model handle it.",
        grade: "bad" as const,
        outcome: (
          <>
            Dividing by zero does not produce a large number; it produces
            nothing, or an error, or silently an infinity that poisons every
            summary downstream.
          </>
        ),
      },
    ],
    s2Body: (removed: number) => (
      <>
        <p>
          <strong>Stop codons.</strong> A truncated GB1 is not a candidate for
          a protein you want to make. Removing them is not a quality decision,
          it is a definition of the question.
        </p>
        <p>
          <strong>Zero input reads.</strong> These {fmt(removed)} rows cannot
          produce a value no matter how much you want one.
        </p>
      </>
    ),
    s2NoteTitle: "Zero before and zero after are opposites",
    s2Note: (
      <>
        <p>
          <Mono>Input = 0</Mono> means the measurement is undefined. The row
          goes.
        </p>
        <p>
          <Mono>IGG20 = 0</Mono> means the variant was there before selection
          and gone after it. That is a real result — a fitness of zero — and
          the row stays.
        </p>
      </>
    ),
    noteDimsumA:
      "DiMSum exposes input and output count cutoffs as separate options precisely because they mean different things. The output cutoffs default to 0.",
    notePandasA:
      "The commented-out line is the mistake. It looks symmetric and it is not.",

    s3Title: "The most honest line in the repository",
    s3Body: (minInput: number) => (
      <>
        <p>
          The published analysis keeps variants with at least{" "}
          <strong>{minInput}</strong> input reads. Here is that line, from the
          authors&apos; own script:
        </p>
      </>
    ),
    s3CodeLabel: "script/Mapper5_NW.py, from the original paper",
    s3After: (
      <>
        <p>
          That comment is the most honest thing in the whole repository. The
          cutoff is not derived from theory. Somebody chose 10, knew it was a
          choice, and said so.
        </p>
        <p>
          Every DMS pipeline has a knob like this. The question is never
          &ldquo;what is the right value&rdquo; — it is{" "}
          <strong>what does this value cost me</strong>.
        </p>
      </>
    ),

    s4Title: "So find out what it costs",
    s4Body: (
      <p>
        Move the slider and watch both numbers at once. One is how much of the
        library you keep. The other is how well two independent selections
        agree.
      </p>
    ),
    figSweepTitle: "What the read-count cutoff costs you",
    figSweepSub:
      "Coverage of the designed library against agreement between two independent selection conditions",
    figSweepCaption: (
      <>
        The two quantities move in opposite directions and sit on different
        scales, so they are two panels sharing one control rather than one
        chart with two vertical axes. A two-axis version could put the
        crossover anywhere.
      </>
    ),
    s4KeyTitle: "The shape of this trade-off is the lesson",
    s4Key: (c1: number, r1: number, c2: number, r2: number) => (
      <>
        <p>
          Going from no cutoff to 10 reads costs about {c1.toFixed(1)} points
          of coverage and buys about {r1.toFixed(3)} of correlation. Going from
          10 to 500 costs another {c2.toFixed(0)} points and buys{" "}
          {r2.toFixed(3)}.
        </p>
        <p>
          The first step is cheap. The rest get expensive fast. That is why a
          low cutoff plus honest reporting of read depth beats a high cutoff
          that quietly throws away three quarters of your library.
        </p>
      </>
    ),

    s5Title: "What you have to write down",
    s5Body: (
      <>
        <p>
          Whatever you choose, the filter decisions have to travel with the
          data. A fitness table with no record of its cutoff is not
          reproducible, and the number is not interpretable by anyone else.
        </p>
        <p>At minimum, record:</p>
      </>
    ),
    s5List: [
      "How many rows you started with.",
      "Each filter, in order, and how many rows it removed.",
      "The read-count cutoff, stated as a number.",
      "How you treated zeros before selection, and zeros after it.",
      "How many designed variants are missing entirely.",
    ],
    noteDimsumB:
      "A pipeline that writes its own report is worth choosing for this reason alone: the decisions end up recorded whether or not you remember to record them.",
    notePandasB:
      "If you roll your own, build the funnel as you go. Reconstructing it afterwards from memory is how cutoffs get misreported.",
  },

  ko: {
    labels: ["단계", "강제", "#TUNABLE", "직접 해보기", "기록"],

    s1Title: "filter 네 개, 결정의 종류는 두 가지",
    s1Body: (start: number, end: number) => (
      <>
        <p>
          Quality control은 생각을 가장 많이 해야 하는 단계이고, 대부분의
          튜토리얼이 대충 넘어가는 단계입니다. filter 네 개가 {fmt(start)}행을{" "}
          {fmt(end)}행으로 줄입니다.
        </p>
        <p>
          <strong>그중 둘은 산술적으로 강제됩니다. 나머지 둘은
          판단입니다.</strong> 어느 쪽이 어느 쪽인지 아는 것이 실력입니다.
        </p>
      </>
    ),
    figTitle: "raw 행에서 분석 가능한 variant까지",
    figSub: (start: number, end: number) =>
      `${fmt(start)}행 입력, ${fmt(end)}개 variant 출력`,
    figCaption: (
      <>
        막대 길이는 살아남은 행 수에 비례합니다. 가장 크게 떨어지는 지점은 stop
        codon인데, 이건 사실 quality 문제가 아닙니다. 그 행들은 애초에 design
        후보가 아니었습니다. 마지막 cutoff만이 다른 분석자가 다르게 정할 법한
        유일한 단계입니다.
      </>
    ),
    stepLabels: [
      "raw 파일에 기록된 행",
      "stop codon이 포함된 variant 제거",
      "input read가 0인 variant 제거",
      "input read 10개 이상 요구",
      "fitness 계산 완료",
    ],
    stepWhy: [
      undefined,
      "잘린 protein은 design 후보가 될 수 없습니다.",
      "fitness는 input count로 나눕니다. 0은 작은 값이 아니라 정의되지 않는 값입니다.",
      "이 아래에서는 enrichment ratio가 대부분 sampling noise입니다.",
      "fitness = (selected/selected_WT) / (input/input_WT)",
    ],
    badgeForced: "강제",
    badgeChoice: "판단",

    s2Title: "강제되는 filter 두 개",
    s2Scenario:
      "0이 들어간 행이 두 종류 있습니다. selection 전에 read가 0인 행, 그리고 selection 후에 read가 0인 행.",
    s2Question: "둘 다 제거해야 할까요?",
    s2Choices: [
      {
        label: "네. 0이면 어느 쪽이든 못 씁니다.",
        grade: "bad" as const,
        outcome: (
          <>
            이러면 <strong>정확히 죽은 variant만</strong> 골라서 지우게 됩니다.
            selection 후 read가 0이라는 건 있었다가 전멸했다는 뜻이고, 그건
            fitness 0이라는 실제 결과입니다. 이 행들을 빼면 library가 실제보다
            훨씬 건강해 보입니다.
          </>
        ),
      },
      {
        label: "selection 전에 0인 것만.",
        grade: "best" as const,
        outcome: (
          <>
            맞습니다. 그리고 이유는 취향이 아니라 산수입니다. input count가
            분모입니다. 거기가 0이면 fitness가 <em>정의되지 않습니다</em>. 작은
            값이 아니라요. selection 후의 0은 분자에 있고, 완벽히 의미 있는
            0입니다.
          </>
        ),
      },
      {
        label: "둘 다 남긴다. 모델이 알아서 처리하게 한다.",
        grade: "bad" as const,
        outcome: (
          <>
            0으로 나누면 큰 값이 나오는 게 아닙니다. 아무것도 안 나오거나,
            에러가 나거나, 조용히 무한대가 되어서 이후 모든 요약 통계를
            오염시킵니다.
          </>
        ),
      },
    ],
    s2Body: (removed: number) => (
      <>
        <p>
          <strong>Stop codon.</strong> 잘린 GB1은 우리가 만들고 싶은 protein
          후보가 아닙니다. 이걸 제거하는 건 quality에 대한 결정이 아니라 질문
          자체의 정의입니다.
        </p>
        <p>
          <strong>input read 0.</strong> 이 {fmt(removed)}개 행은 아무리 원해도
          값을 만들어낼 수 없습니다.
        </p>
      </>
    ),
    s2NoteTitle: "전의 0과 후의 0은 정반대입니다",
    s2Note: (
      <>
        <p>
          <Mono>Input = 0</Mono> 은 측정이 정의되지 않는다는 뜻입니다. 행을
          버립니다.
        </p>
        <p>
          <Mono>IGG20 = 0</Mono> 은 selection 전에는 있었는데 후에는 사라졌다는
          뜻입니다. 이건 실제 결과이고 — fitness 0 — 행을 남깁니다.
        </p>
      </>
    ),
    noteDimsumA:
      "DiMSum이 input과 output count cutoff를 따로 두는 이유가 바로 이것입니다. 둘은 다른 의미예요. output 쪽 기본값은 0입니다.",
    notePandasA:
      "주석 처리된 줄이 그 실수입니다. 대칭처럼 보이지만 대칭이 아닙니다.",

    s3Title: "저장소에서 가장 정직한 한 줄",
    s3Body: (minInput: number) => (
      <>
        <p>
          출판된 분석은 input read가 <strong>{minInput}</strong>개 이상인
          variant만 남깁니다. 저자들이 직접 쓴 스크립트의 그 줄입니다:
        </p>
      </>
    ),
    s3CodeLabel: "script/Mapper5_NW.py, 원 논문",
    s3After: (
      <>
        <p>
          저 주석이 이 저장소 전체에서 가장 정직한 한 줄입니다. 이 cutoff는
          이론에서 유도된 값이 아닙니다. 누군가 10을 골랐고, 그게 선택이라는 걸
          알았고, 그렇게 적어두었습니다.
        </p>
        <p>
          모든 DMS 파이프라인에 이런 손잡이가 있습니다. 질문은 한 번도 &ldquo;정답
          값이 뭐냐&rdquo;인 적이 없습니다. 질문은 언제나{" "}
          <strong>이 값이 나한테 뭘 치르게 하느냐</strong>입니다.
        </p>
      </>
    ),

    s4Title: "그러니 뭘 치르는지 직접 봅시다",
    s4Body: (
      <p>
        슬라이더를 움직이면서 두 숫자를 동시에 보세요. 하나는 library를 얼마나
        유지하는지, 다른 하나는 독립적인 두 selection이 얼마나 일치하는지입니다.
      </p>
    ),
    figSweepTitle: "read count cutoff가 치르는 비용",
    figSweepSub:
      "설계된 library의 coverage와, 독립적인 selection 조건 두 개 사이의 일치도",
    figSweepCaption: (
      <>
        두 값은 반대 방향으로 움직이고 서로 척도가 다릅니다. 그래서 세로축 두
        개짜리 차트 하나가 아니라, 컨트롤 하나를 공유하는 패널 두 개로
        보여줍니다. 축이 두 개인 버전은 교차점을 원하는 곳 아무 데나 둘 수
        있습니다.
      </>
    ),
    s4KeyTitle: "이 trade-off의 모양이 교훈입니다",
    s4Key: (c1: number, r1: number, c2: number, r2: number) => (
      <>
        <p>
          cutoff 없음에서 10으로 가면 coverage {c1.toFixed(1)}%p를 주고
          correlation {r1.toFixed(3)}을 삽니다. 10에서 500으로 가면{" "}
          {c2.toFixed(0)}%p를 더 주고 {r2.toFixed(3)}을 삽니다.
        </p>
        <p>
          첫 걸음은 쌉니다. 그다음부터 빠르게 비싸집니다. 낮은 cutoff에 read
          depth를 정직하게 같이 보고하는 쪽이, library의 3/4를 조용히 버리는 높은
          cutoff보다 나은 이유입니다.
        </p>
      </>
    ),

    s5Title: "반드시 적어둬야 하는 것",
    s5Body: (
      <>
        <p>
          무엇을 고르든, filter 관련 결정은 데이터와 함께 따라다녀야 합니다.
          cutoff 기록이 없는 fitness 표는 재현이 불가능하고, 그 숫자는 다른
          사람이 해석할 수 없습니다.
        </p>
        <p>최소한 다음은 적어두세요:</p>
      </>
    ),
    s5List: [
      "몇 개 행에서 시작했는지.",
      "각 filter가 순서대로 몇 개 행을 제거했는지.",
      "read count cutoff를 숫자로.",
      "selection 전의 0과 후의 0을 각각 어떻게 처리했는지.",
      "설계된 variant 중 몇 개가 아예 없는지.",
    ],
    noteDimsumB:
      "자기 리포트를 직접 쓰는 파이프라인은 이 이유만으로도 쓸 가치가 있습니다. 기록하는 걸 기억하든 안 하든 결정이 남습니다.",
    notePandasB:
      "직접 짠다면 진행하면서 funnel을 쌓아두세요. 나중에 기억으로 복원하려다가 cutoff를 잘못 보고하게 됩니다.",
  },
};
