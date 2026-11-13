# Data sources and attribution

## The dataset

All experimental numbers in this repository come from one publication:

> Wu NC, Dai L, Olson CA, Lloyd-Smith JO, Sun R (2016).
> **Adaptation in protein fitness landscapes is facilitated by indirect paths.**
> *eLife* 5:e16965. https://doi.org/10.7554/eLife.16965

The study randomised four neighbouring residues of protein G domain B1 (GB1) —
**V39, D40, G41 and V54** — to all 20 amino acids, producing 160,000 designed
variants. The library was displayed by mRNA display, selected for binding to
human IgG at three target concentrations, and sequenced before and after
selection.

## The file in this repository

`data/raw/gb1_counts.tsv.gz` is the file `result/Mutcount` from the authors'
own analysis repository:

> https://github.com/wchnicholas/ProteinGFourMutants

It is gzipped and otherwise unmodified. 191,157 rows, six columns:

| Column | Meaning |
|---|---|
| `mut` | the four-letter variant, in the order 39, 40, 41, 54; `_` is a stop codon |
| `HD` | Hamming distance from the wild type `VDGV` |
| `Input` | read count in the unselected input library |
| `IGG10` | read count after selection, low IgG |
| `IGG20` | read count after selection, medium IgG |
| `IGG90` | read count after selection, high IgG |

`data/raw/gb1_wt_counts.tsv` is `result/WTcount` from the same repository: the
wild-type counts that every fitness value is normalised against.

## Licence

*eLife* publishes under **Creative Commons Attribution 4.0 (CC BY 4.0)**, which
permits redistribution and adaptation with attribution. The data here is
redistributed on that basis and remains under CC BY 4.0.

**If you use these numbers for anything beyond learning, cite the paper, not
this repository.** The experiment is the authors' work; this repository is a
walkthrough of it.

## Related work on the same protein

The four-site library above is often confused with a second, larger GB1
dataset. They are different experiments:

- **Olson CA, Wu NC, Sun R (2014).** *A comprehensive biophysical description
  of pairwise epistasis throughout an entire protein domain.*
  *Current Biology* 24(22):2643–2651. All single and nearly all double mutants
  across the **whole 56-residue domain**.
- **Wu et al. 2016** (used here). All combinations at **four positions only**,
  including triples and quadruples, which is what makes higher-order epistasis
  visible.

The 2016 four-site set is the one distributed in the FLIP and ProteinGym
benchmarks as "GB1", usually as `four_mutations_full_data.csv`. That version
carries a precomputed `Fitness` column. This repository deliberately starts
from the read counts instead, so the filtering and the fitness calculation are
visible rather than inherited.

## What the pipeline derives

`pipeline/build_data.py` reads the counts above and writes `public/data/*.json`.
It applies the paper's own filters — drop stop codons, drop zero-input rows,
require at least 10 input reads — and the paper's fitness formula:

```
fitness = (selected_variant / selected_WT) / (input_variant / input_WT)
```

This recovers exactly **149,361** variants, the number reported in the paper.
That agreement is the correctness check for the whole pipeline.
