import {
  Callout,
  DataTable,
  Figure,
  Prose,
  Stat,
  StatGrid,
} from "@/components/ui";
import { FacetedScatter } from "@/components/charts/FacetedScatter";
import { BarChart } from "@/components/charts/BarChart";
import { Legend } from "@/components/charts/primitives";
import { DEPTH_RAMP } from "@/lib/palette";
import { Steps, Step } from "@/components/learn/Steps";
import { Predict, Quiz } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { getReproducibility, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

export function Reproducibility({ lang, takeaway }: ChapterProps) {
  const rep = getReproducibility();
  const worst = rep.byDepth[0];
  const best = rep.byDepth[rep.byDepth.length - 1];
  const shallow = worst.n + rep.byDepth[1].n;
  const t = COPY[lang];

  const facets = rep.byDepth.map((b) => ({
    bin: b.bin,
    n: b.n,
    r: b.r,
    points: rep.scatter
      .filter((p) => p.bin === b.bin)
      .map((p) => ({ x: p.x, y: p.y })),
  }));

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="q" title={t.s1Title}>
          <Prose>{t.s1Body}</Prose>
          <Callout kind="note" title={t.s1PlanTitle}>
            {t.s1Plan}
          </Callout>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="meaning" title={t.s2Title}>
          <Prose>{t.s2Body}</Prose>

          <div className="my-6 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-5 text-center">
            <div className="text-[12px] text-[var(--ink-muted)]">
              {t.s2StatLabel}
            </div>
            <div className="tabular mt-1 text-[40px] leading-none font-semibold text-[var(--series-1)]">
              r = {rep.overallR.toFixed(3)}
            </div>
            <div className="mt-2 text-[12px] text-[var(--ink-muted)]">
              {fmt(rep.n)} variants
            </div>
          </div>

          <Quiz
            lang={lang}
            question={t.s2Question}
            choices={t.s2Choices}
          >
            <Prose>{t.s2After}</Prose>

            <Callout kind="key" title={t.s2ScaleTitle}>
              {t.s2Scale}
            </Callout>

            <StatGrid>
              <Stat
                value={`r = ${rep.overallR.toFixed(3)}`}
                label={t.statOverall}
                tone="good"
              />
              <Stat value={fmt(rep.n)} label={t.statCompared} />
              <Stat
                value={`${(rep.overallR ** 2 * 100).toFixed(0)}%`}
                label={t.statVariance}
                hint="r squared"
              />
              <Stat value="3" label={t.statConditions} />
            </StatGrid>

            <ToolCode
              lang={lang}
              tabs={[
                {
                  tool: "Enrich2",
                  lang: "python",
                  note: t.noteEnrich2a,
                  url: "https://github.com/FowlerLab/Enrich2",
                  code: `# scoring methods Enrich2 offers:
#   WLS     weighted least squares
#   ratios  log ratios (Enrich2)
#   OLS     ordinary least squares
#   simple  log ratios (old Enrich)
#   counts  counts only

store = pd.HDFStore("Results/Rep1_sel.h5")
scores = store["/main/variants/scores"]   # score + SE per variant`,
                },
                {
                  tool: "pandas",
                  lang: "python",
                  note: t.notePandasA,
                  code: `import numpy as np

# floor at 0.001 so variants wiped out by selection stay on a log scale
lo = np.log10(df["fit_IGG10"].clip(lower=1e-3))
hi = np.log10(df["fit_IGG90"].clip(lower=1e-3))

print(lo.corr(hi).round(3))
# 0.717`,
                },
              ]}
            />
          </Quiz>
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="split" title={t.s3Title}>
          <Prose>{t.s3Body}</Prose>

          <Predict
            lang={lang}
            question={t.s3Question(worst.bin)}
            hint={t.s3Hint(rep.overallR)}
            min={0}
            max={1}
            step={0.01}
            initial={0.7}
            actual={worst.r}
            verdictClose={t.s3Close}
            verdictFar={t.s3Far}
          >
            <StatGrid>
              <Stat
                value={`r = ${worst.r.toFixed(2)}`}
                label={`${worst.bin} input reads`}
                tone="bad"
                hint={`${fmt(worst.n)} variants`}
              />
              <Stat
                value={`r = ${best.r.toFixed(2)}`}
                label={`${best.bin} input reads`}
                tone="good"
                hint={`${fmt(best.n)} variants`}
              />
              <Stat
                value={`r = ${rep.overallR.toFixed(2)}`}
                label={t.statSummarySaid}
                hint={t.statAverage}
              />
              <Stat
                value={fmt(shallow)}
                label={t.statBottomTwo}
                tone="warn"
                hint={t.statPassedQc}
              />
            </StatGrid>

            <Callout kind="key" title={t.s3HidingTitle}>
              {t.s3Hiding(rep.overallR)}
            </Callout>

            <ToolCode
              lang={lang}
              tabs={[
                {
                  tool: "Enrich2",
                  lang: "python",
                  note: t.noteEnrich2b,
                  url: "https://github.com/FowlerLab/Enrich2",
                  code: `# docs/exported_notebooks/min_count.rst
counts = my_store["/main/variants/counts"]
scores = my_store["/main/variants/scores"]

# keep only variants above a minimum count in the input timepoint
cutoff = 10
keep = counts["c_0"] >= cutoff
plt.scatter(counts.loc[keep, "c_0"], scores.loc[keep, "score"])`,
                },
                {
                  tool: "pandas",
                  lang: "python",
                  note: t.notePandasB,
                  code: `bins = [10, 20, 50, 200, 1000, np.inf]
df["depth"] = pd.cut(df["Input"], bins, right=False)

print(df.groupby("depth", observed=True)
        .apply(lambda g: np.log10(g["fit_IGG10"].clip(lower=1e-3))
                           .corr(np.log10(g["fit_IGG90"].clip(lower=1e-3))))
        .round(3))
# [10, 20)        0.423
# [20, 50)        0.465
# [50, 200)       0.623
# [200, 1000)     0.794
# [1000, inf)     0.841`,
                },
              ]}
            />
          </Predict>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="all" title={t.s4Title}>
          <Figure
            title={t.fig1Title}
            subtitle={t.fig1Sub}
            caption={t.fig1Caption}
          >
            <BarChart
              labelWidth={78}
              max={1}
              bars={rep.byDepth.map((b, i) => ({
                label: b.bin,
                value: b.r,
                valueLabel: b.r.toFixed(3),
                color: DEPTH_RAMP[i],
                detail: [{ label: "variants", value: fmt(b.n) }],
              }))}
            />
            <Legend
              title={t.inputReads}
              items={rep.byDepth.map((b, i) => ({
                label: b.bin,
                color: DEPTH_RAMP[i],
              }))}
            />
          </Figure>

          <Figure
            title={t.fig2Title}
            subtitle={t.fig2Sub(rep.scatter.length)}
            caption={t.fig2Caption}
          >
            <FacetedScatter
              panels={facets}
              xLabel="log10 fitness, low IgG"
              yLabel="log10 fitness, high IgG"
            />
          </Figure>

          <div className="my-6 rounded-xl border border-[var(--border)] p-1">
            <DataTable
              dense
              caption={t.tableCaption}
              rows={rep.byDepth}
              columns={[
                {
                  key: "bin",
                  header: t.colInputReads,
                  render: (b) => (
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-[2px]"
                        style={{
                          background: DEPTH_RAMP[rep.byDepth.indexOf(b)],
                        }}
                        aria-hidden
                      />
                      {b.bin}
                    </span>
                  ),
                },
                {
                  key: "n",
                  header: t.colVariants,
                  align: "right",
                  render: (b) => fmt(b.n),
                },
                {
                  key: "r",
                  header: t.colR,
                  align: "right",
                  render: (b) => (
                    <span className="font-medium text-[var(--ink)]">
                      {b.r.toFixed(3)}
                    </span>
                  ),
                },
                {
                  key: "q",
                  header: t.colUsable,
                  align: "right",
                  render: (b) => (
                    <span
                      style={{
                        color:
                          b.r > 0.75
                            ? "var(--success-text)"
                            : b.r > 0.6
                              ? "var(--serious)"
                              : "var(--critical)",
                      }}
                    >
                      {b.r > 0.75
                        ? t.usableYes
                        : b.r > 0.6
                          ? t.usableCare
                          : t.usableHint}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </Step>,

        /* 5 --------------------------------------------------------- */
        <Step key="why" title={t.s5Title}>
          <Prose>{t.s5Body}</Prose>
          <Callout kind="trap" title={t.s5TrapTitle}>
            {t.s5Trap(rep.n)}
          </Callout>
        </Step>,

        /* 6 --------------------------------------------------------- */
        <Step key="call" title={t.s6Title}>
          <Quiz
            lang={lang}
            scenario={t.s6Scenario(shallow, rep.n)}
            question={t.s6Question}
            choices={t.s6Choices(worst.r, best.r)}
          >
            <Prose>{t.s6After}</Prose>

            <ToolCode
              lang={lang}
              tabs={[
                {
                  tool: "DiMSum",
                  lang: "bash",
                  note: t.noteDimsum,
                  url: "https://github.com/lehner-lab/DiMSum",
                  code: `DiMSum \\
  --fitnessMinInputCountAny 10 \\
  --fitnessMinInputCountAll 0 \\
  --fitnessMinOutputCountAny 0 \\
  --fitnessMinOutputCountAll 0

# "Minimum input read count (in any replicate) to be
#  retained during fitness calculations (default:0)"`,
                },
                {
                  tool: "pandas",
                  lang: "python",
                  note: t.notePandasC,
                  code: `confirmed = (
    (df["fit_IGG10"] > 1.0)
    & (df["fit_IGG20"] > 1.0)
    & (df["fit_IGG90"] > 1.0)
)

hits = (df[confirmed]
        .sort_values("fit_IGG20", ascending=False)
        .loc[:, ["mut", "Input", "fit_IGG10", "fit_IGG20", "fit_IGG90"]])`,
                },
              ]}
            />
          </Quiz>
        </Step>,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["The question", "What r means", "Split it", "All bands", "Why", "Your call"],

    s1Title: "You have 149,361 numbers. Should you believe them?",
    s1Body: (
      <>
        <p>
          Every variant that survived quality control now has a fitness value.
          Before any of them is used, ask the only question that matters:{" "}
          <strong>if this were measured again, would it come out the same?</strong>
        </p>
        <p>
          This dataset lets you check without doing any new work. The same
          library was selected against three IgG concentrations. Low and high
          are different enough to count as independent selections, so agreement
          between them is real evidence rather than the same pipetting repeated.
        </p>
      </>
    ),
    s1PlanTitle: "The plan",
    s1Plan: (
      <p>
        Take every variant&apos;s fitness at low IgG, take the same
        variant&apos;s fitness at high IgG, and correlate the two. One number
        comes out. Then we will take that number apart.
      </p>
    ),

    s2Title: "Here is the answer. What does it mean?",
    s2Body: (
      <p>
        Correlating low-IgG against high-IgG fitness across every variant gives
        one number. Before reading on, decide what you would conclude from it.
      </p>
    ),
    s2StatLabel: "low IgG vs high IgG, log fitness",
    s2Question: "What does this number let you say?",
    s2Choices: [
      {
        label: "The measurement is solid. Roughly half the variation is shared, which is good for a biological assay.",
        grade: "ok" as const,
        outcome: (
          <>
            A fair reading, and the one most people stop at. It is true on
            average. The problem is the words &ldquo;on average&rdquo;, which
            the next step takes apart.
          </>
        ),
      },
      {
        label: "Every variant's fitness is about 72% reliable.",
        grade: "bad" as const,
        outcome: (
          <>
            This is the trap. A correlation describes a <em>set</em>, not any
            individual row. It says nothing about whether a particular
            variant&apos;s number is trustworthy, and treating it that way is
            how thin data gets promoted to a hit list.
          </>
        ),
      },
      {
        label: "Not much yet. It is one number summarising 149,361 very different variants.",
        grade: "best" as const,
        outcome: (
          <>
            Correct, and the instinct this whole chapter is training. An
            aggregate is a starting point for asking{" "}
            <em>which rows behave differently</em>, not a conclusion.
          </>
        ),
      },
    ],
    s2After: (
      <p>
        Most analyses report this number, put it in a supplementary figure, and
        move on. <strong>Do not move on.</strong>
      </p>
    ),
    s2ScaleTitle: "Reading a correlation, if it is new to you",
    s2Scale: (
      <>
        <p>
          <strong>r = 1</strong> means perfect agreement: knowing one
          measurement tells you the other exactly.{" "}
          <strong>r = 0</strong> means no relationship at all — the second
          measurement is unrelated to the first. <strong>r = 0.72</strong> sits
          in between, and for a biological assay it looks respectable.
        </p>
        <p>
          The catch is that r is a property of the whole group you computed it
          on. Change the group and you change the number, which is exactly what
          happens next.
        </p>
      </>
    ),
    statOverall: "Overall correlation",
    statCompared: "Variants compared",
    statVariance: "Variance explained",
    statConditions: "Selection conditions",

    s3Title: "Now split the same data by read depth",
    s3Body: (
      <>
        <p>
          Group those identical variants by how many reads the sequencer
          happened to give them, then compute the correlation <em>inside</em>{" "}
          each group. Nothing else changes: same formula, same pipeline, same
          variants.
        </p>
        <p>
          6,541 variants had between 10 and 19 input reads. They all passed
          quality control.
        </p>
      </>
    ),
    s3Question: (bin: string) =>
      `For just those ${bin}-read variants, what is the correlation?`,
    s3Hint: (r: number) => `Remember the overall number was r = ${r.toFixed(2)}.`,
    s3Close: "It is r = {actual}. Barely better than noise — and you expected that.",
    s3Far: "It is r = {actual}. Far worse than you guessed, and far worse than the headline number suggested.",
    statSummarySaid: "What the summary said",
    statAverage: "the average of both",
    statBottomTwo: "Variants in the bottom two bands",
    statPassedQc: "all passed QC",
    s3HidingTitle: "What the aggregate number was hiding",
    s3Hiding: (r: number) => (
      <p>
        r = {r.toFixed(2)} is an average over groups that behave completely
        differently. It is not wrong. It is just not an answer to any question
        you actually have.
      </p>
    ),

    s4Title: "All five bands at once",
    fig1Title: "Agreement between conditions, by sequencing depth",
    fig1Sub: "Correlation of log fitness, low IgG against high IgG, within each read-depth band",
    fig1Caption: (
      <>
        The only difference between the top bar and the bottom bar is how many
        times the sequencer happened to read that variant.
      </>
    ),
    fig2Title: "The same thing as scatter plots",
    fig2Sub: (n: number) =>
      `${n.toLocaleString()} variants, sampled evenly so every band is equally visible. Same axes in every panel.`,
    fig2Caption: (
      <>
        Read left to right: the cloud starts as a shapeless smear and tightens
        onto the diagonal as read depth increases. Five panels rather than one
        five-colour scatter, because overlapping translucent points pile up and
        every band ends up looking equally dark.
      </>
    ),
    inputReads: "input reads",
    tableCaption: "Correlation and variant count by read-depth band",
    colInputReads: "Input reads",
    colVariants: "Variants",
    colR: "Correlation r",
    colUsable: "Usable?",
    usableYes: "yes",
    usableCare: "with care",
    usableHint: "treat as a hint",

    s5Title: "Why depth does this",
    s5Body: (
      <>
        <p>
          Nothing is wrong with the low-depth variants biologically. The problem
          is counting.
        </p>
        <p>
          A variant with 12 input reads was sampled twelve times out of 89
          million. That number carries a large random component. Fitness divides
          one noisy count by another noisy count, so the ratio is noisier still.
          Run the experiment again and you get a different answer — not because
          the protein changed, but because the dice did.
        </p>
        <p>
          With 3,000 reads, the sampling error is small and the value reflects
          the protein.
        </p>
      </>
    ),
    s5TrapTitle: "The mistake this prevents",
    s5Trap: (n: number) => (
      <>
        <p>
          Sort {n.toLocaleString()} variants by fitness and the top of the list
          fills up with variants that got there on a handful of reads. A variant
          with 11 input reads and a lucky selection count can post a spectacular
          ratio.
        </p>
        <p>
          Carry the read count next to every fitness value, all the way to the
          hit list.
        </p>
      </>
    ),

    s6Title: "Your call",
    s6Scenario: (shallow: number, n: number) =>
      `You are handed this dataset. ${shallow.toLocaleString()} of the ${n.toLocaleString()} variants sit in the two bands where the conditions agree at r < 0.5. Your PI wants a list of candidates by Friday.`,
    s6Question: "What do you do?",
    s6Choices: (worstR: number, bestR: number) => [
      {
        label: "Raise the input-count cutoff until the correlation looks good",
        grade: "ok" as const,
        outcome: (
          <>
            Defensible, and the usual first move. Chapter 3 measured the cost:
            going to 500 reads lifts r to 0.834 but throws away{" "}
            <strong>71% of the library</strong>. You will never see the variants
            you discarded, including any good ones.
          </>
        ),
      },
      {
        label: "Keep everything, and carry read depth alongside every fitness value",
        grade: "best" as const,
        outcome: (
          <>
            More work, and the honest answer. You keep full coverage and let
            every downstream step know which numbers are thin. This is what the
            published analysis did: cutoff of 10,{" "}
            <strong>93% coverage kept</strong>, noise reported rather than
            hidden.
          </>
        ),
      },
      {
        label: "Require a variant to look good in more than one condition",
        grade: "best" as const,
        outcome: (
          <>
            The cheapest filter that targets the actual failure mode. A lucky
            read count is unlikely to be lucky twice. Chapter 9 shows this
            changes 11 of the top 25.
          </>
        ),
      },
      {
        label: "Report r = 0.72 and hand over the top 25 by fitness",
        grade: "bad" as const,
        outcome: (
          <>
            The number is true and the list is sorted correctly, which is what
            makes this dangerous. You would be presenting an average over groups
            ranging from r = {worstR.toFixed(2)} to r = {bestR.toFixed(2)} as if
            it described every row.
          </>
        ),
      },
    ],
    s6After: (
      <p>
        In practice the last two are combined, and real pipelines expose both as
        configuration rather than as code you write.
      </p>
    ),

    noteEnrich2a:
      "Enrich2 (Fowler lab) is the standard tool for turning DMS read counts into scores. It writes results to HDF5 and you read them back with pandas.",
    notePandasA:
      "What you would write yourself. Fitness is log-scaled first because the values span four orders of magnitude.",
    noteEnrich2b:
      'Enrich2 ships an example notebook for exactly this check, called "Selecting variants by input library count". It plots each variant\'s score against its input count.',
    notePandasB:
      "Two more lines than before: bin the depth, then correlate within each bin. This is the whole chapter in code.",
    noteDimsum:
      "DiMSum (Lehner lab) is an end-to-end DMS pipeline in R. The count cutoff this chapter spent its time on is a command-line option, and it defaults to 0 — the decision is handed to you, not made for you.",
    notePandasC:
      "Requiring agreement across conditions, the cheap filter that targets the real failure mode.",
  },

  ko: {
    labels: ["질문", "r의 의미", "쪼개보기", "전체", "왜", "당신의 선택"],

    s1Title: "숫자가 149,361개 생겼습니다. 믿어도 될까요?",
    s1Body: (
      <>
        <p>
          quality control을 통과한 variant마다 fitness 값이 붙었습니다. 이걸
          쓰기 전에 가장 중요한 질문을 해야 합니다.{" "}
          <strong>다시 측정하면 같은 값이 나올까?</strong>
        </p>
        <p>
          이 데이터는 추가 실험 없이 확인할 수 있습니다. 같은 library를 IgG 농도
          세 가지로 selection했기 때문입니다. 낮은 농도와 높은 농도는 충분히
          다른 조건이라 독립적인 selection으로 볼 수 있고, 그래서 둘 사이의
          일치는 진짜 증거가 됩니다. 같은 피펫팅을 반복한 게 아니니까요.
        </p>
      </>
    ),
    s1PlanTitle: "할 일",
    s1Plan: (
      <p>
        모든 variant의 저농도 IgG fitness와 고농도 IgG fitness를 가져와서 둘의
        correlation을 구합니다. 숫자 하나가 나옵니다. 그다음 그 숫자를
        뜯어봅니다.
      </p>
    ),

    s2Title: "답은 이겁니다. 무슨 뜻일까요?",
    s2Body: (
      <p>
        모든 variant에 대해 저농도와 고농도 fitness의 correlation을 구하면 숫자
        하나가 나옵니다. 넘어가기 전에, 이 숫자로 무엇을 말할 수 있을지
        골라보세요.
      </p>
    ),
    s2StatLabel: "저농도 IgG vs 고농도 IgG, log fitness",
    s2Question: "이 숫자로 할 수 있는 말은?",
    s2Choices: [
      {
        label: "측정이 탄탄하다. 변동의 절반 정도를 공유하니 생물학 assay치고 좋은 편이다.",
        grade: "ok" as const,
        outcome: (
          <>
            타당한 해석이고, 대부분 여기서 멈춥니다. <em>평균적으로는</em>{" "}
            맞는 말입니다. 문제는 그 &ldquo;평균적으로&rdquo;인데, 다음 단계가
            바로 그걸 뜯어봅니다.
          </>
        ),
      },
      {
        label: "variant 하나하나의 fitness가 약 72% 믿을 만하다.",
        grade: "bad" as const,
        outcome: (
          <>
            이게 함정입니다. correlation은 <em>집합</em>을 설명하는 값이지 개별
            행을 설명하지 않습니다. 특정 variant의 숫자가 믿을 만한지에 대해서는
            아무 말도 하지 않습니다. 이걸 개별 값으로 읽는 순간, read가 얇은
            데이터가 hit list까지 올라갑니다.
          </>
        ),
      },
      {
        label: "아직 별로 없다. 149,361개의 서로 다른 variant를 숫자 하나로 요약한 것뿐이다.",
        grade: "best" as const,
        outcome: (
          <>
            맞습니다. 이 챕터 전체가 기르려는 감각이 이겁니다. 전체 요약값은{" "}
            <em>어떤 행이 다르게 움직이는지</em> 묻기 위한 출발점이지 결론이
            아닙니다.
          </>
        ),
      },
    ],
    s2After: (
      <p>
        대부분의 분석은 이 숫자를 보고하고, supplementary figure에 넣고,
        넘어갑니다. <strong>넘어가면 안 됩니다.</strong>
      </p>
    ),
    s2ScaleTitle: "correlation이 처음이라면",
    s2Scale: (
      <>
        <p>
          <strong>r = 1</strong>은 완벽한 일치입니다. 한쪽 측정값을 알면 다른
          쪽이 정확히 결정됩니다. <strong>r = 0</strong>은 아무 관계가 없다는
          뜻입니다. 두 번째 측정이 첫 번째와 무관합니다.{" "}
          <strong>r = 0.72</strong>는 그 사이이고, 생물학 assay 기준으로는 괜찮아
          보이는 값입니다.
        </p>
        <p>
          함정은 r이 <em>계산 대상 집단 전체</em>의 성질이라는 점입니다. 집단을
          바꾸면 숫자도 바뀝니다. 다음 단계에서 정확히 그 일이 벌어집니다.
        </p>
      </>
    ),
    statOverall: "전체 correlation",
    statCompared: "비교한 variant",
    statVariance: "설명된 분산",
    statConditions: "selection 조건",

    s3Title: "같은 데이터를 read depth로 쪼개봅니다",
    s3Body: (
      <>
        <p>
          똑같은 variant들을 sequencer가 몇 번 읽어줬는지에 따라 묶고, 각 그룹{" "}
          <em>안에서</em> correlation을 구합니다. 나머지는 전부 그대로입니다.
          같은 공식, 같은 파이프라인, 같은 variant.
        </p>
        <p>
          input read가 10~19개였던 variant가 6,541개 있습니다. 전부 quality
          control을 통과했습니다.
        </p>
      </>
    ),
    s3Question: (bin: string) =>
      `read가 ${bin}개인 variant들만 보면, correlation은 얼마일까요?`,
    s3Hint: (r: number) => `전체 값은 r = ${r.toFixed(2)}였습니다.`,
    s3Close: "r = {actual}입니다. 노이즈보다 조금 나은 수준이고, 예상하셨네요.",
    s3Far: "r = {actual}입니다. 예상보다 훨씬 낮고, 전체 숫자가 암시한 것보다도 훨씬 낮습니다.",
    statSummarySaid: "요약값이 말한 것",
    statAverage: "둘의 평균",
    statBottomTwo: "하위 두 구간의 variant",
    statPassedQc: "전부 QC 통과",
    s3HidingTitle: "요약값이 가리고 있던 것",
    s3Hiding: (r: number) => (
      <p>
        r = {r.toFixed(2)}는 완전히 다르게 움직이는 그룹들을 평균 낸 값입니다.
        틀린 값은 아닙니다. 다만 당신이 실제로 가진 어떤 질문에도 답이 되지
        않습니다.
      </p>
    ),

    s4Title: "다섯 구간을 한 번에",
    fig1Title: "조건 간 일치도, read depth별",
    fig1Sub: "각 read depth 구간 안에서 저농도 IgG 대 고농도 IgG의 log fitness correlation",
    fig1Caption: (
      <>
        맨 위 막대와 맨 아래 막대의 유일한 차이는, sequencer가 그 variant를 몇 번
        읽었느냐뿐입니다.
      </>
    ),
    fig2Title: "같은 내용을 산점도로",
    fig2Sub: (n: number) =>
      `variant ${n.toLocaleString()}개. 모든 구간이 똑같이 보이도록 균등 추출했습니다. 모든 패널의 축은 같습니다.`,
    fig2Caption: (
      <>
        왼쪽에서 오른쪽으로 보세요. 형체 없이 번진 구름이 read depth가 올라갈수록
        대각선에 달라붙습니다. 색 다섯 개짜리 산점도 하나가 아니라 패널 다섯 개로
        나눈 이유는, 반투명 점이 겹치면 모든 구간이 똑같이 진해 보이기
        때문입니다.
      </>
    ),
    inputReads: "input read",
    tableCaption: "read depth 구간별 correlation과 variant 수",
    colInputReads: "input read",
    colVariants: "variant 수",
    colR: "correlation r",
    colUsable: "쓸 수 있나?",
    usableYes: "예",
    usableCare: "조심해서",
    usableHint: "힌트 정도로만",

    s5Title: "왜 depth가 이런 차이를 만드나",
    s5Body: (
      <>
        <p>
          read가 적은 variant에 생물학적으로 문제가 있는 게 아닙니다. 문제는
          세는 행위 자체입니다.
        </p>
        <p>
          input read가 12개인 variant는 8,900만 번 중 열두 번 뽑힌 겁니다. 이
          숫자에는 큰 무작위 성분이 들어 있습니다. fitness는 노이즈가 낀 숫자를
          또 다른 노이즈가 낀 숫자로 나누기 때문에, 비율은 더 흔들립니다. 실험을
          다시 하면 다른 값이 나옵니다. protein이 변해서가 아니라 주사위가
          달라져서요.
        </p>
        <p>
          read가 3,000개면 sampling 오차가 작아지고, 그 값은 protein을 반영합니다.
        </p>
      </>
    ),
    s5TrapTitle: "이게 막아주는 실수",
    s5Trap: (n: number) => (
      <>
        <p>
          variant {n.toLocaleString()}개를 fitness로 정렬하면, 목록 맨 위가 read
          몇 개로 거기 올라온 variant들로 채워집니다. input read 11개에 운 좋은
          selection count가 겹치면 화려한 비율이 나옵니다.
        </p>
        <p>
          fitness 값 옆에 read count를 끝까지, hit list까지 들고 가세요.
        </p>
      </>
    ),

    s6Title: "당신의 선택",
    s6Scenario: (shallow: number, n: number) =>
      `이 데이터를 넘겨받았습니다. variant ${n.toLocaleString()}개 중 ${shallow.toLocaleString()}개가 두 조건의 일치도가 r < 0.5인 구간에 있습니다. PI는 금요일까지 후보 목록을 원합니다.`,
    s6Question: "어떻게 하시겠습니까?",
    s6Choices: (worstR: number, bestR: number) => [
      {
        label: "correlation이 괜찮아 보일 때까지 input count cutoff를 올린다",
        grade: "ok" as const,
        outcome: (
          <>
            방어 가능하고, 보통 제일 먼저 하는 선택입니다. 3장에서 그 비용을
            쟀습니다. 500으로 올리면 r은 0.834가 되지만{" "}
            <strong>library의 71%</strong>를 버립니다. 버린 variant는 다시는 못
            봅니다. 그중에 좋은 게 있었어도요.
          </>
        ),
      },
      {
        label: "전부 유지하고, 모든 fitness 값 옆에 read depth를 같이 들고 간다",
        grade: "best" as const,
        outcome: (
          <>
            일은 더 많지만 정직한 답입니다. coverage를 다 유지하면서 이후 모든
            단계가 어떤 숫자가 얇은지 알게 됩니다. 출판된 분석이 택한 방식이기도
            합니다. cutoff 10, <strong>coverage 93% 유지</strong>, 노이즈는
            숨기지 않고 보고.
          </>
        ),
      },
      {
        label: "두 개 이상 조건에서 좋아야 후보로 인정한다",
        grade: "best" as const,
        outcome: (
          <>
            실제 실패 모드를 정조준하는 가장 값싼 filter입니다. 운 좋은 read
            count가 두 번 연속 운 좋기는 어렵습니다. 9장에서 이게 상위 25개 중
            11개를 바꿉니다.
          </>
        ),
      },
      {
        label: "r = 0.72를 보고하고 fitness 상위 25개를 넘긴다",
        grade: "bad" as const,
        outcome: (
          <>
            숫자도 맞고 정렬도 맞습니다. 그래서 위험합니다. r ={" "}
            {worstR.toFixed(2)}부터 r = {bestR.toFixed(2)}까지 걸친 그룹들의
            평균을, 마치 모든 행을 설명하는 값처럼 제시하는 셈이니까요.
          </>
        ),
      },
    ],
    s6After: (
      <p>
        실무에서는 뒤의 두 가지를 같이 씁니다. 그리고 실제 파이프라인은 둘 다
        직접 짜는 코드가 아니라 설정값으로 제공합니다.
      </p>
    ),

    noteEnrich2a:
      "Enrich2 (Fowler lab)는 DMS read count를 score로 바꾸는 표준 툴입니다. 결과를 HDF5로 쓰고, pandas로 다시 읽습니다.",
    notePandasA:
      "직접 짜면 이렇게 됩니다. 값이 네 자릿수 규모로 퍼져 있어서 fitness를 먼저 log로 바꿉니다.",
    noteEnrich2b:
      'Enrich2에는 정확히 이 확인을 하는 예제 노트북이 있습니다. 제목이 "Selecting variants by input library count"이고, 각 variant의 score를 input count에 대해 그립니다.',
    notePandasB:
      "앞보다 두 줄 더 쓰면 됩니다. depth로 구간을 나누고, 구간 안에서 correlation을 구합니다. 이 챕터 전체가 이 코드입니다.",
    noteDimsum:
      "DiMSum (Lehner lab)은 R로 된 DMS 전체 파이프라인입니다. 이 챕터가 내내 다룬 count cutoff가 커맨드라인 옵션으로 있고, 기본값이 0입니다. 즉 그 결정을 툴이 대신 해주지 않고 사용자에게 넘깁니다.",
    notePandasC:
      "조건 간 일치를 요구하는 코드입니다. 실제 실패 모드를 정조준하는 값싼 filter입니다.",
  },
};
