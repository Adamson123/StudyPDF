import {
    Search,
    Minus,
    Plus,
    PanelLeftDashed,
    ChevronsRight,
    Stars,
    LucideFileInput,
    Upload,
} from "lucide-react";
import {
    ChangeEvent,
    Dispatch,
    KeyboardEvent,
    RefObject,
    SetStateAction,
    useEffect,
    useState,
} from "react";
import Input from "../../ui/input";
import { MessageType } from "../../ui/Message";
import GenerateQuestionMenu from "../generateStudyMaterials/GenerateQuestionMenu";
import GenerateFlashcardMenu from "../generateStudyMaterials/GenerateFlashcardMenu";
import PDFPage from "../viewer/pdfPage";
import debouncedHandler from "@/utils/debounceHandler";
import GenerateStudyMaterialsMenu from "../generateStudyMaterials/GenerateStudyMaterialsMenu";
import useUpdateOnScroll from "./hooks/useUpdateOnScroll";
import DataTransferMenu, {
    DataTransferSelectionType,
} from "../dataTransfer/DataTransferMenu";
import DataTransferSelection from "../dataTransfer/DataTransferSelection";

/**
 * @param setShowSidebar - Function to toggle the visibility of the sidebar.
 * @param showSidebar - Boolean indicating whether the sidebar is currently shown.
 * @param incrementScale - Function to increase the scale of the PDF viewer.
 * @param decrementScale - Function to decrease the scale of the PDF viewer.
 * @param numOfPages - Total number of pages in the PDF document.
 * @param pdfsContainer - Ref to the container holding the PDF pages.
 * @param setSelectionBoxMode - Function to toggle the selection box mode.
 * @param setPdfInfo - Function to set the PDF information (URL and name).
 * @param setMessage - Function to set messages for the user interface.
 * @param renderPDFsOnView - Function to render the PDF pages on view.
 * @param pdfPages - Array of PDFPage objects representing the pages of the PDF document.
 * @param param0 - Object containing various state setters and values for the header component.
 * @returns JSX.Element
 */
