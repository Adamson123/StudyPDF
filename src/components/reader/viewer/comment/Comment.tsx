import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65">
      <div className="flex flex-col justify-start gap-3 rounded-lg bg-background p-7">
        <div className="flex items-start justify-between gap-3">
          <Button onClick={handleSave}>Save</Button>
          <Button className="self-end bg-transparent hover:bg-gray-border">
            <Trash className="h-14 w-14" />
          </Button>
        </div>
        <textarea
          value={commentInput}
          onChange={(event) => {
            setCommentInput(event.target.value);
          }}
          placeholder="Edit Comment"
          className="min-h-40 min-w-[400px] resize-none rounded-md p-3 text-xs"
        />

        <Button
          onClick={handleClose}
          className="border-2 border-gray-border bg-transparent hover:bg-gray-border"
        >
          Close
        </Button>
      </div>
    </div>
  );
};
export default Comment;
