"use client";

import { useEffect, useRef } from "react";
import * as pdfJS from "pdfjs-dist";

// import createPDFPage from "@/utils/createPDFPage";
// import renderPDFToCanvas from "@/utils/renderPDFToCanvas";
// import getPDFDocument from "@/utils/getPDFDocument";

const getPDFDocument = async (
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

const createPDFPage = (
  document: pdfJS.PDFDocumentProxy,
  page: number,
): Promise<pdfJS.PDFPageProxy> => {
  return new Promise((resolve, reject) => {
    if (!document || !page) return reject();
    document
      .getPage(page)
      .then((pageDocument: pdfJS.PDFPageProxy) => {
        resolve(pageDocument);
      })
      .catch((error: any) => reject(error));
  });
};

const renderPDFToCanvas = (
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
      });
  });
};

const PDFCanvas = () => {
  const ref = useRef<HTMLDivElement>(null);

  const renderPDF = async () => {
    // PDF Path or URL
    const url = window.location.origin + "/10-page-sample.pdf";

    // Page number you want to render
    //const pageNumber = 1;

    const pdfDocument = await getPDFDocument(url);

    for (let index = 1; index < pdfDocument.numPages; index++) {
      // Get the PDF page
      const pdfPage = await createPDFPage(pdfDocument, index);
      const text = await pdfPage.getTextContent();
      console.log(text);
      // Get the viewport of the page to extract sizes
      const viewport = pdfPage.getViewport({ scale: 1 });
      const { height, width } = viewport;

      // Create the canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      // Render the pdf to canvas
      const pdfCanvas = await renderPDFToCanvas(pdfPage, canvas);

      // then add the canvas with pdf to the div element
      ref.current?.appendChild(pdfCanvas);
    }
  };

  useEffect(() => {
    renderPDF();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col gap-3" ref={ref}></div>
    </main>
  );
};

export default PDFCanvas;
