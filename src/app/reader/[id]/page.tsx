"use client";

import { db } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Reader = () => {
  const [document, setDocument] = useState("");
  const params = useParams();

  useEffect(() => {
    (async () => {
      const doc = await db.documents.get(params.id as any);
      console.log(doc, params.id);

      setDocument(doc?.content as string);
    })();
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {document ? (
        <section dangerouslySetInnerHTML={{ __html: document }} />
      ) : (
        <Loader2 className="h-[50px] w-[50px] animate-spin" />
      )}
    </main>
  );
};

export default Reader;
