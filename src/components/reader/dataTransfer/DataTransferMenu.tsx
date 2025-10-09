import { Button } from "@/components/ui/button";
import { getAllFlashcardsFromStorage } from "@/lib/flashcardStorage";
import { getAllQuizzesFromStorage } from "@/lib/quizStorage";
import { getAllSummariesFromStorage } from "@/lib/summaryStorage";
import { Download, Upload } from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";

export type DataTransferSelectionType = {
    type: string;
    data: any[];
    transferMethod: "import" | "download";
} | null;

const DataTransferMenu = ({
    setOpenDataTransferSelection,
    //   setOpenDataTransferMenu,
}: {
    setOpenDataTransferSelection: Dispatch<
        SetStateAction<DataTransferSelectionType>
    >;
    setOpenDataTransferMenu: Dispatch<SetStateAction<boolean>>;
}) => {
    const fileInputRef = useRef<HTMLInputElement & { dataType: string }>(null);

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        //  type: string,
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            // You can add further processing of the file here
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                // console.log(`File content for ${type}:`, content);
                // Further processing based on file content
                setOpenDataTransferSelection({
                    type: fileInputRef.current?.dataType as string,
                    data: content ? JSON.parse(content as string) : [],
                    transferMethod: "import",
                });
                event.target.value = ""; // Reset the input so the same file can be selected again if needed
                //  setOpenDataTransferMenu(false);
            };
            reader.readAsText(file);
        }
    };

    //  const handleImport = (type: string) => {};

    const handleDownload = (type: string) => {
        let data: any[] = [];
        switch (type) {
            case "Quizzes":
                data = getAllQuizzesFromStorage();
                break;
            case "Flashcards":
                data = getAllFlashcardsFromStorage();
                break;
            case "Summaries":
                data = getAllSummariesFromStorage();
                break;
        }

        setOpenDataTransferSelection({
            type,
            data,
            transferMethod: "download",
        });
        // setOpenDataTransferMenu(false);
    };

    return (
        <div className="absolute -right-[80px] top-10 z-10 flex flex-col items-start justify-center gap-3 rounded border border-gray-border bg-background p-3 text-sm shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
            {/* Transfers */}
            {["Quizzes", "Flashcards", "Summaries"].map((item) => (
                <div
                    key={item}
                    className="flex w-full items-center justify-between gap-8"
                >
                    <span>{item}</span>
                    <div className="flex gap-2">
                        <Button
                            className="h-8 text-xs"
                            onClick={() => {
                                handleDownload(item);
                            }}
                        >
                            Download <Download />{" "}
                        </Button>
                        <Button
                            onClick={() => {
                                fileInputRef.current?.click();
                                (
                                    fileInputRef.current as HTMLInputElement & {
                                        dataType: string;
                                    }
                                ).dataType = item;
                            }}
                            className="h-8 border border-border bg-transparent text-xs hover:bg-gray-100/10"
                        >
                            <input
                                onChange={(e) => handleFileChange(e)}
                                type="file"
                                accept="application/json"
                                ref={fileInputRef}
                                className="hidden"
                            />
                            Import <Upload />{" "}
                        </Button>{" "}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DataTransferMenu;
