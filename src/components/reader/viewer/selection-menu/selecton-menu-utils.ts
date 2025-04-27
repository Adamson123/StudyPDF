export const generateClass = (
  type: "comment" | "bgColor" | "underline" | "selectionBox",
) => {
  return `${type}-${Math.round(Math.random() * 50000000)}`;
};

// const textLayerOnMouseUp = (pdfsContainer: HTMLDivElement) => {
//   const selection = window.getSelection();
//   if (selection?.rangeCount === 0 || selection?.isCollapsed) return;

//   const range = selection?.getRangeAt(0);
//   if (range) {
//     const container = document.createElement("div");
//     container.appendChild(range.cloneContents());

//     // const comment = window.prompt("Enter Comment...");

//     const selectonClass = generateClass();
//     const selectedSpans = container.querySelectorAll("span");
//     if (Array.from(selectedSpans).map((span) => span.id).length > 1) {
//       highlightMultilineSelection(
//         selectedSpans,
//         selectonClass,
//         "",
//         pdfsContainer,
//       );
//       //TODO: add parent
//     } else {
//       const highlight = getHighlight(container.innerHTML, "");
//       highlight.classList.add(selectonClass);
//       highlight.style.borderRadius = "2px";
//       range.insertNode(highlight);
//     }

//     selection?.removeAllRanges();

//     return selectonClass;
//   }
// };

//TODO
//Copy Text to Clipboard
export const copyToClipboard = () => {
  const selection = window.getSelection() as Selection;
  if (selection?.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const text = range.toString();
  navigator.clipboard
    .writeText(text)
    .then(() => {
      //TODO: will pop up a message after copying
      console.log("Text copied to clipboard: ", text);
    })
    .catch((err) => {
      console.error("Error copying text: ", err);
      document.execCommand("copy");
    });
};

// const filterRect = (rects: DOMRectList) => {
//   const rectsArr = [...rects];
//   let expandingRects = rectsArr.shift() as DOMRect;
//   console.log("expandingRects-1", expandingRects);
//   const cleanRects = [];

//   for (const rect of rectsArr) {
//     console.log(
//       rect.top,
//       expandingRects?.top,
//       rect.top === expandingRects?.top,
//       rect.top - expandingRects.top,
//     );
//     if (
//       rect.top === expandingRects?.top ||
//       (rect.top - expandingRects.top <= 2 && rect.top - expandingRects.top >= 0)
//     ) {
//       expandingRects = {
//         left: expandingRects.left,
//         width: expandingRects.width + rect.width,
//         height: expandingRects.height,
//         top: expandingRects.top,
//         x: expandingRects.x,
//         y: expandingRects.y,
//         toJSON() {},
//         right: Math.max(expandingRects.right, rect.right),
//         bottom: Math.max(expandingRects.bottom, rect.bottom),
//       };

//       console.log("RAN:::::NNNN");
//       console.log("expandingRects-2", expandingRects);
//     } else {
//       cleanRects.push(expandingRects);
//       expandingRects = rect;
//     }
//   }

//   if (expandingRects) {
//     cleanRects.push(expandingRects);
//   }

//   return cleanRects as DOMRect[];
// };

//Try to use use getClientRects to get the selection range then create a svg element from it instead of append a span element to the range we want to append a svg element to the range
export const highlightSelection = (
  selectionClass: string,
  pdfsContainer: HTMLDivElement,
  type: "comment" | "bgColor" | "underline",
  onClickFunc?: (highlightClass: string) => any,
) => {
  const selection = window.getSelection() as Selection;
  if (selection?.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rects = range.getClientRects();
  const startY = pdfsContainer.getBoundingClientRect().top;
  const startX = pdfsContainer.getBoundingClientRect().left;

  console.log(rects);

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
        pdfsContainer
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

        const highlights = pdfsContainer.querySelectorAll<HTMLSpanElement>(
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

    pdfsContainer.appendChild(highlight);
  }
  selection.removeAllRanges();
  console.log("rects", rects);
};
