import { X } from "lucide-react";
import { HTMLAttributes } from "react";

const XButton = (props: HTMLAttributes<HTMLButtonElement>) => {
  const { ...otherProps } = props;
  return (
    <button
      {...otherProps}
      className="rounded-full border border-gray-border p-2 hover:bg-gray-100/10"
    >
      <X className="h-4 w-4" />
    </button>
  );
};

export default XButton;
