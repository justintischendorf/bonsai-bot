"use client";

import { TvMinimalPlay } from "lucide-react";

import { Divider, PageHeader } from "@/components/decor";
import WatchPlayer from "@/components/watch-player";
import WatchQueue from "@/components/watch-queue";
import { WatchVideoForm } from "@/components/watch-video-form";
import { useWatchLive, useWatchQueue } from "@/hooks/use-watch-queue";
import { CARD } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function BonsaiWatchPage() {
  useWatchQueue();
  useWatchLive();

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-8 xl:px-20">
      <PageHeader
        eyebrow="Videos"
        title="Bonsai Watch"
        Icon={TvMinimalPlay}
        actions={<WatchVideoForm className="w-full shrink-0 lg:w-md" />}
      >
        Hier kannst du zusammen mit anderen <strong>Bonsai Bot</strong> Nutzern{" "}
        <strong>YouTube Videos</strong> schauen. Füge ein Video über seinen{" "}
        <strong>Link</strong> hinzu. <strong>Play</strong>,{" "}
        <strong>Pause</strong> und <strong>Springen</strong> gelten für alle,
        die gerade zuschauen.
      </PageHeader>
      <Divider />
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className={cn(CARD, "flex p-4 sm:p-6")}>
          <WatchPlayer className="w-full" />
        </div>
        <div className={cn(CARD, "flex p-4 sm:p-6")}>
          <WatchQueue />
        </div>
      </div>
    </div>
  );
}
