"use client";

import { useState } from "react";
import { StructureViewer, type Site, type Link } from "./StructureViewer";
import type { StructureModel } from "@/lib/data";

/**
 * The two ways the structure is used in chapter 1.
 *
 * `StructureSwitch` answers "what does binding mean?" by putting the domain
 * next to the antibody it binds. `FourSites` answers "are these four
 * residues really neighbours?" by marking them in the fold and, at the same
 * time, on the sequence, where three of them are adjacent and one is not.
 *
 * Both own only the hover state. The geometry all comes from the pipeline.
 */

const HINT_STYLE =
  "mt-2 text-[11px] text-[var(--ink-muted)] motion-reduce:hidden";

/* -------------------------------------------------------------- two views */

export function StructureSwitch({
  alone,
  bound,
  labels,
  height = 330,
}: {
  alone: StructureModel;
  bound: StructureModel;
  labels: {
    alone: string;
    bound: string;
    hint: string;
    ariaAlone: string;
    ariaBound: string;
    legendDomain: string;
    legendIgg: string;
  };
  height?: number;
}) {
  const [showBound, setShowBound] = useState(false);
  const model = showBound ? bound : alone;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[
          { on: false, text: labels.alone },
          { on: true, text: labels.bound },
        ].map((b) => (
          <button
            key={b.text}
            type="button"
            onClick={() => setShowBound(b.on)}
            aria-pressed={showBound === b.on}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              showBound === b.on
                ? "bg-[var(--ink)] text-[var(--surface)]"
                : "text-[var(--ink-muted)] ring-1 ring-[var(--border)] ring-inset hover:bg-[var(--page)]"
            }`}
          >
            {b.text}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[420px]">
      <StructureViewer
        model={model}
        height={height}
        // The complex is much bigger than the domain, so it turns more slowly
        // to stay readable.
        spin={showBound ? 0.18 : 0.3}
        roleColors={{
          gb1: "--series-1",
          domain: "--series-1",
          igg: "--ink-muted",
          site: "--series-2",
        }}
        label={showBound ? labels.ariaBound : labels.ariaAlone}
      />
      </div>

      {showBound && (
        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-[var(--ink-muted)]">
          <Swatch color="var(--series-1)" text={labels.legendDomain} />
          <Swatch color="var(--ink-muted)" text={labels.legendIgg} />
        </div>
      )}

      <p className={HINT_STYLE}>{labels.hint}</p>
    </div>
  );
}

function Swatch({ color, text }: { color: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-4 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      {text}
    </span>
  );
}

/* ------------------------------------------------------------ four sites */

export function FourSites({
  model,
  sites,
  labels,
  height = 330,
}: {
  model: StructureModel;
  sites: Site[];
  labels: {
    hint: string;
    aria: string;
    ariaRuler: string;
    helix: string;
    strand: string;
    loop: string;
  };
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const chain = model.chains[0];

  return (
    <div>
      <div className="mx-auto w-full max-w-[420px]">
        <StructureViewer
          model={model}
          sites={sites}
          height={height}
          roleColors={{ gb1: "--series-1", site: "--series-2" }}
          label={labels.aria}
          onSiteHover={setHovered}
        />
      </div>
      <p className={HINT_STYLE}>{labels.hint}</p>

      <SequenceRuler
        ss={chain.ss}
        resi={chain.resi}
        sites={sites}
        hovered={hovered}
        onHover={setHovered}
        labels={labels}
      />
    </div>
  );
}

/**
 * The same four positions, drawn along the sequence instead of in space.
 *
 * This is the half of the picture that makes the point: 39, 40 and 41 are
 * neighbours here too, but 54 is thirteen residues away and still packs
 * against them once the chain folds.
 */
function SequenceRuler({
  ss,
  resi,
  sites,
  hovered,
  onHover,
  labels,
}: {
  ss: string;
  resi: number[];
  sites: Site[];
  hovered: number | null;
  onHover: (r: number | null) => void;
  labels: { ariaRuler: string; helix: string; strand: string; loop: string };
}) {
  const W = 340;
  const x0 = 14;
  const x1 = W - 14;
  const n = resi.length;
  const at = (i: number) => x0 + ((x1 - x0) * i) / (n - 1);

  // Collapse the per-residue string into runs, so the ruler draws a handful
  // of boxes rather than 56 of them.
  const runs: { start: number; end: number; kind: string }[] = [];
  for (let i = 0; i < ss.length; i++) {
    const last = runs[runs.length - 1];
    if (last && last.kind === ss[i]) last.end = i;
    else runs.push({ start: i, end: i, kind: ss[i] });
  }

  // Positions that are a few residues apart are only a few pixels apart on a
  // 56-residue ruler, so one label each would overlap however they are
  // stacked. Group them instead and label the group once, which is both
  // readable and the truer picture: V39, D40 and G41 are a block.
  const clusters: Site[][] = [];
  for (const s of sites) {
    const open = clusters[clusters.length - 1];
    const prev = open?.[open.length - 1];
    if (open && prev && at(resi.indexOf(s.resi)) - at(resi.indexOf(prev.resi)) < 30)
      open.push(s);
    else clusters.push([s]);
  }

  const height = (k: string) => (k === "H" ? 13 : k === "E" ? 10 : 4);
  const fill = (k: string) =>
    k === "H"
      ? "var(--depth-4)"
      : k === "E"
        ? "var(--depth-2)"
        : "var(--grid)";

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${W} 66`} className="w-full" role="img" aria-label={labels.ariaRuler}>
        {runs.map((r) => (
          <rect
            key={r.start}
            x={at(r.start)}
            y={22 - height(r.kind) / 2}
            width={Math.max(at(r.end) - at(r.start), 1.5)}
            height={height(r.kind)}
            rx={2}
            fill={fill(r.kind)}
          />
        ))}

        {clusters.map((group) => {
          const xs = group.map((s) => at(resi.indexOf(s.resi)));
          const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
          return (
            <g key={group[0].resi} className="cursor-default">
              {group.map((s, k) => (
                <line
                  key={s.resi}
                  x1={xs[k]}
                  y1={10}
                  x2={xs[k]}
                  y2={34}
                  strokeWidth={hovered === s.resi ? 3 : 1.5}
                  stroke="var(--series-2)"
                />
              ))}
              {group.map((s, k) => (
                <circle
                  key={s.resi}
                  cx={xs[k]}
                  cy={38}
                  r={hovered === s.resi ? 5 : 3.5}
                  fill="var(--series-2)"
                />
              ))}

              <text
                x={mid}
                y={56}
                textAnchor="middle"
                fontSize="10"
                fill="var(--ink-secondary)"
                className="font-mono"
              >
                {group.map((s, k) => (
                  <tspan
                    key={s.resi}
                    dx={k ? 5 : 0}
                    fontWeight={hovered === s.resi ? 700 : 500}
                    fill={
                      hovered === s.resi ? "var(--ink)" : "var(--ink-secondary)"
                    }
                    onPointerEnter={() => onHover(s.resi)}
                    onPointerLeave={() => onHover(null)}
                  >
                    {s.aa}
                    {s.resi}
                  </tspan>
                ))}
              </text>

              {/* a generous invisible target over each tick */}
              {group.map((s, k) => (
                <rect
                  key={s.resi}
                  x={xs[k] - 7}
                  y={6}
                  width={14}
                  height={38}
                  fill="transparent"
                  onPointerEnter={() => onHover(s.resi)}
                  onPointerLeave={() => onHover(null)}
                />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex flex-wrap gap-4 text-[11px] text-[var(--ink-muted)]">
        <Swatch color="var(--depth-4)" text={labels.helix} />
        <Swatch color="var(--depth-2)" text={labels.strand} />
        <Swatch color="var(--grid)" text={labels.loop} />
      </div>
    </div>
  );
}

/* ------------------------------------------------- marked sites, no ruler */

/**
 * The fold with specific residues called out, for the later chapters.
 *
 * Chapter 7 uses it to colour the four positions by how much mutation each
 * one tolerates; chapter 8 uses it to put a measured distance between the
 * two residues of an epistatic pair. In both cases the job is the same: give
 * a number from the count table somewhere physical to live.
 */
export function StructureSites({
  model,
  sites,
  links,
  labels,
  height = 300,
}: {
  model: StructureModel;
  sites: Site[];
  links?: Link[];
  labels: { hint: string; aria: string };
  height?: number;
}) {
  return (
    <div>
      <div className="mx-auto w-full max-w-[420px]">
        <StructureViewer
          model={model}
          sites={sites}
          links={links}
          height={height}
          roleColors={{ gb1: "--series-1", site: "--series-2" }}
          label={labels.aria}
        />
      </div>
      <p className={HINT_STYLE}>{labels.hint}</p>
    </div>
  );
}
