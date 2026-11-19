"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ghost } from "ghostlyjs";
import {
  ExternalLink,
  RotateCw,
  SkipForward,
  TriangleAlert,
  TvMinimalPlay,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  type WatchQueueResponse,
  applyWatchState,
  getServerNow,
  useWatchQueue,
  watchQueueQueryKey,
} from "@/hooks/use-watch-queue";
import { apiClient } from "@/lib/api-client";
import { ICON_TILE, OUTLINE_BUTTON, PLACEHOLDER } from "@/lib/styles";
import { cn } from "@/lib/utils";

import LoadingSpinner from "./loading-spinner";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";
import YouTubePlayer, { getPlayerVideoId } from "./youtube-player";

const TICK_MS = 250;
const PAUSED_SYNC_TOLERANCE_S = 0.1;
const PLAY_SYNC_TOLERANCE_S = 0.25;
const DRIFT_TOLERANCE_S = 0.2;
const DRIFT_COOLDOWN_MS = 3_000;
const SETTLE_MS = 1_500;
const MAX_LEAD_S = 1;
const SEEK_DETECTION_S = 1.5;
const USER_SEEK_MIN_OFFSET_S = 1;
const OWN_COMMAND_GRACE_MS = 1_000;
const STUCK_HINT_MS = 8_000;
const VIDEO_NOT_FOUND_ERROR = 100;

type PlaybackAction = "play" | "pause" | "seek";

type Remote = {
  currentId: number | null;
  videoId: string | null;
  paused: boolean;
  position: number;
  version: number;
  serverTime: number | null;
  receivedAt: number;
};

type Sample = { time: number; at: number; playing: boolean };

type LeadKind = "seek" | "resume";

type PlaybackIssue = "blocked" | "unavailable" | "stuck";

const buttonStyles = OUTLINE_BUTTON;

const ERROR_TITLES: Record<PlaybackAction, string> = {
  play: "Fehler beim Abspielen des Videos",
  pause: "Fehler beim Pausieren des Videos",
  seek: "Fehler beim Springen im Video",
};

function getElapsedMs(remote: Remote) {
  const serverNow = getServerNow();
  if (serverNow !== null && remote.serverTime !== null) {
    return Math.max(0, serverNow - remote.serverTime);
  }
  return Date.now() - remote.receivedAt;
}

function getExpectedPosition(remote: Remote) {
  if (remote.paused) return remote.position;
  return remote.position + getElapsedMs(remote) / 1000;
}

function isPlayingState(playerState: YT.PlayerState) {
  return (
    playerState === YT.PlayerState.PLAYING ||
    playerState === YT.PlayerState.BUFFERING
  );
}

