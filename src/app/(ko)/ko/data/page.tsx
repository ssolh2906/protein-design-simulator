import { DataEn } from "@/content/pages/data";
import { NotTranslated } from "@/components/NotTranslated";

export const metadata = { title: "데이터" };

export default function Page() {
  return (
    <>
      <NotTranslated lang="ko" />
      <DataEn />
    </>
  );
}
