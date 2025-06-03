"use client";

import "pdfjs-dist/web/pdf_viewer.css";
import { createContext, useEffect, useRef, useState } from "react";
import PDFPage from "@/components/reader/viewer/pdfPage";
import { getPDFDocument } from "./utils";
import SelectionMenu from "./SelectionMenu";
import Header from "../Header";
import Sidebar from "../../sidebar/Sidebar";
import { Loader2 } from "lucide-react";
import AddComment from "./comment/AddComment";
import Comment from "./comment/Comment";
import { Message } from "./Message";
import HighlightMenu from "./HighlightMenu";

export const ViewerContext = createContext<{ pdfInfo: PdfInfoTypes }>({
  pdfInfo: { name: "", url: "" },
});

export type CommentType = { text: string; class: string };

const Viewer = () => {
  const pdfsContainer = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [scale, setScale] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [selectionClass, setSelectionClass] = useState("");
  const [comment, setComment] = useState<CommentType>({ text: "", class: "" });
  const [message, setMessage] = useState({ text: "", autoTaminate: false });
  const [highlightClass, setHighlightClass] = useState("");
  //TODO:  Add selection box mode
  const [selectionBoxMode, setSelectionBoxMode] = useState(false);
  const [pdfInfo, setPdfInfo] = useState({
    url: window.location.origin + "/Split.pdf",
    name: "pdf-name",
  });

  // const renderPDFsOnView = async (pdfPages: PDFPage[]) => {
  //   const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;
  //   const pdfContainers =
  //     pdfsContainerElement?.querySelectorAll(".pdfContainer");

  //   if (!pdfContainers?.length) return;

  //   for (let index = 0; index < pdfContainers.length; index++) {
  //     const container = pdfContainers[index] as HTMLDivElement;
  //     const rect = container.getBoundingClientRect();

  //     const pdfPage = pdfPages[index] as PDFPage;
  //     if (!pdfPage) continue; // Skip if pdfPage is undefined
  //     if (rect.top < window.innerHeight || (rect.bottom > 0 && rect.top < 0)) {
  //       //console.log(pdfPages, "pdfPages");
  //       console.log(`rendering ${index}`);
  //       if (!pdfPage.isRendered) {
  //         await pdfPage.load();
  //         await pdfPage.render();
  //         console.log(`rendered ${index}`);
  //       }
  //     } else {
  //       console.log(`trying to cancel pdf ${index} ${pdfPage.isRendered}`);
  //       if (pdfPage.isRendered) {
  //         console.log(`cancelling pdf ${index}`);
  //         pdfPage.cancel();
  //         console.log(`cancelled pdf ${index}`);
  //       }
  //     }
  //   }
  // };

  // ...existing code...
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
      const pdfPromises: Promise<void>[] = [];
      for (let index = 1; index <= pdfDocument.numPages; index++) {
        const pdfPage = new PDFPage(
          index,
          pdfsContainer.current as HTMLDivElement,
          pdfDocument,
          scale,
        );
        await pdfPage.load();
        //   pdfPromises.push(pdfPage.render(pdfDocument, scale));
        pdfPages.push(pdfPage);
        //await pdfPages[index]?.render();
      }

      //  await Promise.all(pdfPromises);

      setLoading(false);

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

  const updateScale = async (scale: number) => {
    setScale(scale);
    const renderPromises: Promise<void>[] = [];
    for (const pdfPage of pdfPages) {
      // await pdfPage.updateScale(scale);
      renderPromises.push(pdfPage.updateScale(scale));
    }
    await Promise.all(renderPromises);
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

  const openAddComment = (id: string) => {
    setSelectionClass(id);
    //setShowAddComment(true);
    commentInputRef.current?.focus();
  };
  const closeHighlightMenu = () => {
    if (!highlightClass) return;
    const highlights = document.querySelectorAll<HTMLSpanElement>(
      "." + highlightClass,
    )!;

    const type = highlights[0]?.classList.value.split(" ")[0];
    highlights.forEach((highlight) => {
      const borderValue = "0px solid green";
      if (type === "bgColor") {
        highlight.style.border = borderValue;
      } else {
        highlight.style.borderTop = borderValue;
        highlight.style.borderRight = borderValue;
        highlight.style.borderLeft = borderValue;
      }
    });
    setHighlightClass("");
  };

  return (
    <ViewerContext.Provider value={{ pdfInfo }}>
      <main className="flex min-h-screen flex-col items-center justify-center p-3 pt-6">
        <Header
          setShowSidebar={setShowSidebar}
          showSidebar={showSidebar}
          incrementScale={incrementScale}
          decrementScale={decrementScale}
          numOfPages={pdfPages.length}
          pdfsContainer={pdfsContainer}
          // it will set the selection box mode to true or false
          setSelectionBoxMode={setSelectionBoxMode}
          setPdfInfo={setPdfInfo}
          setMessage={setMessage}
          renderPDFsOnView={renderPDFsOnView}
          pdfPages={pdfPages}
        />
        {/* Add Optimization */}
        <Sidebar showSidebar={showSidebar} />
        {loading ? (
          <div className="text-md flex flex-col items-center gap-1">
            Loading PDF...
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : (
          <div
            onClick={closeHighlightMenu}
            className={`relative mt-10 flex flex-col gap-3`}
            ref={pdfsContainer}
          ></div>
        )}
        {selectionClass && (
          <AddComment
            selectionClass={selectionClass}
            setSelectionClass={setSelectionClass}
            setComment={setComment}
            pdfsContainer={pdfsContainer}
          />
        )}
        {comment.text && (
          <Comment
            comment={comment}
            setComment={setComment}
            pdfsContainer={pdfsContainer}
          />
        )}
        {highlightClass && (
          <HighlightMenu
            setHighlightClass={setHighlightClass}
            pdfsContainer={pdfsContainer}
            highlightClass={highlightClass}
          />
        )}
        <SelectionMenu
          pdfsContainer={pdfsContainer}
          openAddComment={openAddComment}
          setMessage={setMessage}
          setHighlightClass={setHighlightClass}
        />

        <Message message={message} setMessage={setMessage} />
      </main>
    </ViewerContext.Provider>
  );
};

export default Viewer;
