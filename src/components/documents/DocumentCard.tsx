import { Button } from "@/components/ui/button";
import { DocCover } from "@/lib/db";
import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

const DocumentCard = ({
  info: { title, createdAt, image, type, documentId },
}: {
  info: DocCover;
}) => {
  const cover = useMemo(() => {
    if (!image) return "";
    return URL.createObjectURL(image as Blob);
  }, [image]);

  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/reader/" + documentId)}
      className="flex w-full min-w-[500px] max-w-[500px] cursor-pointer items-center justify-between border-b border-gray-border bg-border p-3"
    >
      <div className="flex items-start gap-3">
        <iframe
          src={cover}
          className="h-20 w-16 rounded bg-black/35 object-contain"
        />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          {/* Info */}
          <p className="text-xs text-muted-foreground">
            Last modified:{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(createdAt as any))}
          </p>
          <span className="my-auto flex h-5 w-7 items-center justify-center rounded border-2 border-gray-border text-[10px] uppercase text-primary">
            {type.split("/")[1]}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default DocumentCard;
