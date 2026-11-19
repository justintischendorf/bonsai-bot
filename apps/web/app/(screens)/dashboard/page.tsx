"use client";

import { useGSAP } from "@gsap/react";
import { Ghost } from "ghostlyjs";
import gsap from "gsap";
import {
  ArrowUpRight,
  Gamepad2,
  type LucideIcon,
  Radio,
  TvMinimalPlay,
  UserRound,
  Users,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useRef } from "react";

import bonsaiBotTitle from "@/assets/logos/bonsai-bot-title.svg";
import { BonsaiLogo } from "@/components/bonsai-logo";
import { Divider, LiveDot, SectionHeading } from "@/components/decor";
import MemberCard from "@/components/member-card";
import NowPlaying from "@/components/now-playing";
import NowWatching from "@/components/now-watching";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { useDiscordMemberInfo } from "@/hooks/use-discord-member-info";
import { useLimitVisibleItems } from "@/hooks/use-limit-visible-items";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMusicQueue } from "@/hooks/use-music-queue";
import { useWatchLive, useWatchQueue } from "@/hooks/use-watch-queue";
import { useWishlist } from "@/hooks/use-wishlist";
import { CARD, CARD_ROW, ICON_BADGE, ICON_TILE, PILL } from "@/lib/styles";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const MAX_VISIBLE_MEMBERS = 10;
const MAX_VISIBLE_MEMBERS_MOBILE = 4;
const MAX_STACKED_AVATARS = 5;
const MAX_TOP_GAMES = 3;

const LIVE_CARD_CLASS =
  "sm:w-auto sm:flex-1 lg:w-auto border-white/10 bg-neutral-950/80 backdrop-blur-sm";

function StatCard({
  label,
  caption,
  value,
  Icon,
  isLoading,
  highlight,
  children,
}: {
  label: string;
  caption: string;
  value: number;
  Icon: LucideIcon;
  isLoading: boolean;
  highlight?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        CARD,
        "flex flex-col justify-between gap-2 rounded-2xl p-4 sm:gap-5 sm:rounded-3xl sm:p-6",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <dt className="truncate text-xs font-medium text-neutral-400 sm:text-base sm:font-bold sm:text-white">
            {label}
          </dt>
          <span className="text-sm text-neutral-400 max-sm:hidden">
            {caption}
          </span>
        </div>
        <span className={cn(ICON_BADGE, "max-sm:hidden")}>
          <Icon className="size-4" />
        </span>
      </div>
      <dd className="flex items-end justify-between gap-4">
        <Ghost name="discord-server-stat" isLoading={isLoading}>
          <span
            className={cn(
              "text-3xl leading-none font-semibold tracking-tighter tabular-nums sm:text-5xl",
              highlight ? "text-bonsai-leaf-light" : "text-white",
            )}
          >
            {value}
          </span>
        </Ghost>
        {!isLoading && <div className="max-sm:hidden">{children}</div>}
      </dd>
    </div>
  );
}

