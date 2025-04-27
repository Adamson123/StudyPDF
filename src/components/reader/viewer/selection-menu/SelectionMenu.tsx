import {
  CopyIcon,
  MessageSquare,
  MessageSquarePlus,
  Paintbrush,
  Underline,
} from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react";
import {
  copyToClipboard,
  generateClass,
  highlightSelection,
} from "./selecton-menu-utils";

const SelectionMenu = ({
  pdfsContainer,
  openAddComment,
  setMessage,
  setHighlightClass,
}: {
  pdfsContainer: RefObject<HTMLDivElement>;
  openAddComment: (id: string) => void;
  setMessage: Dispatch<SetStateAction<string>>;
  setHighlightClass: Dispatch<SetStateAction<string>>;
}) => {
  const selectionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let start: { y: number; scrollY: number } = { y: 0, scrollY: 0 };
    const handleSelectStart = () => {
      const selection = window.getSelection();
      if (selection?.rangeCount === 0 || !selection) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      start = { y: rect.top, scrollY: window.scrollY };
    };

    const updateSelectionMenuPos = (rect: DOMRect, range: Range, width = 0) => {
      const pdfsContainerRect = (
        pdfsContainer.current as HTMLDivElement
      ).getBoundingClientRect();

      const selectionMenu = selectionMenuRef.current as HTMLDivElement;
      //const selectionMenuRect = selectionMenu.getBoundingClientRect();
      const selectionMenuRectHeight = 221;
      const selectionMenuRectWidth = 176;

      let shiftRight = 0;
      if (rect.right + selectionMenuRectWidth > window.innerWidth) {
        shiftRight = window.innerWidth - selectionMenuRectWidth - 50;
      }

      const switchVertical =
        rect.top + selectionMenuRectHeight + 20 > window.innerHeight;

      const parentRight = pdfsContainerRect.right;
      const left = window.innerWidth - parentRight;

      if (pdfsContainer.current?.contains(range?.commonAncestorContainer))
        selectionMenu.style.display = "flex";
    };
    //
    //   selectionMenu.style.left = shiftRight
    //     ? shiftRight + "px"
    //     : rect.left - left + width + window.scrollX + "px";
    //   //
    //   selectionMenu.style.top = switchVertical
    //     ? start.y + window.scrollY - selectionMenuRectHeight - 70 + "px"
    //     : rect.top + window.scrollY - 20 + "px";
    // };

    const getSelectionInfo = () => {
      const selection = window.getSelection() as Selection;

      if (selection?.toString().length) {
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(false);
        return { rect: range.getBoundingClientRect(), range };
      }
    };

    const updatePosAfterCollapse = () => {
      const selection = window.getSelection();
      if (selection?.rangeCount === 0 || selection?.isCollapsed) return;

      const range = selection?.getRangeAt(0);
      if (range) {
        const container = document.createElement("div");
        container.appendChild(range.cloneContents());

        const spansWithIds = Array.from(
          container.querySelectorAll("span")!,
        ).filter((span) => span.id);
        const lastSpan = spansWithIds[
          spansWithIds.length - 1
        ] as HTMLSpanElement;

        if (!lastSpan) {
          return;
        }
        const rect = (pdfsContainer.current as HTMLDivElement)
          .querySelector("#" + lastSpan.id)!
          .getBoundingClientRect();

        updateSelectionMenuPos(rect, range, rect.width);
      }
    };

    const handleScroll = () => {
      const rect = getSelectionInfo()?.rect;
      if (rect) {
        const selectionMenu = selectionMenuRef.current as HTMLDivElement;
        const selectionMenuRect = selectionMenu.getBoundingClientRect();
        const switchVertical =
          rect.top + selectionMenuRect.height + 20 > window.innerHeight;

        selectionMenu.style.top = switchVertical
          ? rect.bottom + window.scrollY - selectionMenuRect.height - 90 + "px"
          : rect.top + window.scrollY - 20 + "px";
      }
    };

    const handleSelectionChange = () => {
      const selectionMenu = selectionMenuRef.current as HTMLDivElement;
      const selection = getSelectionInfo();
      if (selection) {
        const { rect, range } = selection;
        updateSelectionMenuPos(rect, range);
        if (!rect.x && !rect.y) updatePosAfterCollapse();
      } else {
        //TODO:
        selectionMenu.style.display = "none";
      }
    };

    // document.addEventListener("mousedown", handleSelectStart);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("selectionchange", handleSelectionChange);
    // document.addEventListener("scroll", handleScroll);

    return () => {
      // document.removeEventListener("mousedown", handleSelectStart);
      document.removeEventListener("selectionchange", handleSelectionChange);
      // document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);

  const handleAddComment = () => {
    // const selectonClass = textLayerOnMouseUp(
    //   pdfsContainer.current as HTMLDivElement,
    // );
    // if (selectonClass) openAddComment(selectonClass);
    (selectionMenuRef.current as HTMLDivElement).style.display = "none";
    const selectionClass = generateClass("comment");
    highlightSelection(
      selectionClass,
      pdfsContainer.current as HTMLDivElement,
      "comment",
    );
    openAddComment(selectionClass);
  };

  const handleChangeTextBgColor = () => {
    const selectionClass = generateClass("bgColor");
    const onClickFunc = (highlightClass: string) => {
      setHighlightClass(highlightClass);
    };
    highlightSelection(
      selectionClass,
      pdfsContainer.current as HTMLDivElement,
      "bgColor",
      onClickFunc,
    );
  };

  const handleUnderlineText = () => {
    const selectionClass = generateClass("underline");
    const onClickFunc = (highlightClass: string) => {
      setHighlightClass(highlightClass);
    };
    highlightSelection(
      selectionClass,
      pdfsContainer.current as HTMLDivElement,
      "underline",
      onClickFunc,
    );
  };

  const handleCopy = () => {
    copyToClipboard();
    setMessage("Text copied");
  };

  return (
    <div
      ref={selectionMenuRef}
      className="fixed left-1/2 top-12 z-30 hidden min-w-44 -translate-x-1/2 select-none rounded border border-gray-border bg-background text-sm shadow-[3px_3px_3px_rgba(0,0,0,0.3)]"
    >
      <button
        onClick={() => {}}
        className="flex w-full items-center gap-2 rounded-none border-b bg-transparent p-2.5 hover:bg-gray-100/10"
      >
        <MessageSquare />
      </button>
      <button
        onClick={handleAddComment}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-2.5 hover:bg-gray-100/10"
      >
        <MessageSquarePlus />
      </button>
      <button
        onClick={handleCopy}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-2.5 hover:bg-gray-100/10"
      >
        <CopyIcon />
      </button>
      <button
        onClick={handleChangeTextBgColor}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-2.5 hover:bg-gray-100/10"
      >
        <Paintbrush />
      </button>
      <button
        onClick={handleUnderlineText}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-2.5 hover:bg-gray-100/10"
      >
        <Underline />
      </button>
    </div>
  );
};

export default SelectionMenu;
