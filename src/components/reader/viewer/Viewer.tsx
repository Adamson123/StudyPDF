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
        pdfsContainer.current.scrollTop = 0; // Reset scroll position
      }

      if (!pdfInfo.url) {
        setLoading(false);
        // setMessage({ text: "No PDF URL provided.", autoTaminate: true }); // Optional: User feedback
        return;
      }

      try {
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

        if (pdfDocRef.current === pdfDocument && pdfsContainer.current) {
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
      } catch (error) {
        console.error("Error loading PDF:", error);
        setMessage({
          text: `Error loading PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
          autoTaminate: false,
        });
        // Optionally, clear pdfDocRef if loading fails significantly
        pdfDocRef.current = null;
      } finally {
        setLoading(false);
        document.documentElement.style.setProperty(
          "--total-scale-factor",
          scale.toString(),
        );
      }
    };

    loadInitialPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfInfo, scale]); // Add scale back as a dependency

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
    if (scale === newScale) return;
    // setScale will trigger the useEffect to re-render with the new scale.
    // The useEffect already handles setLoading, rendering pages, etc.
    setScale(newScale);
    // The existing logic in useEffect for [pdfInfo, scale] will handle re-rendering.
    // We might still want to preserve scroll position here if useEffect doesn't do it.

    // Store current scroll position percentage
    let scrollPercentage = 0;
    if (pdfsContainer.current && pdfsContainer.current.scrollHeight > 0 && pdfsContainer.current.clientHeight > 0) {
        scrollPercentage = pdfsContainer.current.scrollTop / (pdfsContainer.current.scrollHeight - pdfsContainer.current.clientHeight);
        scrollPercentage = Math.max(0, Math.min(1, scrollPercentage)); // Clamp between 0 and 1
    }
    
    // After setScale triggers re-render, restore scroll.
    // This needs to happen after the DOM updates from re-render.
    // Using a timeout is a common way, but useEffect's cleanup/layout effects might be better.
    // For now, let's assume the re-render from useEffect handles page display.
    // The main useEffect will set --total-scale-factor.
    
    // The challenge is that setScale is async, and the re-render happens after this function.
    // A useEffect that listens to `pdfPages` changes (after rendering) might be better for scroll restoration.
    // Or, pass scrollPercentage to useEffect via a ref.
    // For now, let's simplify and rely on the user to re-adjust scroll after zoom,
    // or accept that it might reset to top due to full re-render.
    // A more sophisticated scroll preservation would be a further enhancement.
    // The main goal here is to make pages visible.
    // The useEffect with `scale` in its dependency array will ensure pages are rendered with the new scale.
  };

  const incrementScale = () => {
    const newScale = parseFloat((scale + 0.1).toFixed(2));
    if (newScale > 3) { // Max zoom limit
      setMessage({ text: "Maximum zoom level reached.", autoTaminate: true });
      return;
    }
    updateScale(newScale);
  };
  const decrementScale = () => {
    const newScale = parseFloat((scale - 0.1).toFixed(2));
    if (newScale < 0.1) { // Min zoom limit
      setMessage({ text: "Minimum zoom level reached.", autoTaminate: true });
      return;
    }
    updateScale(newScale);
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
      <main className="flex h-screen flex-col bg-slate-200"> {/* Use h-screen for a fixed full height */}
        <Header
          setShowSidebar={setShowSidebar}
          showSidebar={showSidebar}
          incrementScale={incrementScale}
          decrementScale={decrementScale}
          numOfPages={pdfDocRef.current?.numPages || 0}
          pdfsContainer={pdfsContainer}
          setSelectionBoxMode={setSelectionBoxMode}
          setPdfInfo={setPdfInfo}
          setMessage={setMessage}
        />
        <div className="flex flex-1 overflow-hidden"> {/* This container will manage sidebar and viewer */}
          <Sidebar showSidebar={showSidebar} />
          <div className="flex-1 relative"> {/* This div will contain loader OR pdfsContainer */}
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-md gap-1 bg-white">
                Loading PDF...
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
            ) : pdfDocRef.current && pdfPages.length > 0 ? ( // Only render container if PDF is loaded and pages exist
              <div
                onClick={closeHighlightMenu}
                className="absolute inset-0 overflow-y-auto p-3 flex flex-col items-center gap-3"
                ref={pdfsContainer}
              >
                {/* PDF pages are appended here by the useEffect hook */}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-md gap-1 bg-white">
                No PDF loaded or PDF is empty.
              </div>
            )}
          </div>
        </div>
        {/* Absolutely positioned Menus & Messages */}
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
