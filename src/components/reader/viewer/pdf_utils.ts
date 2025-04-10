import * as pdfJS from "pdfjs-dist";

export const renderPDFToCanvas = (
  pageDocument: pdfJS.PDFPageProxy,
  canvas: HTMLCanvasElement,
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    pageDocument
      .render({
        canvasContext: canvas.getContext("2d") as CanvasRenderingContext2D,
        viewport: pageDocument.getViewport({ scale: 1 }),
      })
      .promise.then(function () {
        resolve(canvas);
      })
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
