import {
  CopyIcon,
  MessageSquare,
  MessageSquarePlus,
  Paintbrush,
} from "lucide-react";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { MessageType } from "./Message";
import { generateClass } from "../../utils";
import copy from "@/utils/copy";

const copyToClipboard = () => {
  const selection = window.getSelection() as Selection;
  if (selection?.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const text = range.toString();
  copy(text);
};

const SelectionMenu = ({
  pdfsContainer,
  openAddComment,
  setMessage,
  setHighlightClass,
}: {
  pdfsContainer: RefObject<HTMLDivElement>;
  openAddComment: (id: string) => void;
  setMessage: Dispatch<SetStateAction<MessageType>>;
  setHighlightClass: Dispatch<SetStateAction<string>>;
}) => {
  const selectionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSelectionMenuPos = (range: Range) => {
      const selectionMenu = selectionMenuRef.current as HTMLDivElement;
      if (pdfsContainer.current?.contains(range?.commonAncestorContainer)) {
        selectionMenu.style.display = "flex";
      }
    };

    const getSelectionInfo = () => {
      const selection = window.getSelection() as Selection;
      if (selection?.toString().length) {
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(false);
        return { rect: range.getBoundingClientRect(), range };
      }
    };

    const handleSelectionChange = () => {
      const selectionMenu = selectionMenuRef.current as HTMLDivElement;
      const selection = getSelectionInfo();
      if (selection) {
        const { rect, range } = selection;
        updateSelectionMenuPos(range);
      } else {
        //TODO
        selectionMenu.style.display = "none";
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleAddComment = () => {
    (selectionMenuRef.current as HTMLDivElement).style.display = "none";
    const selectionClass = generateClass("comment");
    highlightSelection(selectionClass, "comment");
    openAddComment(selectionClass);
  };

  const handleChangeTextBgColor = () => {
    const selectionClass = generateClass("bgColor");
    const onClickFunc = (highlightClass: string) => {
      setHighlightClass(highlightClass);
    };
    highlightSelection(selectionClass, "bgColor", onClickFunc);
  };

  // const handleUnderlineText = () => {
  //   const selectionClass = generateClass("underline");
  //   const onClickFunc = (highlightClass: string) => {
  //     setHighlightClass(highlightClass);
  //   };
  //   highlightSelection(selectionClass, "underline", onClickFunc);
  // };

  const handleCopy = () => {
    copyToClipboard();
    setMessage({ text: "Text copied", autoTaminate: true });
  };

  const highlightSelection = useCallback(
    (
      selectionClass: string,
      type: "comment" | "bgColor" | "underline",
      onClickFunc?: (highlightClass: string) => any,
    ) => {
      const selection = window.getSelection() as Selection;
      if (selection?.rangeCount === 0) return;

      const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
      const startY = pdfsContainerElement.getBoundingClientRect().top;
      const startX = pdfsContainerElement.getBoundingClientRect().left;

      let highestTop;
      let count = 0;
      for (const rect of rects) {
        const left = rect.left - startX;
        const top = rect.top - startY;

        if (!rect.width) {
          continue;
        }
        highestTop = rect.top;
        const highlight = document.createElement("span");

        highlight.style.position = "absolute";
        highlight.style.left = `${left}px`;
        highlight.style.top = `${top}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        //highlight.style.border = "1px solid red";
        highlight.style.opacity = "0.5";
        highlight.classList.add(type, selectionClass);
        highlight.style.cursor = "pointer";
        highlight.style.padding = "6px 6px";
        highlight.style.transform = "translateY(-10%)";
        if (type === "comment" || type === "bgColor") {
          highlight.style.backgroundColor = "rgba(255,0,0,0.7)";
        } else {
          highlight.style.borderBottom = "2px solid red";
        }
        if (type === "bgColor" || type === "underline") {
          //  highlight.style.pointerEvents = "none";
        }

        count++;

        //TODO: Change border in HighlightMenu instead of here
        if (onClickFunc) {
          const hClass = highlight.classList.value.split(" ") as string[];
          highlight.onclick = (event) => {
            event.stopImmediatePropagation();
            pdfsContainerElement
              .querySelectorAll<HTMLSpanElement>("." + hClass[0])!
              .forEach((highlight) => {
                const borderValue = "0px solid green";
                if (type === "bgColor") {
                  highlight.style.border = borderValue;
                } else {
                  highlight.style.borderTop = borderValue;
                  highlight.style.borderRight = borderValue;
                  highlight.style.borderLeft = borderValue;
                }
              });

            const highlights =
              pdfsContainerElement.querySelectorAll<HTMLSpanElement>(
                "." + hClass[1],
              )!;

            highlights.forEach((highlight, i) => {
              const borderValue = "2px solid green";
              if (type === "bgColor") {
                highlight.style.border = borderValue;
              } else {
                highlight.style.borderTop = borderValue;
                highlight.style.borderRight = borderValue;
                highlight.style.borderLeft = borderValue;
                highlight.style.borderBottom = "2px solid red";
              }
            });
            onClickFunc(hClass[1] as string);
          };
        }

        pdfsContainerElement.appendChild(highlight);
      }
      selection.removeAllRanges();
    },
    [],
  );

  return (
    <div
      ref={selectionMenuRef}
      className="fixed left-1/2 top-12 z-30 hidden min-w-44 -translate-x-1/2 select-none rounded border border-gray-border bg-background text-sm shadow-[3px_3px_3px_rgba(0,0,0,0.3)]"
    >
      <button
        onClick={() => {}}
        className="flex w-full items-center gap-2 rounded-none border-b bg-transparent p-3 hover:bg-gray-100/10"
      >
        <MessageSquare />
      </button>
      <button
        onClick={handleAddComment}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-3 hover:bg-gray-100/10"
      >
        <MessageSquarePlus />
      </button>
      <button
        onClick={handleCopy}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-3 hover:bg-gray-100/10"
      >
        <CopyIcon />
      </button>
      <button
        onClick={handleChangeTextBgColor}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-3 hover:bg-gray-100/10"
      >
        <Paintbrush />
      </button>
      {/* <button
        onClick={handleUnderlineText}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-3 hover:bg-gray-100/10"
      >
        <Underline />
      </button> */}
    </div>
  );
};

export default SelectionMenu;
