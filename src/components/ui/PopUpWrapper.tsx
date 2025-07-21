import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

const PopUpWrapper = (prop: HTMLAttributes<HTMLDivElement>) => {
  const { className, ...otherProps } = prop;
  return (
    <div
      {...otherProps}
      className={cn(
        "fixed inset-0 z-[1000] flex items-center justify-center p-3 backdrop-blur-sm",
        className,
      )}
    ></div>
  );
};

export default PopUpWrapper;
