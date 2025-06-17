import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { CommentType } from "../Viewer";

const Comment = ({
  comment,
  setComment,
  pdfsContainer,
}: {
  comment: CommentType;
  setComment: Dispatch<SetStateAction<CommentType>>;
  pdfsContainer: RefObject<HTMLDivElement>;
}) => {
  const [commentInput, setCommentInput] = useState(comment.text);

  const handleSave = () => {
    if (!comment.class) return;
    const highlights = (
      pdfsContainer.current as HTMLDivElement
    ).querySelectorAll<HTMLSpanElement>("." + comment.class)!;

    if (highlights.length) {
      highlights.forEach((highlight) => {
        highlight.dataset.comment = commentInput;
      });
    } else {
      const highlight = document.querySelector<HTMLSpanElement>(
        "." + comment.class,
      )!;
      highlight.dataset.comment = commentInput;
    }
    setComment({ text: "", class: "" });
  };

  const handleClose = () => {
    setComment({ text: "", class: "" });
  };
  return (
    <div
      onClick={handleClose}
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
          <Button onClick={handleClose}>Cancel</Button>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave}>
              Save <Check />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Comment;
