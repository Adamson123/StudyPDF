import { createPDFPage } from "@/components/reader/viewer/utils";
import { ViewerContext } from "@/components/reader/viewer/Viewer";
import { useContext } from "react";

export default function useGetPDFTexts() {
  const { pdfData } = useContext(ViewerContext);

  const getPDFTexts = async (range?: { from: number; to: number }) => {
    const defaultRange = range || { from: 1, to: pdfData.numOfPages };
    const pdfPromises: Promise<string>[] = [];
    for (let index = defaultRange.from - 1; index < defaultRange.to; index++) {
      const renderer = async () => {
        const pdfPage = await createPDFPage(pdfData.pdfDocument, index + 1);
        const text = await pdfPage.getTextContent();
        return text.items.map((item: any) => item.str).join("\n");
      };
      pdfPromises.push(renderer());
    }

    const pdfTexts = await Promise.all(pdfPromises);
    return pdfTexts;
  };

  return { getPDFTexts, pdfData };
}
