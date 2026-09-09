import { Button } from "@/components/ui/button";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import XButton from "@/components/ui/XButton";
import { getStudyMaterialValidationIssues } from "@/utils/validateStudyMaterial";
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
    const [validationIssues, setValidationIssues] = useState<
        { path: string; message: string }[]
    >([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result;
                setInputData(content as string);
                setValidationIssues([]);
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
                setValidationIssues([]);
            })
            .catch((err) => {
                console.error("Failed to read clipboard contents: ", err);
                alert("Failed to read clipboard contents. Please try again.");
            });
    };

    const handleImport = () => {
        let data: unknown;

        try {
            data = JSON.parse(inputData);
        } catch (error) {
            setValidationIssues([
                {
                    path: "$",
                    message:
                        error instanceof Error
                            ? `Invalid JSON: ${error.message}`
                            : "Invalid JSON format",
                },
            ]);
            return;
        }

        const issues = getStudyMaterialValidationIssues(data, type);
        if (issues.length) {
            setValidationIssues(issues);
            return;
        }

        setValidationIssues([]);
        setOpenDataTransferSelection({
            type,
            data: data as unknown[],
            transferMethod: "import",
        });
        setDataTransferType("");
    };

    return (
        <PopUpWrapper>
            <div className="flex max-h-[calc(100vh-40px)] w-full max-w-[600px] flex-col gap-3 rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
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
                    onChange={(e) => {
                        setInputData(e.target.value);
                        setValidationIssues([]);
                    }}
                    value={inputData}
                    className="h-[400px] w-full rounded-md border border-gray-border bg-background p-3 text-sm shadow-sm"
                    placeholder="Input your data here..."
                />

                {validationIssues.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700">
                        <p className="mb-1 font-semibold">
                            Fix the following before importing:
                        </p>
                        <ul className="list-inside list-disc space-y-1">
                            {validationIssues.map((issue, index) => (
                                <li key={`${issue.path}-${index}`}>
                                    <code>{issue.path}</code>: {issue.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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
