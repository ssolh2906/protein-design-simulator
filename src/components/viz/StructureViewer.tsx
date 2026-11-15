"use client";

import { useEffect, useRef, useState } from "react";
import type { StructureModel } from "@/lib/data";

/**
 * A small protein structure viewer, written by hand.
 *
 * The rest of this repository draws its charts as plain SVG with no charting
 * library, and this follows the same rule: no 3D engine, no WebGL, no viewer
 * bundle. It is a CA trace, a rotation matrix and a 2D canvas, which is all a
 * backbone cartoon actually needs and costs nothing to ship.
 *
 * What it draws
 * -------------
 * The alpha-carbon trace is smoothed with a Catmull-Rom spline, split into
 * short segments, sorted back-to-front and drawn with depth cueing: far
 * segments are thinner and fade toward the page colour. That is enough to
 * read as three-dimensional without lighting or shading.
 *
 * Secondary structure comes from the PDB's own HELIX and SHEET records, so
 * the helix and the strands are drawn thicker than the loops rather than
 * being guessed from geometry.
 *
 * Colours are read from the CSS custom properties at runtime, so the viewer
 * follows light and dark mode, and re-reads them when the theme changes.
 */

export type Site = {
  resi: number;
  aa: string;
  label?: string;
  /** CSS custom property for this marker, e.g. "--div-neg-3". */
  color?: string;
};

/** A measured distance drawn between two marked residues. */
export type Link = { a: number; b: number; label?: string };

type Pt = [number, number, number];

/* ------------------------------------------------------------------ colour */

