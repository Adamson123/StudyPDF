import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { CommentType } from "../Viewer";
import Input from "@/components/ui/input";

const AddComment = ({
  setSelectionClass,
  selectionClass,
  setComment,
  pdfsContainer,
}: {
  setSelectionClass: Dispatch<SetStateAction<string>>;
  selectionClass: string;
  setComment: Dispatch<SetStateAction<CommentType>>;
  pdfsContainer: RefObject<HTMLDivElement>;
}) => {
  const [commentInput, setCommentInput] = useState("");
  const [commentColor, setCommentColor] = useState("#e11d48");

  const handleSaveComment = () => {
    if (!selectionClass) return;
    if (!commentInput) {
      alert("Please enter commnet");
      return;
    }

    const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;

    const highlights = pdfsContainerElement.querySelectorAll<HTMLSpanElement>(
      "." + selectionClass,
    )!;

    if (highlights.length) {
      highlights.forEach((highlight) => {
        highlight.dataset.comment = commentInput;
        highlight.onclick = (event: Event) => {
          event.stopImmediatePropagation();
          //alert(highlight.dataset.comment);
          setComment({
            text: highlight.dataset.comment as string,
            class: selectionClass,
          });
        };
      });
    } else {
      const highlight = (
        pdfsContainer.current as HTMLDivElement
      ).querySelector<HTMLSpanElement>("." + selectionClass)!;
      highlight.dataset.comment = commentInput;
      highlight.onclick = (event: Event) => {
        event.stopImmediatePropagation();
        alert(highlight.dataset.comment);
      };
    }
    setCommentInput("");
    setSelectionClass("");
  };

  const handleCancel = () => {
    if (!selectionClass) return;

    const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;

    const highlights = pdfsContainerElement.querySelectorAll<HTMLSpanElement>(
      "." + selectionClass,
    )!;

    if (highlights.length) {
      highlights.forEach((highlight) => {
        highlight.remove();
      });
    } else {
      const highlight = pdfsContainerElement.querySelector<HTMLSpanElement>(
        "." + selectionClass,
      )!;
      highlight.remove();
    }

    setCommentInput("");
    setSelectionClass("");
  };

  const handleCommentColorChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCommentColor(event.target.value);
    const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;
    const highlights = pdfsContainerElement.querySelectorAll<HTMLSpanElement>(
      "." + selectionClass,
    )!;
    const rgbaColor = event.target.value + 90; // Adding transparency
    if (highlights.length) {
      highlights.forEach((highlight) => {
        highlight.style.backgroundColor = rgbaColor;
        //  highlight.style.borderColor = event.target.value;
      });
    } else {
      const highlight = pdfsContainerElement.querySelector<HTMLSpanElement>(
        "." + selectionClass,
      )!;
      highlight.style.backgroundColor = rgbaColor;
      // highlight.style.borderColor = event.target.value;
    }
  };

  return (
    <div
      onClick={handleCancel}
      className={`fixed inset-0 flex flex-col justify-end bg-black/10`}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
        className={`flex flex-col gap-5 border-t border-gray-border bg-background p-5`}
      >
        <textarea
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
          style={{
            scrollbarWidth: "none",
          }}
          className="h-[84px] w-full resize-none rounded bg-transparent px-3 text-xs outline-none"
          placeholder="Add a comment"
        />{" "}
        <div className="flex w-full justify-between">
          <Button onClick={handleCancel}>Cancel</Button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="color"
                value={commentColor}
                onChange={handleCommentColorChange}
                className="h-8 w-8 cursor-pointer rounded-full"
              />
              {/* Color input overlay */}
              <span
                style={{
                  backgroundColor: commentColor,
                }}
                className="pointer-events-none absolute inset-0 rounded-full"
              ></span>
            </div>
            <Button onClick={handleSaveComment}>
              Add <Send />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddComment;
