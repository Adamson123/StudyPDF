import PopUpWrapper from "@/components/ui/PopUpWrapper";
import XButton from "@/components/ui/XButton";
import React, { Dispatch, SetStateAction, useState } from "react";
import { DataTransferSelectionType } from "./DataTransferMenu";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppStore";
import { addMultipleSummaries } from "@/redux/features/summariesSlice";
import { addMultipleSetsOfFlashcards } from "@/redux/features/flashcardsSlice";
import { addMultipleSetsOfQuizzes } from "@/redux/features/quizzesSlice";
import NoItemsFound from "@/components/ui/NoItemsFound";

const DataTransferSelection = ({
    setOpenDataTransferSelection,
    openDataTransferSelection,
}: {
    setOpenDataTransferSelection: Dispatch<
        SetStateAction<DataTransferSelectionType>
    >;
    openDataTransferSelection: DataTransferSelectionType;
}) => {
    const [selectedItems, setSelectedItems] = useState<Set<number>>(
        new Set(openDataTransferSelection?.data.map((d, i) => i)),
    );
    const [selectAll, setSelectAll] = useState(true);
    const dispatch = useAppDispatch();

    const handleCheckboxChange = (index: number) => {
        const newSelectedItems = new Set(selectedItems);
        if (newSelectedItems.has(index)) {
            newSelectedItems.delete(index);
            setSelectAll(false);
        } else {
            newSelectedItems.add(index);
            //If all items are checked
            if (
                newSelectedItems.size === openDataTransferSelection?.data.length
            ) {
                setSelectAll(true);
            }
        }
        setSelectedItems(newSelectedItems);
        console.log(newSelectedItems);
    };

    const handleDownload = () => {
        if (!openDataTransferSelection) return;
        const itemsToDownload = openDataTransferSelection.data.filter(
            (_, index) => selectedItems.has(index),
        );
        const dataStr = JSON.stringify(itemsToDownload, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });

        const downloadAnchorNode = document.createElement("a");
        const downloadUrl = URL.createObjectURL(blob);
        downloadAnchorNode.setAttribute("href", downloadUrl);
        downloadAnchorNode.setAttribute(
            "download",
            `${openDataTransferSelection.type.toLowerCase()}.json`,
        );
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setOpenDataTransferSelection(null);

        URL.revokeObjectURL(downloadUrl);
    };

    const validateItemsToImport = (items: any[]) => {
        if (!items.length) return false;
        // Basic validation based on type
        switch (openDataTransferSelection?.type) {
            case "Quizzes":
                return items.every(
                    (item) =>
                        //  item.title &&
                        item.id &&
                        item.questions &&
                        Array.isArray(item.questions) &&
                        item.questions?.every(
                            (q: any) =>
                                q.question &&
                                q.options &&
                                Array.isArray(q.options) &&
                                typeof q.answer !== "undefined",
                        ),
                );
            case "Flashcards":
                return items.every(
                    (item) =>
                        // item.title &&
                        item.id &&
                        Array.isArray(item.cards) &&
                        item.cards.every((f: any) => f.front && f.back),
                );
            case "Summaries":
                return items.every(
                    (
                        item, //item.title &&
                    ) => item.id && item.content,
                );
            default:
                return false;
        }
    };

    const handleImport = () => {
        if (!openDataTransferSelection) return;
        const itemsToImport = openDataTransferSelection.data.filter(
            (_, index) => selectedItems.has(index),
        );
        if (!validateItemsToImport(itemsToImport)) {
            alert(
                "Some items are invalid and won't be imported. Please check the file format.",
            );
            return;
        }

        switch (openDataTransferSelection.type) {
            //TODO: Validate imported items structure before saving
            case "Quizzes":
                dispatch(addMultipleSetsOfQuizzes(itemsToImport));
                break;
            case "Flashcards":
                dispatch(addMultipleSetsOfFlashcards(itemsToImport));
                break;
            case "Summaries":
                // saveMultipleSummaries(itemsToImport);
                dispatch(addMultipleSummaries(itemsToImport));
                break;
        }

        setOpenDataTransferSelection(null);
        //TODO: A toast after this
    };

    const handleSelectAll = () => {
        const updatedSelectAll = !selectAll;

        //If updated selectAll is true
        if (updatedSelectAll) {
            setSelectedItems(
                new Set(openDataTransferSelection?.data.map((d, i) => i)),
            );
        } else {
            setSelectedItems(new Set([]));
        }

        setSelectAll(updatedSelectAll);
    };

    return (
        <PopUpWrapper>
            <div className="flex max-h-[calc(100vh-40px)] w-full max-w-[600px] flex-col gap-6 rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {openDataTransferSelection?.type}{" "}
                            <span className="capitalize">
                                {openDataTransferSelection?.transferMethod}
                            </span>
                        </h2>
                        <h3 className="text-xs text-gray-500">
                            Select the{" "}
                            {openDataTransferSelection?.type.toLocaleLowerCase()}{" "}
                            you want to{" "}
                            {openDataTransferSelection?.transferMethod}
                        </h3>
                    </div>

                    <XButton
                        onClick={() => setOpenDataTransferSelection(null)}
                    />
                </div>
                {/* Data */}
                {openDataTransferSelection?.data.length ? (
                    <div className="flex items-center justify-end gap-3">
                        <label htmlFor="selectAll" className="cursor-pointer">
                            Select All{" "}
                        </label>
                        <input
                            onChange={handleSelectAll}
                            checked={selectAll}
                            id="selectAll"
                            className="h-5 w-5 cursor-pointer accent-primary"
                            type="checkbox"
                        />
                    </div>
                ) : (
                    ""
                )}
                {openDataTransferSelection?.data.length ? (
                    <div
                        style={{
                            scrollbarColor:
                                "rgb(var(--gray-border)) transparent",
                        }}
                        className="flex flex-col gap-4 overflow-y-auto"
                    >
                        {openDataTransferSelection?.data.map((item, index) => (
                            <div
                                onClick={() => handleCheckboxChange(index)}
                                key={index}
                                className="flex cursor-pointer items-center justify-between rounded border border-gray-border p-5"
                            >
                                <span>{item.title}</span>
                                <input
                                    onChange={() => {}} //To stop nextjs complain
                                    checked={selectedItems.has(index)}
                                    className="h-4 w-4 cursor-pointer accent-primary"
                                    type="checkbox"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <NoItemsFound
                        text={`No ${openDataTransferSelection?.type.toLocaleLowerCase()} found to ${openDataTransferSelection?.transferMethod}.`}
                    />
                )}
                {/* Generate Button */}
                {openDataTransferSelection?.transferMethod === "import" ? (
                    <Button
                        onClick={handleImport}
                        className="flex items-center"
                    >
                        Import <Upload />
                    </Button>
                ) : (
                    <Button
                        onClick={handleDownload}
                        className="flex items-center"
                    >
                        Download
                        <Download />
                    </Button>
                )}{" "}
            </div>
        </PopUpWrapper>
    );
};

export default DataTransferSelection;
