import type { NextConfig } from "next";

/**
 * GitHub Pages serves this project from https://<user>.github.io/<repo>/,
 * so every asset and link needs the repo name as a prefix. Local `next dev`
 * serves from the root, so the prefix is applied only when BASE_PATH is set
 * (the Pages workflow sets it).
 */
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Emit a plain HTML/CSS/JS site into ./out — no Node server at runtime.
  output: "export",

  // GitHub Pages has no rewrite rules, so emit /ch/01/index.html rather than
  // /ch/01.html. Without this, deep links 404 on refresh.
  trailingSlash: true,

  basePath,

  // next/image optimisation needs a server; static export must opt out.
  images: { unoptimized: true },

  // Exposed to client components that build URLs to files in /public.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
