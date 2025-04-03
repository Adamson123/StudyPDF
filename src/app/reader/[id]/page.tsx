"use client";

import Header from "@/components/reader/Header";
import LeftSection from "@/components/reader/left-section/LeftSection";
import Viewer from "@/components/reader/viewer/OldViewer";
import { db, Document } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Reader = () => {
  const documentRenderer = useRef<HTMLDivElement>(null);
  const params = useParams();
  const [document, setDocument] = useState<Document>();
  const [loading, setLoading] = useState(true);
  const [showLeftSection, setShowLeftSection] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const doc = await db.documents.get(params.id as any);
      setDocument(doc);

      setLoading(false);
    })();
  }, [params.id]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-y-hidden p-2 pt-[55px]">
      <Header setShowLeftSection={setShowLeftSection} />
      {showLeftSection && <LeftSection />}
      <Viewer
        document={document as Document}
        documentRenderer={documentRenderer}
      />

      {loading && (
        <Loader2 className="h-[50px] w-[50px] animate-spin overflow-x-hidden" />
      )}
    </main>
  );
};

export default Reader;
