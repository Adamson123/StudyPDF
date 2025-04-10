import {
  getHighlight,
  highlightMultilineSelection,
} from "./pdf_highlight_utils";

const { EventBus, PDFFindController, PDFLinkService, TextLayerBuilder } =
  await import("pdfjs-dist/web/pdf_viewer.mjs");
import TextHighlighter from "./text_highlighter";

import * as pdfJS from "pdfjs-dist";
import { createPDFPage, renderPDFToCanvas } from "./pdf_utils";
import { TextLayerBuilder as TextLayerBuilderType } from "pdfjs-dist/web/pdf_viewer.mjs";

// PDFPage Class
class PDFPage {
  parent: HTMLDivElement;
  pdfContainer: HTMLDivElement;
  pdfCanvas: HTMLCanvasElement;
  textLayerBuilder!: TextLayerBuilderType;

  index: number;

  constructor(index: number, parent: HTMLDivElement) {
    this.index = index;
    this.parent = parent;
    this.pdfContainer = document.createElement("div");
    this.pdfContainer.classList.add("pdfContainer", "relative");

    this.pdfCanvas = document.createElement("canvas");
    this.pdfCanvas.classList.add("pdfCanvas");
    this.pdfCanvas.id = this.index.toString();
  }

  async render(pdfDocument: pdfJS.PDFDocumentProxy) {
    const pdfPage = await createPDFPage(pdfDocument, this.index);
    const viewport = pdfPage.getViewport({ scale: 1 });

    // Set canvas dimensions
    this.pdfCanvas.width = viewport.width;
    this.pdfCanvas.height = viewport.height;

    // Render PDF to canvas
    await renderPDFToCanvas(pdfPage, this.pdfCanvas);

    // Initialize TextLayerBuilder
    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus });
    linkService.setDocument(pdfDocument);
    const findController = new PDFFindController({ eventBus, linkService });

    const highlighter = pdfJS.shadow(
      this,
      "_textHighlighter",
      new TextHighlighter({
        findController,
        eventBus,
        pageIndex: this.index,
      }),
    );

    this.textLayerBuilder = new TextLayerBuilder({
      pdfPage,
      highlighter,
      onAppend: () => {
        console.log("Appending");
      },
    });

    await this.textLayerBuilder.render({
      viewport: viewport,
    });

    this.textLayerBuilder.show();
    this.textLayerBuilder.div.addEventListener(
      "mouseup",
      this.textLayerOnMouseUp,
    );
    this.textLayerBuilder.div
      .querySelectorAll('span[role="presentation"]')!
      .forEach((span, index) => {
        span.id = `span-${this.index}-${index + 1}`;
      });

    this.pdfContainer.appendChild(this.pdfCanvas);
    this.pdfContainer.appendChild(this.textLayerBuilder.div);
  }

  textLayerOnMouseUp = (event: MouseEvent) => {
    const selection = window.getSelection();
    if (selection?.rangeCount === 0 || selection?.isCollapsed) return;

    const range = selection?.getRangeAt(0);
    if (range) {
      const container = document.createElement("div");
      container.appendChild(range.cloneContents());

      const comment = window.prompt("Enter Comment...");

      const selectedSpans = container.querySelectorAll("span");
      if (Array.from(selectedSpans).map((span) => span.id).length > 1) {
        highlightMultilineSelection(
          selectedSpans,
          comment as string,
          this.parent,
        );
      } else {
        const highlight = getHighlight(container.innerHTML, comment as string);
        highlight.style.borderRadius = "2px";
        range.insertNode(highlight);
      }

      selection?.removeAllRanges();
    }
  };
}

export default PDFPage;
