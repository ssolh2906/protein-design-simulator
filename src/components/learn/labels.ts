import type { Lang } from "@/lib/i18n";

/**
 * UI text for the interactive components.
 *
 * Kept separate from the chapter copy in i18n.ts because these are fixed
 * widget labels, not prose: they are short, repeated, and genuinely are
 * key/value strings, which is the case a dictionary is good at.
 */
export const L: Record<
  Lang,
  {
    stepsAria: string;
    prev: string;
    next: string;
    chapterDone: string;
    predictEyebrow: string;
    myGuess: string;
    actual: string;
    check: string;
    close: string;
    farOff: string;
    quizEyebrow: string;
    showAnswer: string;
    codeTitle: string;
    repo: string;
    grade: Record<"best" | "ok" | "bad", string>;
  }
> = {
  en: {
    stepsAria: "Steps in this chapter",
    prev: "← Back",
    next: "Next →",
    chapterDone: "End of chapter ✓",
    predictEyebrow: "Guess first",
    myGuess: "your guess",
    actual: "actual",
    check: "Check",
    close: "Close.",
    farOff: "Well off. That gap is the point of this chapter.",
    quizEyebrow: "You are the analyst",
    showAnswer: "Show the answer",
    codeTitle: "What this looks like in practice",
    repo: "repository",
    grade: {
      best: "most defensible",
      ok: "works, with caveats",
      bad: "this misleads people",
    },
  },
  ko: {
    stepsAria: "이 챕터의 단계",
    prev: "← 이전",
    next: "다음 →",
    chapterDone: "이 챕터 끝 ✓",
    predictEyebrow: "먼저 찍어보세요",
    myGuess: "내 예상",
    actual: "실제",
    check: "확인하기",
    close: "가깝습니다.",
    farOff: "꽤 빗나갔습니다. 그게 이 챕터의 핵심입니다.",
    quizEyebrow: "당신이 분석가입니다",
    showAnswer: "답 보기",
    codeTitle: "실제로는 이렇게 씁니다",
    repo: "저장소",
    grade: {
      best: "가장 방어 가능",
      ok: "조건부로 가능",
      bad: "이건 사람을 속입니다",
    },
  },
};
