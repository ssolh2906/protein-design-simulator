import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: {
    default: "The GB1 pipeline — a protein design walkthrough on real data",
    template: "%s — The GB1 pipeline",
  },
  description:
    "Work through a real deep mutational scanning dataset, from raw sequencing counts to a shortlist of protein variants worth ordering. Built on Wu et al. 2016 (eLife).",
};

export default function RootLayout({
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
