import { Dispatch, SetStateAction, useEffect } from "react";

export const Message = ({
  message,
  setMessage,
}: {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
}) => {
  useEffect(() => {
    if (!message) return;
    const timeoutID = setTimeout(() => {
      setMessage("");
    }, 500);

    return () => clearTimeout(timeoutID);
  }, [message]);
  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-background p-3 px-5 transition-all duration-75 ${message ? "opacity-100" : "opacity-0"}`}
    >
      {message}
    </div>
  );
};
