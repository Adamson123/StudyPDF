import * as pdfJS from "pdfjs-dist";
import { createPDFPage, renderPDFToCanvas } from "./pdf-utils";

// PDFPage Class
// class PDFPage {
//   parent: HTMLDivElement;
//   pdfContainer: HTMLDivElement;
//   pdfCanvas: HTMLCanvasElement;
//   textLayer: HTMLDivElement;

//   index: number;

//   constructor(index: number, parent: HTMLDivElement) {
//     this.index = index;
//     this.parent = parent;
//     this.pdfContainer = document.createElement("div");
//     this.pdfContainer.classList.add("pdfContainer", "relative");
//     this.pdfContainer.id = `pdfContainer-${this.index}`;

//     this.pdfCanvas = document.createElement("canvas");
//     this.pdfCanvas.classList.add("pdfCanvas");
//     this.pdfCanvas.id = `pdfCanvas-${this.index}`;

//     this.textLayer = document.createElement("div");
//     this.textLayer.id = `textLayer-${this.index}`;

//     this.textLayer.classList.add("textLayer", "absolute", "inset-0");
//   }

//   async render(pdfDocument: pdfJS.PDFDocumentProxy) {
//     const pdfPage = await createPDFPage(pdfDocument, this.index);
//     const viewport = pdfPage.getViewport({ scale: 1 });

//     // Set canvas dimensions
//     this.pdfCanvas.width = viewport.width;
//     this.pdfCanvas.height = viewport.height;

//     // Render the PDF canvas
//     await renderPDFToCanvas(pdfPage, this.pdfCanvas);

//     // 🧠 Get the text content
//     const textContent = await pdfPage.getTextContent();

//     const textLayer = new pdfJS.TextLayer({
//       textContentSource: textContent,
//       viewport: viewport,
//       container: this.textLayer,
//     });

//     await textLayer.render();

//     // this.pdfCanvas.style.scale = "0.7";
//     // const canvasRect = this.pdfCanvas.getBoundingClientRect();
//     // this.textLayer.style.top = canvasRect.top + "px";
//     // this.textLayer.style.left = canvasRect.left + "px";
//     // this.textLayer.style.scale = "0.7";
//     // this.pdfContainer.style.scale = "0.8";

//     const textLayerSpan = this.textLayer.querySelectorAll("span")!;

//     textLayerSpan.forEach((span, index) => {
//       span.id = `span-${this.index}-${index + 1}`;
//     });

//     // this.textLayer.addEventListener("mouseup", this.textLayerOnMouseUp);

//     this.pdfContainer.appendChild(this.pdfCanvas);
//     this.pdfContainer.appendChild(this.textLayer);
//   }

//   updateScale(scale: number) {
//     //this.pdfContainer.style.scale = scale.toString();
//     this.parent.querySelector<HTMLDivElement>(
//       "#" + this.pdfContainer.id,
//     )!.style.transform = `scale(${scale})`; //scale.toString();
//   }
// }

class PDFPage {
  parent: HTMLDivElement;
  pdfContainer: HTMLDivElement;
  pdfCanvas: HTMLCanvasElement;
  textLayer: HTMLDivElement;
  index: number;
  scale: number = 1;
  pdfDocument: pdfJS.PDFDocumentProxy | null = null;
  renderTask?: pdfJS.RenderTask;

  constructor(index: number, parent: HTMLDivElement) {
    this.index = index;
    this.parent = parent;

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

    // Resize canvas
    this.pdfCanvas.width = viewport.width;
    this.pdfCanvas.height = viewport.height;

    // Kill previous render
    try {
      this.renderTask?.cancel();
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.warn("Render cancel failed", err);
      }
    }

    const context = this.pdfCanvas.getContext("2d");

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
