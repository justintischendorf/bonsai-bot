"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Music, Square } from "lucide-react";

import BonsaiFMPlayer from "@/components/bonsai-fm-player";
import { BonsaiLogo } from "@/components/bonsai-logo";
import LoadingSpinner from "@/components/loading-spinner";
import MusicQueue from "@/components/music-queue";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { musicQueueQueryKey, useMusicQueue } from "@/hooks/use-music-queue";
import { apiClient } from "@/lib/api-client";

export default function BonsaiFM() {
  const queryClient = useQueryClient();
  const { data: musicResponse } = useMusicQueue();
  const jamStarted = musicResponse?.data?.server.connected ?? false;

  const { mutateAsync: joinVoiceChannel, isPending: isJoiningVoiceChannel } =
    useMutation({
      mutationFn: async () => {
        return await apiClient.api.music.join.post();
      },
    });

  const { mutateAsync: leaveVoiceChannel, isPending: isLeavingVoiceChannel } =
    useMutation({
      mutationFn: async () => {
        return await apiClient.api.music.leave.post();
      },
    });

  async function handleJoinChannel() {
    const { error: joinError } = await joinVoiceChannel();

    if (joinError) {
      toast.add({
        title: "Fehler beim Betreten des Voice Channels",
        description: (joinError.value as { message: string }).message,
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: musicQueueQueryKey });
  }

  async function handleLeaveChannel() {
    const { error: leaveError } = await leaveVoiceChannel();

    if (leaveError) {
      toast.add({
        title: "Fehler beim Verlassen des Voice Channels",
        description: (leaveError.value as { message: string }).message,
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: musicQueueQueryKey });
  }

  function getButtonContent() {
    if (isJoiningVoiceChannel) {
      return <LoadingSpinner message="Jam startet ..." />;
    }
    if (isLeavingVoiceChannel) {
      return <LoadingSpinner message="Jam wird beendet ..." />;
    }
    return jamStarted ? (
      <>
        <Square />
        Jam beenden
      </>
    ) : (
      <>
        <Music />
        Jam starten
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 sm:px-8 xl:px-20">
      <div className="flex min-w-0 items-center gap-4">
        <BonsaiLogo className="size-14 shrink-0 sm:size-16" />
        <h1 className="text-3xl font-bold uppercase text-bonsai-pot-light min-[375px]:text-4xl sm:text-5xl">
          Bonsai FM
        </h1>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <p className="max-w-3xl text-lg leading-relaxed text-pretty text-bonsai-pot [&_strong]:font-bold [&_strong]:text-bonsai-leaf-light">
          Hier startest du eine <strong>Jam</strong> für euren Abend. Geh zuerst
          in einen <strong>Voice-Channel</strong> und starte dann die Jam, damit{" "}
          <strong>Bonsai Bot</strong> zu dir in den Channel kommt. Wenn ihr
          fertig seid, beendest du die Jam einfach wieder.
        </p>
        <Button
          className="w-full shrink-0 hover:border-bonsai-leaf-light hover:bg-background hover:text-bonsai-leaf-light dark:hover:bg-input/30 sm:w-auto"
          variant="outline"
          type="button"
          disabled={isJoiningVoiceChannel || isLeavingVoiceChannel}
          onClick={(e) => {
            e.preventDefault();
            if (jamStarted) handleLeaveChannel();
            else handleJoinChannel();
          }}
        >
          {getButtonContent()}
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col gap-5 sm:flex-row w-full lg:gap-16">
        <BonsaiFMPlayer />
        <MusicQueue />
      </div>
    </div>
  );
}
