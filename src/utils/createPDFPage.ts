import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

// this function takes a document from the getPDFDocument function and
// page argument for the page number we want to get
const createPDFPage = (
  document: PDFDocumentProxy,
  page: number,
): Promise<PDFPageProxy> => {
  return new Promise((resolve, reject) => {
    if (!document || !page) return reject();
    document
      .getPage(page)
      .then((pageDocument: PDFPageProxy) => {
        resolve(pageDocument);
      })
      .catch((error: any) => reject(error));
  });
};

export default createPDFPage;
