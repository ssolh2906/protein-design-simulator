/**
 * Language support.
 *
 * Two locales, English at the site root and Korean under /ko/. There is no
 * automatic language detection: this is a static export, so there is no
 * server and no proxy/middleware to read Accept-Language. The reader picks a
 * language from the toggle in the navigation.
 *
 * Technical terms are deliberately left in English in the Korean copy
 * (fitness, read depth, stop codon, epistasis ...). That is how Korean
 * bioinformatics material is normally written, and it keeps the vocabulary
 * transferable to papers and tools, which are all in English.
 */

export const LOCALES = ["en", "ko"] as const;
export type Lang = (typeof LOCALES)[number];

export const DEFAULT_LANG: Lang = "en";

/** URL prefix for a locale. English lives at the root. */
export const prefix = (lang: Lang) => (lang === "en" ? "" : `/${lang}`);

/** Build an in-site href for a locale. */
export const href = (lang: Lang, path: string) => `${prefix(lang)}${path}`;

export const LANG_NAME: Record<Lang, string> = {
  en: "English",
  ko: "한국어",
};

/* ------------------------------------------------------------------ UI */

type UIStrings = {
  siteTitle: string;
  siteSubtitle: string;
  chapterLabel: (n: number) => string;
  minutes: (n: number) => string;
  previous: string;
  next: string;
  finally_: string;
  runPipeline: string;
  takeaway: string;
  navData: string;
  navGlossary: string;
  toggleChapters: string;
  chaptersAria: string;
  languageAria: string;
  /** Shown on a Korean chapter whose prose is not translated yet. */
  notTranslated: string;
  notTranslatedBody: string;
};

export const UI: Record<Lang, UIStrings> = {
  en: {
    siteTitle: "The GB1 pipeline",
    siteSubtitle: "A protein design walkthrough on real data",
    chapterLabel: (n) => `Chapter ${n}`,
    minutes: (n) => `${n} min`,
    previous: "Previous",
    next: "Next",
    finally_: "Finally",
    runPipeline: "Run the pipeline yourself",
    takeaway: "Take this with you",
    navData: "The data & how to rerun it",
    navGlossary: "Glossary",
    toggleChapters: "Toggle chapter list",
    chaptersAria: "Chapters",
    languageAria: "Language",
    notTranslated: "Not translated yet",
    notTranslatedBody:
      "This chapter has not been translated into Korean yet, so the English text is shown below. Every number and chart is identical in both languages.",
  },
  ko: {
    siteTitle: "The GB1 pipeline",
    siteSubtitle: "실제 데이터로 하는 protein design 실습",
    chapterLabel: (n) => `${n}장`,
    minutes: (n) => `${n}분`,
    previous: "이전",
    next: "다음",
    finally_: "마지막으로",
    runPipeline: "파이프라인 직접 돌려보기",
    takeaway: "기억할 것",
    navData: "데이터와 재실행 방법",
    navGlossary: "용어집",
    toggleChapters: "챕터 목록 열기",
    chaptersAria: "챕터",
    languageAria: "언어",
    notTranslated: "아직 번역 전",
    notTranslatedBody:
      "이 챕터는 아직 한국어로 옮기지 않아서 아래는 영어 원문입니다. 숫자와 차트는 두 언어가 완전히 같습니다.",
  },
};

/* ------------------------------------------------------- chapter copy */

export type ChapterCopy = {
  title: string;
  summary: string;
  takeaway: string;
};

