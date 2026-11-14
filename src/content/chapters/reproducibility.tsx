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

export function ReproducibilityEn({ takeaway }: ChapterProps) {
  const rep = getReproducibility();
  const worst = rep.byDepth[0];
  const best = rep.byDepth[rep.byDepth.length - 1];
  const shallow = worst.n + rep.byDepth[1].n;

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
      takeaway={takeaway}
      labels={["The question", "Guess", "Split it", "All bands", "Why", "Your call"]}
      steps={[
        /* 1 ----------------------------------------------------------- */
        <Step key="q" title="You have 149,361 numbers. Should you believe them?">
          <Prose>
            <p>
              Every variant that survived quality control now has a fitness
              value. Before any of them is used, ask the only question that
              matters: <strong>if this were measured again, would it come out
              the same?</strong>
            </p>
            <p>
              This dataset lets you check without doing any new work. The same
              library was selected against three IgG concentrations. Low and
              high are different enough to count as independent selections, so
              agreement between them is real evidence rather than the same
              pipetting repeated.
            </p>
          </Prose>
          <Callout kind="note" title="The plan">
            <p>
              Take every variant&apos;s fitness at low IgG, take the same
              variant&apos;s fitness at high IgG, and correlate the two. One
              number comes out. Then we will take that number apart.
            </p>
          </Callout>
        </Step>,

        /* 2 ----------------------------------------------------------- */
        <Step key="guess1" title="First, the overall number">
          <Prose>
            <p>
              {fmt(rep.n)} variants, each measured twice under different
              selection pressure. How well do the two agree?
            </p>
          </Prose>

          <Predict
            question="What is the correlation between low-IgG and high-IgG fitness, across all variants?"
            hint="r = 0 is no relationship at all. r = 1 is perfect agreement. Most people guess high here."
            min={0}
            max={1}
            step={0.01}
            initial={0.5}
            actual={rep.overallR}
            verdictClose="Close. The real answer is r = {actual}, which looks like a dataset you can work with."
            verdictFar="The real answer is r = {actual}. That looks like a dataset you can work with — which is exactly the trap."
          >
            <StatGrid>
              <Stat
                value={`r = ${rep.overallR.toFixed(3)}`}
                label="Overall correlation"
                tone="good"
              />
              <Stat value={fmt(rep.n)} label="Variants compared" />
              <Stat
                value={`${(rep.overallR ** 2 * 100).toFixed(0)}%`}
                label="Variance explained"
                hint="r squared"
              />
              <Stat value="3" label="Selection conditions" />
            </StatGrid>

            <Prose>
              <p>
                Most analyses would report this number, put it in a
                supplementary figure, and move on. <strong>Do not move
                on.</strong>
              </p>
            </Prose>

            <ToolCode
              tabs={[
                {
                  tool: "pandas",
                  lang: "python",
                  note: "What you would write yourself. Fitness is log-scaled first because the values span four orders of magnitude.",
                  code: `import numpy as np

# floor at 0.001 so variants wiped out by selection stay on a log scale
lo = np.log10(df["fit_IGG10"].clip(lower=1e-3))
hi = np.log10(df["fit_IGG90"].clip(lower=1e-3))

print(lo.corr(hi).round(3))
# 0.717`,
                },
                {
                  tool: "Enrich2",
                  lang: "python",
                  note: "Enrich2 (Fowler lab) is the standard tool for turning DMS read counts into scores. It stores results in HDF5 and you read them back with pandas.",
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
              ]}
            />
          </Predict>
        </Step>,

        /* 3 ----------------------------------------------------------- */
        <Step key="guess2" title="Now split the same data by read depth">
          <Prose>
            <p>
              Group those identical variants by how many reads the sequencer
              happened to give them, then compute the correlation{" "}
              <em>inside</em> each group. Nothing else changes: same formula,
              same pipeline, same variants.
            </p>
            <p>
              {fmt(worst.n)} variants had between {worst.bin} input reads.
              They all passed quality control.
            </p>
          </Prose>

          <Predict
            question={`For just those ${worst.bin}-read variants, what is the correlation?`}
            hint={`Remember the overall number was r = ${rep.overallR.toFixed(2)}.`}
            min={0}
            max={1}
            step={0.01}
            initial={0.7}
            actual={worst.r}
            verdictClose="It is r = {actual}. Barely better than noise — and you expected that."
            verdictFar="It is r = {actual}. Far worse than you guessed, and far worse than the headline number suggested."
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
                label="What the summary said"
                hint="the average of both"
              />
              <Stat
                value={fmt(shallow)}
                label="Variants in the bottom two bands"
                tone="warn"
                hint="all passed QC"
              />
            </StatGrid>

            <Callout kind="key" title="What the aggregate number was hiding">
              <p>
                r = {rep.overallR.toFixed(2)} is an average over groups that
                behave completely differently. It is not wrong. It is just not
                an answer to any question you actually have.
              </p>
            </Callout>

            <ToolCode
              tabs={[
                {
                  tool: "pandas",
                  lang: "python",
                  note: "Two extra lines than before: bin the depth, then correlate within each bin. This is the whole chapter in code.",
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
                {
                  tool: "Enrich2",
                  lang: "python",
                  note: "Enrich2 ships an example notebook for exactly this check, called \"Selecting variants by input library count\". It plots each variant's score against its input count.",
                  url: "https://github.com/FowlerLab/Enrich2",
                  code: `# docs/exported_notebooks/min_count.rst
counts = my_store["/main/variants/counts"]
scores = my_store["/main/variants/scores"]

# keep only variants above a minimum count in the input timepoint
cutoff = 10
keep = counts["c_0"] >= cutoff
plt.scatter(counts.loc[keep, "c_0"], scores.loc[keep, "score"])`,
                },
              ]}
            />
          </Predict>
        </Step>,

        /* 4 ----------------------------------------------------------- */
        <Step key="all" title="All five bands at once">
          <Figure
            title="Agreement between conditions, by sequencing depth"
            subtitle="Correlation of log fitness, low IgG against high IgG, within each read-depth band"
            caption={
              <>
                The only difference between the top bar and the bottom bar is
                how many times the sequencer happened to read that variant.
              </>
            }
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
              title="input reads"
              items={rep.byDepth.map((b, i) => ({
                label: b.bin,
                color: DEPTH_RAMP[i],
              }))}
            />
          </Figure>

          <Figure
            title="The same thing as scatter plots"
            subtitle={`${fmt(rep.scatter.length)} variants, sampled evenly so every band is equally visible. Same axes in every panel.`}
            caption={
              <>
                Read left to right: the cloud starts as a shapeless smear and
                tightens onto the diagonal as read depth increases. Five
                panels rather than one five-colour scatter, because
                overlapping translucent points pile up and every band ends up
                looking equally dark.
              </>
            }
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
              caption="Correlation and variant count by read-depth band"
              rows={rep.byDepth}
              columns={[
                {
                  key: "bin",
                  header: "Input reads",
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
                  header: "Variants",
                  align: "right",
                  render: (b) => fmt(b.n),
                },
                {
                  key: "r",
                  header: "Correlation r",
                  align: "right",
                  render: (b) => (
                    <span className="font-medium text-[var(--ink)]">
                      {b.r.toFixed(3)}
                    </span>
                  ),
                },
                {
                  key: "q",
                  header: "Usable?",
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
                        ? "yes"
                        : b.r > 0.6
                          ? "with care"
                          : "treat as a hint"}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </Step>,

        /* 5 ----------------------------------------------------------- */
        <Step key="why" title="Why depth does this">
          <Prose>
            <p>
              Nothing is wrong with the low-depth variants biologically. The
              problem is counting.
            </p>
            <p>
              A variant with 12 input reads was sampled twelve times out of 89
              million. That number carries a large random component. Fitness
              divides one noisy count by another noisy count, so the ratio is
              noisier still. Run the experiment again and you get a different
              answer — not because the protein changed, but because the dice
              did.
            </p>
            <p>With 3,000 reads, the sampling error is small and the value reflects the protein.</p>
          </Prose>

          <Callout kind="trap" title="The mistake this prevents">
            <p>
              Sort {fmt(rep.n)} variants by fitness and the top of the list
              fills up with variants that got there on a handful of reads. A
              variant with 11 input reads and a lucky selection count can post
              a spectacular ratio.
            </p>
            <p>
              Carry the read count next to every fitness value, all the way to
              the hit list.
            </p>
          </Callout>
        </Step>,

        /* 6 ----------------------------------------------------------- */
        <Step key="call" title="Your call">
          <Quiz
            scenario={`You are handed this dataset. ${fmt(shallow)} of the ${fmt(rep.n)} variants sit in the two bands where the two conditions agree at r < 0.5. Your PI wants a list of candidates by Friday.`}
            question="What do you do?"
            choices={[
              {
                label: "Raise the input-count cutoff until the correlation looks good",
                grade: "ok",
                outcome: (
                  <>
                    Defensible, and the usual first move. Chapter 3 measured
                    the cost: going to 500 reads lifts r to 0.834 but throws
                    away <strong>71% of the library</strong>. You will never
                    see the variants you discarded, including any good ones.
                  </>
                ),
              },
              {
                label: "Keep everything, and carry read depth alongside every fitness value",
                grade: "best",
                outcome: (
                  <>
                    More work, and the honest answer. You keep full coverage
                    and let every downstream step know which numbers are thin.
                    This is what the published analysis did: cutoff of 10,{" "}
                    <strong>93% coverage kept</strong>, noise reported rather
                    than hidden.
                  </>
                ),
              },
              {
                label: "Require a variant to look good in more than one condition",
                grade: "best",
                outcome: (
                  <>
                    The cheapest filter that targets the actual failure mode.
                    A lucky read count is unlikely to be lucky twice. Chapter
                    9 shows this changes 11 of the top 25.
                  </>
                ),
              },
              {
                label: "Report r = 0.72 and hand over the top 25 by fitness",
                grade: "bad",
                outcome: (
                  <>
                    The number is true and the list is sorted correctly, which
                    is what makes this dangerous. You would be presenting an
                    average over groups ranging from r = {worst.r.toFixed(2)}{" "}
                    to r = {best.r.toFixed(2)} as if it described every row.
                  </>
                ),
              },
            ]}
          >
            <Prose>
              <p>
                In practice the last two are combined, and real pipelines
                expose both as configuration rather than as code you write.
              </p>
            </Prose>

            <ToolCode
              tabs={[
                {
                  tool: "DiMSum",
                  lang: "bash",
                  note: "DiMSum (Lehner lab) is an end-to-end DMS pipeline in R. The count cutoff this chapter spent its time on is a command-line option, and it defaults to 0 — the decision is handed to you, not made for you.",
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
                  note: "Requiring agreement across conditions, which is the cheap filter that targets the real failure mode.",
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
