export const getHighlight = (html: string, comment: string) => {
  const highlight = document.createElement("span");
  highlight.style.backgroundColor = "rgba(255,0,0,0.4)";
  highlight.style.position = "absolute";
  highlight.innerHTML = html;
  highlight.classList.add("alertComment");
  highlight.dataset.comment = comment;
  highlight.style.cursor = "pointer";
  highlight.style.paddingLeft = "1px";
  highlight.style.paddingRight = "1px";
  highlight.style.userSelect = "none";

  highlight.querySelectorAll(".alertComment").forEach((span) => {
    span.remove();
  });

  highlight.onclick = (event: Event) => {
    event.stopImmediatePropagation();
    alert(highlight.dataset.comment);
  };
  return highlight;
};

export const highlightMultilineSelection = (
  selectedSpans: NodeListOf<HTMLSpanElement>,
  comment = "",
  parent: HTMLDivElement,
) => {
  selectedSpans.forEach((span, index) => {
    const spanInDom = document.querySelector("#" + span.id)!;
    if (spanInDom && spanInDom.textContent) {
      const highlight = getHighlight(span.innerHTML, comment);

      if (index === 0) {
        highlight.style.right = "0";
        highlight.style.borderTopLeftRadius = "2px";
        highlight.style.borderBottomLeftRadius = "2px";
        spanInDom.appendChild(highlight);
      } else if (index > 0 && index < selectedSpans.length - 1) {
        highlight.style.left = "0";
        highlight.style.right = "0";
        spanInDom.appendChild(highlight);
      } else {
        highlight.style.left = "0";
        highlight.style.borderTopRightRadius = "2px";
        highlight.style.borderBottomRightRadius = "2px";
        spanInDom.appendChild(highlight);
      }
    }
  });
};
