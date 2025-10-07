import { useEffect } from "react";
import PDFPage from "../../viewer/pdfPage";

function useUpdateOnScroll({
    pdfsContainer,
    pdfPages,
    setPageNum,
    debouncedHandler,
    pageNum,
    renderPDFsOnView,
}: {
    pdfsContainer: React.RefObject<HTMLDivElement>;
    pdfPages: PDFPage[];
    setPageNum: (pageNum: string) => void;
    pageNum: string;
    renderPDFsOnView: (pdfPage: PDFPage[]) => Promise<void>;
    debouncedHandler: (
        func: () => Promise<void>,
        timeoutId: NodeJS.Timeout | any,
        delay: number,
    ) => () => void;
}) {
    useEffect(() => {
        /**
         * Updates the current page number based on the user's scroll position.
         *
         * This function calculates which PDF page is currently in view by checking the
         * position of each page relative to the viewport. If multiple pages are partially
         * visible, it determines the page with the larger visible portion and sets it as
         * the current page.
         *
         * @async
         * @returns {Promise<void>} Resolves when the page number is updated and PDFs in view are rendered.
         *
         * @remarks
         * - The function assumes that each page is represented by an element with the class `pdfContainer`.
         * - The `pdfsContainer` ref must point to a valid HTMLDivElement containing the PDF pages.
         *
         * @see renderPDFsOnView
         * @see setPageNum
         */
        const updatePageNumOnScroll = async () => {
            //   if (onPageNumInput.current) return;
            const pdfsContainerElement =
                pdfsContainer.current as HTMLDivElement;
            if (!pdfsContainerElement) return;
            const pages =
                pdfsContainerElement.querySelectorAll(".pdfContainer");
            if (!pages.length) return;

            let currentPageNum = 1;

            interface PagePos {
                index: number;
                top: number;
                bottom: number;
            }

            const pagePos: PagePos[] = [];

            for (let index = 0; index < pages.length; index++) {
                const page = pages[index] as HTMLDivElement;
                const rect = page.getBoundingClientRect();

                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    currentPageNum = index + 1;

                    pagePos.push({
                        index: currentPageNum,
                        bottom: rect.bottom,
                        top: rect.top,
                    });

                    //  break;
                }
                if (pagePos.length >= 2) {
                    break;
                }
            }

            if (pagePos.length > 1) {
                const firstPage = pagePos[0] as PagePos;
                const secondPage = pagePos[1] as PagePos;

                const remainOfFirstInView = firstPage.bottom;
                const remainOfSecondInView =
                    window.innerHeight - secondPage.top;

                if (remainOfFirstInView > remainOfSecondInView) {
                    currentPageNum = firstPage.index;
                } else {
                    currentPageNum = secondPage.index;
                }
            }

            setPageNum(currentPageNum.toString());
        };

        let scrollTimeoutId: NodeJS.Timeout | any = null;
        const renderPDFsOnDebounce = debouncedHandler(
            async () => {
                await renderPDFsOnView(pdfPages);
            },
            scrollTimeoutId,
            500,
        );

        const onScroll = () => {
            //TODO: update page num on debounce too
            updatePageNumOnScroll();
            renderPDFsOnDebounce();
        };

        window.addEventListener("scroll", onScroll);
        //    window.addEventListener("scrollend", debouncedFunc);
        return () => {
            window.removeEventListener("scroll", onScroll);
            //  window.removeEventListener("scrollend", throttleFunc);
        };
    }, [pdfPages, pageNum]);
}

export default useUpdateOnScroll;
