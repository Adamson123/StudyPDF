import * as pdfJS from "pdfjs-dist";
import { createPDFPage } from "./utils";

class PDFPage {
  pdfsContainer: HTMLDivElement;
  pdfContainer: HTMLDivElement;
  pdfCanvas: HTMLCanvasElement = document.createElement("canvas");
  loader: HTMLDivElement;
  textLayer: HTMLDivElement;
  index: number;
  scale: number = 1;
  pdfDocument: pdfJS.PDFDocumentProxy | null = null;
  pdfPage: pdfJS.PDFPageProxy | null = null;
  viewport: pdfJS.PageViewport | null = null;
  renderTask?: pdfJS.RenderTask;
  isRendered: boolean = false;

  constructor(
    index: number,
    pdfsContainer: HTMLDivElement,
    pdfDocument: pdfJS.PDFDocumentProxy,
    scale: number = 1,
  ) {
    this.index = index;
    this.pdfsContainer = pdfsContainer;

    this.pdfContainer = document.createElement("div");
    this.pdfContainer.classList.add("pdfContainer", "relative", "bg-white");
    this.pdfContainer.id = `pdfContainer-${this.index}`;

    this.textLayer = document.createElement("div");
    this.textLayer.id = `textLayer-${this.index}`;
    this.textLayer.classList.add("textLayer", "absolute", "inset-0");

    this.loader = document.createElement("div");
    this.loader.classList.add("loader");

    this.pdfContainer.appendChild(this.textLayer);
    this.pdfContainer.appendChild(this.loader);
    this.pdfDocument = pdfDocument;
    this.scale = scale;
  }

  async load() {
    this.pdfCanvas.classList.add("pdfCanvas", "shadow-lg");
    this.pdfCanvas.id = `pdfCanvas-${this.index}`;

    const pdfDocument = this.pdfDocument as pdfJS.PDFDocumentProxy;
    this.pdfPage = await createPDFPage(pdfDocument, this.index);
    this.viewport = this.pdfPage.getViewport({ scale: this.scale });

    const DPR = window.devicePixelRatio || 1;

    // const resolution = 2; // Set the resolution to 2x
    // // Resize canvas
    this.pdfCanvas.width = this.viewport.width * DPR;
    this.pdfCanvas.height = this.viewport.height * DPR;

    this.pdfCanvas.style.width = `${this.viewport.width}px`;
    this.pdfCanvas.style.height = `${this.viewport.height}px`;

    this.pdfContainer.style.width = `${this.viewport.width}px`;
    this.pdfContainer.style.height = `${this.viewport.height}px`;

    this.pdfContainer.appendChild(this.pdfCanvas);
  }

  async render() {
    const DPR = window.devicePixelRatio || 1;
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

    const pdfPage = this.pdfPage as pdfJS.PDFPageProxy;
    const viewport = this.viewport as pdfJS.PageViewport;
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

    this.loader.style.display = "none";
    await textLayer.render();

    const textLayerSpan = this.textLayer.querySelectorAll("span")!;
    textLayerSpan.forEach((span, index) => {
      span.id = `span-${this.index}-${index + 1}`;
    });
    this.isRendered = true;
  }

  cancel() {
    try {
      this.renderTask?.cancel();
      this.isRendered = false;
      this.loader.style.display = "initial";
      this.pdfCanvas.remove(); // Remove the canvas from the DOM

      // Release references to free up memory
      this.pdfPage = null;
      this.viewport = null;
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.warn("Render cancel failed", err);
      }
    }
  }

  async updateScale(newScale: number) {
    if (!this.pdfDocument) return;
    try {
      this.scale = newScale;
      await this.load();
      await this.render();
    } catch (error) {
      console.error("Error updating scale:", error);
    }
  }
}

export default PDFPage;
