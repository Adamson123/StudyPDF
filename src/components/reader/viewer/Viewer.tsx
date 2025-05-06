"use client";

import "pdfjs-dist/web/pdf_viewer.css";
import { useEffect, useRef, useState } from "react";
import PDFPage from "@/components/reader/viewer/pdf-page";
import { getPDFDocument } from "./pdf-utils";
import SelectionMenu from "./selection-menu/SelectionMenu";
import Header from "../Header";
import LeftSection from "../left-section/LeftSection";
import { Loader2 } from "lucide-react";
import AddComment from "./comment/AddComment";
import Comment from "./comment/Comment";
import { Message } from "./Message";
import HighlightMenu from "./HighlightMenu";
import useDrawSelectionBox from "./hooks/useDrawSelectionBox";

export type CommentType = { text: string; class: string };

const Viewer = () => {
  const pdfsContainer = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [showLeftSection, setShowLeftSection] = useState(false);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectionClass, setSelectionClass] = useState("");
  const [comment, setComment] = useState<CommentType>({ text: "", class: "" });
  const [message, setMessage] = useState("");
  const [highlightClass, setHighlightClass] = useState("");
  const [selectionBoxMode, setSelectionBoxMode] = useState(false);
  const [pdfURL, setPdfURL] = useState(window.location.origin + "/Split.pdf");
  const handleMouse = useDrawSelectionBox(pdfsContainer, selectionBoxMode);

  useEffect(() => {
    (async () => {
      const pdfDocument = await getPDFDocument(pdfURL);

      const pdfPages: PDFPage[] = [];
      for (let index = 1; index <= pdfDocument.numPages; index++) {
        const pdfPage = new PDFPage(
          index,
          pdfsContainer.current as HTMLDivElement,
        );
        await pdfPage.render(pdfDocument, scale);

        pdfPages.push(pdfPage);
      }
      setLoading(false);

      const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;

      if (pdfsContainerElement) pdfsContainerElement.innerHTML = ""; // Clear the container before appending new pages
      pdfPages.forEach((pdfPage) => {
        if (
          pdfsContainer.current?.querySelectorAll(".pdfContainer").length !==
          pdfPages.length
        ) {
          pdfsContainer.current?.appendChild(pdfPage.pdfContainer);
        }
      });
      setPdfPages(pdfPages);
    })();
  }, [pdfURL]);

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
    <main className="flex min-h-screen flex-col items-center justify-center p-3 pt-12">
      <Header
        setShowLeftSection={setShowLeftSection}
        showLeftSection={showLeftSection}
        incrementScale={incrementScale}
        decrementScale={decrementScale}
        numOfPages={pdfPages.length}
        pdfsContainer={pdfsContainer}
        setSelectionBoxMode={setSelectionBoxMode}
        setPdfURL={setPdfURL}
        setMessage={setMessage}
      />
      {/* Add Optimization */}
      <LeftSection showLeftSection={showLeftSection} />
      {loading ? (
        <div className="text-md flex flex-col items-center gap-1">
          Loading PDF...
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      ) : (
        <div
          onClick={closeHighlightMenu}
          className="relative mt-10 flex flex-col gap-1"
          ref={pdfsContainer}
        >
          <SelectionMenu
            pdfsContainer={pdfsContainer}
            openAddComment={openAddComment}
            setMessage={setMessage}
            setHighlightClass={setHighlightClass}
          />
        </div>
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

      <Message message={message} setMessage={setMessage} />
    </main>
  );
};

export default Viewer;
