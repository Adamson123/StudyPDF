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

import * as pdfJS from "pdfjs-dist";

export const ViewerContext = createContext<{ pdfInfo: PdfInfoTypes }>({
  pdfInfo: { name: "", url: "" },
});

export type CommentType = { text: string; class: string };

const INITIAL_PAGE_COUNT = 3;
const PAGES_TO_LOAD_ON_SCROLL = 2;
const SCROLL_THRESHOLD = 300; // pixels from bottom

const Viewer = () => {
  const pdfsContainer = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const pdfDocRef = useRef<pdfJS.PDFDocumentProxy | null>(null);
  const isLoadingMoreRef = useRef(false);

  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [renderedPagesCount, setRenderedPagesCount] = useState(0);
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

  useEffect(() => {
    const loadInitialPages = async () => {
      setLoading(true);
      setPdfPages([]);
      setRenderedPagesCount(0);
      if (pdfsContainer.current) {
        pdfsContainer.current.innerHTML = ""; // Clear previous PDF
      }
      // Reset scroll position for new PDF
      if (pdfsContainer.current) {
        pdfsContainer.current.scrollTop = 0;
      }


      const pdfDocument = await getPDFDocument(pdfInfo.url);
      pdfDocRef.current = pdfDocument;

      const initialPagesToRender = Math.min(
        INITIAL_PAGE_COUNT,
        pdfDocument.numPages,
      );
      const pagePromises: Promise<PDFPage>[] = [];

      for (let i = 1; i <= initialPagesToRender; i++) {
        pagePromises.push(
          (async () => {
            const pdfPage = new PDFPage(
              i,
              pdfsContainer.current as HTMLDivElement,
            );
            await pdfPage.render(pdfDocument, scale);
            return pdfPage;
          })(),
        );
      }

      const initialPdfPages = await Promise.all(pagePromises);

      // Check if the component is still mounted and the pdfInfo hasn't changed
      if (pdfDocRef.current === pdfDocument) {
        initialPdfPages.forEach((pdfPage) => {
          pdfsContainer.current?.appendChild(pdfPage.pdfContainer);
        });

        setPdfPages(initialPdfPages);
        setRenderedPagesCount(initialPagesToRender);
        setMessage({
          text: "PDF Loaded Successfully",
          autoTaminate: true,
        });
      }
      setLoading(false);
      document.documentElement.style.setProperty(
        "--total-scale-factor",
        scale.toString(),
      );
    };

    loadInitialPages();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfInfo]); // Only re-run when pdfInfo changes. Scale changes will be handled by updateScale.

  const loadMorePages = async () => {
    if (
      isLoadingMoreRef.current ||
      !pdfDocRef.current ||
      renderedPagesCount >= pdfDocRef.current.numPages
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    const pdfDocument = pdfDocRef.current;
    const numPagesToLoad = Math.min(
      PAGES_TO_LOAD_ON_SCROLL,
      pdfDocument.numPages - renderedPagesCount,
    );

    if (numPagesToLoad <= 0) {
      isLoadingMoreRef.current = false;
      return;
    }

    const pagePromises: Promise<PDFPage>[] = [];
    for (
      let i = renderedPagesCount + 1;
      i <= renderedPagesCount + numPagesToLoad;
      i++
    ) {
      pagePromises.push(
        (async () => {
          const pdfPage = new PDFPage(
            i,
            pdfsContainer.current as HTMLDivElement,
          );
          await pdfPage.render(pdfDocument, scale);
          return pdfPage;
        })(),
      );
    }

    const newPdfPages = await Promise.all(pagePromises);

    newPdfPages.forEach((pdfPage) => {
      pdfsContainer.current?.appendChild(pdfPage.pdfContainer);
    });

    setPdfPages((prevPages) => [...prevPages, ...newPdfPages]);
    setRenderedPagesCount(
      (prevCount) => prevCount + newPdfPages.length,
    );
    isLoadingMoreRef.current = false;
  };

  useEffect(() => {
    const container = pdfsContainer.current;
    // Do not attach listener if initial loading is in progress, or if there's no container.
    if (loading || !container) return;

    const handleScroll = () => {
      if (
        !isLoadingMoreRef.current && // Check loading flag for more pages
        pdfDocRef.current && // Ensure pdfDoc is available
        renderedPagesCount < pdfDocRef.current.numPages && // Ensure there are more pages to load
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - SCROLL_THRESHOLD
      ) {
        loadMorePages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, renderedPagesCount]); // Rerun when initial loading is done or more pages are rendered.

  const updateScale = async (newScale: number) => {
    if (scale === newScale) return; // Avoid unnecessary updates

    setLoading(true); // Use main loading indicator
    setScale(newScale);

    // Store current scroll position percentage
    let scrollPercentage = 0;
    if (pdfsContainer.current && pdfsContainer.current.scrollHeight > 0) {
        scrollPercentage = pdfsContainer.current.scrollTop / (pdfsContainer.current.scrollHeight - pdfsContainer.current.clientHeight);
        scrollPercentage = Math.max(0, Math.min(1, scrollPercentage)); // Clamp between 0 and 1
    }


    // Re-render *all currently loaded* pages with the new scale
    const newPdfPages: PDFPage[] = [];
    const renderPromises: Promise<void>[] = [];

    if (pdfDocRef.current && pdfsContainer.current) {
      // Clear existing pages from DOM to re-render them
      // pdfsContainer.current.innerHTML = ""; // This might be too aggressive if not all pages are re-rendered

      for (let i = 0; i < pdfPages.length; i++) {
        const pageToUpdate = pdfPages[i];
         // It's better if PDFPage.updateScale directly uses the new scale
         // and re-renders itself. The current PDFPage class seems to do this.
        renderPromises.push(pageToUpdate.updateScale(newScale));
      }
      await Promise.all(renderPromises);

      // If pages were cleared, re-append them.
      // However, PDFPage.updateScale modifies the existing canvas, so clearing and re-appending might not be needed
      // unless the page dimensions change significantly causing layout issues.
      // For now, assume updateScale handles its DOM updates correctly.
    }
    
    setLoading(false);
    document.documentElement.style.setProperty(
      "--total-scale-factor",
      newScale.toString(),
    );

    // Restore scroll position
    if (pdfsContainer.current && pdfsContainer.current.scrollHeight > 0) {
        // Timeout to allow DOM to update with new page sizes
        setTimeout(() => {
            if(pdfsContainer.current) { // Check again as it might be unmounted
                 pdfsContainer.current.scrollTop = scrollPercentage * (pdfsContainer.current.scrollHeight - pdfsContainer.current.clientHeight);
            }
        }, 100); // Adjust timeout as needed
    }
  };

  const incrementScale = () => {
    const latestScale = parseFloat((scale + 0.1).toFixed(2));
    updateScale(latestScale);
  };
  const decrementScale = () => {
    const latestScale = parseFloat((scale - 0.1).toFixed(2));
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
          numOfPages={pdfDocRef.current?.numPages || 0}
          pdfsContainer={pdfsContainer}
          // it will set the selection box mode to true or false
          setSelectionBoxMode={setSelectionBoxMode}
          setPdfInfo={setPdfInfo}
          setMessage={setMessage}
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
            className={`relative mt-10 flex flex-col gap-3 overflow-y-auto`} // Added overflow-y-auto
            style={{ maxHeight: "calc(100vh - 100px)" }} // Example: Adjust height as needed
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
