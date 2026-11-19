import { type Member } from "@/hooks/use-discord-member-info";
import { cn } from "@/lib/utils";

import { MemberAvatar } from "./member-avatar";

export default function MemberCard({
  member,
  className,
}: {
  member: Member;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-accent p-3",
        className,
      )}
    >
      <MemberAvatar member={member} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="max-w-3/5 shrink-0 truncate text-sm font-semibold">
            {member.name}
          </h2>
          <span
            className={`truncate text-xs font-medium ${
              member.online ? "text-bonsai-leaf-light" : "text-muted-foreground"
            }`}
          >
            {member.game
              ? `Spielt ${member.game}`
              : member.online
                ? "Online"
                : "Offline"}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          @{member.username}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Dabei seit{" "}
          {new Date(member.joinedAt).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
      </div>
    </article>
  );
}
