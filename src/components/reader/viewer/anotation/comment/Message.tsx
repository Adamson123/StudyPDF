import { Dispatch, SetStateAction, useEffect } from "react";

export type MessageType = {
  text: string;
  autoTaminate: boolean;
};

export const Message = ({
  message,
  setMessage,
}: {
  message: MessageType;
  setMessage: Dispatch<SetStateAction<MessageType>>;
}) => {
  useEffect(() => {
    if (!message.text || !message.autoTaminate) return;

    const timeoutID = setTimeout(() => {
      setMessage({ text: "", autoTaminate: false });
    }, 1000);

    return () => clearTimeout(timeoutID);
  }, [message]);
  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-background p-3 px-5 text-xs transition-all duration-75 ${message.text ? "opacity-100" : "opacity-0"}`}
    >
      {message.text}
    </div>
  );
};
