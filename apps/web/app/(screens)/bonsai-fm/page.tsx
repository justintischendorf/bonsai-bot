"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ghost } from "ghostlyjs";
import { Music, Radio, Square } from "lucide-react";

import BonsaiFMPlayer from "@/components/bonsai-fm-player";
import { Divider, LiveDot, PageHeader } from "@/components/decor";
import LoadingSpinner from "@/components/loading-spinner";
import MusicQueue from "@/components/music-queue";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { musicQueueQueryKey, useMusicQueue } from "@/hooks/use-music-queue";
import { apiClient } from "@/lib/api-client";
import { CARD, OUTLINE_BUTTON, PILL, PRIMARY_BUTTON } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function BonsaiFM() {
  const queryClient = useQueryClient();
  const { data: musicResponse, isLoading: isMusicQueueLoading } =
    useMusicQueue();
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
    <div className="flex flex-col gap-8 px-4 sm:px-8 xl:px-20">
      <PageHeader
        eyebrow="Musik"
        title="Bonsai FM"
        Icon={Radio}
        actions={
          <Ghost name="bonsai-fm-jam" isLoading={isMusicQueueLoading}>
            {jamStarted && (
              <span className={PILL}>
                <LiveDot />
                Jam läuft
              </span>
            )}
            <Button
              className={cn(
                jamStarted ? OUTLINE_BUTTON : PRIMARY_BUTTON,
                "w-full shrink-0 sm:w-auto",
              )}
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
          </Ghost>
        }
      >
        Hier startest du eine <strong>Jam</strong> für euren Abend. Geh zuerst
        in einen <strong>Voice-Channel</strong> und starte dann die Jam, damit{" "}
        <strong>Bonsai Bot</strong> zu dir in den Channel kommt. Wenn ihr fertig
        seid, beendest du die Jam einfach wieder.
      </PageHeader>
      <Divider />
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className={cn(CARD, "flex p-5 sm:p-8")}>
          <BonsaiFMPlayer />
        </div>
        <div className={cn(CARD, "flex p-4 sm:p-6")}>
          <MusicQueue />
        </div>
      </div>
    </div>
  );
}
