import * as pdfJS from "pdfjs-dist";
import { createPDFPage } from "./utils";

class PDFPage {
  pdfsContainer: HTMLDivElement;
  pdfContainer: HTMLDivElement;
  pdfCanvas: HTMLCanvasElement;
  textLayer: HTMLDivElement;
  index: number;
  scale: number = 1;
  pdfDocument: pdfJS.PDFDocumentProxy | null = null;
  renderTask?: pdfJS.RenderTask;

  constructor(index: number, pdfsContainer: HTMLDivElement) {
    this.index = index;
    this.pdfsContainer = pdfsContainer;

    this.pdfContainer = document.createElement("div");
    this.pdfContainer.classList.add("pdfContainer", "relative");
    this.pdfContainer.id = `pdfContainer-${this.index}`;

    this.pdfCanvas = document.createElement("canvas");
    this.pdfCanvas.classList.add("pdfCanvas");
    this.pdfCanvas.id = `pdfCanvas-${this.index}`;

    this.textLayer = document.createElement("div");
    this.textLayer.id = `textLayer-${this.index}`;
    this.textLayer.classList.add("textLayer", "absolute", "inset-0");

    this.pdfContainer.appendChild(this.pdfCanvas);
    this.pdfContainer.appendChild(this.textLayer);
  }

  async render(pdfDocument: pdfJS.PDFDocumentProxy, scale: number = 1) {
    this.pdfDocument = pdfDocument;
    this.scale = scale;

    const pdfPage = await createPDFPage(pdfDocument, this.index);
    const viewport = pdfPage.getViewport({ scale: this.scale });

    const DPR = window.devicePixelRatio || 1;

    // const resolution = 2; // Set the resolution to 2x
    // // Resize canvas
    this.pdfCanvas.width = viewport.width * DPR;
    this.pdfCanvas.height = viewport.height * DPR;

    this.pdfCanvas.style.width = `${viewport.width}px`;
    this.pdfCanvas.style.height = `${viewport.height}px`;

    // Kill previous render
    try {
      this.renderTask?.cancel();
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.warn("Render cancel failed", err);
      }
    }

    const context = this.pdfCanvas.getContext("2d");
    if (context) {
      context.scale(DPR, DPR);
    }

    // Start render task
    this.renderTask = pdfPage.render({
      canvasContext: context as CanvasRenderingContext2D,
      viewport,
    });

    try {
      await this.renderTask.promise;
    } catch (error) {
      console.log(error);
    }

    // Clear text layer
    this.textLayer.innerHTML = "";

    const textContent = await pdfPage.getTextContent();

    const textLayer = new pdfJS.TextLayer({
      textContentSource: textContent,
      viewport: viewport,
      container: this.textLayer,
    });

    await textLayer.render();

    const textLayerSpan = this.textLayer.querySelectorAll("span")!;
    textLayerSpan.forEach((span, index) => {
      span.id = `span-${this.index}-${index + 1}`;
    });
  }

  async updateScale(newScale: number) {
    if (!this.pdfDocument) return;
    try {
      await this.render(this.pdfDocument, newScale);
    } catch (error) {
      console.error("Error updating scale:", error);
    }
  }
}

export default PDFPage;
