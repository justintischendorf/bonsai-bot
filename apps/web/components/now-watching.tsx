import Image from "next/image";
import Link from "next/link";

import { useWatchQueue } from "@/hooks/use-watch-queue";
import { cn } from "@/lib/utils";

export default function NowWatching({
  href,
  className,
}: {
  href?: string;
  className?: string;
}) {
  const { data: watchResponse } = useWatchQueue();
  const playback = watchResponse?.data?.server;
  const video = playback?.current;

  if (!video) return null;

  return (
    <article
      className={cn(
        "relative flex w-full items-center gap-3 rounded-xl border p-3 sm:w-1/2 lg:w-1/4",
        href && "hover:border-bonsai-leaf-light",
        className,
      )}
    >
      {href && (
        <Link
          href={href}
          aria-label="Zu Bonsai Watch"
          className="absolute inset-0 rounded-xl"
        />
      )}
      <div
        role="img"
        aria-label={`Vorschaubild von ${video.title}`}
        className="relative aspect-video h-13 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          sizes="92px"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-xs text-muted-foreground">
          {playback.paused ? "Pausiert" : "Wird gerade geschaut"}
        </p>
        <h2 className="truncate text-sm font-semibold">{video.title}</h2>
        <p className="truncate text-xs font-medium text-muted-foreground">
          {video.channel}
        </p>
      </div>
    </article>
  );
}
