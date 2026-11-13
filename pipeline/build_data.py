#!/usr/bin/env python3
"""
Build the site's data files from the raw GB1 read counts.

This script is part of the lesson. It does what a real deep mutational
scanning (DMS) analysis does, in order, with nothing hidden:

    raw read counts -> QC -> filtering -> fitness -> summaries

Source data
-----------
Wu NC, Dai L, Olson CA, Lloyd-Smith JO, Sun R (2016).
"Adaptation in protein fitness landscapes is facilitated by indirect paths."
eLife 5:e16965.  https://doi.org/10.7554/eLife.16965

The counts come from the authors' own analysis repository
(github.com/wchnicholas/ProteinGFourMutants, file result/Mutcount), which is
the read count table behind that paper. The paper is open access under
CC BY 4.0.

The experiment
--------------
GB1 is the B1 domain of streptococcal protein G. It binds IgG. The authors
randomised four residues that sit next to each other in the folded structure
-- V39, D40, G41 and V54 -- to all 20 amino acids. That is 20^4 = 160,000
designed variants. The library was displayed by mRNA display, selected for
IgG binding, and sequenced before and after selection.

A variant is written as four letters, one per randomised position, in the
order 39, 40, 41, 54. The wild type is therefore "VDGV".

Columns in the raw table:
    mut     the four-letter variant, where "_" means a stop codon
    HD      Hamming distance from VDGV (how many of the 4 sites are mutated)
    Input   read count in the unselected input library
    IGG10   read count after selection, low IgG concentration
    IGG20   read count after selection, medium IgG concentration
    IGG90   read count after selection, high IgG concentration

Fitness
-------
Fitness is an enrichment ratio, normalised to the wild type so that
WT fitness == 1.0 by construction:

    fitness(v) = (sel(v) / sel(WT)) / (input(v) / input(WT))

Above 1.0 the variant did better than wild type, below 1.0 it did worse.
This is exactly the formula in the authors' script/Mapper5_NW.py.

Usage:  python3 pipeline/build_data.py
Writes: public/data/*.json
"""

from __future__ import annotations

import gzip
import json
import math
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_COUNTS = ROOT / "data" / "raw" / "gb1_counts.tsv.gz"
RAW_WT = ROOT / "data" / "raw" / "gb1_wt_counts.tsv"
OUT_DIR = ROOT / "public" / "data"

# The four randomised positions, in the order they appear in the variant string.
POSITIONS = [39, 40, 41, 54]
WT_VARIANT = "VDGV"

# The 20 standard amino acids, grouped so a heatmap reads sensibly:
# hydrophobic, polar, acidic, basic, special.
AA_ORDER = "AVLIMFWYGPSTCNQDEKRH"

# The authors' own input-count cutoff. Their code marks it "#TUNABLE",
# which is the honest label: it is a judgement call, not a law.
PUBLISHED_MIN_INPUT = 10

# Thresholds we precompute metrics for, so the site can show what the
# cutoff actually costs you.
THRESHOLD_SWEEP = [0, 1, 2, 5, 10, 20, 50, 100, 200, 500]

SELECTION_CONDITIONS = ["IGG10", "IGG20", "IGG90"]

random.seed(20160906)  # eLife 16965 publication date, so reruns are identical


def r(x, places=4):
    """Round for JSON, and turn non-finite values into None (JSON null)."""
    if x is None:
        return None
    if isinstance(x, float) and not math.isfinite(x):
        return None
    return round(x, places)


# --------------------------------------------------------------------------
# Step 1. Load the raw table exactly as sequenced. No cleaning yet.
# --------------------------------------------------------------------------

def load_raw():
    with gzip.open(RAW_COUNTS, "rt") as fh:
        header = fh.readline().rstrip("\n").split("\t")
        rows = []
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            rows.append(
                {
                    "mut": parts[0],
                    "hd": int(parts[1]),
                    "Input": int(parts[2]),
                    "IGG10": int(parts[3]),
                    "IGG20": int(parts[4]),
                    "IGG90": int(parts[5]),
                }
            )
    return header, rows


