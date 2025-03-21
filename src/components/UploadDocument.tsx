"use client";
import { UploadIcon } from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useMemo, useState } from "react";
import { Button } from "./ui/button";
import Input from "./ui/input";
import { PDFDocument } from "pdf-lib";
import getDocumentSummary from "@/server/actions/getDocumentSummary";
import { db } from "@/lib/db";

const getPdfCover = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const newPdf = await PDFDocument.create();
  const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
  newPdf.addPage(firstPage);

  const pdfBytes = await newPdf.save(); // Save extracted page
  // Convert to Blob
  return new Blob([pdfBytes], { type: "application/pdf" });
};

//Convert doc size to mb or kb
const convertDocumentSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
};

const trimContent = (content: string) => {
  const htmlContent = document.createElement("div");
  htmlContent.innerHTML = content;

  htmlContent.querySelector("#sidebar")!.remove();

  htmlContent.querySelectorAll("script").forEach((script) => {
    script.remove();
  });

  const pageContainer =
    htmlContent.querySelector<HTMLDivElement>("#page-container")!;
  pageContainer.style.backgroundImage = "none";
  pageContainer.style.backgroundColor = "black";

  // Fix weird behavior when selecting text

  return htmlContent.innerHTML;
};

const UploadDocument = ({
  setShowUploadDoc,
}: {
  setShowUploadDoc: Dispatch<SetStateAction<boolean>>;
}) => {
  const [title, setTitle] = useState("");
  const [document, setDocument] = useState<File>();
  const [docCoverImage, setDocCoverImage] = useState<Blob>();
  const cover = useMemo(() => {
    if (!docCoverImage) return "";
    return URL.createObjectURL(docCoverImage as Blob);
  }, [docCoverImage]);

  const pickDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) return;
    const doc = event.target.files[0];
    setDocument(doc);
    const cover = await getPdfCover(doc as File);
    console.log({ cover });
    setDocCoverImage(cover);
  };

  const handleUploadDocument = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("pdf", document as any);

    try {
      console.log("Converting to html and generating summary");

      const pdfHtml = fetch("http://localhost:3500/convert", {
        method: "POST",
        body: formData,
      });

      const docBuffer = await document?.arrayBuffer();
      const pdfSummary = getDocumentSummary(docBuffer as ArrayBuffer);

      const [html, summary] = await Promise.all([pdfHtml, pdfSummary]);

      if (!html.ok) throw new Error("Error generating html");

      const content = trimContent(await html.text());
      const newDocument = await db.documents.add({
        content,
        summary,
      });

      await db.docCovers.add({
        title: title || (document?.name as string),
        image: docCoverImage as Blob,
        documentId: newDocument,
        type: document?.type as string,
        size: document?.size as number,
      });

      console.log(
        "Converted to html and summary generated succesfully " + newDocument,
      );
      setShowUploadDoc(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/75 p-3">
      <form
        onSubmit={handleUploadDocument}
        className="o flex w-full max-w-[500px] flex-col items-center gap-4 rounded-md bg-border p-5"
      >
        {/* Title  */}
        <Input
          className="border-gray-border bg-border"
          placeholder="Enter title"
          onChange={(event) => setTitle(event.target.value)}
        />
        {/* Pdf uploader */}
        <div className="relative flex w-full flex-col items-center justify-start gap-1 rounded-md border-2 border-dashed border-gray-border px-5 py-8">
          {!document ? (
            <>
              {" "}
              <UploadIcon />
              <p className="text-sm">Drop doc or tap here to upload</p>
              <span className="text-xs text-muted-foreground">
                Accept .pdf, .doc, .docx
              </span>
              <input
                onChange={pickDocument}
                type="file"
                about=".pdf, .doc, .docx"
                size={1024 * 3}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3">
                {docCoverImage && (
                  <iframe
                    src={cover}
                    className="h-28 w-24 rounded bg-black/35 object-contain p-3"
                  />
                )}
                {/* Info */}
                <div className="text-center">
                  <p className="text-sm">{document.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {document.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {convertDocumentSize(document.size)}
                  </p>
                </div>
                {/* <Button type="button" onClick={handleUploadDocument} size="sm">
                  Process
                </Button> */}
              </div>
            </>
          )}
        </div>

        {/* Cancel, Add */}
        <div className="space-x-2">
          <Button
            type="button"
            onClick={() => setShowUploadDoc(false)}
            className="border-2 border-gray-border bg-transparent hover:bg-gray-border"
          >
            Cancel
          </Button>
          <Button type="submit">Add Document</Button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocument;
