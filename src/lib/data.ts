import fs from "node:fs";
import path from "node:path";

/**
 * Data loading for the tutorial.
 *
 * Everything is read from disk at build time inside server components, so the
 * exported site makes no network requests for its data and nothing depends on
 * the GitHub Pages base path. The JSON is produced by pipeline/build_data.py.
 */

const DATA_DIR = path.join(process.cwd(), "public", "data");

function read<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8")) as T;
}

// --- shapes -------------------------------------------------------------

export type Pathology = {
  id: string;
  label: string;
  count: number;
  pct: number;
  why: string;
};

export type RawProfile = {
  rowsInFile: number;
  designedSpace: number;
  spaceWithStops: number;
  rowsWithStopCodon: number;
  rowsCodingOnly: number;
  neverObserved: number;
  neverObservedPct: number;
  libraryTotals: Record<string, number>;
  depthImbalance: { deepest: string; shallowest: string; ratio: number };
  inputCount: {
    min: number;
    p25: number;
    median: number;
    p75: number;
    max: number;
    mean: number;
  };
  pathologies: Pathology[];
  hammingDistribution: { hd: number; observed: number; possible: number }[];
  wildType: Record<string, string | number>;
};

export type RawRow = {
  mut: string;
  hd: number;
  Input: number;
  IGG10: number;
  IGG20: number;
  IGG90: number;
  flag: string;
};

export type FunnelStep = {
  step: string;
  kept: number;
  removed: number;
  why?: string;
  forced?: boolean;
};

export type SweepPoint = {
  threshold: number;
  variantsKept: number;
  coveragePct: number;
  overallR: number;
  isPublished: boolean;
};

export type Reproducibility = {
  overallR: number;
  n: number;
  byDepth: { bin: string; n: number; r: number }[];
  scatter: { x: number; y: number; bin: string }[];
  axisLabel: string;
};

export type HeatmapRow = {
  position: number;
  wt: string;
  cells: {
    aa: string;
    isWt: boolean;
    fitness: number | null;
    input: number | null;
  }[];
};

export type Single = {
  mut: string;
  position: number;
  from: string;
  to: string;
  label: string;
  fitness: number;
  input: number;
};

export type Epistasis = {
  n: number;
  positive: EpistasisPair[];
  negative: EpistasisPair[];
  scatter: { x: number; y: number }[];
};

export type EpistasisPair = {
  mut: string;
  label: string;
  expected: number;
  observed: number;
  ratio: number;
  input: number;
};

export type Landscape = {
  n: number;
  betterThanWt: number;
  betterThanWtPct: number;
  effectivelyDead: number;
  effectivelyDeadPct: number;
  top: { mut: string; hd: number; fitness: number; input: number }[];
  histogram: { logFitness: number; count: number }[];
};

export type HitRow = {
  mut: string;
  input: number;
  igg20: number;
  igg10: number;
  igg90: number;
  shaky: boolean;
};

export type WinnersCurse = {
  tiers: {
    tier: string;
    n: number;
    medianInput: number;
    medianInputAll: number;
    lowCoverage: number;
    confirmedInBoth: number;
    confirmedPct: number;
    medianFitness: number;
  }[];
  naiveTop: HitRow[];
  deepTop: HitRow[];
  deepMinInput: number;
  overlapOfTop25: number;
};

export type Conditions = {
  spread: {
    condition: string;
    max: number;
    p99: number;
    median: number;
    aboveWt: number;
    aboveWtPct: number;
  }[];
  agreement: { pair: string; r: number }[];
  deepN: number;
  examples: Record<string, string | number>[];
  note: string;
};

export type Meta = {
  wildType: string;
  positions: number[];
  conditions: string[];
  minInput: number;
  source: {
    paper: string;
    doi: string;
    repo: string;
    licence: string;
  };
};

// --- loaders ------------------------------------------------------------

export const getRawProfile = () => read<RawProfile>("raw-profile.json");
export const getRawSample = () => read<RawRow[]>("raw-sample.json");
export const getFunnel = () =>
  read<{ steps: FunnelStep[]; minInput: number }>("funnel.json");
export const getSweep = () => read<SweepPoint[]>("threshold-sweep.json");
export const getReproducibility = () =>
  read<Reproducibility>("reproducibility.json");
export const getSingles = () =>
  read<{ singles: Single[]; heatmap: HeatmapRow[]; aaOrder: string }>(
    "singles.json",
  );
export const getEpistasis = () => read<Epistasis>("epistasis.json");
export const getLandscape = () => read<Landscape>("landscape.json");
export const getWinnersCurse = () => read<WinnersCurse>("winners-curse.json");
export const getConditions = () => read<Conditions>("conditions.json");
export const getMeta = () => read<Meta>("meta.json");

// --- formatting helpers -------------------------------------------------

export const fmt = (n: number) => n.toLocaleString("en-US");

export const pct = (n: number) => `${n.toFixed(n < 10 ? 2 : 1)}%`;
