"use client";

import "pdfjs-dist/web/pdf_viewer.css";
import { useEffect, useRef, useState } from "react";
import PDFPage from "@/components/reader/viewer/pdf_page";

import { getPDFDocument } from "./pdf_utils";

const Viewer = () => {
  const parent = useRef<HTMLDivElement>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);

  useEffect(() => {
    (async () => {
      const url = window.location.origin + "/Split.pdf";
      const pdfDocument = await getPDFDocument(url);

      const pdfPages: PDFPage[] = [];
      for (let index = 1; index <= pdfDocument.numPages; index++) {
        const pdfPage = new PDFPage(index, parent.current as HTMLDivElement);
        await pdfPage.render(pdfDocument);

        pdfPages.push(pdfPage);
      }

      pdfPages.forEach((pdfPage) => {
        if (
          parent.current?.querySelectorAll(".pdfContainer").length !==
          pdfPages.length
        ) {
          parent.current?.appendChild(pdfPage.pdfContainer);
        }
      });

      setPdfPages(pdfPages);
    })();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col gap-1" ref={parent}></div>
    </main>
  );
};

export default Viewer;
