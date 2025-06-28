import {
  createPDFPage,
  getPDFDocument,
} from "../components/reader/viewer/utils";

export const splitTexts = (pdfString: string[], chunkSize = 30000) => {
  const chunks: string[] = [];
  let chunk = "";

  for (let para of pdfString) {
    if ((chunk + para).length > chunkSize) {
      chunks.push(chunk);
      chunk = "";
    }
    chunk += para + "\n";
  }
  if (chunk) chunks.push(chunk);
  return chunks;
};

export const getPDFTexts = async (
  pdfURL: string,
  range?: { from: number; to: number },
) => {
  const pdfDocument = await getPDFDocument(pdfURL);
  const defaultRange = range || { from: 1, to: pdfDocument.numPages };
  const pdfPromises: Promise<string>[] = [];
  for (let index = defaultRange.from - 1; index < defaultRange.to; index++) {
    const renderer = async () => {
      const pdfPage = await createPDFPage(pdfDocument, index + 1);
      const text = await pdfPage.getTextContent();
      return text.items.map((item: any) => item.str).join("\n");
    };
    pdfPromises.push(renderer());
  }

  const pdfTexts = await Promise.all(pdfPromises);
  return pdfTexts;
};

export const splitChunks = (chunks: string[], amountOfQuestions: number) => {
  const maxAnountOfQuestions = 22; // Maximum questions per chunk
  if (amountOfQuestions / maxAnountOfQuestions < chunks.length) return chunks; // No need to break if less than max

  const gap = Math.ceil(amountOfQuestions / maxAnountOfQuestions);

  const newChunks: string[] = [];

  let textIndexToSplit = 0;
  for (let index = 0; index < gap; index++) {
    if (textIndexToSplit <= chunks.length - 1) {
      const texts = chunks[textIndexToSplit] as string;
      const firstTextPart = texts.substring(0, texts.length / 2);
      const secTextPart = texts.substring(texts.length / 2);
      newChunks.push(firstTextPart, secTextPart);

      textIndexToSplit++;
    } else {
      chunks = newChunks;
      textIndexToSplit = 0;
    }
  }

  console.log(
    `New chunks created: new:${newChunks.length} old:${chunks.length}`,
  );
  return newChunks;
};
