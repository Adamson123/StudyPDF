import { Button } from "@/components/ui/button";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import XButton from "@/components/ui/XButton";
import validateStudyMaterial from "@/utils/validateStudyMaterial";
import { useState } from "react";

const DataTransferInput = ({
    setOpenDataTransferSelection,
    setDataTransferType,
    type,
}: {
    setOpenDataTransferSelection: React.Dispatch<
        React.SetStateAction<{
            type: string;
            data: any[];
            transferMethod: "import" | "download";
        } | null>
    >;
    setDataTransferType: React.Dispatch<React.SetStateAction<string>>;
    type: string;
}) => {
    const [inputData, setInputData] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result;
                setInputData(content as string);
            };
            reader.readAsText(file);
            e.target.value = ""; // Reset the input so the same file can be selected again if needed
        }
    };

    const handlePaste = () => {
        navigator.clipboard
            .readText()
            .then((text) => {
                setInputData(text);
            })
            .catch((err) => {
                console.error("Failed to read clipboard contents: ", err);
                alert("Failed to read clipboard contents. Please try again.");
            });
    };

    const handleImport = () => {
        let data = [];
        try {
            data = inputData ? JSON.parse(inputData as string) : [];
        } catch (error) {
            alert(
                "Invalid JSON format. Please check your input and try again.",
            );
            return;
        }

        if (!validateStudyMaterial(data, type)) {
            alert(
                "This file does not seem to be a valid " +
                    type.toLowerCase() +
                    " export. Please check the file and try again.",
            );
            return;
        }
        setOpenDataTransferSelection({
            type,
            data,
            transferMethod: "import",
        });
        setDataTransferType("");
    };

    return (
        <PopUpWrapper>
            <div className="flex max-h-[calc(100vh-40px)] w-full max-w-[600px] flex-col gap-6 rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Input {type} JSON
                        </h2>
                    </div>

                    <XButton onClick={() => setDataTransferType("")} />
                </div>

                <textarea
                    style={{
                        scrollbarColor: "hsl(var(--border)) transparent",
                    }}
                    onChange={(e) => setInputData(e.target.value)}
                    value={inputData}
                    className="h-[400px] w-full rounded-md border border-gray-border bg-background p-3 text-sm shadow-sm"
                    placeholder="Input your data here..."
                />

                <div className="flex justify-between">
                    {/* paste options */}
                    <div>
                        <Button variant={"outline"} className="relative mr-3">
                            <input
                                onChange={(e) => handleFileChange(e)}
                                type="file"
                                accept="application/json"
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            Load a file
                        </Button>
                        <Button onClick={handlePaste} variant={"outline"}>
                            Paste
                        </Button>
                    </div>

                    {/* import input */}
                    <Button
                        disabled={!inputData}
                        onClick={handleImport}
                        className=""
                    >
                        Import
                    </Button>
                </div>
            </div>
        </PopUpWrapper>
    );
};

export default DataTransferInput;
