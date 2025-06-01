"use client";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/reader/viewer/Viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center text-primary">
      <Loader2 className="animate-spin" /> &nbsp; Loading
    </div>
  ),
});

export default PDFViewer;
