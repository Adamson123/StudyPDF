import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import PDFPage from "./pdfPage";
import { getPDFDocument } from "./utils";

function useRender({
  pdfInfo,
  pdfsContainer,
  scale,
  setMessage,
}: {
  pdfsContainer: RefObject<HTMLDivElement>;
  pdfInfo: { name: string; url: string };
  scale: number;
  setMessage: Dispatch<SetStateAction<{ text: string; autoTaminate: boolean }>>;
}) {
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const renderPDFsOnView = async (currentPdfPages: PDFPage[]) => {
    const pdfsContainerElement = pdfsContainer.current;
    if (!pdfsContainerElement || !currentPdfPages.length) return;

    const RENDER_BUFFER = 2; // Pages to render before/after visible ones
    const MAX_CONCURRENT_RENDERS = 2; // Limit simultaneous rendering operations

    const pagesToProcess: { page: PDFPage; rect: DOMRect; index: number }[] =
      [];
    for (let i = 0; i < currentPdfPages.length; i++) {
      const pageInstance = currentPdfPages[i]!;
      const pageElement = pdfsContainerElement.querySelector(
        `#pdfContainer-${pageInstance.index}`,
      );
      if (pageElement) {
        pagesToProcess.push({
          page: pageInstance,
          rect: pageElement.getBoundingClientRect(),
          index: i,
        });
      }
    }

    let firstVisibleIndex = -1;
    let lastVisibleIndex = -1;

    for (let i = 0; i < pagesToProcess.length; i++) {
      const { rect } = pagesToProcess[i]!;
      const isInView = rect.bottom > 0 && rect.top < window.innerHeight;
      if (isInView) {
        if (firstVisibleIndex === -1) firstVisibleIndex = i;
        lastVisibleIndex = i;
      }
    }

    const pagesToActuallyRender: PDFPage[] = [];
    const pagesToCancel: PDFPage[] = [];

    if (firstVisibleIndex !== -1) {
      // If any page is visible
      const renderStartIndex = Math.max(0, firstVisibleIndex - RENDER_BUFFER);
      const renderEndIndex = Math.min(
        currentPdfPages.length - 1,
        lastVisibleIndex + RENDER_BUFFER,
      );

      for (let i = 0; i < pagesToProcess.length; i++) {
        const { page } = pagesToProcess[i]!;
        if (i >= renderStartIndex && i <= renderEndIndex) {
          if (!page.isRendered) {
            pagesToActuallyRender.push(page);
          }
        } else {
          if (page.isRendered) {
            pagesToCancel.push(page);
          }
        }
      }
    } else {
      // No pages visible, cancel all rendered ones
      pagesToProcess.forEach((p) => {
        if (p.page.isRendered) pagesToCancel.push(p.page);
      });
    }

    // Cancel pages
    for (const pageToCancel of pagesToCancel) {
      if (pageToCancel.isRendered) {
        // Double check
        console.log(`cancelling pdf ${pageToCancel.index}`);
        pageToCancel.cancel();
        console.log(`cancelled pdf ${pageToCancel.index}`);
      }
    }

    // Render pages in batches
    for (
      let i = 0;
      i < pagesToActuallyRender.length;
      i += MAX_CONCURRENT_RENDERS
    ) {
      const batch = pagesToActuallyRender.slice(i, i + MAX_CONCURRENT_RENDERS);
      const renderPromises = batch.map(async (p) => {
        if (!p.isRendered) {
          // Check again before rendering
          console.log(`rendering ${p.index}`);
          await p.load(); // Ensure viewport is up-to-date
          await p.render();
          console.log(`rendered ${p.index}`);
        }
      });
      await Promise.all(renderPromises);
    }
  };

  useEffect(() => {
    (async () => {
      const pdfDocument = await getPDFDocument(pdfInfo.url);

      const pdfPages: PDFPage[] = [];
      for (let index = 1; index <= pdfDocument.numPages; index++) {
        const pdfPage = new PDFPage(
          index,
          pdfsContainer.current as HTMLDivElement,
          pdfDocument,
          scale,
        );
        await pdfPage.load();
        pdfPages.push(pdfPage);
      }

      setLoadingPDF(false);

      const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;
      if (pdfsContainerElement) pdfsContainerElement.innerHTML = ""; // Clear the container before appending new pages
      for (let index = 0; index < pdfPages.length; index++) {
        const pdfPage = pdfPages[index] as PDFPage;
        if (
          pdfsContainer.current?.querySelectorAll(".pdfContainer").length !==
          pdfPages.length
        ) {
          pdfsContainer.current?.appendChild(pdfPage.pdfContainer);
        }
      }

      await renderPDFsOnView(pdfPages);
      setPdfPages(pdfPages);

      setMessage({
        text: "PDF Loaded Successfully",
        autoTaminate: true,
      });

      document.documentElement.style.setProperty(
        "--total-scale-factor",
        scale.toString(),
      );
    })();
  }, [pdfInfo]);

  return {
    renderPDFsOnView,
    loadingPDF,
    pdfPages,
  };
}

export default useRender;
