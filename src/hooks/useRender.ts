import {
    Dispatch,
    RefObject,
    SetStateAction,
    useEffect,
    useState,
} from "react";
import PDFPage from "../components/reader/viewer/pdfPage";
import { getPDFDocument } from "../components/reader/viewer/utils";

/**
 * Custom hook to render PDF pages in a container.
 * This hook manages the loading and rendering of PDF pages based on the provided PDF information, scale factor, and container reference.
 * @param pdfInfo - Information about the PDF to be rendered, including its name and URL.
 * @param pdfsContainer - A reference to the container where the PDF pages will be rendered.
 * @param scale - The scale factor for rendering the PDF pages.
 * @param setMessage - A function to set messages for user notifications.
 * @returns An object containing functions and state related to rendering PDF pages, including the list of pages, loading state, and metadata.
 */
function useRender({
    pdfInfo,
    pdfsContainer,
    scale,
    setMessage,
}: {
    pdfsContainer: RefObject<HTMLDivElement>;
    pdfInfo: { name: string; url: string };
    scale: number;
    setMessage: Dispatch<
        SetStateAction<{ text: string; autoTaminate: boolean }>
    >;
}) {
    const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
    const [loadingPDF, setLoadingPDF] = useState(false);
    const [pdfData, setPdfData] = useState<PdfDataTypes>();

    const renderPDFsOnView = async (
        currentPdfPages: PDFPage[],
        isScaliing = false,
    ) => {
        const pdfsContainerElement = pdfsContainer.current;
        if (!pdfsContainerElement || !currentPdfPages.length) return;

        const RENDER_BUFFER = 2; // Number of pages to render before and after the visible ones
        const MAX_CONCURRENT_RENDERS = 2; // Maximum number of pages to render simultaneously

        const pagesToProcess: {
            page: PDFPage;
            rect: DOMRect;
            index: number;
        }[] = [];
        for (let i = 0; i < currentPdfPages.length; i++) {
            const pageInstance = currentPdfPages[i]!;
            const pageElement = pdfsContainerElement.querySelector(
                `#pdfContainer-${pageInstance.index}`,
            );
            if (pageElement) {
                // Collect page information and its bounding rectangle
                pagesToProcess.push({
                    page: pageInstance,
                    rect: pageElement.getBoundingClientRect(),
                    index: i,
                });
            }
        }

        let firstVisibleIndex = -1; // Index of the first visible page
        let lastVisibleIndex = -1; // Index of the last visible page

        for (let i = 0; i < pagesToProcess.length; i++) {
            const { rect } = pagesToProcess[i]!;
            const isInView = rect.bottom > 0 && rect.top < window.innerHeight; // Check if the page is in the viewport
            if (isInView) {
                if (firstVisibleIndex === -1) firstVisibleIndex = i;
                lastVisibleIndex = i;
            }
        }

        const pagesToActuallyRender: PDFPage[] = []; // Pages that need to be rendered
        const pagesToCancel: PDFPage[] = []; // Pages that need to stop rendering

        if (firstVisibleIndex !== -1) {
            // If there are visible pages
            const renderStartIndex = Math.max(
                0,
                firstVisibleIndex - RENDER_BUFFER,
            ); // Start rendering a few pages before the first visible one
            const renderEndIndex = Math.min(
                currentPdfPages.length - 1,
                lastVisibleIndex + RENDER_BUFFER, // End rendering a few pages after the last visible one
            );

            for (let i = 0; i < pagesToProcess.length; i++) {
                const { page } = pagesToProcess[i]!;
                if (i >= renderStartIndex && i <= renderEndIndex) {
                    if (!page.isRendered || isScaliing) {
                        // Add to render queue if not already rendered or if scaling
                        pagesToActuallyRender.push(page);
                    }
                } else {
                    if (page.isRendered) {
                        // Add to cancel queue if already rendered but outside the buffer
                        pagesToCancel.push(page);
                    }
                }
            }
        } else {
            // If no pages are visible, cancel all rendered pages
            pagesToProcess.forEach((p) => {
                if (p.page.isRendered) pagesToCancel.push(p.page);
            });
        }

        // Cancel rendering for pages outside the buffer
        for (const pageToCancel of pagesToCancel) {
            if (pageToCancel.isRendered) {
                // Double-check before canceling
                //  console.log(`cancelling pdf ${pageToCancel.index}`);
                pageToCancel.cancel();
                //  console.log(`cancelled pdf ${pageToCancel.index}`);
            }
        }

        // Render pages in batches to limit concurrent rendering
        for (
            let i = 0;
            i < pagesToActuallyRender.length;
            i += MAX_CONCURRENT_RENDERS
        ) {
            const batch = pagesToActuallyRender.slice(
                i,
                i + MAX_CONCURRENT_RENDERS,
            );
            const renderPromises = batch.map(async (p) => {
                if (!p.isRendered || isScaliing) {
                    // Check again before rendering
                    //  console.log(`rendering ${p.index}`);
                    await p.load(); // Ensure the page is loaded
                    await p.render(); // Render the page
                    //   console.log(`rendered ${p.index}`);
                }
            });
            await Promise.all(renderPromises); // Wait for all pages in the batch to finish rendering
        }
    };

    useEffect(() => {
        (async () => {
            if (pdfData?.pdfDocument) {
                pdfData.pdfDocument.destroy(); // Clean up previous PDF document if it exists
            }

            const pdfDocument = await getPDFDocument(pdfInfo.url); // Fetch the PDF document from the provided URL
            setPdfData({
                ...pdfInfo,
                pdfDocument,
                numOfPages: pdfDocument.numPages,
            }); // Update state with PDF document and metadata
            const pdfPages: PDFPage[] = [];

            for (let index = 1; index <= pdfDocument.numPages; index++) {
                const pdfPage = new PDFPage(
                    index,
                    pdfsContainer.current as HTMLDivElement,
                    pdfDocument,
                    scale, // Initialize each PDF page with its index, container, document, and scale
                );
                await pdfPage.load(); // Load the page content
                pdfPages.push(pdfPage); // Add the page to the list of pages
            }

            setLoadingPDF(false); // Set loading state to false after loading all pages

            const pdfsContainerElement =
                pdfsContainer.current as HTMLDivElement;
            if (pdfsContainerElement) pdfsContainerElement.innerHTML = ""; // Clear the container before appending new pages
            for (let index = 0; index < pdfPages.length; index++) {
                const pdfPage = pdfPages[index] as PDFPage;
                if (
                    pdfsContainer.current?.querySelectorAll(".pdfContainer")
                        .length !== pdfPages.length // Check if the container doesn't already have the correct number of pages
                ) {
                    pdfsContainer.current?.appendChild(pdfPage.pdfContainer); // Append the page container to the DOM
                }
            }

            await renderPDFsOnView(pdfPages); // Render the visible pages based on the current viewport
            setPdfPages(pdfPages); // Update state with the list of loaded pages

            setMessage({
                text: "PDF Loaded Successfully", // Notify the user that the PDF has been loaded
                autoTaminate: true,
            });

            document.documentElement.style.setProperty(
                "--total-scale-factor",
                scale.toString(), // Update the CSS variable for the scale factor
            );
        })();
    }, [pdfInfo]); // Re-run the effect when pdfInfo changes

    return {
        renderPDFsOnView, // Function to render visible pages
        loadingPDF, // Loading state
        pdfPages, // List of loaded PDF pages
        pdfData, // Metadata and document reference
    };
}

export default useRender;