function PageCard({
  href,
  title,
  description,
  status,
  isActive,
  Icon,
}: {
  href: string;
  title: string;
  description: string;
  status: string | null;
  isActive: boolean;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 p-4 transition-colors hover:bg-white/3 md:flex-col md:items-start md:gap-0 md:p-8"
    >
      <span
        className={cn(
          ICON_TILE,
          "transition-colors group-hover:text-bonsai-leaf-light md:mb-5",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 md:w-full md:gap-2">
        <h3 className="font-bold text-neutral-100 md:text-lg">{title}</h3>
        <p className="text-sm text-neutral-400 max-md:hidden">{description}</p>
        <div className="md:mt-4">
          <Ghost name="dashboard-page-status" isLoading={status === null}>
            <span className={cn(PILL, "max-w-full")}>
              {isActive ? (
                <LiveDot />
              ) : (
                <span className="size-2 shrink-0 rounded-full bg-neutral-600" />
              )}
              <span className="min-w-0 truncate">{status}</span>
            </span>
          </Ghost>
        </div>
      </div>
      <ArrowUpRight className="size-5 shrink-0 text-neutral-600 transition-colors group-hover:text-bonsai-leaf-light md:absolute md:top-8 md:right-8" />
    </Link>
  );
}

function playbackStatus(
  playback: { paused: boolean; current: { title: string } | null } | undefined,
  idleText: string,
) {
  if (!playback) return null;
  if (!playback.current) return idleText;
  return `${playback.paused ? "Pausiert" : "Läuft"}: ${playback.current.title}`;
}

export default function DashboardPage() {
  const {
    data: serverMembersResponse,
    isLoading: isDiscordServerMembersLoading,
  } = useDiscordMemberInfo();

  const serverMembers = serverMembersResponse?.data?.members.toSorted(
    (a, b) => Number(b.online) - Number(a.online),
  );
  const isMobile = useMediaQuery("(max-width: 639px)");
  const maxVisibleMembers = isMobile
    ? MAX_VISIBLE_MEMBERS_MOBILE
    : MAX_VISIBLE_MEMBERS;
  const memberListRef = useLimitVisibleItems(
    maxVisibleMembers,
    serverMembers?.length ?? 0,
  );

  const memberCount = serverMembers?.length ?? 0;
  const onlineMembers = serverMembers?.filter((member) => member.online) ?? [];
  const onlineCount = onlineMembers.length;
  const onlinePercent =
    memberCount === 0 ? 0 : Math.round((onlineCount / memberCount) * 100);
  const playingCount =
    serverMembers?.filter((member) => member.game).length ?? 0;
  const topGames = Object.entries(
    Object.groupBy(
      serverMembers?.filter((member) => member.game) ?? [],
      (member) => member.game!,
    ),
  )
    .map(([game, players]) => ({ game, count: players?.length ?? 0 }))
    .toSorted((a, b) => b.count - a.count)
    .slice(0, MAX_TOP_GAMES);
  const stackedMembers = (
    onlineMembers.length > 0 ? onlineMembers : (serverMembers ?? [])
  ).slice(0, MAX_STACKED_AVATARS);

  const { data: wishlistResponse } = useWishlist();
  const { data: musicResponse } = useMusicQueue();
  const { data: watchResponse } = useWatchQueue();
  useWatchLive();
  const wishlistCount = wishlistResponse?.data?.server.length;
  const music = musicResponse?.data?.server;
  const watch = watchResponse?.data?.server;

  const pages = [
    {
      href: "/wishlist",
      title: "Wunschliste",
      description: "Spiele sammeln und Preise vergleichen",
      Icon: Gamepad2,
      isActive: false,
      status:
        wishlistCount === undefined
          ? null
          : `${wishlistCount} ${wishlistCount === 1 ? "Spiel" : "Spiele"} gesammelt`,
    },
    {
      href: "/bonsai-fm",
      title: "Bonsai FM",
      description: "Jam starten und Musik hören",
      Icon: Radio,
      isActive: !!music?.current && !music.paused,
      status: playbackStatus(music, "Gerade ist es still"),
    },
    {
      href: "/bonsai-watch",
      title: "Bonsai Watch",
      description: "Youtube Videos zusammen schauen",
      Icon: TvMinimalPlay,
      isActive: !!watch?.current && !watch.paused,
      status: playbackStatus(watch, "Gerade läuft nichts"),
    },
  ];

  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "#heading",
        { y: 0 },
        {
          y: -10,
          duration: 1.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        },
      );
    },
    { scope: pageRef },
  );

  return (
    <div ref={pageRef} className="flex flex-col gap-10 lg:gap-16">
      <section className="flex flex-col gap-4 px-4 sm:px-8 xl:px-20">
        <div
          className={cn(
            CARD,
            "isolate flex min-h-36 items-center p-6 sm:min-h-52 sm:p-10",
          )}
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_90%_at_85%_70%,--theme(--color-bonsai-leaf/22%),transparent)]"
          />
          <h1 className="w-3/5 max-w-md">
            <Image
              loading="eager"
              className="h-auto w-full drop-shadow-[0_12px_30px_#00000080]"
              src={bonsaiBotTitle}
              alt="Bonsai Bot"
              width={448}
            />
          </h1>
          <div
            id="heading"
            aria-hidden
            className="absolute right-2 bottom-2 sm:right-10 sm:bottom-4 lg:right-24"
          >
            <BonsaiLogo className="size-28 -rotate-12 drop-shadow-[0_0_40px_#4ade8050] sm:size-44" />
          </div>
        </div>

        {(music?.current || watch?.current) && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <NowPlaying href="/bonsai-fm" className={LIVE_CARD_CLASS} />
            <NowWatching href="/bonsai-watch" className={LIVE_CARD_CLASS} />
          </div>
        )}
      </section>

      <section
        aria-labelledby="community-heading"
        className="flex flex-col gap-5 px-4 sm:gap-8 sm:px-8 xl:px-20"
      >
        <SectionHeading
          id="community-heading"
          eyebrow="Community"
          title="Wer ist gerade da?"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <dl className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-1 lg:grid-rows-3">
            <StatCard
              label="Mitglieder"
              caption="Auf dem Server"
              value={memberCount}
              Icon={Users}
              isLoading={isDiscordServerMembersLoading}
            >
              <AvatarGroup className="*:data-[slot=avatar]:ring-neutral-950">
                {stackedMembers.map((member) => (
                  <Avatar key={member.id}>
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>
                      {[...member.name][0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {memberCount > stackedMembers.length && (
                  <AvatarGroupCount className="bg-neutral-800 text-xs text-neutral-300 ring-neutral-950">
                    +{memberCount - stackedMembers.length}
                  </AvatarGroupCount>
                )}
              </AvatarGroup>
            </StatCard>
            <StatCard
              label="Online"
              caption="Gerade aktiv"
              value={onlineCount}
              Icon={Wifi}
              isLoading={isDiscordServerMembersLoading}
              highlight
            >
              <div className="flex w-28 flex-col items-end gap-2">
                <span className="text-xs font-medium text-neutral-400 tabular-nums">
                  {onlinePercent} %
                </span>
                <div
                  role="progressbar"
                  aria-label="Anteil online"
                  aria-valuenow={onlinePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
                >
                  <div
                    className="h-full rounded-full bg-linear-to-r from-bonsai-leaf to-bonsai-leaf-light shadow-[0_0_12px_#4ade80aa] transition-[width] duration-700"
                    style={{ width: `${onlinePercent}%` }}
                  />
                </div>
              </div>
            </StatCard>
            <StatCard
              label="Im Spiel"
              caption="Zocken gerade"
              value={playingCount}
              Icon={Gamepad2}
              isLoading={isDiscordServerMembersLoading}
            >
              {topGames.length > 0 && (
                <ul className="flex min-w-0 flex-col items-end gap-1">
                  {topGames.map(({ game, count }) => (
                    <li
                      key={game}
                      className="flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-0.5 pr-1 pl-2.5 text-xs text-neutral-300"
                    >
                      <span className="truncate">{game}</span>
                      <span className="rounded-full bg-white/10 px-1.5 font-medium text-white tabular-nums">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </StatCard>
          </dl>

          <div className={cn(CARD, "flex min-w-0 flex-col gap-4 p-4 sm:p-6")}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={ICON_BADGE}>
                  <UserRound className="size-4" />
                </span>
                <h3 className="font-bold text-white">Mitglieder</h3>
              </div>
              <Ghost
                name="discord-server-member-count"
                isLoading={isDiscordServerMembersLoading}
              >
                <span className={cn(PILL, "tabular-nums")}>
                  <LiveDot />
                  {onlineCount} von {memberCount} online
                </span>
              </Ghost>
            </div>
            <div
              ref={memberListRef}
              className="grid w-full grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2"
            >
              <Ghost
                name="discord-server-members"
                isLoading={isDiscordServerMembersLoading}
                count={maxVisibleMembers}
              >
                {serverMembers?.map((member) => (
                  <MemberCard
                    member={member}
                    key={member.id}
                    className={CARD_ROW}
                  />
                ))}
              </Ghost>
            </div>
          </div>
        </div>
      </section>

      <Divider className="mx-4 sm:mx-8 xl:mx-20" />

      <nav
        aria-labelledby="pages-heading"
        className="flex flex-col gap-5 px-4 sm:gap-8 sm:px-8 xl:px-20"
      >
        <SectionHeading
          id="pages-heading"
          eyebrow="Bereiche"
          title="Alles an einem Ort"
        />
        <div
          className={cn(
            CARD,
            "grid grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0",
          )}
        >
          {pages.map((page) => (
            <PageCard key={page.href} {...page} />
          ))}
        </div>
      </nav>
    </div>
  );
}
