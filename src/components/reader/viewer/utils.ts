import * as pdfJS from "pdfjs-dist";

export const renderPDFToCanvas = (
  pageDocument: pdfJS.PDFPageProxy,
  canvas: HTMLCanvasElement,
  viewport: pdfJS.PageViewport,
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    pageDocument
      .render({
        canvasContext: context,
        viewport: viewport,
      })
      .promise.then(() => resolve(canvas))
      .catch((error) => reject(error));
  });
};

export const createPDFPage = (
  document: pdfJS.PDFDocumentProxy,
  page: number,
): Promise<pdfJS.PDFPageProxy> => {
  return new Promise((resolve, reject) => {
    if (!document || !page) return reject("Invalid document or page number");

    document
      .getPage(page)
      .then((pageDocument: pdfJS.PDFPageProxy) => {
        resolve(pageDocument);
      })
      .catch((error: any) => reject(error));
  });
};

export const getPDFDocument = async (
  path: string,
): Promise<pdfJS.PDFDocumentProxy> => {
  pdfJS.GlobalWorkerOptions.workerSrc =
    window.location.origin + "/pdf.worker.min.mjs";
  return new Promise((resolve, reject) => {
    pdfJS
      .getDocument(path)
      .promise.then((document: any) => {
        resolve(document);
      })
      .catch(reject);
  });
};

export const generateClass = (
  type: "comment" | "bgColor" | "underline" | "selectionBox",
) => {
  return `${type}-${Math.round(Math.random() * 50000000)}`;
};
