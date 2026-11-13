import {
  Callout,
  CodeBlock,
  Figure,
  Mono,
  Prose,
  Section,
} from "@/components/ui";
import { ThresholdExplorer } from "@/components/charts/ThresholdExplorer";
import { getFunnel, getSweep, fmt } from "@/lib/data";

export function QualityControlKo() {
  const { steps, minInput } = getFunnel();
  const sweep = getSweep();
  const start = steps[0].kept;
  const end = steps[steps.length - 1].kept;

  return (
    <>
      <Prose>
        <p>
          Quality control은 생각을 가장 많이 해야 하는 단계이고, 대부분의
          튜토리얼이 대충 넘어가는 단계입니다. 이 데이터에서는 filter 네 개가{" "}
          {fmt(start)}행을 {fmt(end)}행으로 줄입니다. 그중 둘은 산술적으로
          강제됩니다. 나머지 둘은 판단입니다.
        </p>
        <p>어느 쪽이 어느 쪽인지 아는 것이 실력입니다.</p>
      </Prose>

      <Section title="Filter 단계" lead="각 관문이 무엇을 제거하고, 왜 제거하는가.">
        <Figure
          title="raw 행에서 분석 가능한 variant까지"
          subtitle={`${fmt(start)}행 입력, ${fmt(end)}개 variant 출력`}
          caption={
            <>
              막대 길이는 살아남은 행 수에 비례합니다. 가장 크게 떨어지는
              지점은 stop codon인데, 이건 사실 quality 문제가 아닙니다 — 그
              행들은 애초에 design 후보가 아니었습니다. 마지막 cutoff만이
              다른 분석자가 다르게 정할 법한 유일한 단계입니다.
            </>
          }
        >
          <div className="space-y-1">
            {steps.map((s, i) => {
              const width = (s.kept / start) * 100;
              const isForced = s.forced === true;
              const isChoice = s.forced === false;
              const labelKo = [
                "raw 파일에 기록된 행",
                "stop codon이 포함된 variant 제거",
                "input read가 0인 variant 제거",
                `input read ${minInput}개 이상 요구`,
                "fitness 계산 완료",
              ][i];
              const whyKo = [
                undefined,
                "잘린 protein은 design 후보가 될 수 없습니다.",
                "fitness는 input count로 나눕니다. 0은 작은 값이 아니라 정의되지 않는 값입니다.",
                "이 아래에서는 enrichment ratio가 대부분 sampling noise입니다.",
                "fitness = (selected/selected_WT) / (input/input_WT)",
              ][i];
              return (
                <div key={i}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-[var(--ink)]">
                      {labelKo}
                      {isForced && (
                        <span className="ml-2 rounded-full bg-[var(--page)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--ink-secondary)] ring-1 ring-[var(--border)] ring-inset">
                          강제
                        </span>
                      )}
                      {isChoice && (
                        <span
                          className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ring-1 ring-inset"
                          style={{
                            color: "var(--serious)",
                            borderColor: "var(--serious)",
                          }}
                        >
                          판단
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
                  {whyKo && (
                    <p className="mt-1.5 mb-3 text-[12.5px] leading-5 text-[var(--ink-muted)]">
                      {whyKo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Figure>
      </Section>

      <Section title="강제되는 filter">
        <Prose>
          <p>
            <strong>Stop codon.</strong> 잘린 GB1은 우리가 만들고 싶은 protein
            후보가 아닙니다. 이걸 제거하는 건 quality에 대한 결정이 아니라
            질문 자체의 정의입니다. negative control로는 따로 챙겨두고, design
            후보 집합에서는 빼냅니다.
          </p>
          <p>
            <strong>input read 0.</strong> fitness는 input count로 나눕니다.
            0으로 나누면 큰 값이 나오는 게 아니라 아무 값도 나오지 않습니다. 이{" "}
            {fmt(steps[2].removed)}개 행은 아무리 원해도 값을 만들어낼 수
            없습니다.
          </p>
        </Prose>

        <Callout kind="note" title="전의 0과 후의 0은 정반대입니다">
          <p>
            <Mono>Input = 0</Mono> 은 측정이 정의되지 않는다는 뜻입니다. 행을
            버립니다.
          </p>
          <p>
            <Mono>IGG20 = 0</Mono> 은 selection 전에는 있었는데 후에는
            사라졌다는 뜻입니다. 이건 실제 결과이고 — fitness 0 — 행을
            남깁니다. dropout을 제거하면 정확히 죽은 variant만 골라서 지우는
            셈이고, library가 실제보다 훨씬 좋아 보이게 됩니다.
          </p>
        </Callout>
      </Section>

      <Section
        title="판단이 필요한 filter"
        lead="input read는 몇 개면 충분한가? 정답은 없고, 원 논문 저자들도 그걸 알고 있었습니다."
      >
        <Prose>
          <p>
            출판된 분석은 input read가 <strong>{minInput}</strong>개 이상인
            variant만 남깁니다. 저자들이 직접 쓴 스크립트의 해당 줄입니다:
          </p>
        </Prose>

        <CodeBlock
          label="script/Mapper5_NW.py, 원 논문"
          code={`if DNAcount >= 10: #TUNABLE`}
        />

        <Prose>
          <p>
            저 주석이 이 저장소 전체에서 가장 정직한 한 줄입니다. 이 cutoff는
            이론에서 유도된 값이 아닙니다. 누군가 10을 골랐고, 그게 선택이라는
            걸 알았고, 그렇게 적어두었습니다.
          </p>
          <p>
            슬라이더를 움직여서 그 선택이 무엇을 사고 무엇을 치르는지 보세요.
          </p>
        </Prose>

        <Figure
          title="read count cutoff가 치르는 비용"
          subtitle="설계된 library의 coverage와, 독립적인 selection 조건 두 개 사이의 일치도"
          caption={
            <>
              두 값은 반대 방향으로 움직이고 서로 척도가 다릅니다. 그래서 세로
              축 두 개짜리 차트 하나가 아니라, 컨트롤 하나를 공유하는 패널
              두 개로 보여줍니다. 축이 두 개인 버전은 교차점을 원하는 곳
              아무 데나 둘 수 있습니다.
            </>
          }
        >
          <ThresholdExplorer sweep={sweep} />
        </Figure>

        <Callout kind="key" title="이 trade-off의 모양이 알려주는 것">
          <p>
            cutoff 없음에서 10으로 가면 coverage{" "}
            {(sweep[0].coveragePct - sweep[4].coveragePct).toFixed(1)}%p를 주고
            correlation {(sweep[4].overallR - sweep[0].overallR).toFixed(3)}을
            삽니다. 10에서 500으로 가면 coverage를{" "}
            {(sweep[4].coveragePct - sweep[sweep.length - 1].coveragePct).toFixed(
              0,
            )}
            %p 더 주고{" "}
            {(sweep[sweep.length - 1].overallR - sweep[4].overallR).toFixed(3)}을
            삽니다.
          </p>
          <p>
            첫 걸음은 쌉니다. 그다음부터 빠르게 비싸집니다. 이게 보통의
            모양이고, 낮은 cutoff에 read depth를 정직하게 같이 보고하는 쪽이
            library의 3/4를 조용히 버리는 높은 cutoff보다 나은 이유입니다.
          </p>
        </Callout>
      </Section>

      <Section title="무엇을 기록해야 하는가">
        <Prose>
          <p>
            무엇을 고르든, filter 관련 결정은 데이터와 함께 따라다녀야 합니다.
            cutoff 기록이 없는 fitness 표는 재현이 불가능하고, 그 숫자는 다른
            사람이 해석할 수 없습니다.
          </p>
          <p>최소한 다음은 적어두세요:</p>
        </Prose>

        <ul className="my-5 max-w-2xl space-y-2">
          {[
            "몇 개 행에서 시작했는지.",
            "각 filter가 순서대로 몇 개 행을 제거했는지.",
            "read count cutoff를 숫자로.",
            "selection 전의 0과 후의 0을 각각 어떻게 처리했는지.",
            "설계된 variant 중 몇 개가 아예 없는지.",
          ].map((t) => (
            <li
              key={t}
              className="flex gap-2.5 text-[14px] leading-6 text-[var(--ink-secondary)]"
            >
              <span
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--series-1)]"
                aria-hidden
              />
              {t}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