export default function WatchPlayer({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const { data: watchResponse, isLoading: isWatchQueueLoading } =
    useWatchQueue();
  const state = watchResponse?.data?.server;
  const current = state?.current ?? null;

  const playerRef = useRef<YT.Player | null>(null);
  const [readyCount, setReadyCount] = useState(0);
  const remote = useRef<Remote | null>(null);
  const sample = useRef<Sample | null>(null);
  const hasPlayed = useRef(false);
  const ignoreEventsUntil = useRef(0);
  const lastDriftFix = useRef(0);
  const playingSince = useRef<number | null>(null);
  const leads = useRef<Record<LeadKind, number>>({ seek: 0, resume: 0 });
  const measuringLead = useRef<LeadKind | null>(null);
  const requestChain = useRef<Promise<void>>(Promise.resolve());
  const stuckSince = useRef<number | null>(null);
  const [issue, setIssue] = useState<PlaybackIssue | null>(null);
  const [playerKey, setPlayerKey] = useState(0);

  const { mutateAsync: skipVideo, isPending: isSkippingVideo } = useMutation({
    mutationFn: async (currentId: number) =>
      apiClient.api.watch.skip.post({ currentId }),
  });

  function getSyncedPlayer() {
    const player = playerRef.current;
    const target = remote.current;
    if (!player || !target?.videoId) return null;
    if (getPlayerVideoId(player) !== target.videoId) return null;
    return { player, target };
  }

  function command(run: () => void) {
    ignoreEventsUntil.current = Date.now() + OWN_COMMAND_GRACE_MS;
    sample.current = null;
    run();
  }

  function startCorrection(kind: LeadKind) {
    lastDriftFix.current = Date.now();
    measuringLead.current = kind;
  }

  function seekWhilePlaying(player: YT.Player, target: Remote) {
    startCorrection("seek");
    command(() =>
      player.seekTo(getExpectedPosition(target) + leads.current.seek, true),
    );
  }

  function resume(player: YT.Player, target: Remote) {
    startCorrection("resume");
    command(() => {
      player.seekTo(getExpectedPosition(target) + leads.current.resume, true);
      player.playVideo();
    });
  }

  function updateLead(time: number, expected: number) {
    const kind = measuringLead.current;
    if (!kind) return;
    measuringLead.current = null;
    const behind = expected - time;
    leads.current[kind] = Math.min(
      MAX_LEAD_S,
      Math.max(0, leads.current[kind] + behind),
    );
  }

  function applyRemote() {
    const synced = getSyncedPlayer();
    if (!synced) return;
    const { player, target } = synced;

    const playerState = player.getPlayerState();
    const expected = getExpectedPosition(target);
    const offset = Math.abs(player.getCurrentTime() - expected);

    if (target.paused) {
      if (
        playerState === YT.PlayerState.UNSTARTED ||
        playerState === YT.PlayerState.CUED
      ) {
        return;
      }
      if (isPlayingState(playerState)) command(() => player.pauseVideo());
      if (offset > PAUSED_SYNC_TOLERANCE_S) {
        command(() => player.seekTo(expected, true));
      }
      return;
    }

    if (playerState === YT.PlayerState.PAUSED) {
      resume(player, target);
      return;
    }
    if (!isPlayingState(playerState)) {
      if (offset > PLAY_SYNC_TOLERANCE_S) {
        command(() => player.seekTo(expected, true));
      }
      command(() => player.playVideo());
      return;
    }
    if (offset > PLAY_SYNC_TOLERANCE_S) seekWhilePlaying(player, target);
  }

  useEffect(() => {
    if (!state) return;
    const previous = remote.current;
    if (previous && previous.version >= state.version) return;

    const currentId = state.current?.id ?? null;
    if (previous?.currentId !== currentId) {
      hasPlayed.current = false;
      sample.current = null;
      stuckSince.current = null;
      setIssue(null);
    }
    remote.current = {
      currentId,
      videoId: state.current?.videoId ?? null,
      paused: state.paused,
      position: state.position,
      version: state.version,
      serverTime: state.serverTime,
      receivedAt: Date.now(),
    };
    measuringLead.current = null;
    applyRemote();
  }, [state]);

  useEffect(() => {
    applyRemote();
  }, [readyCount]);

  function sendPlayback(action: PlaybackAction, position: number) {
    const target = remote.current;
    if (!target?.currentId) return;

    const paused = action === "seek" ? target.paused : action === "pause";
    const serverTime = getServerNow();
    remote.current = {
      ...target,
      paused,
      position,
      serverTime,
      receivedAt: Date.now(),
    };
    queryClient.setQueryData<WatchQueueResponse>(watchQueueQueryKey, (old) =>
      old?.data
        ? {
            ...old,
            data: {
              ...old.data,
              server: {
                ...old.data.server,
                paused,
                position,
                serverTime: serverTime ?? old.data.server.serverTime,
              },
            },
          }
        : old,
    );

    requestChain.current = requestChain.current.then(async () => {
      const { data, error } = await apiClient.api.watch[action].post({
        position,
        ...(serverTime !== null && { serverTime }),
      });
      if (data) {
        applyWatchState(queryClient, data.server);
        return;
      }
      toast.add({
        title: ERROR_TITLES[action],
        description: (error?.value as { message: string } | undefined)?.message,
      });
      if (remote.current) remote.current.version = -Infinity;
      await queryClient.invalidateQueries({ queryKey: watchQueueQueryKey });
    });
  }

  function detectStuckPlayer() {
    const target = remote.current;
    const player = playerRef.current;
    const isPlaying = player ? isPlayingState(player.getPlayerState()) : false;

    if (!target?.videoId || target.paused || isPlaying) {
      stuckSince.current = null;
      if (issue === "stuck" || (isPlaying && issue)) setIssue(null);
      return;
    }
    stuckSince.current ??= Date.now();
    if (!issue && Date.now() - stuckSince.current > STUCK_HINT_MS) {
      setIssue("stuck");
    }
  }

  function tick() {
    detectStuckPlayer();
    const synced = getSyncedPlayer();
    if (!synced) return;
    const { player, target } = synced;

    const now = Date.now();
    const playerState = player.getPlayerState();
    const time = player.getCurrentTime();
    if (playerState === YT.PlayerState.PLAYING) playingSince.current ??= now;
    else playingSince.current = null;
    if (playerState === YT.PlayerState.PAUSED) measuringLead.current = null;
    const previous = sample.current;
    sample.current = {
      time,
      at: now,
      playing: playerState === YT.PlayerState.PLAYING,
    };
    if (now < ignoreEventsUntil.current) return;

    const expected = getExpectedPosition(target);

    if (previous) {
      const maxAdvance = previous.playing
        ? ((now - previous.at) / 1000) * player.getPlaybackRate()
        : 0;
      const jumped =
        time < previous.time - SEEK_DETECTION_S ||
        time > previous.time + maxAdvance + SEEK_DETECTION_S;
      if (jumped && Math.abs(time - expected) > USER_SEEK_MIN_OFFSET_S) {
        sendPlayback("seek", time);
        return;
      }
    }

    if (playerState === YT.PlayerState.PAUSED && !target.paused) {
      if (hasPlayed.current) sendPlayback("pause", time);
      return;
    }
    if (playerState === YT.PlayerState.PLAYING && target.paused) {
      handleLocalPlay(time);
      return;
    }

    const isSettled =
      playingSince.current !== null &&
      now - playingSince.current > SETTLE_MS &&
      now - lastDriftFix.current > SETTLE_MS;
    if (!isSettled) return;

    updateLead(time, expected);
    if (
      Math.abs(time - expected) > DRIFT_TOLERANCE_S &&
      now - lastDriftFix.current > DRIFT_COOLDOWN_MS
    ) {
      seekWhilePlaying(player, target);
    }
  }

  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  });
  useEffect(() => {
    const interval = setInterval(() => tickRef.current(), TICK_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleSkipVideo(currentId: number) {
    const { data, error } = await skipVideo(currentId);

    if (data) {
      applyWatchState(queryClient, data.server);
      return;
    }
    toast.add({
      title: "Fehler beim Überspringen des Videos",
      description: (error?.value as { message: string } | undefined)?.message,
    });
    await queryClient.invalidateQueries({ queryKey: watchQueueQueryKey });
  }

  function handleLocalPlay(time: number) {
    const synced = getSyncedPlayer();
    if (!synced) return;
    const { player, target } = synced;

    if (
      !hasPlayed.current &&
      Math.abs(time - target.position) > PLAY_SYNC_TOLERANCE_S
    ) {
      command(() => player.seekTo(target.position, true));
      time = target.position;
    }
    hasPlayed.current = true;
    sendPlayback("play", time);
  }

  function handlePlayerError(code: YT.PlayerError) {
    setIssue(code === VIDEO_NOT_FOUND_ERROR ? "unavailable" : "blocked");
  }

  function handleRetry() {
    hasPlayed.current = false;
    sample.current = null;
    stuckSince.current = null;
    setIssue(null);
    setPlayerKey((key) => key + 1);
  }

  function openOnYouTube() {
    const target = remote.current;
    if (!target?.videoId) return;
    const start = Math.floor(getExpectedPosition(target));
    window.open(
      `https://www.youtube.com/watch?v=${target.videoId}&t=${start}s`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function handleStateChange(playerState: YT.PlayerState) {
    const synced = getSyncedPlayer();
    if (!synced) return;
    const { player, target } = synced;

    if (playerState === YT.PlayerState.ENDED) {
      if (target.currentId !== null) handleSkipVideo(target.currentId);
      return;
    }
    if (playerState === YT.PlayerState.CUED) {
      applyRemote();
      return;
    }
    if (Date.now() < ignoreEventsUntil.current) {
      if (playerState === YT.PlayerState.PLAYING) hasPlayed.current = true;
      return;
    }

    const time = player.getCurrentTime();
    if (playerState === YT.PlayerState.PLAYING) {
      if (target.paused) handleLocalPlay(time);
      else hasPlayed.current = true;
      return;
    }
    if (
      playerState === YT.PlayerState.PAUSED &&
      !target.paused &&
      hasPlayed.current
    ) {
      sendPlayback("pause", time);
    }
  }

  return (
    <section className={cn("flex min-w-0 flex-col gap-4 lg:flex-2", className)}>
      <Ghost name="watch-player" isLoading={isWatchQueueLoading}>
        {current ? (
          <YouTubePlayer
            key={playerKey}
            videoId={current.videoId}
            playerRef={playerRef}
            onReady={() => setReadyCount((count) => count + 1)}
            onStateChange={handleStateChange}
            onError={handlePlayerError}
          />
        ) : (
          <div
            className={cn(
              PLACEHOLDER,
              "flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl p-4 text-center",
            )}
          >
            <span
              className={cn(
                ICON_TILE,
                "size-14 rounded-2xl text-bonsai-leaf-light",
              )}
            >
              <TvMinimalPlay className="size-6" />
            </span>
            <p className="text-sm font-medium text-neutral-400">
              Füge ein Video hinzu, um zusammen zu schauen
            </p>
          </div>
        )}
        {current && issue && (
          <PlaybackHint
            issue={issue}
            onRetry={handleRetry}
            onOpenOnYouTube={openOnYouTube}
          />
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {current
                ? state?.paused
                  ? "Pausiert"
                  : "Läuft gerade"
                : "Kein Video aktiv"}
            </p>
            <h2 className="line-clamp-2 text-xl font-semibold lg:text-2xl">
              {current?.title ?? "Kein Video"}
            </h2>
            {current && (
              <p className="truncate text-sm font-medium text-muted-foreground">
                {current.channel} · Gewünscht von {current.requestedBy}
              </p>
            )}
          </div>
          <Button
            className={cn(buttonStyles, "shrink-0")}
            variant="outline"
            type="button"
            disabled={isSkippingVideo || !current}
            onClick={() => current && handleSkipVideo(current.id)}
          >
            {isSkippingVideo ? (
              <LoadingSpinner />
            ) : (
              <>
                <SkipForward />
                Überspringen
              </>
            )}
          </Button>
        </div>
      </Ghost>
    </section>
  );
}

const COOKIE_STEPS = [
  {
    browser: "Chrome",
    step: "Schloss-Symbol links in der Adressleiste → Drittanbieter-Cookies → zulassen. Im Inkognito-Fenster geht es nicht.",
  },
  {
    browser: "Edge",
    step: "Schloss-Symbol → Tracking-Verhinderung für diese Website ausschalten.",
  },
  {
    browser: "Firefox",
    step: "Schild-Symbol links in der Adressleiste → Verbesserten Schutz vor Aktivitätenverfolgung für diese Website ausschalten.",
  },
  {
    browser: "Safari",
    step: "Einstellungen → Datenschutz → „Websiteübergreifendes Tracking verhindern“ ausschalten (iPhone: Einstellungen → Apps → Safari).",
  },
  {
    browser: "Brave",
    step: "Löwen-Symbol in der Adressleiste → Shields für diese Website ausschalten.",
  },
];

const HINTS: Record<PlaybackIssue, { title: string; description: string }> = {
  blocked: {
    title: "YouTube blockiert die Wiedergabe",
    description:
      "Steht im Player „Sign in“, sieht der eingebettete Player deinen YouTube-Login nicht, weil dein Browser Drittanbieter-Cookies blockiert. Erlaube sie für diese Seite, melde dich auf youtube.com an und versuche es erneut. Läuft das Video bei niemandem, erlaubt es kein Einbetten.",
  },
  unavailable: {
    title: "Video nicht verfügbar",
    description:
      "Das Video ist privat oder wurde gelöscht. Überspringe es, um mit dem nächsten weiterzumachen.",
  },
  stuck: {
    title: "Das Video startet nicht?",
    description:
      "Klicke im Player auf Play. Steht dort „Sign in“, erlaube Drittanbieter-Cookies für diese Seite, melde dich auf youtube.com an und versuche es erneut.",
  },
};

function PlaybackHint({
  issue,
  onRetry,
  onOpenOnYouTube,
}: {
  issue: PlaybackIssue;
  onRetry: () => void;
  onOpenOnYouTube: () => void;
}) {
  const { title, description } = HINTS[issue];

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex min-w-0 gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          {issue !== "unavailable" && (
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer font-medium text-bonsai-leaf-light">
                Drittanbieter-Cookies erlauben
              </summary>
              <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
                {COOKIE_STEPS.map(({ browser, step }) => (
                  <li key={browser}>
                    <span className="font-medium text-foreground">
                      {browser}:
                    </span>{" "}
                    {step}
                  </li>
                ))}
                <li>
                  Danach in einem neuen Tab auf youtube.com anmelden und hier
                  „Erneut versuchen“ klicken.
                </li>
              </ul>
            </details>
          )}
        </div>
      </div>
      {issue !== "unavailable" && (
        <div className="flex shrink-0 gap-2">
          <Button
            className={buttonStyles}
            variant="outline"
            size="sm"
            type="button"
            onClick={onRetry}
          >
            <RotateCw />
            Erneut versuchen
          </Button>
          <Button
            className={buttonStyles}
            variant="outline"
            size="sm"
            type="button"
            onClick={onOpenOnYouTube}
          >
            <ExternalLink />
            Auf YouTube öffnen
          </Button>
        </div>
      )}
    </div>
  );
}
