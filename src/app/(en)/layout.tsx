import type { Metadata } from "next";
import "../globals.css";
import { Nav } from "@/components/Nav";

/**
 * Root layout for the English site at the domain root.
 *
 * There are two root layouts, one per language, so that each can set the
 * correct `lang` on <html>. That attribute drives screen-reader
 * pronunciation and the browser's font choice for CJK text, so it cannot
 * just be hardcoded to "en" for both. The documented cost is that crossing
 * between the two triggers a full page load, which is fine for a language
 * switch.
 */
export const metadata: Metadata = {
  title: {
    default: "The GB1 pipeline — a protein design walkthrough on real data",
    template: "%s — The GB1 pipeline",
  },
  description:
    "Work through a real deep mutational scanning dataset, from raw sequencing counts to a shortlist of protein variants worth ordering. Built on Wu et al. 2016 (eLife).",
};

export default function EnLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="lg:flex">
          <Nav />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