const Header = ({
    setShowSidebar,
    showSidebar,
    incrementScale,
    decrementScale,
    numOfPages,
    pdfsContainer,
    setSelectionBoxMode,
    setPdfInfo,
    setMessage,
    renderPDFsOnView,
    pdfPages,
}: {
    setShowSidebar: Dispatch<SetStateAction<boolean>>;
    showSidebar: boolean;
    incrementScale: () => void;
    decrementScale: () => void;
    numOfPages: number;
    pdfsContainer: RefObject<HTMLDivElement>;
    setSelectionBoxMode: Dispatch<SetStateAction<boolean>>;
    setPdfInfo: Dispatch<SetStateAction<{ url: string; name: string }>>;
    setMessage: Dispatch<SetStateAction<MessageType>>;
    renderPDFsOnView: (pdfPages: PDFPage[]) => Promise<void>;
    pdfPages: PDFPage[];
}) => {
    const [pageNum, setPageNum] = useState("1");
    //TODO:Rename
    const [openGenerationMenu, setOpenGenerationMenu] = useState(false);

    const [openDataTransferMenu, setOpenDataTransferMenu] = useState(false);

    //TODO: put into one state object
    const [openQuestionMenu, setOpenQuestionMenu] = useState(false);
    const [openFlashCardMenu, setOpenFlashCardMenu] = useState(false);
    const [openDataTransferSelection, setOpenDataTransferSelection] =
        useState<DataTransferSelectionType>(null);

    const handlePageNumChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (Number(value) <= numOfPages) {
            setPageNum(value);
        }
    };

    const scrollToPageNum = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const page = pdfsContainer.current?.querySelector(
                `#pdfContainer-${pageNum}`,
            ) as HTMLDivElement;
            if (!page) return;
            // Scroll to the page
            page.scrollIntoView({
                block: "center",
                behavior: "smooth",
            });
        }
    };

    useUpdateOnScroll({
        debouncedHandler,
        pageNum,
        pdfPages,
        pdfsContainer,
        renderPDFsOnView,
        setPageNum,
    });

    const handlePdfSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fileURL = URL.createObjectURL(file);
        setPdfInfo({ url: fileURL, name: file.name });
        setMessage({ text: "Loading PDF...", autoTaminate: false });
        setPageNum("1");
        window.scrollTo(0, 0);
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-[100] flex w-full items-center justify-between gap-3 bg-background px-3 py-[7px] shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3">
                {/* Left section toggle */}
                <PanelLeftDashed
                    onClick={() => setShowSidebar((prev) => !prev)}
                    strokeWidth={"1.2"}
                    className={`h-[1.40rem] w-[1.40rem] cursor-pointer ${showSidebar && "stroke-primary"}`}
                />

                <div className="flex h-7 items-center gap-2 border-l border-gray-border pl-3 text-xs">
                    <Search className="h-[17px] w-[17px]" />{" "}
                    <Input
                        id="page-input"
                        value={pageNum}
                        onChange={handlePageNumChange}
                        onKeyDown={scrollToPageNum}
                        type="number"
                        className="h-8 w-10 bg-gray-100/5"
                    />
                    /{numOfPages}
                </div>
            </div>
            {/* Middle section */}
            <div className="flex items-center">
                <button
                    onClick={decrementScale}
                    className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-l border border-r-[3px] border-r-gray-border bg-gray-border"
                >
                    <Minus className="h-5 w-5" />
                </button>

                <button
                    onClick={incrementScale}
                    className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-r bg-gray-border"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>
            {/* Right section */}
            <div className="flex items-center gap-[15px]">
                {/* Upload file */}
                <div className="relative flex h-[17px] w-[17px] cursor-pointer items-center justify-center">
                    <LucideFileInput className="pointer-events-none absolute inset-0 h-full w-full" />
                    <Input
                        onChange={handlePdfSelection}
                        type="file"
                        accept="application/pdf"
                        className="h-full w-full cursor-pointer opacity-0"
                        id="pdf-file-input"
                    />
                </div>

                {/* Data transfer */}
                <div
onClick={() => setOpenDataTransferMenu(true)
                    }
                    tabIndex={0}
                    className="relative cursor-pointer"
                >
                    <Upload className="h-[18px] w-[18px]" />
                    {openDataTransferMenu && (
                        <DataTransferMenu
                            setOpenDataTransferSelection={
                                setOpenDataTransferSelection
                            }
                            setOpenDataTransferMenu={
                                setOpenDataTransferMenu
                            }
                        />
                    )}
                </div>

                {/* Generate Study Materials Menu */}
                <div
                    onBlur={() => setOpenGenerationMenu(false)}
                    onClick={() => setOpenGenerationMenu(!openGenerationMenu)}
                    tabIndex={0}
                    className="relative flex h-8 w-9 cursor-pointer items-center justify-center rounded border border-gray-border bg-gray-border"
                >
                    <Stars className="h-[18px] w-[18px]" />
                    {openGenerationMenu && (
                        <GenerateStudyMaterialsMenu
                            setOpenQuestionMenu={setOpenQuestionMenu}
                            setOpenFlashCardMenu={setOpenFlashCardMenu}
                        />
                    )}
                </div>

                <ChevronsRight className="h-6 w-6" />
            </div>
            {/* Study Materials Generation */}
            <>
                {openQuestionMenu && (
                    <GenerateQuestionMenu
                        setOpenQuestionMenu={setOpenQuestionMenu}
                        numOfPages={numOfPages}
                    />
                )}
                {openFlashCardMenu && (
                    <GenerateFlashcardMenu
                        setOpenFlashCardMenu={setOpenFlashCardMenu}
                        numOfPages={numOfPages}
                    />
                )}
            </>
            {/* Study Materials Data Transfer selection  */}
            <>
                {openDataTransferSelection && (
                    <DataTransferSelection
                        setOpenDataTransferSelection={
                            setOpenDataTransferSelection
                        }
                        openDataTransferSelection={openDataTransferSelection}
                    />
                )}
            </>
        </header>
    );
};

export default Header;
