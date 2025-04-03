"use client";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/reader/viewer/viewer"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default PDFViewer;
