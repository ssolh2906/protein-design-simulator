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

## The structures

Two coordinate files are vendored so the four randomised sites can be shown in
the fold rather than only named. Both come from the RCSB Protein Data Bank and
are gzipped but otherwise unmodified.

| File | PDB | What it is |
|---|---|---|
| `data/raw/1pga.pdb.gz` | [1PGA](https://doi.org/10.2210/pdb1pga/pdb) | GB1 itself: the B1 domain of streptococcal protein G, X-ray at 2.07 Å |
| `data/raw/1fcc.pdb.gz` | [1FCC](https://doi.org/10.2210/pdb1fcc/pdb) | A protein G domain bound to the Fc of human IgG |

> Gallagher T, Alexander P, Bryan P, Gilliland GL (1994). *Two crystal
> structures of the B1 immunoglobulin-binding domain of streptococcal protein
> G and comparison with NMR.* **Biochemistry** 33(15):4721–4729.

> Sauer-Eriksson AE, Kleywegt GJ, Uhlén M, Jones TA (1995). *Crystal structure
> of the C2 fragment of streptococcal protein G in complex with the Fc domain
> of human IgG.* **Structure** 3(3):265–278.

**1FCC contains the C2 domain, not B1.** Protein G carries several
near-identical IgG-binding domains; the library was built from B1, and no
B1–Fc complex of comparable quality exists. Comparing the two chains as
deposited, they are **identical at 53 of 56 positions** — the three
differences are M1T, I6V and L7I, all at the far end of the domain from the
randomised sites, which read `VDGV` in both. 1FCC is used only to show what
"binding to IgG" physically means; every number on the site comes from B1. The site states this caveat where the structure is shown.

The pipeline reads both files, keeps the α-carbon trace and the secondary
structure records, and writes `public/data/structure.json` (14 KB). It also
**measures** the claim that the four sites are neighbours rather than asserting
it: the CA distances come out at 3.8–8.1 Å, including 8.1 Å between V39 and
V54, which are 15 residues apart in the sequence. The pipeline fails loudly if
residues 39, 40, 41 and 54 of 1PGA do not read `VDGV`.

PDB coordinate files are released into the public domain (CC0).

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
