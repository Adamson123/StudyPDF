import Dexie, { type EntityTable } from "dexie";
import { v4 as uuidv4 } from "uuid";

interface Document {
  id: string; // UUID or unique identifier
  content: string;
  summary: string;
}

interface DocCover {
  id: string;
  documentId: string; // Foreign key linking to a document
  title: string;
  image: Blob;
  createdAt?: number;
  updatedAt?: number;
  type: string;
  size: number;
}

const db = new Dexie("DocsDatabase") as Dexie & {
  documents: EntityTable<Document, "id">;
  docCovers: EntityTable<DocCover, "id">;
};

// Define schemas
db.version(1).stores({
  documents: "id, content, summary",
  docCovers: "id, title, documentId, image, createdAt, updatedAt, type, size",
});

// **HOOKS: Automatically set timestamps and id**
db.documents.hook("creating", (primKey, obj) => {
  obj.id = uuidv4();
});

db.docCovers.hook("creating", (primKey, obj) => {
  obj.id = uuidv4(); // Auto-generate id
  obj.createdAt = Date.now();
  obj.updatedAt = Date.now();
});

db.docCovers.hook("updating", (modifications, primKey, obj) => {
  return { ...modifications, updatedAt: Date.now() };
});

export type { Document, DocCover };
export { db };
