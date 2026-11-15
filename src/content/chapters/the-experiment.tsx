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
import { DEPTH_RAMP } from "@/lib/palette";
import { Steps, Step } from "@/components/learn/Steps";
import { Quiz, Reveal } from "@/components/learn/Quiz";
import { ToolCode } from "@/components/learn/ToolCode";
import { StructureSwitch, FourSites } from "@/components/viz/StructureFigure";
import { SelectionFlow } from "@/components/viz/SelectionFlow";
import { getRawProfile, getMeta, getStructures, fmt } from "@/lib/data";
import type { ChapterProps } from "@/content/registry";

export function TheExperiment({ lang, takeaway }: ChapterProps) {
  const profile = getRawProfile();
  const meta = getMeta();
  const struct = getStructures();
  const wt = profile.wildType;
  const t = COPY[lang];

  // The claim in this chapter is that the four randomised positions are
  // neighbours in the fold. V39 and V54 are the furthest apart in sequence,
  // so that pair is the one worth quoting. Measured by the pipeline from
  // 1PGA, not asserted here.
  const far = struct.gb1.sitePairs?.find((x) => x.a === 39 && x.b === 54);
  const sites = (struct.gb1.sites ?? []).map((x) => ({
    resi: x.resi,
    aa: x.aa,
  }));

  return (
    <Steps
      lang={lang}
      takeaway={takeaway}
      labels={t.labels}
      steps={[
        /* 1 --------------------------------------------------------- */
        <Step key="protein" title={t.s1Title}>
          <Prose>{t.s1Body}</Prose>

          <Figure
            title={t.figFoldTitle}
            subtitle={t.figFoldSub}
            caption={t.figFoldCaption}
            source={`${struct.gb1.pdb} · ${struct.complex.pdb} · RCSB PDB`}
          >
            <StructureSwitch
              alone={struct.gb1}
              bound={struct.complex}
              labels={t.structLabels}
            />
          </Figure>

          <Callout kind="note" title={t.s1NoteTitle}>
            {t.s1Note}
          </Callout>
        </Step>,

        /* 2 --------------------------------------------------------- */
        <Step key="sites" title={t.s2Title}>
          <Prose>{t.s2Body}</Prose>

          <Figure
            title={t.figSitesTitle}
            subtitle={t.figSitesSub}
            caption={t.figSitesCaption(far?.ca ?? 0, far?.apart ?? 0)}
            source={`${struct.gb1.pdb} · ${struct.gb1.method} ${struct.gb1.resolution} Å`}
          >
            <FourSites model={struct.gb1} sites={sites} labels={t.siteLabels} />
          </Figure>

          <div className="my-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 text-center">
            <div className="font-mono text-[13px] tracking-widest text-[var(--ink-muted)]">
              20 × 20 × 20 × 20
            </div>
            <div className="tabular mt-2 text-[36px] leading-none font-semibold text-[var(--ink)]">
              {fmt(profile.designedSpace)}
            </div>
            <div className="mt-2 text-[12px] text-[var(--ink-muted)]">
              {t.s2Designed}
            </div>
          </div>

          <Callout kind="note" title={t.s2NoteTitle}>
            {t.s2Note}
          </Callout>
        </Step>,

        /* 3 --------------------------------------------------------- */
        <Step key="assay" title={t.s3Title}>
          <Prose>{t.s3Intro}</Prose>

          <Figure title={t.figFlowTitle} subtitle={t.figFlowSub}>
            <SelectionFlow
              stations={t.flowStations}
              caption={t.flowCaptions}
              label={t.flowAria}
              readout={t.flowReadout}
            />
          </Figure>

          <Callout kind="key" title={t.s3KeyTitle}>
            {t.s3Key}
          </Callout>
        </Step>,

        /* 4 --------------------------------------------------------- */
        <Step key="columns" title={t.s4Title}>
          <Quiz
            lang={lang}
            scenario={t.s4Scenario}
            question={t.s4Question}
            choices={t.s4Choices}
          >
            <Prose>{t.s4After}</Prose>

            <Figure title={t.figColsTitle} subtitle={t.figColsSub}>
              <DataTable
                caption={t.figColsTitle}
                rows={[
                  { col: "mut", what: t.colMut, wt: String(wt.mut) },
                  { col: "HD", what: t.colHd, wt: "0" },
                  { col: "Input", what: t.colInput, wt: fmt(Number(wt.Input)) },
                  { col: "IGG10", what: t.colI10, wt: fmt(Number(wt.IGG10)) },
                  { col: "IGG20", what: t.colI20, wt: fmt(Number(wt.IGG20)) },
                  { col: "IGG90", what: t.colI90, wt: fmt(Number(wt.IGG90)) },
                ]}
                columns={[
                  {
                    key: "col",
                    header: t.hCol,
                    width: "22%",
                    render: (r) => (
                      <span className="font-mono font-medium text-[var(--ink)]">
                        {r.col}
                      </span>
                    ),
                  },
                  { key: "what", header: t.hMeaning, render: (r) => r.what },
                  {
                    key: "wt",
                    header: t.hWt,
                    align: "right",
                    width: "18%",
                    render: (r) => r.wt,
                  },
                ]}
              />
            </Figure>

            <ToolCode
              lang={lang}
              tabs={[
                {
                  tool: "shell",
                  lang: "bash",
                  note: t.noteShell,
                  code: `gzip -dc data/raw/gb1_counts.tsv.gz | head -5
# mut   HD  Input   IGG10   IGG20   IGG90
# VDGV  0   92735   247431  338346  398449
# SSGE  3   1365    35      44      129
# FR_R  4   10      0       0       0`,
                },
                {
                  tool: "pandas",
                  lang: "python",
                  note: t.notePandas,
                  code: `df = pd.read_csv("gb1_counts.tsv.gz", sep="\\t")
wt = df.loc[df["mut"] == "VDGV"].iloc[0]

print(df.shape)      # (191157, 6)
print(wt["Input"])   # 92735`,
                },
              ]}
            />
          </Quiz>
        </Step>,

        /* 5 --------------------------------------------------------- */
        <Step key="coverage" title={t.s5Title}>
          <Prose>{t.s5Body}</Prose>

          <Figure
            title={t.figHdTitle}
            subtitle={t.figHdSub}
            caption={t.figHdCaption}
          >
            <BarChart
              labelWidth={116}
              unit="%"
              max={100}
              bars={profile.hammingDistribution
                .filter((h) => h.hd > 0)
                .map((h, i) => ({
                  label: t.mutationLabel(h.hd),
                  value: Number(((100 * h.observed) / h.possible).toFixed(1)),
                  valueLabel: `${((100 * h.observed) / h.possible).toFixed(1)}%`,
                  color: DEPTH_RAMP[i + 1],
                  detail: [
                    { label: t.observed, value: fmt(h.observed) },
                    { label: t.possible, value: fmt(h.possible) },
                  ],
                }))}
            />
          </Figure>

          <StatGrid>
            <Stat
              value={fmt(profile.designedSpace)}
              label={t.statDesigned}
              hint="20^4"
            />
            <Stat
              value={fmt(profile.rowsInFile)}
              label={t.statRows}
              hint={t.statRowsHint}
            />
            <Stat
              value={fmt(profile.neverObserved)}
              label={t.statMissing}
              tone="warn"
              hint={`${profile.neverObservedPct}%`}
            />
            <Stat
              value={`${profile.depthImbalance.ratio}x`}
              label={t.statDepth}
              hint={t.statDepthHint}
            />
          </StatGrid>

          <Reveal lang={lang} prompt={t.s5RevealPrompt}>
            <Prose>{t.s5RevealBody}</Prose>
          </Reveal>

          <Prose>
            <p className="text-[13px] text-[var(--ink-muted)]">
              {meta.source.paper}
            </p>
          </Prose>
        </Step>,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ copy */

const COPY = {
  en: {
    labels: ["The protein", "Four sites", "The assay", "The file", "Coverage"],


    figFoldTitle: "GB1, and what it binds",
    figFoldSub: "GB1 itself, and its sibling domain C2 caught holding an antibody",
    figFoldCaption: (
      <>
        Binding is a physical contact, and that contact is the only thing this
        experiment measures. Every <em>number</em> on this site comes from B1.
      </>
    ),
    structLabels: {
      alone: "GB1",
      bound: "C2, bound to IgG",
      noteAlone:
        "GB1 (PDB 1PGA). Four beta strands packed against one helix.",
      noteBound:
        "Not GB1: this is C2 (PDB 1FCC), the sibling domain next door in the same protein. There is no B1 structure bound to an antibody, and C2 differs at 3 of 56 positions, none of them near the four sites.",
      hint: "Drag to turn it.",
      ariaAlone:
        "A slowly rotating backbone of the GB1 fold: a four-stranded beta sheet packed against a single alpha helix.",
      ariaBound:
        "A slowly rotating backbone of a protein G domain, in blue, docked against the two grey chains of an antibody Fc region.",
      legendDomain: "C2 domain",
      legendIgg: "IgG Fc",
    },

    figSitesTitle: "The four randomised positions",
    figSitesSub: "Marked in the fold, and again along the sequence",
    figSitesCaption: (ca: number, apart: number) => (
      <>
        V39, D40 and G41 are consecutive. V54 is <strong>{apart} residues
        away</strong> along the chain and still only <strong>{ca} Å</strong>{" "}
        from V39 once the protein folds. That is the reason these four were
        picked: side chains this close are the ones that can interact, so if
        combined effects exist anywhere, they exist here.
      </>
    ),
    siteLabels: {
      hint: "Drag to turn it. Hover a marker to find it on the sequence.",
      aria: "The GB1 backbone with the four randomised positions marked: V39, D40 and G41 in a loop, and V54 in the last beta strand, all packed together on one face.",
      ariaRuler:
        "The 56-residue sequence drawn as a bar, with helix and strand regions raised. V39, D40 and G41 are adjacent; V54 sits thirteen residues later.",
      helix: "helix",
      strand: "strand",
      loop: "loop",
    },

    figFlowTitle: "One tube, 160,000 proteins",
    figFlowSub: "Nothing here is measured one variant at a time",
    flowStations: ["Build", "Count", "Select", "Count again"] as [string, string, string, string],
    flowCaptions: [
      "DNA is synthesised with all four positions randomised. Every variant sits in the same tube, and not in equal amounts — that unevenness matters in chapter 3.",
      "Sequencing counts each variant before anything is selected. This is the Input column: the starting line.",
      "The whole pool is held against IgG. Binders stay; the rest are washed away. No variant is ever tested on its own.",
      "Sequencing counts what is left. Binders now take a far bigger share than at the start, and that shift is the measurement. Three IgG concentrations were used, so there are three selected columns.",
    ] as [string, string, string, string],
    flowAria:
      "An animation of the selection: a mixed population of variants is counted, held against IgG so that non-binders wash away, and counted again, leaving binders at a much higher share.",
    flowReadout: {
      before: "before selection",
      after: "after selection",
      binds: "held by IgG",
      washed: "washed away",
    },

    s1Title: "GB1, and what counts as “better”",
    s1Body: (
      <>
        <p>
          Before touching a number, know what the numbers are. Analysing an
          assay you do not understand is guesswork with extra steps.
        </p>
        <p>
          <strong>GB1</strong> is the B1 domain of protein G, from{" "}
          <em>Streptococcus</em>. It is 56 amino acids long, it folds on its
          own, and it binds the constant region of antibodies (IgG). Small
          enough to test exhaustively, stable enough to survive being mutated —
          which is why it is one of the most studied proteins in biophysics.
        </p>
      </>
    ),
    s1NoteTitle: "“Better” means one specific thing here",
    s1Note: (
      <p>
        Binding to IgG is the function being measured. When this walkthrough
        says a variant is better, it means it bound IgG more tightly than the
        original protein. It does not mean the protein is more stable, easier
        to express, or better in any other sense. Those were not measured.
      </p>
    ),

    s2Title: "Four positions, not fifty-six",
    s2Body: (
      <>
        <p>
          The authors did not mutate the whole domain. They picked{" "}
          <strong>four</strong>: V39, D40, G41 and V54. These four sit next to
          each other in the folded structure, even though V54 is far away in
          the sequence.
        </p>
        <p>
          That choice is deliberate. Side chains that touch each other are the
          ones most likely to interact, so this is where combined effects
          should show up — and chapter 8 shows that they do, dramatically.
        </p>
      </>
    ),
    s2Designed: "designed variants",
    s2NoteTitle: "How a variant is written",
    s2Note: (
      <>
        <p>
          Every variant is four letters, one per randomised position, in the
          order 39, 40, 41, 54. The original protein has valine, aspartate,
          glycine and valine there, so the wild type is <Variant seq="VDGV" />.
        </p>
        <p>
          <Variant seq="WDGV" /> is V39W: one change. <Variant seq="WWLG" />{" "}
          differs at all four.
        </p>
      </>
    ),

    s3Title: "How 160,000 proteins get tested at once",
    s3Intro: (
      <p>
        This is a <strong>selection</strong>, not 160,000 separate experiments.
        Everything is pooled and sequencing does the counting.
      </p>
    ),
    s3KeyTitle: "The core idea, and it is the whole thing",
    s3Key: (
      <p>
        A variant that binds well goes <em>up</em> in frequency from input to
        selected. A variant that binds badly goes <em>down</em>. Every number
        in this walkthrough comes from comparing two read counts for the same
        variant.
      </p>
    ),

    s4Title: "What the file actually contains",
    s4Scenario:
      "You open the raw file for the first time. It has six columns and 191,157 rows.",
    s4Question:
      "The library was designed with 160,000 variants. Why does the file have 191,157 rows?",
    s4Choices: [
      {
        label: "Each variant was sequenced multiple times, so some appear more than once.",
        grade: "bad" as const,
        outcome: (
          <>
            No — repeated sequencing is what produces the read <em>counts</em>{" "}
            inside each row. One row is one variant. If rows repeated, you
            could not read the table at all.
          </>
        ),
      },
      {
        label: "Some rows are not full-length proteins.",
        grade: "best" as const,
        outcome: (
          <>
            Correct. The randomisation also produced{" "}
            <strong>stop codons</strong>, written as <code>_</code>. With a
            stop possible at each of four positions the real space is 21⁴ =
            194,481, comfortably more than 191,157. Chapter 2 opens these rows.
          </>
        ),
      },
      {
        label: "The file includes variants from a different experiment.",
        grade: "bad" as const,
        outcome: (
          <>
            No. Every row is from this one library. Mixing experiments into one
            count table would make the normalisation in chapter 4 meaningless.
          </>
        ),
      },
    ],
    s4After: (
      <p>
        So the row count is <em>higher</em> than the design. Chapter 2 finds
        that it is also, at the same time, lower than it should be.
      </p>
    ),
    figColsTitle: "Columns in the raw file",
    figColsSub: "What each column holds, and the wild-type values",
    colMut: "The four-letter variant; _ marks a stop codon",
    colHd: "Hamming distance: how many of the 4 sites differ from VDGV",
    colInput: "Reads before selection",
    colI10: "Reads after selection, low IgG (most stringent)",
    colI20: "Reads after selection, medium IgG",
    colI90: "Reads after selection, high IgG (least stringent)",
    hCol: "Column",
    hMeaning: "Meaning",
    hWt: "Wild type",
    noteShell:
      "The first thing to do with any dataset: look at it before loading it into anything.",
    notePandas:
      "The wild type is a row like any other. Every fitness value in chapter 4 is normalised against it.",

    s5Title: "How much of the library was actually seen",
    s5Body: (
      <>
        <p>
          The library was designed to contain every variant. Sequencing found
          most of them — but not all, and not evenly.
        </p>
      </>
    ),
    figHdTitle: "Variants observed, by number of mutations",
    figHdSub: "Against the number that exist at each Hamming distance from the wild type",
    figHdCaption: (
      <>
        Coverage is close to complete at every distance. The gap is small in
        percentage terms but it is not zero, and the missing variants are not
        missing at random.
      </>
    ),
    mutationLabel: (hd: number) => `${hd} mutation${hd > 1 ? "s" : ""}`,
    observed: "observed",
    possible: "possible",
    statDesigned: "Variants designed",
    statRows: "Rows in the file",
    statRowsHint: "more than designed",
    statMissing: "Never sequenced",
    statDepth: "Deepest vs shallowest sample",
    statDepthHint: "read totals differ",
    s5RevealPrompt:
      "Why would a variant be missing from a library that was designed to contain it?",
    s5RevealBody: (
      <>
        <p>
          Three ordinary reasons, none of them an error. The synthesis may
          never have made that particular combination. It may have been made
          but lost in the bottleneck when the library was transformed into
          cells. Or it was present at such low abundance that sequencing simply
          never sampled it.
        </p>
        <p>
          The data cannot tell you which. That matters for chapter 3: a missing
          variant is not a variant that scored zero, and treating it as one
          would record a protein as dead on the basis of no measurement at all.
        </p>
      </>
    ),
  },

  ko: {
    labels: ["단백질", "네 자리", "assay", "파일", "coverage"],


    figFoldTitle: "GB1, 그리고 무엇에 붙는지",
    figFoldSub: "GB1 본체, 그리고 형제 domain C2가 항체를 붙잡고 있는 구조",
    figFoldCaption: (
      <>
        결합은 물리적인 접촉이고, 이 실험이 재는 건 그 접촉 하나뿐입니다. 이
        사이트의 모든 <em>숫자</em>는 B1에서 나옵니다.
      </>
    ),
    structLabels: {
      alone: "GB1",
      bound: "C2가 IgG에 붙은 모습",
      noteAlone:
        "GB1 (PDB 1PGA). beta strand 네 개가 helix 하나에 붙어 있습니다.",
      noteBound:
        "GB1이 아닙니다. 같은 단백질 안 옆자리 형제 domain인 C2 (PDB 1FCC)입니다. B1이 항체에 붙은 구조가 없어서 이걸 씁니다. C2는 56자리 중 3자리만 다르고, 그 셋은 네 자리 근처에 없습니다.",
      hint: "끌어서 돌려보세요.",
      ariaAlone:
        "천천히 회전하는 GB1 backbone. beta strand 네 가닥으로 된 sheet가 alpha helix 하나에 붙어 있습니다.",
      ariaBound:
        "천천히 회전하는 구조. 파란색 protein G domain이 회색 항체 Fc region 두 가닥에 붙어 있습니다.",
      legendDomain: "C2 domain",
      legendIgg: "IgG Fc",
    },

    figSitesTitle: "무작위화된 네 자리",
    figSitesSub: "접힌 구조에서 한 번, 서열에서 다시 한 번",
    figSitesCaption: (ca: number, apart: number) => (
      <>
        V39, D40, G41은 서로 붙어 있습니다. V54는 사슬을 따라가면{" "}
        <strong>{apart}칸</strong> 떨어져 있는데, 단백질이 접히고 나면 V39에서{" "}
        <strong>{ca} Å</strong>밖에 안 됩니다. 이 넷을 고른 이유가 바로
        이것입니다. 이만큼 가까운 side chain이라야 서로 간섭할 수 있으니,
        합쳐진 효과가 어딘가에 있다면 여기에 있습니다.
      </>
    ),
    siteLabels: {
      hint: "끌어서 돌려보세요. 표시된 자리에 마우스를 올리면 서열에서 어디인지 보입니다.",
      aria: "GB1 backbone에 무작위화된 네 자리가 표시된 모습. V39, D40, G41은 loop에 있고 V54는 마지막 beta strand에 있으며, 넷이 한쪽 면에 모여 있습니다.",
      ariaRuler:
        "56개 residue 서열을 막대로 그린 그림. helix와 strand 구간이 두껍게 표시돼 있습니다. V39, D40, G41은 붙어 있고 V54는 13칸 뒤에 있습니다.",
      helix: "helix",
      strand: "strand",
      loop: "loop",
    },

    figFlowTitle: "tube 하나, 단백질 16만 개",
    figFlowSub: "여기서는 어떤 것도 variant 하나씩 재지 않습니다",
    flowStations: ["만들기", "세기", "선별", "다시 세기"] as [string, string, string, string],
    flowCaptions: [
      "네 자리를 전부 무작위화한 DNA를 합성합니다. 모든 variant가 같은 tube 안에 있고, 양은 제각각입니다. 이 불균등함이 3장에서 중요해집니다.",
      "아직 아무것도 선별하기 전에 각 variant를 셉니다. 이게 Input 열, 출발선입니다.",
      "pool 전체를 IgG에 걸어둡니다. 붙는 것은 남고 나머지는 씻겨 나갑니다. 어떤 variant도 따로 시험하지 않습니다.",
      "남은 것을 다시 셉니다. 붙는 variant의 몫이 출발선보다 훨씬 커졌습니다. 이 변화가 곧 측정값입니다. IgG 농도 세 가지를 썼기 때문에 selected 열이 세 개 나옵니다.",
    ] as [string, string, string, string],
    flowAria:
      "selection 과정 애니메이션. 섞여 있는 variant 집단을 세고, IgG에 걸어 붙지 않는 것을 씻어내고, 다시 셉니다. 붙는 variant의 비율이 훨씬 높아집니다.",
    flowReadout: {
      before: "selection 전",
      after: "selection 후",
      binds: "IgG가 붙잡음",
      washed: "씻겨 나감",
    },

    s1Title: "GB1, 그리고 여기서 “좋다”의 뜻",
    s1Body: (
      <>
        <p>
          숫자를 만지기 전에 그 숫자가 뭔지부터 알아야 합니다. 이해하지 못한
          assay를 분석하는 건 단계만 늘어난 찍기입니다.
        </p>
        <p>
          <strong>GB1</strong>은 <em>Streptococcus</em>의 protein G에서 온 B1
          domain입니다. amino acid 56개짜리로 작고, 혼자서도 접히고, 항체(IgG)의
          constant region에 달라붙습니다. 전수 조사가 가능할 만큼 작고 mutation을
          견딜 만큼 안정적이라, 생물물리학에서 가장 많이 연구된 단백질 중
          하나입니다.
        </p>
      </>
    ),
    s1NoteTitle: "여기서 “좋다”는 딱 하나를 뜻합니다",
    s1Note: (
      <p>
        측정하는 기능은 IgG 결합입니다. 이 실습에서 어떤 variant가 좋다고 하면,
        원래 단백질보다 IgG에 더 세게 붙었다는 뜻입니다. 더 안정적이라거나,
        발현이 잘 된다거나, 다른 의미로 더 낫다는 뜻이 아닙니다. 그건 측정하지
        않았습니다.
      </p>
    ),

    s2Title: "56자리가 아니라 네 자리",
    s2Body: (
      <>
        <p>
          저자들은 domain 전체를 건드리지 않았습니다. <strong>네 군데</strong>만
          골랐습니다. V39, D40, G41, V54. 이 넷은 서열상으로는 V54가 멀리 있지만,
          접힌 구조에서는 서로 옆에 붙어 있습니다.
        </p>
        <p>
          의도적인 선택입니다. 서로 닿는 side chain이 상호작용할 가능성이 가장
          높으니, 합쳐졌을 때의 효과가 나타난다면 여기서 나타납니다. 8장에서
          실제로, 그것도 극적으로 나타납니다.
        </p>
      </>
    ),
    s2Designed: "설계된 variant",
    s2NoteTitle: "variant 표기법",
    s2Note: (
      <>
        <p>
          모든 variant는 네 글자입니다. 무작위화된 자리마다 한 글자씩, 39, 40,
          41, 54 순서입니다. 원래 단백질은 그 자리에 valine, aspartate, glycine,
          valine이 있어서 wild type은 <Variant seq="VDGV" />입니다.
        </p>
        <p>
          <Variant seq="WDGV" />는 V39W, 즉 한 군데만 바뀐 것입니다.{" "}
          <Variant seq="WWLG" />는 네 군데가 전부 다릅니다.
        </p>
      </>
    ),

    s3Title: "16만 개 단백질을 한 번에 시험하는 법",
    s3Intro: (
      <p>
        이건 <strong>selection</strong>이지 16만 번의 개별 실험이 아닙니다. 전부
        섞어놓고 sequencing이 세어줍니다.
      </p>
    ),
    s3KeyTitle: "핵심은 이게 전부입니다",
    s3Key: (
      <p>
        잘 붙는 variant는 input에서 selected로 가면서 비율이 <em>올라갑니다</em>.
        못 붙는 variant는 <em>내려갑니다</em>. 이 실습에 나오는 모든 숫자는 같은
        variant의 read count 두 개를 비교해서 나옵니다.
      </p>
    ),

    s4Title: "파일에 실제로 들어 있는 것",
    s4Scenario:
      "raw 파일을 처음 열었습니다. 열이 여섯 개, 행이 191,157개 있습니다.",
    s4Question:
      "library는 160,000개 variant로 설계됐습니다. 그런데 왜 파일에 행이 191,157개 있을까요?",
    s4Choices: [
      {
        label: "variant마다 여러 번 sequencing해서 중복으로 들어간 행이 있다.",
        grade: "bad" as const,
        outcome: (
          <>
            아닙니다. 여러 번 읽은 결과가 각 행 안의 read <em>count</em>입니다.
            한 행이 한 variant입니다. 행이 중복됐다면 표 자체를 읽을 수 없습니다.
          </>
        ),
      },
      {
        label: "온전한 길이의 단백질이 아닌 행이 섞여 있다.",
        grade: "best" as const,
        outcome: (
          <>
            맞습니다. 무작위화 과정에서 <strong>stop codon</strong>도 같이
            생겼고, <code>_</code>로 표기됩니다. 네 자리 각각에 stop이 가능하니
            실제 공간은 21⁴ = 194,481이고, 191,157보다 넉넉히 큽니다. 2장에서 이
            행들을 직접 엽니다.
          </>
        ),
      },
      {
        label: "다른 실험의 variant가 같이 들어 있다.",
        grade: "bad" as const,
        outcome: (
          <>
            아닙니다. 모든 행이 이 library 하나에서 나왔습니다. 서로 다른 실험을
            한 count 표에 섞으면 4장의 normalization이 의미를 잃습니다.
          </>
        ),
      },
    ],
    s4After: (
      <p>
        그래서 행 수가 설계보다 <em>많습니다</em>. 2장에서는 동시에 있어야 할
        것보다 <em>적기도</em> 하다는 걸 보게 됩니다.
      </p>
    ),
    figColsTitle: "raw 파일의 열",
    figColsSub: "각 열의 의미와 wild type 값",
    colMut: "네 글자 variant. _ 는 stop codon",
    colHd: "Hamming distance. 네 자리 중 VDGV와 다른 자리 수",
    colInput: "selection 전 read 수",
    colI10: "selection 후 read 수, 저농도 IgG (가장 엄격)",
    colI20: "selection 후 read 수, 중간 농도 IgG",
    colI90: "selection 후 read 수, 고농도 IgG (가장 느슨)",
    hCol: "열",
    hMeaning: "의미",
    hWt: "wild type",
    noteShell:
      "어떤 데이터든 첫 번째로 할 일. 뭔가에 로드하기 전에 눈으로 봅니다.",
    notePandas:
      "wild type도 그냥 한 행입니다. 4장의 모든 fitness 값이 이 행을 기준으로 정규화됩니다.",

    s5Title: "library를 실제로 얼마나 봤나",
    s5Body: (
      <>
        <p>
          library는 모든 variant를 담도록 설계됐습니다. sequencing은 그중
          대부분을 찾았습니다. 전부는 아니고, 고르지도 않게요.
        </p>
      </>
    ),
    figHdTitle: "mutation 개수별 관측된 variant",
    figHdSub: "wild type으로부터 각 Hamming distance에 존재하는 수 대비",
    figHdCaption: (
      <>
        어느 거리에서든 coverage는 거의 완전합니다. 퍼센트로 보면 격차가 작지만
        0은 아니고, 빠진 variant들이 무작위로 빠진 것도 아닙니다.
      </>
    ),
    mutationLabel: (hd: number) => `mutation ${hd}개`,
    observed: "관측됨",
    possible: "가능한 수",
    statDesigned: "설계된 variant",
    statRows: "파일의 행 수",
    statRowsHint: "설계보다 많음",
    statMissing: "한 번도 안 잡힘",
    statDepth: "가장 깊은 샘플 대 얕은 샘플",
    statDepthHint: "총 read 수가 다름",
    s5RevealPrompt:
      "모든 variant를 담도록 설계한 library인데, 왜 어떤 variant는 한 번도 안 잡혔을까요?",
    s5RevealBody: (
      <>
        <p>
          평범한 이유 세 가지이고, 어느 것도 오류가 아닙니다. 합성 과정에서 그
          조합이 아예 안 만들어졌을 수 있습니다. 만들어졌지만 library를 세포에
          넣는 병목 구간에서 사라졌을 수 있습니다. 아니면 양이 너무 적어서
          sequencing이 한 번도 집어내지 못했을 수 있습니다.
        </p>
        <p>
          데이터는 셋 중 뭔지 알려주지 않습니다. 이게 3장에서 중요해집니다. 빠진
          variant는 0점을 받은 variant가 아닙니다. 그렇게 취급하면 측정 자체가
          없는 단백질을 죽은 것으로 기록하게 됩니다.
        </p>
      </>
    ),
  },
};
