import {
  Callout,
  CodeBlock,
  Figure,
  Prose,
  Stat,
  StatGrid,
  Variant,
} from "@/components/ui";
import { RawTable } from "@/components/RawTable";
import { Steps, Step } from "@/components/learn/Steps";
import { Quiz, Reveal } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { getRawProfile, getRawSample, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

export function RawCounts({ lang, takeaway }: ChapterProps) {
  const profile = getRawProfile();
  const sample = getRawSample();
  const t = COPY[lang];

  const stops = profile.pathologies.find((p) => p.id === "stop")!;
  const zeroInput = profile.pathologies.find((p) => p.id === "zeroInput")!;
  const lowInput = profile.pathologies.find((p) => p.id === "lowInput")!;
  const dropout = profile.pathologies.find((p) => p.id === "dropout")!;

  const minTotal = Math.min(
    profile.libraryTotals.IGG10,
    profile.libraryTotals.IGG20,
    profile.libraryTotals.IGG90,
  );

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="open" title={t.s1Title}>
          <Prose>{t.s1Body}</Prose>

          <CodeBlock
            label={t.s1CodeLabel}
            code={`mut   HD  Input   IGG10   IGG20   IGG90
VDGV  0   92735   247431  338346  398449
SSGE  3   1365    35      44      129
FR_R  4   10      0       0       0
AEEA  4   8       0       1       2
...   ${fmt(profile.rowsInFile)} rows`}
          />

          <Prose>{t.s1After}</Prose>

          <Reveal lang={lang} prompt={t.s1RevealPrompt}>
            <Prose>{t.s1RevealBody}</Prose>
          </Reveal>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="stops" title={t.s2Title}>
          <Prose>
            {t.s2Body(profile.spaceWithStops, stops.count, stops.pct)}
          </Prose>

          <StatGrid>
            <Stat value={fmt(profile.rowsInFile)} label={t.statRows} />
            <Stat
              value={fmt(stops.count)}
              label={t.statStops}
              tone="bad"
              hint={`${stops.pct}%`}
            />
            <Stat value={fmt(profile.rowsCodingOnly)} label={t.statCoding} />
            <Stat
              value={fmt(profile.neverObserved)}
              label={t.statMissing}
              tone="warn"
              hint={`${profile.neverObservedPct}%`}
            />
          </StatGrid>

          <Quiz
            lang={lang}
            question={t.s2Question}
            choices={t.s2Choices}
          >
            <Callout kind="key" title={t.s2KeyTitle}>
              {t.s2Key}
            </Callout>

            <ToolCode
              lang={lang}
              tabs={[
                {
                  tool: "Enrich2",
                  lang: "python",
                  note: t.noteEnrich2,
                  url: "https://github.com/FowlerLab/Enrich2",
                  code: `# Enrich2 marks a variant's protein consequence while counting,
# so synonymous, missense and nonsense can be split later.
from enrich2.variant import WILD_TYPE_VARIANT

# nonsense variants are kept in the store and filtered when scoring,
# not thrown away at the counting stage`,
                },
                {
                  tool: "pandas",
                  lang: "python",
                  note: t.notePandas,
                  code: `stops  = df[df["mut"].str.contains("_", regex=False)]
coding = df[~df["mut"].str.contains("_", regex=False)]

print(len(stops), len(coding))
# 32587 158570`,
                },
              ]}
            />
          </Quiz>
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="uneven" title={t.s3Title}>
          <Prose>{t.s3Body}</Prose>

          <StatGrid>
            <Stat
              value={fmt(profile.inputCount.min)}
              label={t.statFewest}
              tone="bad"
            />
            <Stat value={fmt(profile.inputCount.median)} label={t.statMedian} />
            <Stat value={fmt(profile.inputCount.p75)} label={t.statP75} />
            <Stat
              value={fmt(profile.inputCount.max)}
              label={t.statMost}
              hint={t.statMostHint}
            />
          </StatGrid>

          <Callout kind="trap" title={t.s3TrapTitle}>
            {t.s3Trap}
          </Callout>

          <Prose>{t.s3Totals(profile.libraryTotals.Input, minTotal)}</Prose>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="look" title={t.s4Title}>
          <Prose>{t.s4Body}</Prose>

          <Figure
            title={t.figTitle}
            subtitle={t.figSub(sample.length)}
            caption={t.figCaption}
            source="Wu et al. 2016, eLife 5:e16965, result/Mutcount"
          >
            <RawTable rows={sample} />
          </Figure>
        </Step>,

        /* 5 --------------------------------------------------------- */
        <Step key="count" title={t.s5Title}>
          <div className="my-6 space-y-2">
            {[stops, zeroInput, lowInput, dropout].map((p, i) => (
              <div
                key={p.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
              >
                <span className="tabular text-[18px] font-semibold text-[var(--ink)]">
                  {fmt(p.count)}
                </span>
                <span className="text-[13px] font-medium text-[var(--ink)]">
                  {t.pathologyLabels[i]}
                </span>
                <span className="tabular text-[12px] text-[var(--ink-muted)]">
                  {p.pct}%
                </span>
                <span className="w-full text-[13px] leading-6 text-[var(--ink-secondary)]">
                  {t.pathologyWhy[i]}
                </span>
              </div>
            ))}
          </div>

          <Callout kind="warning" title={t.s5WarnTitle}>
            {t.s5Warn}
          </Callout>
        </Step>,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["Open it", "Stop codons", "Uneven", "Real rows", "Counted"],

    s1Title: "Open the file and count the rows",
    s1Body: (
      <p>
        The first thing you do with any dataset is open it and count the rows.
        The second thing is work out why the count is wrong.
      </p>
    ),
    s1CodeLabel: "what the file looks like",
    s1After: (
      <>
        <p>
          Six columns. One row per variant. Every value is a count of
          sequencing reads — a whole number, not a measurement with units. That
          is the entire input to this analysis.
        </p>
        <p>
          Look at row three. <code>FR_R</code> has an underscore in it.
        </p>
      </>
    ),
    s1RevealPrompt: "What is that underscore doing in a protein sequence?",
    s1RevealBody: (
      <>
        <p>
          It is a <strong>stop codon</strong>. The ribosome stops there and the
          protein ends early, so <code>FR_R</code> is not a four-residue
          variant of GB1 — it is a truncated fragment.
        </p>
        <p>
          They appear because of how the library was built. Randomising a
          position means synthesising a mixture of bases at each of its three
          DNA positions, and no mixture encodes exactly the 20 amino acids and
          nothing else. Stop codons come along for free.
        </p>
      </>
    ),

    s2Title: "Problem one: too many rows",
    s2Body: (space: number, n: number, pct: number) => (
      <>
        <p>
          With a stop allowed at each of the four positions, the real space is
          21 × 21 × 21 × 21 = {fmt(space)}, comfortably more than the row
          count. That explains the excess.
        </p>
        <p>
          {fmt(n)} rows — {pct}% of the file — contain at least one stop codon.
        </p>
      </>
    ),
    statRows: "Rows in the file",
    statStops: "Contain a stop codon",
    statCoding: "Full-length proteins",
    statMissing: "Designed but never seen",
    s2Question: "What should you do with the stop-codon rows?",
    s2Choices: [
      {
        label: "Delete them immediately. They are not design candidates.",
        grade: "ok" as const,
        outcome: (
          <>
            Half right. They must come out of the design set — but deleting
            them before looking at them throws away something valuable, which
            the next option names.
          </>
        ),
      },
      {
        label: "Keep them as a negative control, then exclude them from candidates.",
        grade: "best" as const,
        outcome: (
          <>
            Yes. A truncated GB1 <em>cannot</em> bind IgG, so whatever these
            score is what &ldquo;definitely dead&rdquo; looks like in this
            assay — measured in the same experiment, for free. Chapter 4 uses
            them to check the assay actually worked.
          </>
        ),
      },
      {
        label: "Score them alongside everything else and rank them normally.",
        grade: "bad" as const,
        outcome: (
          <>
            This puts broken proteins on your hit list. They cannot be ordered
            and made, so any that scored well by chance would waste a slot.
          </>
        ),
      },
    ],
    s2KeyTitle: "Free negative controls are rare — use them",
    s2Key: (
      <p>
        Most experiments need controls designed in. This one produced 32,587 of
        them as a side effect of the library chemistry. Chapter 4 shows that{" "}
        <strong>not one of them</strong> beats the wild type, which is how you
        learn the assay is working.
      </p>
    ),
    noteEnrich2:
      "Enrich2 records what each variant does to the protein as it counts, so nonsense variants can be separated at scoring time rather than discarded early.",
    notePandas:
      "Splitting the table rather than dropping rows. Both halves are needed: one for candidates, one as the control.",

    s3Title: "Problem two: the counts are wildly uneven",
    s3Body: (
      <>
        <p>
          The wild type <Variant seq="VDGV" /> has 92,735 input reads. The
          median variant has 161. Some have one. Some have none.
        </p>
      </>
    ),
    statFewest: "Fewest input reads",
    statMedian: "Median input reads",
    statP75: "75th percentile",
    statMost: "Most input reads",
    statMostHint: "the wild type",
    s3TrapTitle: "Why this matters more than it looks",
    s3Trap: (
      <>
        <p>
          Fitness is a ratio. A variant with 4 input reads and 8 selected reads
          has exactly the same ratio as one with 4,000 and 8,000.
        </p>
        <p>
          The two numbers are not equally believable, and{" "}
          <strong>nothing in the ratio itself tells you which is which</strong>.
          Chapter 5 is about what happens when you forget this.
        </p>
      </>
    ),
    s3Totals: (input: number, minSel: number) => (
      <>
        <p>
          <strong>And the samples are different sizes.</strong> The input
          library has {fmt(input)} reads in total; the selected samples have as
          few as {fmt(minSel)}.
        </p>
        <p>
          So a raw count cannot be compared across columns. 100 reads out of 89
          million is not the same share as 100 out of 45 million. Every count
          has to become a proportion before anything is compared — which is
          exactly what chapter 4 does.
        </p>
      </>
    ),

    s4Title: "Look at the real rows",
    s4Body: (
      <p>
        These are genuine rows from the file, chosen so that each problem is
        visible. Filter by the kind of problem.
      </p>
    ),
    figTitle: "A sample of the raw file",
    figSub: (n: number) => `${n} real rows. ✗ marks a stop codon.`,
    figCaption: (
      <>
        Every row came out of the file unchanged. Notice that the{" "}
        <strong>dropout</strong> rows have plenty of input reads and zero after
        selection — real measurements of failure. The <strong>zero input</strong>{" "}
        rows are the opposite: selected reads but no input reads, which should
        be impossible and is the signature of a sequencing or assignment error.
      </>
    ),

    s5Title: "The four problems, counted",
    pathologyLabels: [
      "Stop codon in the variant",
      "Zero reads in the input library",
      "Fewer than 10 input reads",
      "Zero reads after selection (IGG20)",
    ],
    pathologyWhy: [
      "Built with degenerate codons, which also encode stop. Truncated proteins, not design candidates.",
      "Seen after selection but never before it. Fitness would divide by zero.",
      "Too few reads to estimate a ratio. One extra read changes the answer by tens of percent.",
      "Either genuinely dead, or present but missed by sequencing. The data cannot tell you which.",
    ],
    s5WarnTitle: "None of this is an error in the data",
    s5Warn: (
      <>
        <p>
          Every one of these is the normal output of a working experiment.
          Degenerate codons make stop codons. Libraries are uneven. Sequencers
          miss things.
        </p>
        <p>
          The job is not to find the clean version of this file. There is no
          clean version. The job is to decide what to do about each problem and
          to say what you decided.
        </p>
      </>
    ),
  },

  ko: {
    labels: ["열어보기", "stop codon", "불균등", "실제 행", "집계"],

    s1Title: "파일을 열고 행을 세어봅니다",
    s1Body: (
      <p>
        어떤 데이터든 첫 번째로 할 일은 열어서 행을 세는 것입니다. 두 번째로 할
        일은 그 행 수가 왜 틀렸는지 알아내는 것입니다.
      </p>
    ),
    s1CodeLabel: "파일 생김새",
    s1After: (
      <>
        <p>
          열 여섯 개, variant 하나당 한 행. 모든 값은 sequencing read 개수입니다.
          단위가 붙은 측정값이 아니라 정수예요. 이 분석의 입력은 이게 전부입니다.
        </p>
        <p>
          세 번째 행을 보세요. <code>FR_R</code> 안에 밑줄이 있습니다.
        </p>
      </>
    ),
    s1RevealPrompt: "단백질 서열에 저 밑줄은 왜 있을까요?",
    s1RevealBody: (
      <>
        <p>
          <strong>stop codon</strong>입니다. 리보솜이 거기서 멈춰서 단백질이
          일찍 끝납니다. 그러니까 <code>FR_R</code>은 GB1의 네 자리 variant가
          아니라 잘려나간 조각입니다.
        </p>
        <p>
          library를 만든 방식 때문에 생깁니다. 한 자리를 무작위화한다는 건 그
          자리의 DNA 세 칸마다 염기를 섞어서 합성한다는 뜻인데, 어떤 조합도 amino
          acid 20개만 정확히 만들어내지 못합니다. stop codon이 덤으로 따라옵니다.
        </p>
      </>
    ),

    s2Title: "문제 1: 행이 너무 많다",
    s2Body: (space: number, n: number, pct: number) => (
      <>
        <p>
          네 자리 각각에 stop이 가능하니 실제 공간은 21 × 21 × 21 × 21 ={" "}
          {fmt(space)}이고, 행 수보다 넉넉히 큽니다. 초과분이 설명됩니다.
        </p>
        <p>
          {fmt(n)}개 행, 전체의 {pct}%에 stop codon이 최소 하나 들어 있습니다.
        </p>
      </>
    ),
    statRows: "파일의 행 수",
    statStops: "stop codon 포함",
    statCoding: "온전한 길이의 단백질",
    statMissing: "설계됐지만 안 잡힘",
    s2Question: "stop codon 행들을 어떻게 해야 할까요?",
    s2Choices: [
      {
        label: "바로 지운다. design 후보가 아니니까.",
        grade: "ok" as const,
        outcome: (
          <>
            절반만 맞습니다. design 집합에서 빼는 건 맞지만, 보지도 않고 지우면
            쓸모 있는 걸 버리게 됩니다. 다음 선택지가 그게 뭔지 말해줍니다.
          </>
        ),
      },
      {
        label: "negative control로 챙겨두고, 후보에서만 제외한다.",
        grade: "best" as const,
        outcome: (
          <>
            맞습니다. 잘린 GB1은 IgG에 <em>붙을 수가 없습니다</em>. 그러니 이들이
            받는 점수가 이 assay에서 &ldquo;확실히 죽은&rdquo; 값입니다. 같은
            실험 안에서 공짜로 측정된 거죠. 4장에서 이걸로 assay가 제대로
            작동했는지 확인합니다.
          </>
        ),
      },
      {
        label: "나머지와 똑같이 점수 매기고 정상적으로 순위를 낸다.",
        grade: "bad" as const,
        outcome: (
          <>
            망가진 단백질이 hit list에 올라갑니다. 주문해서 만들 수가 없으니,
            우연히 높은 점수를 받은 게 있으면 자리만 낭비합니다.
          </>
        ),
      },
    ],
    s2KeyTitle: "공짜 negative control은 흔하지 않습니다",
    s2Key: (
      <p>
        보통은 control을 따로 설계해 넣어야 합니다. 이 실험은 library 화학의
        부산물로 32,587개를 얻었습니다. 4장에서 <strong>그중 단 하나도</strong>{" "}
        wild type을 이기지 못한다는 걸 보게 되는데, 그게 assay가 작동한다는
        증거입니다.
      </p>
    ),
    noteEnrich2:
      "Enrich2는 세는 단계에서 각 variant가 단백질에 무슨 일을 하는지 기록해둡니다. 그래서 nonsense variant를 미리 버리지 않고 점수 계산 시점에 분리할 수 있습니다.",
    notePandas:
      "행을 버리는 게 아니라 표를 나눕니다. 양쪽 다 필요합니다. 하나는 후보용, 하나는 control용.",

    s3Title: "문제 2: read 수가 극단적으로 불균등하다",
    s3Body: (
      <>
        <p>
          wild type <Variant seq="VDGV" />은 input read가 92,735개입니다. 중앙값
          variant는 161개입니다. 1개인 것도 있고, 0개인 것도 있습니다.
        </p>
      </>
    ),
    statFewest: "가장 적은 input read",
    statMedian: "input read 중앙값",
    statP75: "75 백분위",
    statMost: "가장 많은 input read",
    statMostHint: "wild type",
    s3TrapTitle: "보이는 것보다 중요한 이유",
    s3Trap: (
      <>
        <p>
          fitness는 비율입니다. input 4개에 selected 8개인 variant는, input
          4,000개에 selected 8,000개인 variant와 비율이 정확히 같습니다.
        </p>
        <p>
          두 숫자는 똑같이 믿을 만하지 않은데,{" "}
          <strong>비율 자체에는 어느 쪽이 어느 쪽인지 적혀 있지 않습니다</strong>.
          5장이 이걸 잊으면 무슨 일이 생기는지 다룹니다.
        </p>
      </>
    ),
    s3Totals: (input: number, minSel: number) => (
      <>
        <p>
          <strong>게다가 샘플마다 크기가 다릅니다.</strong> input library는 총{" "}
          {fmt(input)} read이고, selected 샘플은 적게는 {fmt(minSel)}입니다.
        </p>
        <p>
          그래서 raw count는 열끼리 비교할 수 없습니다. 8,900만 중 100개와
          4,500만 중 100개는 같은 비중이 아닙니다. 비교하기 전에 모든 count를
          비율로 바꿔야 하고, 그게 정확히 4장에서 하는 일입니다.
        </p>
      </>
    ),

    s4Title: "실제 행을 봅니다",
    s4Body: (
      <p>
        파일에서 그대로 가져온 행들이고, 각 문제가 보이도록 골랐습니다. 문제
        종류별로 필터해보세요.
      </p>
    ),
    figTitle: "raw 파일 표본",
    figSub: (n: number) => `실제 행 ${n}개. ✗ 는 stop codon입니다.`,
    figCaption: (
      <>
        모든 행이 파일에서 그대로 나왔습니다. <strong>dropout</strong> 행들은
        input read가 넉넉한데 selection 후가 0입니다. 실패를 실제로 측정한
        값이에요. <strong>zero input</strong> 행은 반대입니다. selected read는
        있는데 input read가 없습니다. 원래 불가능한 조합이고, sequencing이나 배정
        오류의 흔적입니다.
      </>
    ),

    s5Title: "네 가지 문제, 숫자로",
    pathologyLabels: [
      "variant에 stop codon 포함",
      "input library에서 read 0개",
      "input read 10개 미만",
      "selection 후 read 0개 (IGG20)",
    ],
    pathologyWhy: [
      "degenerate codon으로 만들다 보니 stop도 같이 들어갔습니다. 잘린 단백질이고 design 후보가 아닙니다.",
      "selection 후에는 보이는데 전에는 없었습니다. fitness가 0으로 나누게 됩니다.",
      "비율을 추정하기에 read가 너무 적습니다. read 하나 차이로 답이 수십 퍼센트 움직입니다.",
      "진짜 죽었거나, 있었는데 sequencing이 놓쳤거나. 데이터는 둘 중 뭔지 말해주지 않습니다.",
    ],
    s5WarnTitle: "이 중 어느 것도 데이터의 오류가 아닙니다",
    s5Warn: (
      <>
        <p>
          전부 정상적으로 작동한 실험의 평범한 결과물입니다. degenerate codon은
          stop codon을 만듭니다. library는 불균등합니다. sequencer는 놓칩니다.
        </p>
        <p>
          할 일은 이 파일의 깨끗한 버전을 찾는 게 아닙니다. 그런 건 없습니다. 할
          일은 각 문제를 어떻게 할지 정하고, 무엇을 정했는지 적어두는 것입니다.
        </p>
      </>
    ),
  },
};
