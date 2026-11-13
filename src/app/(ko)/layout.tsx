import type { Metadata } from "next";
import "../globals.css";
import { Nav } from "@/components/Nav";

/** Root layout for the Korean site under /ko/. See (en)/layout.tsx. */
export const metadata: Metadata = {
  title: {
    default: "The GB1 pipeline — 실제 데이터로 하는 protein design 실습",
    template: "%s — The GB1 pipeline",
  },
  description:
    "실제 deep mutational scanning 데이터를 raw sequencing count부터 주문할 variant 후보 목록까지 직접 따라가 봅니다. Wu et al. 2016 (eLife) 기반.",
};

export default function KoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="lg:flex">
          <Nav />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
