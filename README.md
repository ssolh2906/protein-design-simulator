# The GB1 pipeline

A hands-on walkthrough of a real protein design dataset, from raw sequencing
read counts to a shortlist of variants worth making.

**Live site: https://ssolh2906.github.io/protein-design-simulator/**

Built for people who are new to bioinformatics and tired of tutorials that
hand out clean data. The data here is not clean. It has stop codons where
proteins should be, variants with four reads that look like miracle hits, and
a quality cutoff that the original authors marked `#TUNABLE` in their own
source code.

## What it covers

Nine chapters, each built on the same real dataset:

| # | Chapter | The idea |
|---|---------|----------|
| 1 | The experiment | Read the assay before you analyse it |
| 2 | The raw counts | Raw output is read counts, not answers |
| 3 | Quality control | Which filters are forced, which are judgement calls |
| 4 | Computing fitness | A ratio of ratios, and two kinds of zero |
| 5 | Does it reproduce? | Aggregate correlation hides where data is worthless |
| 6 | The assay is part of the answer | Fitness belongs to the protein *and* the assay |
| 7 | Reading the landscape | Most of the design space is dead |
| 8 | Epistasis | Mutations interact, and additive models fail |
| 9 | Picking what to order | A hit list is a decision under uncertainty |

## The data

**Wu NC, Dai L, Olson CA, Lloyd-Smith JO, Sun R (2016). "Adaptation in protein
fitness landscapes is facilitated by indirect paths." *eLife* 5:e16965.**
[doi:10.7554/eLife.16965](https://doi.org/10.7554/eLife.16965)

The experiment randomised four neighbouring residues of protein G domain B1 —
V39, D40, G41 and V54 — to all 20 amino acids, giving 160,000 designed
variants, and selected the library for binding to IgG by mRNA display.

Read counts come from the authors' own analysis repository,
[wchnicholas/ProteinGFourMutants](https://github.com/wchnicholas/ProteinGFourMutants)
(`result/Mutcount`), and are vendored here at `data/raw/gb1_counts.tsv.gz`
(1.4 MB). See [DATA_SOURCES.md](DATA_SOURCES.md).

### It reproduces the paper

Running the pipeline with the published filters recovers exactly the
**149,361** variants reported in the paper. That check is the reason to trust
the rest of the numbers on the site, and it will break loudly if the filtering
or the fitness formula is changed.

## What makes the data messy

All of this is the normal output of a working experiment, not errors:

| Problem | Rows |
|---|---|
| Stop codons in the variant | 32,587 |
| Zero input reads (fitness undefined) | 123 |
| Fewer than 10 input reads | 18,797 |
| Zero reads after selection (dropout) | 55,927 |
| Designed but never sequenced | 1,430 |
| Unequal library depth across samples | 89M vs 45–48M reads |

## Running it

Requires Node 22+ and Python 3. The pipeline needs no third-party Python
packages.

```bash
npm install
```

```bash
python3 pipeline/build_data.py
```

```bash
npm run dev
```

Then open http://localhost:3000.

To produce the static site in `out/`:

```bash
npm run build
```

To look at the raw file yourself:

```bash
gzip -dc data/raw/gb1_counts.tsv.gz | head -20
```

## How it is put together

```
pipeline/build_data.py    the whole analysis: QC, fitness, summaries
data/raw/                 the vendored read counts
public/data/              generated JSON, ~190 KB total
src/lib/chapters.ts       the curriculum
src/lib/palette.ts        validated chart colours
src/components/charts/    hand-rolled SVG charts, no chart library
src/app/chapters/         one directory per chapter
```

`pipeline/build_data.py` is written to be read. It is commented as a teaching
document and it is the authority on every number the site shows.

Charts are plain SVG with no charting dependency. Colours are not chosen by
eye: the categorical, ordinal and diverging scales were each checked for
colour-blind separation and contrast, in both light and dark mode. The notes
at the top of `src/app/globals.css` say what was verified.

### Deployment

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to
`main`. It regenerates the data and **fails the build if `public/data` differs
from a fresh pipeline run**, so the site can never drift from the pipeline.

To enable it on a fork: Settings → Pages → Source → **GitHub Actions**.

The base path is taken from the repository name, so a fork under a different
name works without editing anything.

## Contributing

Corrections are welcome, especially to the explanations. If something is
unclear to someone learning this material, that is a bug worth filing.

## Licence

Code and written material: [MIT](LICENSE).

The read counts remain under **CC BY 4.0** from the original publication, with
attribution to Wu et al. 2016. If you use the numbers for anything beyond
learning, cite the paper rather than this repository.
