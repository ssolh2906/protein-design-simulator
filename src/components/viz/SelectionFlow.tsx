"use client";

import { usePhases, PhaseButtons, PhaseCaption } from "./phases";

/**
 * The selection, as a picture.
 *
 * Four stations, one population. The point it has to land is that nobody
 * measured any single protein: the library is pooled, the selection removes
 * the ones that do not bind, and sequencing counts what is left. The change
 * in composition between station 2 and station 4 *is* the measurement.
 *
 * It runs itself but it is not a video. The reader can click any station to
 * go there, and the whole thing holds still for anyone who asked their
 * system for reduced motion.
 */

/** 28 variants, of which 8 bind. Fixed, not random, so the picture is stable. */
const BINDERS = new Set([2, 5, 9, 12, 16, 19, 23, 26]);
const COUNT = 28;
const COLS = 7;

/** Jitter for the "freshly synthesised, nothing is ordered yet" state. */
const JITTER = Array.from({ length: COUNT }, (_, i) => {
  // A cheap deterministic hash, so the server and the client agree and the
  // layout does not jump on hydration.
  const h = Math.sin(i * 12.9898) * 43758.5453;
  const g = Math.sin(i * 78.233) * 24634.6345;
  return [(h - Math.floor(h) - 0.5) * 16, (g - Math.floor(g) - 0.5) * 14];
});

export function SelectionFlow({
  stations,
  label,
  caption,
  readout,
}: {
  /** Four short labels, under the track. */
  stations: [string, string, string, string];
  /** Describes the whole figure for screen readers. */
  label: string;
  /** One line per phase, shown under the picture. */
  caption: [string, string, string, string];
  /** Labels for the two count badges. */
  readout: { before: string; after: string; binds: string; washed: string };
}) {
  const { phase, pick } = usePhases(4);

  const W = 340;
  const gridX = (i: number) => 92 + (i % COLS) * 26;
  const gridY = (i: number) => 24 + Math.floor(i / COLS) * 22;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} 146`}
        className="w-full"
        role="img"
        aria-label={label}
      >
        {/* the population */}
        {Array.from({ length: COUNT }, (_, i) => {
          const binds = BINDERS.has(i);
          const washed = phase >= 2 && !binds;

          // Phase 0: jittered, because nothing has been sorted yet.
          const jx = phase === 0 ? JITTER[i][0] : 0;
          const jy = phase === 0 ? JITTER[i][1] : 0;

          // Phase 3: the survivors close ranks, which is what enrichment
          // looks like in a count table.
          let x = gridX(i) + jx;
          const y = gridY(i) + jy;
          if (phase === 3 && binds) {
            const rank = [...BINDERS].sort((a, b) => a - b).indexOf(i);
            x = 118 + rank * 14;
          }

          return (
            <circle
              key={i}
              cx={x}
              cy={phase === 3 && binds ? 46 : y}
              r={washed ? 2 : binds && phase >= 2 ? 6 : 5}
              className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
                washed
                  ? "fill-[var(--grid)] opacity-25"
                  : binds
                    ? "fill-[var(--series-1)]"
                    : "fill-[var(--ink-muted)] opacity-70"
              }`}
              style={{ transitionDelay: `${(i % COLS) * 35}ms` }}
            />
          );
        })}

        {/* count badges: the only numbers the reader needs here are "most"
            and "few", so the bars are deliberately unlabelled by value */}
        <g className="transition-opacity duration-500" opacity={phase >= 1 ? 1 : 0}>
          <text x="20" y="34" className="fill-[var(--ink-muted)]" fontSize="9">
            {readout.before}
          </text>
          <rect x="20" y="40" width="56" height="7" rx="3.5" className="fill-[var(--ink-muted)] opacity-40" />
          <rect x="20" y="40" width="16" height="7" rx="3.5" className="fill-[var(--series-1)]" />
        </g>

        <g
          className="transition-opacity duration-500"
          opacity={phase === 3 ? 1 : 0}
        >
          <text x="20" y="66" className="fill-[var(--ink-muted)]" fontSize="9">
            {readout.after}
          </text>
          <rect x="20" y="72" width="56" height="7" rx="3.5" className="fill-[var(--ink-muted)] opacity-40" />
          <rect x="20" y="72" width="44" height="7" rx="3.5" className="fill-[var(--series-1)]" />
        </g>

        {/* the IgG bait, present only while selection is happening */}
        <g
          className="transition-opacity duration-500"
          opacity={phase === 2 ? 1 : 0}
        >
          <rect
            x="88"
            y="14"
            width="240"
            height="78"
            rx="8"
            fill="none"
            strokeDasharray="4 3"
            className="stroke-[var(--series-1)] opacity-50"
          />
          <text
            x="208"
            y="104"
            textAnchor="middle"
            fontSize="9"
            className="fill-[var(--series-1)]"
          >
            {readout.binds}
          </text>
        </g>

        {/* the track */}
        <line
          x1="24"
          y1="130"
          x2={W - 24}
          y2="130"
          strokeWidth="2"
          className="stroke-[var(--grid)]"
        />
        {stations.map((s, n) => {
          const cx = 24 + n * ((W - 48) / 3);
          const active = n === phase;
          const done = n < phase;
          return (
            <g key={s}>
              <circle
                cx={cx}
                cy="130"
                r="9"
                strokeWidth="1.5"
                className={`transition-[fill,stroke] duration-300 motion-reduce:transition-none ${
                  active
                    ? "fill-[var(--series-1)] stroke-[var(--series-1)]"
                    : done
                      ? "fill-[var(--surface)] stroke-[var(--series-1)]"
                      : "fill-[var(--surface)] stroke-[var(--grid)]"
                }`}
              />
              <text
                x={cx}
                y="134"
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                className={
                  active ? "fill-[var(--surface)]" : "fill-[var(--ink-muted)]"
                }
              >
                {n + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <PhaseButtons labels={stations} phase={phase} onPick={pick} />
      <PhaseCaption text={caption[phase]} />
    </div>
  );
}