export const CHAPTER_COPY: Record<Lang, Record<string, ChapterCopy>> = {
  en: {
    "the-experiment": {
      title: "The experiment",
      summary:
        "What GB1 is, what was measured, and why four positions give 160,000 variants.",
      takeaway:
        "You cannot analyse a screen you do not understand. Read the assay first.",
    },
    "raw-counts": {
      title: "The raw counts",
      summary:
        "Open the real file. Count the rows. Discover the row count is wrong in four different ways.",
      takeaway:
        "Raw sequencing output is a table of read counts, not a table of answers.",
    },
    "quality-control": {
      title: "Quality control",
      summary:
        "Stop codons, zero-input rows and the noise floor. Which filters are forced and which are a judgement call.",
      takeaway:
        "Every filter trades coverage for confidence. Know which one you are paying.",
    },
    fitness: {
      title: "Computing fitness",
      summary:
        "Turn two read counts into one enrichment ratio, normalised to the wild type.",
      takeaway:
        "Fitness is a ratio of ratios. Zero before selection and zero after selection mean opposite things.",
    },
    reproducibility: {
      title: "Does it reproduce?",
      summary:
        "The correlation looks fine. Split it by read depth and the bottom falls out.",
      takeaway:
        "An aggregate correlation hides where your data is worthless. Always stratify by depth.",
    },
    "assay-conditions": {
      title: "The assay is part of the answer",
      summary:
        "The same variants, measured against three IgG concentrations, give three different numbers.",
      takeaway:
        "Fitness is a property of the protein and the assay together. Quote the condition.",
    },
    landscape: {
      title: "Reading the landscape",
      summary:
        "Single-mutant heatmaps, the distribution of effects, and how rare an improvement is.",
      takeaway:
        "Most of the designed space is dead. Improvement is the exception, not the goal state.",
    },
    epistasis: {
      title: "Epistasis",
      summary:
        "Two good mutations are not always a better one. Why a greedy search gets stuck.",
      takeaway:
        "Mutations interact. Additive models mislead exactly where the interesting variants are.",
    },
    "picking-hits": {
      title: "Picking what to order",
      summary:
        "Turn a cleaned landscape into a shortlist you would spend real money on.",
      takeaway:
        "A hit list is a decision under uncertainty, not a sorted column.",
    },
  },
  ko: {
    "the-experiment": {
      title: "실험 이해하기",
      summary:
        "GB1이 무엇이고, 무엇을 측정했고, 왜 네 자리가 160,000개 variant가 되는지.",
      takeaway:
        "이해하지 못한 screen은 분석할 수 없습니다. assay를 먼저 읽으세요.",
    },
    "raw-counts": {
      title: "raw count 열어보기",
      summary:
        "실제 파일을 연다. 행을 센다. 그 행 수가 네 가지 방식으로 틀렸다는 걸 발견한다.",
      takeaway:
        "raw sequencing 결과는 답이 적힌 표가 아니라 read count가 적힌 표입니다.",
    },
    "quality-control": {
      title: "Quality control",
      summary:
        "stop codon, input read가 0인 행, 그리고 noise floor. 어떤 filter가 강제되고 어떤 것이 판단인지.",
      takeaway:
        "모든 filter는 coverage를 주고 신뢰도를 삽니다. 지금 무엇을 지불하는지 알아야 합니다.",
    },
    fitness: {
      title: "fitness 계산하기",
      summary:
        "read count 두 개를 wild type 기준 enrichment ratio 하나로 바꾼다.",
      takeaway:
        "fitness는 비율의 비율입니다. selection 전의 0과 후의 0은 정반대를 뜻합니다.",
    },
    reproducibility: {
      title: "재현이 되는가?",
      summary:
        "correlation은 괜찮아 보인다. read depth로 쪼개면 바닥이 빠진다.",
      takeaway:
        "전체 correlation은 데이터가 쓸모없는 구간을 가립니다. 항상 depth로 나눠서 보세요.",
    },
    "assay-conditions": {
      title: "assay도 답의 일부다",
      summary:
        "같은 variant를 IgG 농도 세 가지에서 측정하면 서로 다른 숫자 세 개가 나온다.",
      takeaway:
        "fitness는 protein과 assay가 함께 만드는 성질입니다. 조건을 반드시 같이 적으세요.",
    },
    landscape: {
      title: "landscape 읽기",
      summary:
        "single mutant heatmap, 효과의 분포, 그리고 개선이 얼마나 드문 일인지.",
      takeaway:
        "설계 공간 대부분은 죽어 있습니다. 개선은 기본값이 아니라 예외입니다.",
    },
    epistasis: {
      title: "Epistasis",
      summary:
        "좋은 mutation 둘이 항상 더 좋은 하나가 되지는 않는다. greedy search가 막히는 이유.",
      takeaway:
        "mutation은 서로 상호작용합니다. additive model은 정작 가장 흥미로운 variant에서 틀립니다.",
    },
    "picking-hits": {
      title: "무엇을 주문할지 고르기",
      summary:
        "정리된 landscape를 실제로 돈을 쓸 후보 목록으로 바꾼다.",
      takeaway:
        "hit list는 정렬된 열이 아니라 불확실성 속에서 내리는 의사결정입니다.",
    },
  },
};

export const isLang = (v: string): v is Lang =>
  (LOCALES as readonly string[]).includes(v);
