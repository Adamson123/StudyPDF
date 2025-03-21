import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { className, ...otherProps } = props;
  return (
    <input
      {...otherProps}
      ref={ref}
      className={cn(
        `border-gray-border w-full rounded-[8px] border p-[9px] text-[13px] outline-none`,
        className,
      )}
    />
  );
});

export default Input;
