import type { Metadata } from "next";
import { CHAPTERS } from "@/lib/chapters";
import { CHAPTER_COPY } from "@/lib/i18n";
import { ChapterFrame } from "@/components/ChapterFrame";

// Static export needs the full list of pages up front, and nothing outside
// it should resolve.
export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const copy = CHAPTER_COPY.en[slug];
  return { title: copy.title, description: copy.summary };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ChapterFrame slug={slug} lang="en" />;
}
