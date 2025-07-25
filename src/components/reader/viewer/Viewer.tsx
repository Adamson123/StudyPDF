"use client";

import "pdfjs-dist/web/pdf_viewer.css";
import { createContext, useRef, useState } from "react";
import SelectionMenu from "./anotation/comment/SelectionMenu";
import Header from "../header/Header";
import Sidebar from "../../sidebar/Sidebar";
import { Loader2 } from "lucide-react";
import AddComment from "./anotation/comment/AddComment";
import Comment from "./anotation/comment/Comment";
import { Message } from "./anotation/comment/Message";
import useRender from "./useRender";
import { PDFDocumentProxy } from "pdfjs-dist";

export const ViewerContext = createContext<{
  pdfData: PdfDataTypes;
  //  setDataToDelete: Dispatch<SetStateAction<DataToDeleteTypes>>;
  // dataToDelete: DataToDeleteTypes;
}>({
  pdfData: {
    name: "",
    url: "",
    pdfDocument: {} as PDFDocumentProxy,
    numOfPages: 0,
  },
  // dataToDelete: {
  //   id: "",
  //   type: "",
  // },
  // setDataToDelete: () => {},
});

export type CommentType = { text: string; class: string };

const Viewer = () => {
  const pdfsContainer = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [showSidebar, setShowSidebar] = useState(
    window.innerWidth > 1600 ? true : false,
  );
  const constant = window.innerWidth < 640 ? -0.01 : 0.1;
  const [scale, setScale] = useState(
    1 - (1 / window.innerWidth) * 100 + constant,
  );
  // const [selectionClass, setSelectionClass] = useState("");
  // const [comment, setComment] = useState<CommentType>({ text: "", class: "" });
  const [message, setMessage] = useState({ text: "", autoTaminate: false });
  const [highlightClass, setHighlightClass] = useState("");
  //TODO:  Add selection box mode
  const [selectionBoxMode, setSelectionBoxMode] = useState(false);
  const [pdfInfo, setPdfInfo] = useState({
    url: window.location.origin + "/Split.pdf",
    name: "pdf-name",
  });

  const { renderPDFsOnView, loadingPDF, pdfPages, pdfData } = useRender({
    pdfInfo,
    pdfsContainer,
    scale,
    setMessage,
  });

  const updateScale = async (scale: number) => {
    setScale(scale);
    const renderPromises: Promise<void>[] = [];
    for (const pdfPage of pdfPages) {
      renderPromises.push(pdfPage.updateScale(scale));
    }
    await Promise.all(renderPromises);
    document.documentElement.style.setProperty(
      "--total-scale-factor",
      scale.toString(),
    );
    console.log({ scale });
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
    // setSelectionClass(id);
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
    <ViewerContext.Provider
      value={{
        // setDataToDelete,
        // dataToDelete,
        pdfData: pdfData as PdfDataTypes,
      }}
    >
      <main className="flex min-h-screen justify-center p-3 pt-6">
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

        {loadingPDF ? (
          <div className="text-md flex flex-col items-center gap-1">
            Loading PDF...
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : (
          <div
            onClick={closeHighlightMenu}
            className={`relative mt-5 flex flex-col gap-1`}
            ref={pdfsContainer}
          ></div>
        )}
        {/* 
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
        /> */}

        <Message message={message} setMessage={setMessage} />
      </main>
    </ViewerContext.Provider>
  );
};

export default Viewer;
