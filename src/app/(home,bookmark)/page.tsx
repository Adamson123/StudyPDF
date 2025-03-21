"use client";
import UploadDocuments from "@/components/UploadDocument";
import Documents from "../../components/documents/Documents";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  return (
    <>
      {/*  */}
      <div className="mt-5 flex flex-col items-start gap-3 p-3">
        <h2 className="text-3xl font-semibold tracking-tighter">
          Welcome <span className="text-primary">Adam</span>
        </h2>
        <Button onClick={() => setShowUploadDoc(true)}>Add New Document</Button>
        {showUploadDoc && (
          <UploadDocuments setShowUploadDoc={setShowUploadDoc} />
        )}
        <Documents />
      </div>
    </>
  );
}

//TODO: Make comps in (main)

//bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white
