import {
  CopyIcon,
  MessageSquare,
  MessageSquarePlus,
  Paintbrush,
  Underline,
} from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import {
  getHighlight,
  highlightMultilineSelection,
} from "../viewer/pdf-highlight-utils";

const textLayerOnMouseUp = () => {
  const selection = window.getSelection();
  if (selection?.rangeCount === 0 || selection?.isCollapsed) return;

  const range = selection?.getRangeAt(0);
  if (range) {
    const container = document.createElement("div");
    container.appendChild(range.cloneContents());

    const comment = window.prompt("Enter Comment...");

    const selectedSpans = container.querySelectorAll("span");
    if (Array.from(selectedSpans).map((span) => span.id).length > 1) {
      highlightMultilineSelection(selectedSpans, comment as string);
      //TODO: add parent
    } else {
      const highlight = getHighlight(container.innerHTML, comment as string);
      highlight.style.borderRadius = "2px";
      range.insertNode(highlight);
    }

    selection?.removeAllRanges();
  }
};
const SelectionMenu = ({
  parent,
  scale,
}: {
  parent: RefObject<HTMLDivElement>;
  scale: number;
}) => {
  const selectionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let start: { y: number; scrollY: number } = { y: 0, scrollY: 0 };
    const handleSelectStart = (event: MouseEvent) => {
      // const selection = window.getSelection() as Selection;
      // //  if (selection?.toString().length) {
      // start = selection.getRangeAt(0).getBoundingClientRect();
      // //  }
      // console.log("started");
      start = { y: event.clientY, scrollY: window.scrollY };
    };

    let globalRect: DOMRect;

    const updateSelectionMenuPos = (rect: DOMRect, width = 0) => {
      globalRect = rect;
      const parentRect = (
        parent.current as HTMLDivElement
      ).getBoundingClientRect();

      const selectionMenu = selectionMenuRef.current as HTMLDivElement;
      const selectionMenuRect = selectionMenu.getBoundingClientRect();

      let shiftRight = 0;
      if (rect.right + selectionMenuRect.width > window.innerWidth) {
        shiftRight = window.innerWidth - selectionMenuRect.width - 50;
      }

      const switchVertical =
        rect.top + selectionMenuRect.height + 20 > window.innerHeight;

      console.log({
        y: rect.y,
        height: rect.height,
        start,
        switchVertical,
        windowHeight: window.innerHeight,
      });

      const parentRight = parentRect.right;
      const left = window.innerWidth - parentRight;

      selectionMenu.style.display = "initial";
      //
      selectionMenu.style.left = shiftRight
        ? shiftRight + "px"
        : rect.left - left + width + window.scrollX + "px";
      //
      selectionMenu.style.top = switchVertical
        ? start.y + window.scrollY - selectionMenuRect.height - 70 + "px"
        : rect.top + window.scrollY - 20 + "px";
    };

    const getSelectionBoundingClient = () => {
      const selection = window.getSelection() as Selection;

      if (selection?.toString().length) {
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(false);
        return range.getBoundingClientRect();
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
        const rect = (parent.current as HTMLDivElement)
          .querySelector("#" + lastSpan.id)!
          .getBoundingClientRect();

        updateSelectionMenuPos(rect, rect.width);
      }
    };

    const handleScroll = () => {
      const rect = getSelectionBoundingClient();
      if (rect) {
        const selectionMenu = selectionMenuRef.current as HTMLDivElement;
        const selectionMenuRect = selectionMenu.getBoundingClientRect();
        const switchVertical =
          rect.top + selectionMenuRect.height + 20 > window.innerHeight;

        console.log({ switchVertical });
        selectionMenu.style.top = switchVertical
          ? rect.y -
            start.y +
            window.scrollY -
            selectionMenuRect.height +
            10 +
            "px"
          : rect.top + window.scrollY - 20 + "px";

        // if (switchVertical) {
        //  selectionMenu.style.top = start.y - selectionMenuRect.height + "px";
        // } else {
        //  selectionMenu.style.top = globalRect.top - 20 + "px";
        // }
      }
    };

    const handleSelectionChange = () => {
      const selectionMenu = selectionMenuRef.current as HTMLDivElement;
      const rect = getSelectionBoundingClient();
      if (rect) {
        updateSelectionMenuPos(rect);
        if (!rect.x && !rect.y) updatePosAfterCollapse();
      } else {
        selectionMenu.style.display = "none";
      }
    };

    document.addEventListener("mousedown", handleSelectStart);
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleSelectStart);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      ref={selectionMenuRef}
      className="absolute z-30 hidden min-w-44 select-none rounded bg-background text-sm shadow-[3px_3px_3px_rgba(0,0,0,0.3)]"
    >
      <button
        onClick={textLayerOnMouseUp}
        className="flex w-full items-center gap-2 rounded-none border-b bg-transparent p-2.5 hover:bg-gray-100/5"
      >
        <MessageSquare /> Ask AI Assistant
      </button>
      <button
        onClick={textLayerOnMouseUp}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-2.5 hover:bg-gray-100/5"
      >
        <MessageSquarePlus /> Add Comment
      </button>
      <button
        onClick={textLayerOnMouseUp}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-2.5 hover:bg-gray-100/5"
      >
        <CopyIcon /> Copy Text
      </button>
      <button
        onClick={textLayerOnMouseUp}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-2.5 hover:bg-gray-100/5"
      >
        <Paintbrush /> Highlight Text
      </button>
      <button
        onClick={textLayerOnMouseUp}
        className="flex w-full items-center gap-2 rounded-none bg-transparent p-2.5 hover:bg-gray-100/5"
      >
        <Underline /> Underline Text
      </button>
    </div>
  );
};

export default SelectionMenu;
