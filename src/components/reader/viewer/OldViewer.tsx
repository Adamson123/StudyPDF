import { Document } from "@/lib/db";
import { RefObject, useEffect } from "react";

const addComment = (pages: NodeListOf<HTMLDivElement>) => {
  pages.forEach((page) => {
    page.addEventListener("mouseup", () => {
      let selection = window.getSelection();
      if (!selection?.rangeCount) return;
      let range = selection.getRangeAt(0);
      let contents = range.extractContents();

      let span = document.createElement("span");
      span.classList.add("bg-red-500", "px-1", "rounded");
      span.appendChild(contents);

      range.insertNode(span);
      selection.removeAllRanges();
    });
  });
};
const Viewer = ({
  documentRenderer,
  document,
}: {
  documentRenderer: RefObject<HTMLDivElement>;
  document: Document;
}) => {
  useEffect(() => {
    if (!document?.content || !documentRenderer.current) return;

    documentRenderer.current.innerHTML = document.content;

    const pages =
      documentRenderer.current?.querySelectorAll<HTMLDivElement>(".pf");

    pages.forEach((div, index) => {
      div.classList.add(
        "scale-[0.68]",
        "md:scale-[0.8]",
        "lg:scale-[1.001]",
        `origin-top`,
      );

      if (!index) div.style.margin = "0";
      div.style.padding = "0";

      div.querySelector("img")!.draggable = false;
      div.querySelector("img")!.style.pointerEvents = "none";
    });

    const pagesT =
      documentRenderer.current?.querySelectorAll<HTMLDivElement>(".t");

    addComment(pagesT);

    const pageContainer =
      documentRenderer.current.querySelector<HTMLDivElement>(
        "#page-container",
      )!;

    //  pageContainer.style.overflowX = "hidden";
    pageContainer.style.position = "initial";
    pageContainer.style.background = "transparent";
    pageContainer.style.overflowY = "hidden";
    pageContainer.style.padding = "0";
    pageContainer.style.margin = "0";
    pageContainer.style.overflowX = "auto";
    pageContainer.style.scrollbarWidth = "none";

    pageContainer.classList.add(
      "flex",
      "flex-col",
      "items-center",
      "gap-2",
      "-space-y-64",
      "md:-space-y-40",
      "lg:space-y-10",

      "justify-center",
    );
  }, [document]);

  return (
    <section
      className="flex w-full flex-col items-center justify-center overflow-x-hidden"
      ref={documentRenderer}
    />
  );
};

export default Viewer;
