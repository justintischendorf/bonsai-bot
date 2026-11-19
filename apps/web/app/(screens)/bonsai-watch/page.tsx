"use client";

import { BonsaiLogo } from "@/components/bonsai-logo";
import { Separator } from "@/components/ui/separator";
import WatchPlayer from "@/components/watch-player";
import WatchQueue from "@/components/watch-queue";
import { WatchVideoForm } from "@/components/watch-video-form";
import { useWatchLive, useWatchQueue } from "@/hooks/use-watch-queue";

export default function BonsaiWatchPage() {
  useWatchQueue();
  useWatchLive();

  return (
    <div className="flex flex-col gap-5 px-4 sm:px-8 xl:px-20">
      <div className="flex min-w-0 items-center gap-4">
        <BonsaiLogo className="size-14 shrink-0 sm:size-16" />
        <h1 className="text-3xl font-bold uppercase text-bonsai-pot-light min-[375px]:text-4xl sm:text-5xl">
          Bonsai Watch
        </h1>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <p className="max-w-3xl text-lg leading-relaxed text-pretty text-bonsai-pot [&_strong]:font-bold [&_strong]:text-bonsai-leaf-light">
          Hier kannst du zusammen mit anderen <strong>Bonsai Bot</strong>{" "}
          Nutzern <strong>YouTube Videos</strong> schauen. Füge ein Video über
          seinen <strong>Link</strong> hinzu. <strong>Play</strong>,{" "}
          <strong>Pause</strong> und <strong>Springen</strong> gelten für alle,
          die gerade zuschauen.
        </p>
        <WatchVideoForm className="w-full shrink-0 sm:w-md" />
      </div>
      <Separator />
      <div className="flex w-full flex-col gap-5 lg:flex-row lg:gap-16">
        <WatchPlayer />
        <WatchQueue />
      </div>
    </div>
  );
}