/** Parse #rgb, #rrggbb, rgb() and rgba() into [r,g,b]. */
function parseColor(css: string): [number, number, number] {
  const s = css.trim();
  if (s.startsWith("#")) {
    const h = s.slice(1);
    if (h.length === 3) {
      return [
        parseInt(h[0] + h[0], 16),
        parseInt(h[1] + h[1], 16),
        parseInt(h[2] + h[2], 16),
      ];
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  const m = s.match(/-?\d+\.?\d*/g);
  if (m && m.length >= 3) return [+m[0], +m[1], +m[2]];
  return [128, 128, 128];
}

const mix = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): string =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(
    a[1] + (b[1] - a[1]) * t,
  )},${Math.round(a[2] + (b[2] - a[2]) * t)})`;

/* ------------------------------------------------------------------ spline */

/**
 * Catmull-Rom through the CA atoms.
 *
 * Straight lines between alpha carbons look like a folded drinking straw. The
 * spline costs a few multiplications per point and makes the fold legible.
 */
function smooth(pts: Pt[], perSegment: number): { p: Pt; i: number }[] {
  if (pts.length < 2) return pts.map((p, i) => ({ p, i }));
  const out: { p: Pt; i: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const q: Pt = [0, 0, 0];
      for (let d = 0; d < 3; d++) {
        q[d] =
          0.5 *
          (2 * p1[d] +
            (-p0[d] + p2[d]) * t +
            (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 +
            (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3);
      }
      // Carry the index of the residue this point belongs to, so the segment
      // can be coloured and sized by that residue's secondary structure.
      out.push({ p: q, i: t < 0.5 ? i : i + 1 });
    }
  }
  out.push({ p: pts[pts.length - 1], i: pts.length - 1 });
  return out;
}

/* ------------------------------------------------------------------ viewer */

export function StructureViewer({
  model,
  roleColors,
  sites = [],
  links = [],
  height = 300,
  autoRotate = true,
  spin = 0.3,
  initialYaw = 0.6,
  initialPitch = -0.25,
  label,
  onSiteHover,
}: {
  model: StructureModel;
  /** Chain role -> CSS custom property name, e.g. { gb1: "--series-1" }. */
  roleColors: Record<string, string>;
  /** Residues to mark with a sphere. Applied to the first chain only. */
  sites?: Site[];
  /** Dashed connectors between marked residues, for showing a distance. */
  links?: Link[];
  height?: number;
  autoRotate?: boolean;
  /** Radians per second. */
  spin?: number;
  initialYaw?: number;
  initialPitch?: number;
  /** Describes the picture for screen readers. */
  label: string;
  onSiteHover?: (resi: number | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // Camera and interaction live in refs: they change every frame and must not
  // trigger React renders.
  const yaw = useRef(initialYaw);
  const pitch = useRef(initialPitch);
  const dragging = useRef(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const paused = useRef(false);
  const themeTick = useRef(0);

  // The draw loop reads the hover through a ref. Putting it in the effect's
  // dependencies would tear down the canvas, its observers and its listeners
  // every time the pointer crossed a marker.
  const hovered = useRef<number | null>(null);
  const onHover = useRef(onSiteHover);

  const [reduced, setReduced] = useState(false);

  // Object props would be a fresh identity on every parent render. Comparing
  // them by value keeps the effect from rebuilding the canvas for no reason.
  // The draw loop runs on requestAnimationFrame, so a ref is picked up on the
  // next frame without any React render at all.
  const sitesKey = JSON.stringify(sites);
  const rolesKey = JSON.stringify(roleColors);
  const linksKey = JSON.stringify(links);
  const modelRef = useRef(model);

  // Kept in sync in an effect rather than during render: the draw loop reads
  // these outside React, and writing a ref while rendering is a lint error
  // for good reason -- it makes the render impure.
  useEffect(() => {
    onHover.current = onSiteHover;
    modelRef.current = model;
  }, [onSiteHover, model]);

  // Respect the reader's motion preference, and follow it if it changes.
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  // Re-read the CSS custom properties when the theme changes.
  useEffect(() => {
    const bump = () => {
      themeTick.current += 1;
    };
    const obs = new MutationObserver(bump);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    m.addEventListener("change", bump);
    return () => {
      obs.disconnect();
      m.removeEventListener("change", bump);
    };
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    const box = wrap.current;
    if (!cv || !box) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    /* --- geometry, computed once per model ----------------------------- */

    const reportHover = (resi: number | null) => {
      if (hovered.current === resi) return;
      hovered.current = resi;
      onHover.current?.(resi);
    };

    const model = modelRef.current;
    const stableSites: Site[] = JSON.parse(sitesKey);
    const stableRoles: Record<string, string> = JSON.parse(rolesKey);
    const stableLinks: Link[] = JSON.parse(linksKey);

    const traces = model.chains.map((c) => ({
      role: c.role,
      ss: c.ss,
      resi: c.resi,
      pts: smooth(c.ca as Pt[], 6),
    }));

    const siteIndex = new Map<number, number>();
    model.chains[0]?.resi.forEach((r, i) => siteIndex.set(r, i));
    const markers = stableSites
      .map((s) => ({ ...s, idx: siteIndex.get(s.resi) }))
      .filter((s): s is Site & { idx: number } => s.idx !== undefined)
      .map((s) => ({ ...s, xyz: model.chains[0].ca[s.idx] as Pt }));

    const byResi = new Map(markers.map((m) => [m.resi, m]));
    const connectors = stableLinks
      .map((l) => ({ ...l, p: byResi.get(l.a), q: byResi.get(l.b) }))
      .filter((l) => l.p && l.q);

    /* --- per-frame state ------------------------------------------------ */

    let raf = 0;
    let last = performance.now();
    let w = 0;
    let h = 0;
    let dpr = 1;

    let colors: {
      role: Record<string, [number, number, number]>;
      bg: [number, number, number];
      ink: [number, number, number];
      halo: [number, number, number];
    } | null = null;
    let colorTick = -1;

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      // Callers pass either a bare custom property ("--series-1") or the
      // wrapped form that the chart helpers return ("var(--div-neg-3)").
      const get = (v: string) => {
        const name = v.startsWith("var(") ? v.slice(4, -1).trim() : v;
        return parseColor(cs.getPropertyValue(name) || "#888");
      };
      colors = {
        role: Object.fromEntries([
          ...Object.entries(stableRoles).map(([k, v]) => [k, get(v)]),
          // Sites may each carry their own token, e.g. a fitness colour.
          ...stableSites
            .filter((x) => x.color)
            .map((x) => [x.color as string, get(x.color as string)]),
        ]),
        bg: get("--surface"),
        ink: get("--ink"),
        halo: get("--surface-raised"),
      };
      colorTick = themeTick.current;
    };

    const resize = () => {
      const rect = box.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(rect.width, 1);
      h = height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    /* --- the frame ------------------------------------------------------ */

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (colorTick !== themeTick.current || !colors) readColors();
      const col = colors!;

      if (autoRotate && !reduced && !dragging.current && !paused.current) {
        yaw.current += spin * dt;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cy = Math.cos(yaw.current);
      const sy = Math.sin(yaw.current);
      const cp = Math.cos(pitch.current);
      const sp = Math.sin(pitch.current);

      const pad = 14;
      const scale = (Math.min(w, h) / 2 - pad) / model.extent;
      const camera = model.extent * 3.2;

      const project = (p: Pt) => {
        const x1 = p[0] * cy + p[2] * sy;
        const z1 = -p[0] * sy + p[2] * cy;
        const y2 = p[1] * cp - z1 * sp;
        const z2 = p[1] * sp + z1 * cp;
        // Weak perspective: enough to tell front from back, not enough to
        // distort a small domain.
        const f = camera / (camera - z2);
        return {
          x: w / 2 + x1 * scale * f,
          y: h / 2 - y2 * scale * f,
          z: z2,
        };
      };

      // Build every drawable, then sort the whole set by depth. Painting
      // back-to-front is what makes the fold read as solid.
      type Seg = {
        z: number;
        kind: "tube" | "site" | "link";
        a?: { x: number; y: number };
        b?: { x: number; y: number };
        width?: number;
        color: [number, number, number];
        site?: (typeof markers)[number];
        x?: number;
        y?: number;
        text?: string;
      };
      const segs: Seg[] = [];

      for (const tr of traces) {
        const base = col.role[tr.role] ?? col.role[Object.keys(col.role)[0]];
        const proj = tr.pts.map((q) => ({ ...project(q.p), i: q.i }));
        for (let k = 0; k < proj.length - 1; k++) {
          const a = proj[k];
          const b = proj[k + 1];
          const ss = tr.ss[a.i] ?? "C";
          segs.push({
            z: (a.z + b.z) / 2,
            kind: "tube",
            a,
            b,
            // Helix and sheet are the structured parts; drawing them heavier
            // than the loops is the whole visual grammar of a cartoon.
            width: ss === "H" ? 7 : ss === "E" ? 5.5 : 3,
            color: base,
          });
        }
      }

      // Connectors sit behind their markers but in front of the backbone
      // they cross, which is what depth sorting already gives us.
      for (const l of connectors) {
        const a = project(l.p!.xyz);
        const b = project(l.q!.xyz);
        segs.push({
          z: (a.z + b.z) / 2,
          kind: "link",
          a,
          b,
          color: col.ink,
          text: l.label,
        });
      }

      for (const mk of markers) {
        const p = project(mk.xyz);
        segs.push({ z: p.z, kind: "site", x: p.x, y: p.y, color: col.ink, site: mk });
      }

      segs.sort((a, b) => a.z - b.z);

      const fog = (z: number) => {
        // 0 at the front, ~0.62 at the back.
        const t = (z + model.extent) / (2 * model.extent);
        return 0.62 * (1 - Math.max(0, Math.min(1, t)));
      };

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const chips: {
        x: number;
        y: number;
        dx: number;
        dy: number;
        z: number;
        text: string;
      }[] = [];

      for (const s of segs) {
        const f = fog(s.z);
        if (s.kind === "link" && s.a && s.b) {
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = mix(s.color, col.bg, 0.35 + f * 0.3);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(s.a.x, s.a.y);
          ctx.lineTo(s.b.x, s.b.y);
          ctx.stroke();
          ctx.restore();
          if (s.text) {
            // Drawn in the top pass, below. Two residues close enough to
            // interact are also close enough that their markers would cover
            // a chip placed at the midpoint between them.
            chips.push({
              x: (s.a.x + s.b.x) / 2,
              y: (s.a.y + s.b.y) / 2,
              dx: s.b.x - s.a.x,
              dy: s.b.y - s.a.y,
              z: s.z,
              text: s.text,
            });
          }
          continue;
        }
        if (s.kind === "tube" && s.a && s.b) {
          ctx.strokeStyle = mix(s.color, col.bg, f);
          ctx.lineWidth = (s.width ?? 3) * (1 - f * 0.45);
          ctx.beginPath();
          ctx.moveTo(s.a.x, s.a.y);
          ctx.lineTo(s.b.x, s.b.y);
          ctx.stroke();
        }
      }

      // Site markers go on top of the tube they sit on, but still in depth
      // order relative to each other.
      const labelled: { x: number; y: number; z: number; text: string }[] = [];
      for (const s of segs) {
        if (s.kind !== "site" || !s.site || s.x === undefined || s.y === undefined)
          continue;
        const f = fog(s.z);
        const on = hovered.current === s.site.resi;
        const r = (on ? 9 : 6.5) * (1 - f * 0.3);

        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 2.5, 0, Math.PI * 2);
        ctx.fillStyle = mix(col.halo, col.bg, f);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        const dot =
          (s.site.color ? col.role[s.site.color] : undefined) ??
          col.role.site ??
          col.ink;
        ctx.fillStyle = mix(dot, col.bg, f * 0.8);
        ctx.fill();

        labelled.push({
          x: s.x,
          y: s.y,
          z: s.z,
          text: s.site.label ?? `${s.site.aa}${s.site.resi}`,
        });
      }

      // Distance chips, offset off the line they measure so the markers at
      // both ends cannot hide them.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif';
      for (const c of chips) {
        const len = Math.hypot(c.dx, c.dy);
        // Perpendicular to the connector, or straight up when the two ends
        // are nearly on top of each other and there is no direction to take.
        const [ux, uy] = len < 2 ? [0, -1] : [-c.dy / len, c.dx / len];
        const x = c.x + ux * 20;
        const y = c.y + uy * 20;
        const f = fog(c.z);

        ctx.strokeStyle = mix(col.ink, col.bg, 0.6);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        const tw = ctx.measureText(c.text).width + 10;
        ctx.fillStyle = mix(col.halo, col.bg, f * 0.4);
        ctx.strokeStyle = mix(col.ink, col.bg, 0.8);
        ctx.beginPath();
        ctx.roundRect(x - tw / 2, y - 9, tw, 18, 9);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = mix(col.ink, col.bg, f * 0.4);
        ctx.fillText(c.text, x, y);
      }
      ctx.textAlign = "left";

      // Labels last, so no geometry can cover them. Adjacent residues put
      // their markers within a few pixels of each other -- V39, D40 and G41
      // are consecutive -- so nudge any label that would land on top of the
      // one before it.
      ctx.font =
        '600 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.textBaseline = "middle";
      const placed: { x: number; y: number }[] = [];
      for (const l of [...labelled].sort((a, b) => a.y - b.y)) {
        let ly = l.y - 10;
        for (const q of placed) {
          if (Math.abs(q.x - (l.x + 11)) < 34 && Math.abs(q.y - ly) < 13) {
            ly = q.y + 13;
          }
        }
        placed.push({ x: l.x + 11, y: ly });
        const f = fog(l.z);
        // A short leader, so a nudged label still points at its marker.
        ctx.strokeStyle = mix(col.ink, col.bg, 0.55 + f * 0.3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(l.x + 4, l.y - 4);
        ctx.lineTo(l.x + 9, ly);
        ctx.stroke();
        ctx.fillStyle = mix(col.ink, col.bg, f * 0.75);
        ctx.fillText(l.text, l.x + 11, ly);
      }

      // Pointer hit test against the marker positions, in screen space.
      if (pointer.current && markers.length) {
        let best: { resi: number; d: number } | null = null;
        for (const s of segs) {
          if (s.kind !== "site" || !s.site || s.x === undefined || s.y === undefined)
            continue;
          const d = Math.hypot(s.x - pointer.current.x, s.y - pointer.current.y);
          if (d < 16 && (!best || d < best.d)) best = { resi: s.site.resi, d };
        }
        reportHover(best?.resi ?? null);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    /* --- interaction ---------------------------------------------------- */

    const local = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      lastPointer.current = local(e);
      cv.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      pointer.current = p;
      if (dragging.current && lastPointer.current) {
        yaw.current += (p.x - lastPointer.current.x) * 0.01;
        pitch.current = Math.max(
          -1.3,
          Math.min(1.3, pitch.current + (p.y - lastPointer.current.y) * 0.01),
        );
        lastPointer.current = p;
      }
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      lastPointer.current = null;
      if (cv.hasPointerCapture(e.pointerId)) cv.releasePointerCapture(e.pointerId);
    };
    const onEnter = () => {
      paused.current = true;
    };
    const onLeave = () => {
      paused.current = false;
      pointer.current = null;
      reportHover(null);
    };

    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("pointerenter", onEnter);
    cv.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      cv.removeEventListener("pointerenter", onEnter);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, [model.pdb, sitesKey, rolesKey, linksKey, height, autoRotate, spin, reduced]);

  return (
    <div ref={wrap} className="relative w-full">
      <canvas
        ref={canvas}
        role="img"
        aria-label={label}
        className="block w-full cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ height }}
      />
    </div>
  );
}
