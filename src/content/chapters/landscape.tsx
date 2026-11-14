import {
  Callout,
  DataTable,
  Figure,
  Prose,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { Heatmap } from "@/components/charts/Heatmap";
import { Histogram } from "@/components/charts/Histogram";
import { Steps, Step } from "@/components/learn/Steps";
import { Quiz, Reveal } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { getSingles, getLandscape, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

export function Landscape({ lang, takeaway }: ChapterProps) {
  const { singles, heatmap, aaOrder } = getSingles();
  const landscape = getLandscape();
  const t = COPY[lang];

  const best = singles.slice(0, 8);
  const worst = singles.slice(-6).reverse();
  const beneficial = singles.filter((s) => s.fitness > 1);

  const byPosition = heatmap.map((row) => {
    const measured = row.cells.filter((c) => !c.isWt && c.fitness !== null);
    const tolerated = measured.filter((c) => (c.fitness ?? 0) > 0.1).length;
    const better = measured.filter((c) => (c.fitness ?? 0) > 1).length;
    return {
      position: row.position,
      wt: row.wt,
      measured: measured.length,
      tolerated,
      better,
      pct: Math.round((100 * tolerated) / Math.max(measured.length, 1)),
    };
  });

  const g41 = byPosition.find((p) => p.position === 41)!;
  const d40 = byPosition.find((p) => p.position === 40)!;
  const fit = (label: string) =>
    singles.find((s) => s.label === label)?.fitness ?? 0;

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="heatmap" title={t.s1Title}>
          <Prose>{t.s1Body}</Prose>

          <Figure
            title={t.figHeatTitle}
            subtitle={t.figHeatSub}
            caption={t.figHeatCaption}
            source={t.figHeatSource}
          >
            <Heatmap rows={heatmap} aaOrder={aaOrder} />
          </Figure>

          <Reveal lang={lang} prompt={t.s1RevealPrompt}>
            <Prose>{t.s1RevealBody(g41, d40, fit("D40Y"), fit("D40W"), fit("D40F"))}</Prose>
          </Reveal>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="tolerance" title={t.s2Title}>
          <Quiz
            lang={lang}
            scenario={t.s2Scenario}
            question={t.s2Question}
            choices={t.s2Choices}
          >
            <Figure title={t.figTolTitle} subtitle={t.figTolSub}>
              <DataTable
                caption={t.figTolTitle}
                rows={byPosition}
                columns={[
                  {
                    key: "pos",
                    header: t.colPosition,
                    render: (p) => (
                      <span className="font-mono font-medium text-[var(--ink)]">
                        {p.wt}
                        {p.position}
                      </span>
                    ),
                  },
                  {
                    key: "tol",
                    header: t.colTolerated,
                    align: "right",
                    render: (p) => `${p.tolerated} / ${p.measured}`,
                  },
                  {
                    key: "better",
                    header: t.colBetter,
                    align: "right",
                    render: (p) => (
                      <span
                        style={{
                          color:
                            p.better > 0
                              ? "var(--success-text)"
                              : "var(--ink-muted)",
                          fontWeight: p.better > 0 ? 600 : 400,
                        }}
                      >
                        {p.better}
                      </span>
                    ),
                  },
                  {
                    key: "bar",
                    header: "",
                    render: (p) => (
                      <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-[var(--grid)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.pct}%`,
                            background:
                              p.pct > 40
                                ? "var(--series-3)"
                                : p.pct > 20
                                  ? "var(--serious)"
                                  : "var(--critical)",
                          }}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </Figure>

            <ToolCode
              lang={lang}
              tabs={[
                {
                  tool: "Enrich2",
                  lang: "python",
                  note: t.noteEnrich2,
                  url: "https://github.com/FowlerLab/Enrich2",
                  code: `# Enrich2 draws this figure for you: enrich2/sfmap.py
# builds a sequence-function map, one cell per
# position x amino acid, from the scores table.

from enrich2.sfmap import sfmap_plot`,
                },
                {
                  tool: "pandas",
                  lang: "python",
                  note: t.notePandas,
                  code: `POS = [39, 40, 41, 54]
WT  = "VDGV"

singles = df[df["hd"] == 1].copy()
singles["pos"] = singles["mut"].apply(
    lambda m: POS[next(i for i in range(4) if m[i] != WT[i])]
)
singles["aa"] = singles["mut"].apply(
    lambda m: next(c for i, c in enumerate(m) if c != WT[i])
)

heat = singles.pivot(index="pos", columns="aa", values="fitness")`,
                },
              ]}
            />
          </Quiz>
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="singles" title={t.s3Title}>
          <div className="my-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
              <div className="px-4 pt-3 pb-2 text-[12px] font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
                {t.bestSingles}
              </div>
              <DataTable
                dense
                caption={t.bestSingles}
                rows={best}
                columns={[
                  {
                    key: "l",
                    header: t.colMutation,
                    render: (s) => (
                      <span className="font-mono font-medium text-[var(--ink)]">
                        {s.label}
                      </span>
                    ),
                  },
                  {
                    key: "f",
                    header: t.colFitness,
                    align: "right",
                    render: (s) => (
                      <span
                        style={{
                          color:
                            s.fitness > 1
                              ? "var(--success-text)"
                              : "var(--ink-secondary)",
                          fontWeight: 500,
                        }}
                      >
                        {s.fitness.toFixed(2)}
                      </span>
                    ),
                  },
                  {
                    key: "n",
                    header: t.colReads,
                    align: "right",
                    render: (s) => fmt(s.input),
                  },
                ]}
              />
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
              <div className="px-4 pt-3 pb-2 text-[12px] font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
                {t.worstSingles}
              </div>
              <DataTable
                dense
                caption={t.worstSingles}
                rows={worst}
                columns={[
                  {
                    key: "l",
                    header: t.colMutation,
                    render: (s) => (
                      <span className="font-mono font-medium text-[var(--ink)]">
                        {s.label}
                      </span>
                    ),
                  },
                  {
                    key: "f",
                    header: t.colFitness,
                    align: "right",
                    render: (s) => (
                      <span
                        style={{ color: "var(--critical)", fontWeight: 500 }}
                      >
                        {s.fitness.toFixed(4)}
                      </span>
                    ),
                  },
                  {
                    key: "n",
                    header: t.colReads,
                    align: "right",
                    render: (s) => fmt(s.input),
                  },
                ]}
              />
            </div>
          </div>

          <StatGrid>
            <Stat value={String(singles.length)} label={t.statSingles} />
            <Stat
              value={String(beneficial.length)}
              label={t.statBeneficial}
              tone="good"
            />
            <Stat
              value={best[0].fitness.toFixed(2)}
              label={t.statBestSingle}
              hint={best[0].label}
            />
            <Stat
              value={landscape.top[0].fitness.toFixed(1)}
              label={t.statBestOverall}
              tone="good"
              hint={`${landscape.top[0].mut}, ${landscape.top[0].hd}×`}
            />
          </StatGrid>

          <Callout kind="trap" title={t.s3TrapTitle}>
            {t.s3Trap(
              best[0].fitness,
              landscape.top[0].fitness,
              landscape.top[0].hd,
            )}
          </Callout>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="shape" title={t.s4Title}>
          <Figure
            title={t.figDistTitle}
            subtitle={t.figDistSub}
            caption={t.figDistCaption(
              landscape.effectivelyDeadPct,
              landscape.betterThanWt,
              landscape.betterThanWtPct,
            )}
          >
            <Histogram
              bins={landscape.histogram}
              markAt={0}
              markLabel={t.wildTypeMark}
              xLabel={t.xLabel}
              height={240}
            />
          </Figure>

          <Prose>{t.s4After}</Prose>

          <Figure
            title={t.figTopTitle}
            subtitle={t.figTopSub}
            caption={t.figTopCaption}
          >
            <DataTable
              dense
              caption={t.figTopTitle}
              rows={landscape.top}
              columns={[
                {
                  key: "mut",
                  header: t.colVariant,
                  render: (x) => <Variant seq={x.mut} />,
                },
                {
                  key: "hd",
                  header: t.colChanges,
                  align: "right",
                  render: (x) => String(x.hd),
                },
                {
                  key: "f",
                  header: t.colFitness,
                  align: "right",
                  render: (x) => (
                    <span
                      style={{ color: "var(--success-text)", fontWeight: 500 }}
                    >
                      {x.fitness.toFixed(2)}x
                    </span>
                  ),
                },
                {
                  key: "n",
                  header: t.colReads,
                  align: "right",
                  render: (x) => (
                    <span
                      style={{
                        color:
                          x.input < 50
                            ? "var(--serious)"
                            : "var(--ink-secondary)",
                      }}
                    >
                      {fmt(x.input)}
                    </span>
                  ),
                },
              ]}
            />
          </Figure>
        </Step>,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["The heatmap", "Where to work", "Singles", "The shape"],

    s1Title: "Start with single mutants",
    s1Body: (
      <>
        <p>
          The data is clean and the caveats are known. Now you can do biology.
        </p>
        <p>
          Change one position, leave the other three as wild type. There are 76
          of these, and they are the foundation for everything that follows.
        </p>
      </>
    ),
    figHeatTitle: "Single-mutant fitness at each randomised position",
    figHeatSub:
      "Medium IgG. Colour is fitness relative to the wild type; the wild-type residue is outlined.",
    figHeatCaption: (
      <>
        The colour scale is <strong>diverging</strong>, centred on the wild
        type, because the question for every cell is better or worse than what
        we started with. Red is worse, blue is better, grey is about the same.
        Hover any cell for its fitness and read depth.
      </>
    ),
    figHeatSource: "Hatched cells were never measured at sufficient depth.",
    s1RevealPrompt: "Two rows stand out. What are they telling you?",
    s1RevealBody: (
      g41: { tolerated: number; measured: number },
      d40: { better: number; measured: number },
      y: number,
      w: number,
      f: number,
    ) => (
      <>
        <p>
          <strong>G41 is almost entirely red.</strong> Only {g41.tolerated} of{" "}
          {g41.measured} substitutions keep any function. Glycine sits where
          the backbone has to bend sharply, and glycine is the only residue
          with no side chain to get in the way. This position is not available
          to you.
        </p>
        <p>
          <strong>D40 is mostly blue.</strong> All {d40.measured} substitutions
          are tolerated and <strong>{d40.better} beat the wild type</strong>.
          The best are large aromatics: D40Y at {y.toFixed(2)}x, D40W at{" "}
          {w.toFixed(2)}x, D40F at {f.toFixed(2)}x. Evolution left a charged
          aspartate in a spot where a big flat ring binds IgG far better.
        </p>
        <p>
          That is the useful output of a heatmap: which positions are locked
          and which are open, before you spend anything.
        </p>
      </>
    ),

    s2Title: "Where would you spend your library?",
    s2Scenario:
      "You have budget to randomise two positions deeply in a follow-up experiment, not four.",
    s2Question: "Which two do you pick?",
    s2Choices: [
      {
        label: "G41 and V39 — the positions where most changes break the protein.",
        grade: "bad" as const,
        outcome: (
          <>
            These are the <em>least</em> promising. If nearly every substitution
            is dead, a deeper library there mostly buys you more dead variants.
            Intolerant positions are information, not opportunity.
          </>
        ),
      },
      {
        label: "D40 and V54 — the positions that tolerate change and already contain improvements.",
        grade: "best" as const,
        outcome: (
          <>
            Right. D40 tolerates everything and 12 substitutions already beat
            wild type; V54 tolerates most and contains three. That is where
            additional sampling can find something.
          </>
        ),
      },
      {
        label: "All four, shallowly — do not pre-judge.",
        grade: "ok" as const,
        outcome: (
          <>
            Defensible if you distrust the first screen, and it protects
            against interactions that single mutants cannot see — chapter 8
            shows those are real. But you have already paid to learn that G41
            is locked, and spending again to relearn it is expensive.
          </>
        ),
      },
    ],
    figTolTitle: "How tolerant is each position?",
    figTolSub: "Substitutions keeping fitness above 0.1, and those beating wild type",
    colPosition: "Position",
    colTolerated: "Tolerated",
    colBetter: "Beat WT",
    noteEnrich2:
      "The sequence-function map is a standard enough output that Enrich2 ships code to draw it.",
    notePandas:
      "Going from a variant string to a position-by-amino-acid matrix. The pivot is the only interesting line.",

    s3Title: "The best and worst single changes",
    bestSingles: "Best single mutants",
    worstSingles: "Worst single mutants",
    colMutation: "Mutation",
    colFitness: "Fitness",
    colReads: "Reads",
    statSingles: "Single mutants measured",
    statBeneficial: "That beat the wild type",
    statBestSingle: "Best single mutant",
    statBestOverall: "Best variant overall",
    s3TrapTitle: "The gap that makes protein design hard",
    s3Trap: (bestSingle: number, bestAll: number, hd: number) => (
      <>
        <p>
          The best <em>single</em> mutation gives {bestSingle.toFixed(2)}x. The
          best variant overall gives {bestAll.toFixed(1)}x, and it has {hd}{" "}
          mutations.
        </p>
        <p>
          <strong>You cannot reach the second by collecting the first.</strong>{" "}
          That gap is called epistasis, and it is chapter 8.
        </p>
      </>
    ),

    s4Title: "The shape of the whole landscape",
    figDistTitle: "Distribution of fitness across the library",
    figDistSub: "Log scale, wild type marked",
    figDistCaption: (deadPct: number, better: number, betterPct: number) => (
      <>
        Two features matter. The enormous spike on the left is dead protein —{" "}
        {deadPct}% of the library. The thin tail to the right of the wild-type
        line is the entire useful output of the experiment: {fmt(better)}{" "}
        variants, {betterPct}% of what was measured.
      </>
    ),
    wildTypeMark: "wild type",
    xLabel: "fitness (log scale)",
    s4After: (
      <p>
        This shape is typical, and worth internalising before you design your
        own library. Randomising four neighbouring positions does not give you
        a gentle spread of outcomes around the starting point. It gives you
        mostly rubble, with a few peaks.
      </p>
    ),
    figTopTitle: "The 20 best variants in the library",
    figTopSub: "Medium IgG, ranked by fitness",
    figTopCaption: (
      <>
        Nearly all carry changes at all four positions. Several share a pattern
        — a large aromatic at 39 and 40, something small at 41 and 54 — which
        is a real structural signal rather than coincidence. Read depth is
        shown because, as chapter 5 warned, the top of a sorted list is where
        thin data hides.
      </>
    ),
    colVariant: "Variant",
    colChanges: "Changes",
  },

  ko: {
    labels: ["heatmap", "어디를 건드릴까", "single", "분포"],

    s1Title: "single mutant부터 봅니다",
    s1Body: (
      <>
        <p>
          데이터는 정리됐고 주의사항도 압니다. 이제 생물학을 할 수 있습니다.
        </p>
        <p>
          한 자리만 바꾸고 나머지 셋은 wild type으로 둡니다. 이런 게 76개 있고,
          이후 모든 것의 토대가 됩니다.
        </p>
      </>
    ),
    figHeatTitle: "무작위화된 자리별 single mutant fitness",
    figHeatSub:
      "중간 농도 IgG. 색은 wild type 대비 fitness이고, wild type 잔기는 테두리로 표시했습니다.",
    figHeatCaption: (
      <>
        색 척도는 wild type을 중심으로 한 <strong>diverging</strong>입니다. 각
        칸의 질문이 시작점보다 나은가 못한가이기 때문입니다. 빨강이 나쁨, 파랑이
        좋음, 회색이 비슷함입니다. 칸에 마우스를 올리면 fitness와 read depth가
        나옵니다.
      </>
    ),
    figHeatSource: "빗금 친 칸은 충분한 depth로 측정되지 않았습니다.",
    s1RevealPrompt: "눈에 띄는 행이 두 개 있습니다. 뭘 말하고 있을까요?",
    s1RevealBody: (
      g41: { tolerated: number; measured: number },
      d40: { better: number; measured: number },
      y: number,
      w: number,
      f: number,
    ) => (
      <>
        <p>
          <strong>G41은 거의 전부 빨강입니다.</strong> {g41.measured}개 치환 중{" "}
          {g41.tolerated}개만 기능을 조금이라도 유지합니다. glycine은 backbone이
          급격히 꺾여야 하는 자리에 있고, 곁사슬이 없어서 방해가 안 되는 유일한
          잔기입니다. 이 자리는 쓸 수 없습니다.
        </p>
        <p>
          <strong>D40은 대부분 파랑입니다.</strong> {d40.measured}개 치환이 전부
          허용되고, <strong>{d40.better}개가 wild type을 이깁니다</strong>. 가장
          좋은 건 큰 방향족입니다. D40Y {y.toFixed(2)}배, D40W {w.toFixed(2)}배,
          D40F {f.toFixed(2)}배. 진화는 큰 평평한 고리가 IgG에 훨씬 잘 붙는
          자리에 전하를 띤 aspartate를 남겨뒀습니다.
        </p>
        <p>
          heatmap의 쓸모가 이겁니다. 돈을 쓰기 전에 어느 자리가 잠겨 있고 어느
          자리가 열려 있는지 알려줍니다.
        </p>
      </>
    ),

    s2Title: "library를 어디에 쓰시겠습니까?",
    s2Scenario:
      "후속 실험에서 네 자리가 아니라 두 자리만 깊게 무작위화할 예산이 있습니다.",
    s2Question: "어느 두 자리를 고르시겠습니까?",
    s2Choices: [
      {
        label: "G41과 V39. 대부분의 변화가 단백질을 망가뜨리는 자리.",
        grade: "bad" as const,
        outcome: (
          <>
            <em>가장 가망 없는</em> 선택입니다. 거의 모든 치환이 죽는다면, 거기
            library를 더 깊게 파봐야 죽은 variant만 더 얻습니다. 불관용 자리는
            정보이지 기회가 아닙니다.
          </>
        ),
      },
      {
        label: "D40과 V54. 변화를 허용하고 이미 개선 사례가 있는 자리.",
        grade: "best" as const,
        outcome: (
          <>
            맞습니다. D40은 전부 허용하고 이미 12개 치환이 wild type을 이깁니다.
            V54는 대부분 허용하고 3개가 이깁니다. 추가 샘플링이 뭔가를 찾아낼 수
            있는 곳이 거기입니다.
          </>
        ),
      },
      {
        label: "네 자리 전부를 얕게. 미리 판단하지 않는다.",
        grade: "ok" as const,
        outcome: (
          <>
            첫 screen을 못 믿겠다면 방어 가능하고, single mutant로는 못 보는
            상호작용에 대한 보험도 됩니다. 8장에서 그게 실재한다는 걸 봅니다.
            다만 G41이 잠겨 있다는 건 이미 비용을 치르고 알아낸 사실이고, 그걸
            다시 알아내려고 또 돈을 쓰는 건 비쌉니다.
          </>
        ),
      },
    ],
    figTolTitle: "자리별 관용도",
    figTolSub: "fitness 0.1 이상을 유지하는 치환 수와, wild type을 이긴 수",
    colPosition: "자리",
    colTolerated: "허용됨",
    colBetter: "WT 초과",
    noteEnrich2:
      "sequence-function map은 충분히 표준적인 출력이라 Enrich2가 그리는 코드를 아예 포함하고 있습니다.",
    notePandas:
      "variant 문자열에서 자리×amino acid 행렬로 가는 과정입니다. 흥미로운 줄은 pivot 하나뿐입니다.",

    s3Title: "가장 좋은 변화와 가장 나쁜 변화",
    bestSingles: "최고 single mutant",
    worstSingles: "최악 single mutant",
    colMutation: "mutation",
    colFitness: "fitness",
    colReads: "read",
    statSingles: "측정된 single mutant",
    statBeneficial: "wild type을 이긴 수",
    statBestSingle: "최고 single mutant",
    statBestOverall: "전체 최고 variant",
    s3TrapTitle: "protein design을 어렵게 만드는 격차",
    s3Trap: (bestSingle: number, bestAll: number, hd: number) => (
      <>
        <p>
          최고의 <em>단일</em> mutation은 {bestSingle.toFixed(2)}배입니다. 전체
          최고 variant는 {bestAll.toFixed(1)}배이고, mutation이 {hd}개입니다.
        </p>
        <p>
          <strong>첫 번째를 모아서는 두 번째에 도달할 수 없습니다.</strong> 이
          격차를 epistasis라고 하고, 8장이 그 이야기입니다.
        </p>
      </>
    ),

    s4Title: "landscape 전체의 모양",
    figDistTitle: "library 전체의 fitness 분포",
    figDistSub: "log 축, wild type 표시",
    figDistCaption: (deadPct: number, better: number, betterPct: number) => (
      <>
        중요한 특징이 둘입니다. 왼쪽의 거대한 봉우리는 죽은 단백질이고, library의{" "}
        {deadPct}%입니다. wild type 선 오른쪽의 얇은 꼬리가 이 실험의 쓸모 있는
        산출물 전부입니다. variant {fmt(better)}개, 측정된 것의 {betterPct}%
        입니다.
      </>
    ),
    wildTypeMark: "wild type",
    xLabel: "fitness (log 축)",
    s4After: (
      <p>
        이 모양이 전형적이고, 직접 library를 설계하기 전에 몸에 익혀둘 가치가
        있습니다. 이웃한 네 자리를 무작위화한다고 시작점 주변으로 완만하게 퍼진
        결과가 나오지 않습니다. 대부분 잔해이고, 봉우리가 몇 개 있습니다.
      </p>
    ),
    figTopTitle: "library 최고 variant 20개",
    figTopSub: "중간 농도 IgG, fitness 순",
    figTopCaption: (
      <>
        거의 전부가 네 자리 모두 바뀐 것들입니다. 39와 40에 큰 방향족, 41과 54에
        작은 잔기라는 패턴을 여럿이 공유하는데, 우연이 아니라 실제 구조 신호입니다.
        read depth를 같이 보여주는 건, 5장에서 경고했듯 정렬된 목록의 맨 위가
        얇은 데이터가 숨는 자리이기 때문입니다.
      </>
    ),
    colVariant: "variant",
    colChanges: "변경 수",
  },
};
