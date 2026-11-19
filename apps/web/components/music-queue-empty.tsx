import { ListMusic } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ICON_TILE } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function MusicQueueEmpty() {
  return (
    <Empty className="py-12">
      <EmptyHeader className="max-w-md">
        <EmptyMedia
          variant="icon"
          className={cn(
            ICON_TILE,
            "size-14 rounded-2xl text-bonsai-leaf-light",
          )}
        >
          <ListMusic className="size-6" />
        </EmptyMedia>
        <EmptyTitle className="text-xl font-semibold">
          Die Warteschlange ist leer
        </EmptyTitle>
        <EmptyDescription className="text-pretty">
          Sobald sich jemand einen Song wünscht, taucht er hier auf.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
