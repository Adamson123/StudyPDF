import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import XButton from "@/components/ui/XButton";
import { Stars } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const GenerateSummary = ({
  setOpenGenerateSummary,
}: {
  setOpenGenerateSummary: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 flex-col gap-4 rounded-lg border bg-background p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Generate Summary</h2>
          <h3 className="text-xs text-gray-500">
            Generate PDF content summary
          </h3>
        </div>
        <XButton onClick={() => setOpenGenerateSummary(false)} />
      </div>
      <div>
        <label className="text-sm">Name:</label>
        <Input placeholder="Enter summary name" className="" />
      </div>
      <div className="flex w-full gap-4">
        <div className="w-full">
          <label className="text-sm">From:</label>
          <Input type="number" placeholder="Enter starting page" />
        </div>
        <div className="w-full">
          <label className="text-sm">To:</label>
          <Input type="number" placeholder="Enter ending page" />
        </div>
      </div>
      <Button className="flex w-full max-w-96 items-center self-center">
        Generate Summary <Stars />
      </Button>
    </div>
  );
};

export default GenerateSummary;
