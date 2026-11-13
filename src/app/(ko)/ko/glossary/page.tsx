import { GlossaryEn } from "@/content/pages/glossary";
import { NotTranslated } from "@/components/NotTranslated";

export const metadata = { title: "용어집" };

export default function Page() {
  return (
    <>
      <NotTranslated lang="ko" />
      <GlossaryEn />
    </>
  );
}
