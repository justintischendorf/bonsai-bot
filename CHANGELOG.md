# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.0] - 2026-11-19

### Added

- "Now watching" card on the dashboard next to the daily suggestion and
  "Now playing": it shows the thumbnail, title and channel of the video
  playing in Bonsai Watch, whether it is paused, and links to Bonsai Watch.
  The card updates instantly over the `/api/watch/live` WebSocket. ([#42])
- The footer shows the version of the dashboard. ([#41])

### Changed

- Loading skeletons are measured from the real UI with
  [GhostlyJs](https://github.com/justintischendorf/ghostlyjs) instead of
  being written by hand, so they match the layout at every window width.
  The measurements live in `apps/web/ghostly.json`. ([#41], [#42])
- Bun 1.4.4 instead of 1.4.2 everywhere: in the Docker images, in CI and
  in `package.json`. ([#36], [#40])
- Dependency updates, among them Next.js 16.4.6, React 19.3.1, Elysia
  1.4.32, Better Auth 1.7.25, discord.js 14.28.1 and lavalink-client
  2.11.2. ([#37])

### Removed

- The unused `eslint` and `eslint-config-next` packages, linting runs on
  oxlint only. ([#39])

## [1.5.0] - 2026-11-19

### Added

- On every pull request to `develop` and `main`, CI now also builds all apps
  (`bun run build`). ([#27])
- Release PR workflow: a new PR to `main` with an empty description is
  automatically filled with `.github/release_pr_template.md` and the list of
  commits since the last release. The version is taken from the PR title
  (e.g. `v1.5.0`). ([#27])
- Every Monday, Dependabot opens PRs to `develop` for Bun packages, GitHub
  Actions, the Dockerfile base images and the images in the compose files.
  ([#28])
- `CHANGELOG.md` with all changes since v1.0.0. ([#30])

### Changed

- The README is now in English, with a table of all environment variables.
  ([#29], [#33])
- CI no longer runs on pushes to `main` and `develop`, only on pull
  requests. ([#27])

### Removed

- All animations in the dashboard: the intro and fade-in animations of the
  pages, the blinking eyes of the logo, hover effects and the open and close
  animations of dialogs, popovers and menus. Only the Bonsai Bot heading on
  the dashboard still floats up and down. ([#31])
- `prettier` has been removed, formatting runs on oxfmt only. `oxfmt` and
  `oxlint` are now dev dependencies. ([#26])

## [1.4.3] - 2026-11-13

### Fixed

- Bonsai Watch: skipping a video, by hand or automatically at the end of a
  video, no longer crashes the page with "This page couldn't load". The sync
  now waits until the player has loaded the new video. ([#24])

## [1.4.2] - 2026-11-13

### Added

- Bonsai Watch: when YouTube asks to sign in, a hint below the player
  explains how to allow third-party cookies in Chrome, Edge, Firefox, Safari
  and Brave. "Try again" reloads the player without reloading the page,
  "Open on YouTube" opens the video at the current position. Deleted or
  private videos are shown in the hint as well. ([#22])

### Fixed

- Bonsai Watch: after pause and play, all devices continue at the same
  position. Network delay is taken into account even if a device's clock is
  wrong, the player learns how long it buffers and compensates for it, and
  small drifts are corrected from 0.2 seconds instead of one second. API and
  dashboard must be updated together, both use the new clock sync over the
  `/api/watch/live` WebSocket. ([#22])

## [1.4.1] - 2026-11-12

### Fixed

- Bonsai Watch now stays in sync: changes reach everyone instantly over the
  new WebSocket `/api/watch/live` instead of polling every 2 seconds. Seeking
  works while paused, late joiners start at the current position, blocked
  autoplay no longer pauses the video for everyone, and queue changes appear
  for everyone right away. The reverse proxy has to pass WebSocket
  connections to the API. ([#20])

## [1.4.0] - 2026-11-12

### Added

- Bonsai Watch: watch YouTube videos together. Videos, Shorts and youtu.be
  links go onto a queue that can be sorted by drag and drop. Play, pause and
  seek apply to everyone watching, the next video starts automatically and
  every video shows who requested it. New API endpoints under `/api/watch`
  and a new migration for the `watch_queue` table. No API key is needed,
  video data comes from the YouTube oEmbed endpoint. ([#18])

## [1.3.0] - 2026-11-12

### Added

- The thumb button on every wishlist card shows the number of likes in a
  small badge. ([#16])
- The daily suggestion on the dashboard shows whether crossplay is
  available. ([#16])

### Changed

- Wishlist cards have a bit more space below the title image and a bit less
  between the other contents. ([#16])

## [1.2.2] - 2026-11-11

### Added

- Games on the wishlist can be liked. Hovering the thumb shows up to nine
  members who also like the game. New endpoint `PATCH /api/wishlist/:id/like`
  and migration `20261111143125_wishlist_likes`. ([#14])
- The dashboard asks for confirmation before a game is removed from the
  wishlist. ([#14])

## [1.2.1] - 2026-11-07

### Added

- When adding a game to the wishlist, it can be marked as crossplay
  available (PlayStation 5 and PC). Every card shows the status. New field
  `crossplayAvailable` with migration `20261107224841_crossplay_available`,
  existing games default to "no". ([#12])

## [1.2.0] - 2026-11-07

### Added

- Games can be added to the wishlist by a PlayStation Store link. Price,
  name, description, release date and title image are refreshed every 30
  minutes, and price drops are posted to Discord. ([#9])
- Wishlist cards and the daily suggestion show the title image of the game,
  shop links show the logos of Steam, Instant Gaming and PlayStation. ([#8])

### Changed

- The daily suggestion only suggests games that are already released. ([#9])
- The "Today's suggestion" and "Now playing" cards on the dashboard link to
  the wishlist and to Bonsai FM. ([#8])

### Fixed

- Steam prices are found again for games with a free Friend's Pass. ([#8])

## [1.1.0] - 2026-11-06

### Added

- When the jam queue is empty, the bot keeps playing songs from the YouTube
  mix of the last song, skipping livestreams and the last 50 songs. ([#6])

### Changed

- The "Now playing" and "Daily suggestion" cards only show up when there is
  something to show. ([#5])
- Price drop messages are only sent for drops of at least 10 %. ([#5])
- The background is black everywhere and layout bugs are fixed. ([#5])

### Removed

- The "Show all members" button. ([#5])

## [1.0.1] - 2026-11-05

### Added

- The Bonsai Bot logo is used as favicon. ([#3])

### Changed

- `docker-compose-prod.yml` is set up for Dokploy with Traefik. Dashboard
  and API run under one domain (`/` and `/api`) and no longer publish ports
  on the host. `WEB_SERVER_URL` and `BETTER_AUTH_URL` must be the same
  address. ([#2])

## [1.0.0] - 2026-11-05

### Added

- First release: Discord bot, web dashboard and API in one monorepo with
  Discord login, a dashboard with server data, the wishlist with Steam and
  Instant Gaming prices, the music player with Lavalink and the slash
  commands `/ping` and `/link`.

[Unreleased]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.4.3...v1.5.0
[1.4.3]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.4.2...v1.4.3
[1.4.2]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/justintischendorf/Bonsai-Bot/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/justintischendorf/Bonsai-Bot/releases/tag/v1.0.0
[#2]: https://github.com/justintischendorf/Bonsai-Bot/pull/2
[#3]: https://github.com/justintischendorf/Bonsai-Bot/pull/3
[#5]: https://github.com/justintischendorf/Bonsai-Bot/pull/5
[#6]: https://github.com/justintischendorf/Bonsai-Bot/pull/6
[#8]: https://github.com/justintischendorf/Bonsai-Bot/pull/8
[#9]: https://github.com/justintischendorf/Bonsai-Bot/pull/9
[#12]: https://github.com/justintischendorf/Bonsai-Bot/pull/12
[#14]: https://github.com/justintischendorf/Bonsai-Bot/pull/14
[#16]: https://github.com/justintischendorf/Bonsai-Bot/pull/16
[#18]: https://github.com/justintischendorf/Bonsai-Bot/pull/18
[#20]: https://github.com/justintischendorf/Bonsai-Bot/pull/20
[#22]: https://github.com/justintischendorf/Bonsai-Bot/pull/22
[#24]: https://github.com/justintischendorf/Bonsai-Bot/pull/24
[#26]: https://github.com/justintischendorf/Bonsai-Bot/pull/26
[#27]: https://github.com/justintischendorf/Bonsai-Bot/pull/27
[#28]: https://github.com/justintischendorf/Bonsai-Bot/pull/28
[#29]: https://github.com/justintischendorf/Bonsai-Bot/pull/29
[#30]: https://github.com/justintischendorf/Bonsai-Bot/pull/30
[#31]: https://github.com/justintischendorf/Bonsai-Bot/pull/31
[#33]: https://github.com/justintischendorf/Bonsai-Bot/pull/33
[#36]: https://github.com/justintischendorf/Bonsai-Bot/pull/36
[#37]: https://github.com/justintischendorf/Bonsai-Bot/pull/37
[#39]: https://github.com/justintischendorf/Bonsai-Bot/pull/39
[#40]: https://github.com/justintischendorf/Bonsai-Bot/pull/40
[#41]: https://github.com/justintischendorf/Bonsai-Bot/pull/41
[#42]: https://github.com/justintischendorf/Bonsai-Bot/pull/42
