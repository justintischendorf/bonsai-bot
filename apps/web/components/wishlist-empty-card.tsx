import { Swords } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ICON_TILE } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function WishlistEmptyCard() {
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
          <Swords className="size-6" />
        </EmptyMedia>
        <EmptyTitle className="text-xl font-semibold">
          Noch keine Spiele auf der Wunschliste
        </EmptyTitle>
        <EmptyDescription className="text-pretty">
          Klicke auf „Spiel hinzufügen“ und gib den Link von Steam oder Instant
          Gaming an, damit das erste Spiel hier auftaucht.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
