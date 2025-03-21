"use client";
import { db } from "@/lib/db";
import DocumentCard from "./DocumentCard";
import { useLiveQuery } from "dexie-react-hooks";

const Documents = () => {
  const covers = useLiveQuery(() => db.docCovers.toArray(), []);
  if (!covers) return <p>Loading...</p>;
  return (
    <div className="flex max-w-[600px] flex-col overflow-hidden rounded-md">
      {covers.length
        ? covers.map((cover) => <DocumentCard key={cover.id} info={cover} />)
        : "No Doc was found"}
    </div>
  );
};

export default Documents;
