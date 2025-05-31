import { cn } from "@/lib/utils";

const Popup = ({
  executeBtnLabel,
  message,
  executeBtnColor,
  cancelBtnColor,
  cancelBtnFunc,
  executeBtnFunc,
}: {
  message: string;
  executeBtnLabel: string;
  executeBtnColor?: string;
  executeBtnFunc: () => any;
  cancelBtnColor?: string;
  cancelBtnFunc: () => any;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-lg bg-background p-6 shadow-lg">
        {/* <h2 className="text-xl font-semibold">Popup Title</h2> */}
        <p className="text-white">{message}</p>
        <div className="flex w-full items-center justify-center gap-4">
          <button
            onClick={cancelBtnFunc}
            className={cn("rounded bg-red-500 p-2 px-3", cancelBtnColor)}
          >
            Cancel
          </button>
          <button
            onClick={executeBtnFunc}
            className={cn("rounded bg-green-500 px-3 py-2", executeBtnColor)}
          >
            {executeBtnLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
