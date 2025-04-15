"use client";

import "pdfjs-dist/web/pdf_viewer.css";
import { RefObject, useEffect, useRef, useState } from "react";
import PDFPage from "@/components/reader/viewer/pdf-page";
import { getPDFDocument } from "./pdf-utils";
import SelectionMenu from "../selection-menu/SelectionMenu";
import Header from "../Header";
import LeftSection from "../left-section/LeftSection";
import { Loader2 } from "lucide-react";

const Viewer = () => {
  const parent = useRef<HTMLDivElement>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [showLeftSection, setShowLeftSection] = useState(false);
  const [scale, setScale] = useState(0.8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const url = window.location.origin + "/Split.pdf";
      const pdfDocument = await getPDFDocument(url);

      const pdfPages: PDFPage[] = [];
      for (let index = 1; index <= pdfDocument.numPages; index++) {
        const pdfPage = new PDFPage(index, parent.current as HTMLDivElement);
        await pdfPage.render(pdfDocument, scale);

        pdfPages.push(pdfPage);
      }
      setLoading(false);

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

  const updateScale = async (scale: number) => {
    setScale(scale);
    for (const pdfPage of pdfPages) {
      await pdfPage.updateScale(scale);
    }
    document.documentElement.style.setProperty(
      "--total-scale-factor",
      scale.toString(),
    );
  };

  const incrementScale = () => {
    const latestScale = scale + 0.1;
    updateScale(latestScale);
  };
  const decrementScale = () => {
    const latestScale = scale - 0.1;
    updateScale(latestScale);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden p-3">
      <Header
        setShowLeftSection={setShowLeftSection}
        showLeftSection={showLeftSection}
        incrementScale={incrementScale}
        decrementScale={decrementScale}
        numOfPages={pdfPages.length}
      />
      <LeftSection showLeftSection={showLeftSection} />
      {loading ? (
        <div className="text-md flex flex-col items-center gap-1">
          Loading PDF...
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      ) : (
        <div className="relative mt-10 flex flex-col gap-1" ref={parent}>
          <SelectionMenu parent={parent} scale={scale} />
        </div>
      )}
    </main>
  );
};

export default Viewer;
