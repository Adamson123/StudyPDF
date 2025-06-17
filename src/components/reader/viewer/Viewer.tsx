"use client";

import "pdfjs-dist/web/pdf_viewer.css";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from "react";
import SelectionMenu from "./SelectionMenu";
import Header from "../Header";
import Sidebar from "../../sidebar/Sidebar";
import { Loader2 } from "lucide-react";
import AddComment from "./comment/AddComment";
import Comment from "./comment/Comment";
import { Message } from "./Message";
import HighlightMenu from "./HighlightMenu";
import Popup from "@/components/ui/Popup";
import { deleteFlashcardById } from "@/lib/flashcardStorage";
import { deleteQuizById } from "@/lib/quizStorage";
import useRender from "./useRender";

export const ViewerContext = createContext<{
  pdfInfo: PdfInfoTypes;
  setDataToDelete: Dispatch<SetStateAction<DataToDeleteTypes>>;
  dataToDelete: DataToDeleteTypes;
}>({
  pdfInfo: { name: "", url: "" },
  dataToDelete: {
    id: "",
    type: "",
  },
  setDataToDelete: () => {},
});

export type CommentType = { text: string; class: string };

const Viewer = () => {
  const pdfsContainer = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [scale, setScale] = useState(0.7);

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
  const [dataToDelete, setDataToDelete] = useState<DataToDeleteTypes>({
    id: "",
    type: "",
  });

  const { renderPDFsOnView, loadingPDF, pdfPages } = useRender({
    pdfInfo,
    pdfsContainer,
    scale,
    setMessage,
  });

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
    <ViewerContext.Provider value={{ pdfInfo, setDataToDelete, dataToDelete }}>
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

        {loadingPDF ? (
          <div className="text-md flex flex-col items-center gap-1">
            Loading PDF...
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : (
          <div
            onClick={closeHighlightMenu}
            className={`relative mt-10 flex flex-col gap-1`}
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
        {dataToDelete.id && (
          <Popup
            message="Are you sure you want to delete this quiz"
            cancelBtnFunc={() => setDataToDelete({ id: "", type: "" })}
            executeBtnLabel="Delete"
            executeBtnFunc={() => {
              switch (dataToDelete.type) {
                case "quiz":
                  deleteQuizById(dataToDelete.id);
                  break;
                case "flashcard":
                  deleteFlashcardById(dataToDelete.id);
                default:
                  break;
              }
              setDataToDelete({ id: "", type: "" });
            }}
          />
        )}
      </main>
    </ViewerContext.Provider>
  );
};

export default Viewer;