def load_wt():
    lines = RAW_WT.read_text().strip().split("\n")
    header = lines[0].split("\t")
    values = lines[1].split("\t")
    wt = dict(zip(header, values))
    return {
        "mut": wt["mut"],
        "Input": int(wt["Input"]),
        "IGG10": int(wt["IGG10"]),
        "IGG20": int(wt["IGG20"]),
        "IGG90": int(wt["IGG90"]),
    }


# --------------------------------------------------------------------------
# Step 2. Describe the mess, before touching it.
# --------------------------------------------------------------------------

def profile_raw(rows, wt):
    n = len(rows)
    has_stop = sum(1 for x in rows if "_" in x["mut"])
    clean_aa = n - has_stop

    inputs = sorted(x["Input"] for x in rows)
    totals = {
        col: sum(x[col] for x in rows)
        for col in ["Input"] + SELECTION_CONDITIONS
    }

    # How much of the designed space did we actually see?
    designed_space = 20 ** 4
    observed_coding = clean_aa
    never_observed = designed_space - observed_coding

    def pct(a, b):
        return round(100.0 * a / b, 2)

    return {
        "rowsInFile": n,
        "designedSpace": designed_space,
        "spaceWithStops": 21 ** 4,
        "rowsWithStopCodon": has_stop,
        "rowsCodingOnly": clean_aa,
        "neverObserved": never_observed,
        "neverObservedPct": pct(never_observed, designed_space),
        "libraryTotals": totals,
        "depthImbalance": {
            "deepest": max(totals, key=totals.get),
            "shallowest": min(totals, key=totals.get),
            "ratio": r(max(totals.values()) / min(totals.values()), 2),
        },
        "inputCount": {
            "min": inputs[0],
            "p25": inputs[n // 4],
            "median": inputs[n // 2],
            "p75": inputs[3 * n // 4],
            "max": inputs[-1],
            "mean": r(sum(inputs) / n, 1),
        },
        "pathologies": [
            {
                "id": "stop",
                "label": "Stop codon in the variant",
                "count": has_stop,
                "pct": pct(has_stop, n),
                "why": "The library was built with degenerate codons, which also encode stop. These are truncated proteins, not design candidates.",
            },
            {
                "id": "zeroInput",
                "label": "Zero reads in the input library",
                "count": sum(1 for x in rows if x["Input"] == 0),
                "pct": pct(sum(1 for x in rows if x["Input"] == 0), n),
                "why": "Seen after selection but never before it. Fitness would divide by zero.",
            },
            {
                "id": "lowInput",
                "label": f"Fewer than {PUBLISHED_MIN_INPUT} input reads",
                "count": sum(1 for x in rows if x["Input"] < PUBLISHED_MIN_INPUT),
                "pct": pct(sum(1 for x in rows if x["Input"] < PUBLISHED_MIN_INPUT), n),
                "why": "Too few reads to estimate a ratio. One extra read changes the answer by tens of percent.",
            },
            {
                "id": "dropout",
                "label": "Zero reads after selection (IGG20)",
                "count": sum(1 for x in rows if x["IGG20"] == 0),
                "pct": pct(sum(1 for x in rows if x["IGG20"] == 0), n),
                "why": "Either genuinely dead, or present but missed by sequencing. The data cannot tell you which.",
            },
        ],
        "hammingDistribution": [
            {
                "hd": hd,
                "observed": c,
                # How many 4-letter coding variants exist at this distance:
                # choose(4, hd) * 19^hd
                "possible": math.comb(4, hd) * (19 ** hd),
            }
            for hd, c in sorted(
                Counter(
                    x["hd"] for x in rows if "_" not in x["mut"]
                ).items()
            )
        ],
        "wildType": wt,
    }


# --------------------------------------------------------------------------
# Step 3. A hand-picked sample of real rows that shows each problem.
# --------------------------------------------------------------------------

def build_raw_sample(rows):
    """Real rows, never invented, chosen so each pathology is visible."""
    by_id = {x["mut"]: x for x in rows}

    def take(pred, k, exclude):
        pool = [x for x in rows if pred(x) and x["mut"] not in exclude]
        random.shuffle(pool)
        return pool[:k]

    chosen, seen = [], set()

    def add(items, tag):
        for it in items:
            if it["mut"] in seen:
                continue
            seen.add(it["mut"])
            chosen.append({**it, "flag": tag})

    add([by_id[WT_VARIANT]], "wildtype")
    add(take(lambda x: "_" in x["mut"] and x["Input"] > 100, 4, seen), "stop")
    add(take(lambda x: x["Input"] == 0, 3, seen), "zeroInput")
    add(take(lambda x: 0 < x["Input"] < 5, 4, seen), "lowInput")
    add(take(lambda x: x["Input"] > 500 and x["IGG20"] == 0, 3, seen), "dropout")
    add(take(lambda x: x["Input"] > 1000 and x["IGG20"] > 2000, 4, seen), "enriched")
    add(take(lambda x: x["Input"] > 200 and "_" not in x["mut"], 12, seen), "ordinary")

    random.shuffle(chosen)
    return chosen


# --------------------------------------------------------------------------
# Step 4. Filtering, then fitness.
# --------------------------------------------------------------------------

def compute_fitness(rows, wt, min_input):
    """
    Apply QC, then compute WT-normalised enrichment for everything that passes.

    Returns the surviving variants plus a record of what each gate removed,
    so the site can show the funnel honestly.
    """
    funnel = []
    stage = rows

    funnel.append({"step": "Sequenced rows in the raw file", "kept": len(stage), "removed": 0})

    before = len(stage)
    stage = [x for x in stage if "_" not in x["mut"]]
    funnel.append(
        {
            "step": "Drop variants containing a stop codon",
            "kept": len(stage),
            "removed": before - len(stage),
            "why": "A truncated protein cannot be a design candidate.",
            "forced": True,
        }
    )

    # Two separate gates, deliberately. Zero input reads is not a noisy
    # measurement, it is an undefined one -- the ratio divides by zero. That
    # gate is forced. The count threshold below it is a judgement call.
    before = len(stage)
    stage = [x for x in stage if x["Input"] > 0]
    funnel.append(
        {
            "step": "Drop variants with zero input reads",
            "kept": len(stage),
            "removed": before - len(stage),
            "why": "Fitness divides by the input count. Zero makes it undefined, not small.",
            "forced": True,
        }
    )

    if min_input > 1:
        before = len(stage)
        stage = [x for x in stage if x["Input"] >= min_input]
        funnel.append(
            {
                "step": f"Require at least {min_input} input reads",
                "kept": len(stage),
                "removed": before - len(stage),
                "why": "Below this the enrichment ratio is mostly sampling noise.",
                "forced": False,
            }
        )

    out = []
    for x in stage:
        rec = {"mut": x["mut"], "hd": x["hd"], "Input": x["Input"]}
        for cond in SELECTION_CONDITIONS:
            rec[cond] = x[cond]
            # Note the asymmetry: zero reads AFTER selection is a real
            # measurement (fitness 0, the variant was wiped out), while zero
            # reads BEFORE selection is missing information (already removed).
            rec["fit_" + cond] = (
                (x[cond] / wt[cond]) / (x["Input"] / wt["Input"])
            )
        out.append(rec)

    funnel.append(
        {
            "step": "Fitness computed",
            "kept": len(out),
            "removed": 0,
            "why": "fitness = (selected/selected_WT) / (input/input_WT)",
        }
    )
    return out, funnel


# --------------------------------------------------------------------------
# Step 5. Does the measurement reproduce?
# --------------------------------------------------------------------------

def pearson(xs, ys):
    n = len(xs)
    if n < 3:
        return None
    mx, my = sum(xs) / n, sum(ys) / n
    num = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
    dx = math.sqrt(sum((a - mx) ** 2 for a in xs))
    dy = math.sqrt(sum((b - my) ** 2 for b in ys))
    if dx == 0 or dy == 0:
        return None
    return num / (dx * dy)


def log_fit(v):
    """Log scale, with a floor so that fitness 0 stays plottable."""
    return math.log10(max(v, 1e-3))


def reproducibility(variants):
    """
    Correlate two independent selection conditions, split by read depth.

    This is the chapter that matters most. The overall correlation looks
    reassuring. Split it by input depth and the bottom bin falls apart.
    """
    # Five bins, not six: the ordinal colour ramp the site uses has five
    # steps that are reliably distinguishable from one another.
    bins = [
        ("10-19", 10, 20),
        ("20-49", 20, 50),
        ("50-199", 50, 200),
        ("200-999", 200, 1000),
        ("1000+", 1000, float("inf")),
    ]
    out = []
    for label, lo, hi in bins:
        sub = [v for v in variants if lo <= v["Input"] < hi]
        if len(sub) < 10:
            continue
        xs = [log_fit(v["fit_IGG10"]) for v in sub]
        ys = [log_fit(v["fit_IGG90"]) for v in sub]
        out.append(
            {
                "bin": label,
                "n": len(sub),
                "r": r(pearson(xs, ys), 3),
            }
        )

    xs = [log_fit(v["fit_IGG10"]) for v in variants]
    ys = [log_fit(v["fit_IGG90"]) for v in variants]

    # A scatter the browser can actually render: stratified subsample.
    sample = []
    for label, lo, hi in bins:
        sub = [v for v in variants if lo <= v["Input"] < hi]
        random.shuffle(sub)
        for v in sub[:550]:
            sample.append(
                {
                    "x": r(log_fit(v["fit_IGG10"]), 3),
                    "y": r(log_fit(v["fit_IGG90"]), 3),
                    "bin": label,
                }
            )

    return {
        "overallR": r(pearson(xs, ys), 3),
        "n": len(variants),
        "byDepth": out,
        "scatter": sample,
        "axisLabel": "log10 fitness",
    }


# --------------------------------------------------------------------------
# Step 6. The biology: single mutants, the heatmap, epistasis.
# --------------------------------------------------------------------------

def singles_and_heatmap(variants):
    """Single mutants: one position changed, three still wild type."""
    index = {v["mut"]: v for v in variants}
    singles, heatmap = [], []

    for i, pos in enumerate(POSITIONS):
        wt_aa = WT_VARIANT[i]
        row = {"position": pos, "wt": wt_aa, "cells": []}
        for aa in AA_ORDER:
            mut = WT_VARIANT[:i] + aa + WT_VARIANT[i + 1:]
            v = index.get(mut)
            cell = {
                "aa": aa,
                "isWt": aa == wt_aa,
                "fitness": r(v["fit_IGG20"], 4) if v else None,
                "input": v["Input"] if v else None,
            }
            row["cells"].append(cell)
            if v and aa != wt_aa:
                singles.append(
                    {
                        "mut": mut,
                        "position": pos,
                        "from": wt_aa,
                        "to": aa,
                        "label": f"{wt_aa}{pos}{aa}",
                        "fitness": r(v["fit_IGG20"], 4),
                        "input": v["Input"],
                    }
                )
        heatmap.append(row)

    singles.sort(key=lambda s: s["fitness"], reverse=True)
    return singles, heatmap


def epistasis(variants):
    """
    Epistasis: when two mutations together do not equal the sum of their parts.

    Expected fitness of a double, under independence, is the product of the
    two single-mutant fitnesses. The deviation is epistasis, and it is the
    reason a greedy single-step search gets stuck.
    """
    index = {v["mut"]: v for v in variants}
    singles = {}
    for i in range(4):
        for aa in AA_ORDER:
            if aa == WT_VARIANT[i]:
                continue
            m = WT_VARIANT[:i] + aa + WT_VARIANT[i + 1:]
            if m in index:
                singles[(i, aa)] = index[m]["fit_IGG20"]

    pairs = []
    for v in variants:
        if v["hd"] != 2 or v["Input"] < 100:
            continue
        diffs = [i for i in range(4) if v["mut"][i] != WT_VARIANT[i]]
        a, b = diffs
        fa = singles.get((a, v["mut"][a]))
        fb = singles.get((b, v["mut"][b]))
        if fa is None or fb is None:
            continue
        expected = fa * fb
        observed = v["fit_IGG20"]
        pairs.append(
            {
                "mut": v["mut"],
                "label": f"{WT_VARIANT[a]}{POSITIONS[a]}{v['mut'][a]} + {WT_VARIANT[b]}{POSITIONS[b]}{v['mut'][b]}",
                "expected": r(expected, 4),
                "observed": r(observed, 4),
                "ratio": r(observed / expected, 3) if expected > 1e-6 else None,
                "input": v["Input"],
            }
        )

    scored = [p for p in pairs if p["ratio"] is not None]
    scored.sort(key=lambda p: p["ratio"], reverse=True)

    return {
        "n": len(scored),
        "positive": scored[:12],
        "negative": list(reversed(scored[-12:])),
        "scatter": [
            {"x": r(log_fit(p["expected"]), 3), "y": r(log_fit(p["observed"]), 3)}
            for p in random.sample(scored, min(2500, len(scored)))
        ],
    }


def landscape_summary(variants, wt_fitness=1.0):
    """Headline numbers: how rare is a variant better than wild type?"""
    better = [v for v in variants if v["fit_IGG20"] > wt_fitness]
    dead = [v for v in variants if v["fit_IGG20"] < 0.01]
    best = sorted(variants, key=lambda v: v["fit_IGG20"], reverse=True)

    hist = Counter()
    for v in variants:
        hist[round(log_fit(v["fit_IGG20"]) * 4) / 4] += 1

    return {
        "n": len(variants),
        "betterThanWt": len(better),
        "betterThanWtPct": r(100.0 * len(better) / len(variants), 2),
        "effectivelyDead": len(dead),
        "effectivelyDeadPct": r(100.0 * len(dead) / len(variants), 2),
        "top": [
            {
                "mut": v["mut"],
                "hd": v["hd"],
                "fitness": r(v["fit_IGG20"], 3),
                "input": v["Input"],
            }
            for v in best[:20]
        ],
        "histogram": [
            {"logFitness": k, "count": c} for k, c in sorted(hist.items())
        ],
    }


def winners_curse(variants):
    """
    The most expensive mistake in screening: trusting the top of the list.

    Rank by one selection condition, then look the same variants up in an
    independent one. Variants that got to the top on very few reads fall
    back down; the apparent winners were partly sampling luck. This is why
    a hit list has to be re-tested before anyone orders DNA.
    """
    ranked = sorted(variants, key=lambda v: v["fit_IGG20"], reverse=True)
    all_inputs = sorted(v["Input"] for v in variants)
    median_input = all_inputs[len(all_inputs) // 2]

    def median(xs):
        s = sorted(xs)
        return s[len(s) // 2] if s else None

    tiers = []
    for label, k in [("Top 10", 10), ("Top 50", 50), ("Top 100", 100),
                     ("Top 500", 500), ("Top 2000", 2000)]:
        top = ranked[:k]
        # How well does the IGG20 ranking hold up in an independent condition?
        held = sum(1 for v in top if v["fit_IGG10"] > 1.0 and v["fit_IGG90"] > 1.0)
        tiers.append(
            {
                "tier": label,
                "n": k,
                "medianInput": median([v["Input"] for v in top]),
                "medianInputAll": median_input,
                "lowCoverage": sum(1 for v in top if v["Input"] < 50),
                "confirmedInBoth": held,
                "confirmedPct": r(100.0 * held / k, 1),
                "medianFitness": r(median([v["fit_IGG20"] for v in top]), 3),
            }
        )

    # A concrete, honest side-by-side of the headline hit list.
    table = [
        {
            "mut": v["mut"],
            "input": v["Input"],
            "igg20": r(v["fit_IGG20"], 2),
            "igg10": r(v["fit_IGG10"], 2),
            "igg90": r(v["fit_IGG90"], 2),
            "shaky": v["Input"] < 50,
        }
        for v in ranked[:25]
    ]

    # Same ranking, but only variants measured deeply enough to believe.
    deep = [v for v in ranked if v["Input"] >= 500][:25]
    deep_table = [
        {
            "mut": v["mut"],
            "input": v["Input"],
            "igg20": r(v["fit_IGG20"], 2),
            "igg10": r(v["fit_IGG10"], 2),
            "igg90": r(v["fit_IGG90"], 2),
            "shaky": False,
        }
        for v in deep
    ]

    overlap = len({v["mut"] for v in table} & {v["mut"] for v in deep_table})

    return {
        "tiers": tiers,
        "naiveTop": table,
        "deepTop": deep_table,
        "deepMinInput": 500,
        "overlapOfTop25": overlap,
    }


def worked_example(rows, wt):
    """
    One variant, every step of the arithmetic shown.

    Chosen for being unremarkable: enough reads to be trustworthy, a fitness
    near but not at the wild type, so none of the numbers are special cases.
    """
    pool = [
        x
        for x in rows
        if "_" not in x["mut"]
        and 800 < x["Input"] < 3000
        and x["IGG20"] > 100
        and x["hd"] == 2
    ]
    pool.sort(key=lambda x: abs((x["IGG20"] / wt["IGG20"]) / (x["Input"] / wt["Input"]) - 0.6))
    v = pool[0]

    var_share_in = v["Input"] / wt["Input"]
    var_share_sel = v["IGG20"] / wt["IGG20"]
    fit = var_share_sel / var_share_in

    return {
        "mut": v["mut"],
        "hd": v["hd"],
        "counts": {
            "variantInput": v["Input"],
            "variantSelected": v["IGG20"],
            "wtInput": wt["Input"],
            "wtSelected": wt["IGG20"],
        },
        "ratioBefore": r(var_share_in, 6),
        "ratioAfter": r(var_share_sel, 6),
        "fitness": r(fit, 4),
        "condition": "IGG20",
    }


def stop_codon_control(rows, wt, min_input):
    """
    Stop-codon variants as a free negative control.

    A truncated GB1 cannot bind IgG, so whatever these score is the floor of
    the assay. Comparing them with full-length variants tells you whether a
    low fitness value means "dead" or just "noisy".
    """
    def fit(x):
        return (x[ "IGG20"] / wt["IGG20"]) / (x["Input"] / wt["Input"])

    usable = [x for x in rows if x["Input"] >= min_input]
    stops = [fit(x) for x in usable if "_" in x["mut"]]
    coding = [fit(x) for x in usable if "_" not in x["mut"]]

    def med(xs):
        s = sorted(xs)
        return s[len(s) // 2]

    def frac_below(xs, t):
        return r(100.0 * sum(1 for v in xs if v < t) / len(xs), 1)

    return {
        "stopN": len(stops),
        "codingN": len(coding),
        "stopMedian": r(med(stops), 5),
        "codingMedian": r(med(coding), 5),
        "stopBelow0_01": frac_below(stops, 0.01),
        "codingBelow0_01": frac_below(coding, 0.01),
        "stopAboveWt": sum(1 for v in stops if v > 1.0),
        "stopAboveWtPct": r(100.0 * sum(1 for v in stops if v > 1.0) / len(stops), 2),
    }


def assay_conditions(variants):
    """
    The same variants, measured against three IgG concentrations.

    "Fitness" is not a fixed property of a protein. It is the result of a
    particular assay run a particular way. Here, low IgG is the stringent
    condition and spreads the strong binders apart; high IgG saturates and
    squashes them together. The ranking largely survives, the numbers do not,
    so any absolute fitness value must be quoted with its condition.
    """
    ranked = sorted(variants, key=lambda v: v["fit_IGG20"], reverse=True)

    def spread(cond):
        vals = sorted(v["fit_" + cond] for v in variants)
        return {
            "condition": cond,
            "max": r(vals[-1], 2),
            "p99": r(vals[int(len(vals) * 0.99)], 2),
            "median": r(vals[len(vals) // 2], 4),
            "aboveWt": sum(1 for x in vals if x > 1.0),
            "aboveWtPct": r(100.0 * sum(1 for x in vals if x > 1.0) / len(vals), 2),
        }

    # Rank agreement between conditions, on the variants measured deeply.
    deep = [v for v in variants if v["Input"] >= 200]
    pairs = [("IGG10", "IGG20"), ("IGG20", "IGG90"), ("IGG10", "IGG90")]
    agreement = [
        {
            "pair": f"{a} vs {b}",
            "r": r(
                pearson(
                    [log_fit(v["fit_" + a]) for v in deep],
                    [log_fit(v["fit_" + b]) for v in deep],
                ),
                3,
            ),
        }
        for a, b in pairs
    ]

    return {
        "spread": [spread(c) for c in SELECTION_CONDITIONS],
        "agreement": agreement,
        "deepN": len(deep),
        "examples": [
            {
                "mut": v["mut"],
                "input": v["Input"],
                "IGG10": r(v["fit_IGG10"], 2),
                "IGG20": r(v["fit_IGG20"], 2),
                "IGG90": r(v["fit_IGG90"], 2),
            }
            for v in ranked[:12]
        ],
        "note": "Low IgG is the stringent condition; high IgG saturates.",
    }


def threshold_sweep(rows, wt):
    """What does the input-count cutoff actually buy you?"""
    out = []
    for t in THRESHOLD_SWEEP:
        variants, _ = compute_fitness(rows, wt, t)
        if len(variants) < 50:
            continue
        rep = reproducibility(variants)
        out.append(
            {
                "threshold": t,
                "variantsKept": len(variants),
                "coveragePct": r(100.0 * len(variants) / (20 ** 4), 2),
                "overallR": rep["overallR"],
                "isPublished": t == PUBLISHED_MIN_INPUT,
            }
        )
    return out


# --------------------------------------------------------------------------

def write(name, payload):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    path.write_text(json.dumps(payload, separators=(",", ":")))
    print(f"  {name:28s} {path.stat().st_size / 1024:8.1f} KB")


def main():
    print("Loading raw counts ...")
    _, rows = load_raw()
    wt = load_wt()
    print(f"  {len(rows):,} rows, wild type {wt['mut']}")

    print("Profiling raw data ...")
    profile = profile_raw(rows, wt)

    print("Filtering and computing fitness ...")
    variants, funnel = compute_fitness(rows, wt, PUBLISHED_MIN_INPUT)
    print(f"  {len(variants):,} variants survived QC")

    print("Sweeping the input-count threshold ...")
    sweep = threshold_sweep(rows, wt)

    print("Analysing ...")
    singles, heatmap = singles_and_heatmap(variants)
    rep = reproducibility(variants)
    epi = epistasis(variants)
    land = landscape_summary(variants)
    curse = winners_curse(variants)
    conds = assay_conditions(variants)
    example = worked_example(rows, wt)
    control = stop_codon_control(rows, wt, PUBLISHED_MIN_INPUT)

    print("Writing ...")
    write("raw-profile.json", profile)
    write("raw-sample.json", build_raw_sample(rows))
    write("funnel.json", {"steps": funnel, "minInput": PUBLISHED_MIN_INPUT})
    write("threshold-sweep.json", sweep)
    write("reproducibility.json", rep)
    write("singles.json", {"singles": singles, "heatmap": heatmap, "aaOrder": AA_ORDER})
    write("epistasis.json", epi)
    write("landscape.json", land)
    write("winners-curse.json", curse)
    write("conditions.json", conds)
    write("worked-example.json", example)
    write("stop-control.json", control)
    write(
        "meta.json",
        {
            "wildType": WT_VARIANT,
            "positions": POSITIONS,
            "conditions": SELECTION_CONDITIONS,
            "minInput": PUBLISHED_MIN_INPUT,
            "source": {
                "paper": "Wu NC, Dai L, Olson CA, Lloyd-Smith JO, Sun R (2016) eLife 5:e16965",
                "doi": "10.7554/eLife.16965",
                "repo": "https://github.com/wchnicholas/ProteinGFourMutants",
                "licence": "CC BY 4.0",
            },
        },
    )
    print("Done.")


if __name__ == "__main__":
    main()
