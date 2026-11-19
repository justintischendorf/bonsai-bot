# Bonsai Bot

A Discord bot with a web dashboard for a single Discord server. Members sign
in with their Discord account, keep a shared game wishlist, control the music
in the voice channel from the website and watch YouTube videos together.

Built as a [Turborepo](https://turborepo.dev/) monorepo on
[Bun](https://bun.sh/): Next.js dashboard, Elysia API, discord.js bot with
Lavalink, SQLite through Prisma and Better Auth for the Discord login.

**[Features](#features) · [Architecture](#architecture) ·
[Environment](#environment-variables) · [Development](#development) ·
[Production](#production) · [Scripts](#scripts)**

## Features

- **Discord login:** only members of the configured server can sign in.
- **Dashboard:** server info, the member list and a daily game suggestion
  from the released games on the wishlist.
- **Wishlist:** add games by a link to Steam, Instant Gaming or the
  PlayStation Store and mark whether crossplay is available. Title image and
  prices are fetched automatically and refreshed every 30 minutes, price
  drops are posted to a Discord channel. Games can be liked, and hovering the
  thumb shows who else likes them.
- **Bonsai FM:** a queue of YouTube links plus join, leave, play, stop and
  skip from the website. When the jam queue is empty, the bot keeps playing
  songs from the YouTube mix of the last song.
- **Bonsai Watch:** watch YouTube videos together. Videos go onto a queue
  that can be sorted by drag and drop. Play, pause and seek apply to everyone
  watching and reach all browsers instantly over a WebSocket.
- **Slash commands:** `/ping` and `/link`.

## Architecture

Web dashboard and API run under the same domain (`/` and `/api`). The API
talks to Discord for server data and to the bot over an internal HTTP server
secured by `BOT_INTERNAL_SECRET`. The bot plays music through Lavalink, which
uses yt-cipher to resolve YouTube streams.

| Path                | Content                                         |
| ------------------- | ----------------------------------------------- |
| `apps/web`          | Web dashboard (Next.js, React)                  |
| `apps/api`          | API (Elysia on Bun)                             |
| `apps/bot`          | Discord bot (discord.js, lavalink-client)       |
| `packages/database` | Prisma schema, migrations and client (SQLite)   |
| `packages/auth`     | Authentication (Better Auth with Discord OAuth) |
| `packages/treaty`   | Typed API client for the dashboard              |
| `packages/logger`   | Shared logger                                   |

## Environment variables

For development, copy the `.env.example` in `apps/api`, `apps/bot`,
`apps/web` and `packages/database` to `.env` in the same folder. For
production, the root `.env.example` lists everything the compose file needs.

| Variable                      | Used by       | Description                                                           |
| ----------------------------- | ------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`                | api, bot, web | SQLite file, e.g. `"file:../../packages/database/data.db"`            |
| `API_SERVER_PORT`             | api           | `3001`                                                                |
| `WEB_SERVER_URL`              | api, bot, web | Address of the dashboard, e.g. `http://localhost:3000`                |
| `BETTER_AUTH_URL`             | api, web      | Address of the API, e.g. `http://localhost:3001` ¹                    |
| `BETTER_AUTH_SECRET`          | api, web      | Random value ²                                                        |
| `NEXT_PUBLIC_API_SERVER_URL`  | web           | Address of the API as seen by the browser ³                           |
| `NEXT_PUBLIC_AUTH_BASE_URL`   | web           | Address of Better Auth as seen by the browser ³                       |
| `DISCORD_CLIENT_ID`           | api, bot, web | From the Discord Developer Portal                                     |
| `DISCORD_CLIENT_SECRET`       | api, web      | From the Discord Developer Portal                                     |
| `DISCORD_GUILD_ID`            | api, bot, web | ID of the Discord server                                              |
| `DISCORD_BOT_TOKEN`           | api           | Bot token, used for server data and the member list                   |
| `DISCORD_TOKEN`               | bot           | Bot token (same value as `DISCORD_BOT_TOKEN`)                         |
| `WISHLIST_CHANNEL_ID`         | api           | Channel for price drop messages                                       |
| `BOT_INTERNAL_URL`            | api           | Internal bot server, `http://127.0.0.1:3002`                          |
| `BOT_INTERNAL_PORT`           | bot           | `3002`                                                                |
| `BOT_INTERNAL_SECRET`         | api, bot      | Random value ², must be the same in both                              |
| `LAVALINK_HOST`               | bot           | `127.0.0.1`, set by the compose file in Docker                        |
| `LAVALINK_PORT`               | bot           | `2333`                                                                |
| `LAVALINK_PASSWORD`           | bot, lavalink | Random value ² in production                                          |
| `YT_CIPHER_TOKEN`             | lavalink      | Random value ², shared by Lavalink and yt-cipher                      |
| `YOUTUBE_OAUTH_ENABLED`       | lavalink      | Optional, see [YouTube blocks the server](#youtube-blocks-the-server) |
| `YOUTUBE_OAUTH_REFRESH_TOKEN` | lavalink      | Optional, see [YouTube blocks the server](#youtube-blocks-the-server) |

¹ In production `WEB_SERVER_URL` and `BETTER_AUTH_URL` are the same address,
e.g. `https://bonsai.example.com`.
² Generate with `openssl rand -base64 32`. Never reuse development values in
production.
³ `NEXT_PUBLIC_*` values are baked into the dashboard at build time. Restart
`bun run dev` or rebuild the image after changing them.

## Development

API and dashboard run locally with hot reload, the bot, Lavalink and
yt-cipher run in Docker. You need [Bun](https://bun.sh/) 1.4.4, Node.js 24,
Docker with Docker Compose and an application in the
[Discord Developer Portal](https://discord.com/developers/applications) with
a bot and OAuth2.

```sh
bun install

# 1. Create the .env files (see the table above)
for d in apps/api apps/bot apps/web packages/database; do cp "$d/.env.example" "$d/.env"; done

# 2. Generate the Prisma client and create the database
bun run db:generate
bun run db:migrate

# 3. Start the bot, Lavalink and yt-cipher
bun run docker:dev

# 4. Start the API (http://localhost:3001) and the dashboard (http://localhost:3000)
bun run dev
```

Register the slash commands once and after every change to them:

```sh
cd apps/bot && bun run deploy
```

### Changing the schema

Edit `packages/database/prisma/schema.prisma`, run `bun run db:migrate` and
commit the new migration.

## Production

The deployment runs on [Dokploy](https://dokploy.com/) with
`docker-compose-prod.yml`. A `migrate` service applies new migrations on
every deployment before the API and the dashboard start.

1. Create a service of type **Docker Compose** (not **Stack**), set the
   compose path to `./docker-compose-prod.yml` and leave
   **Isolated Deployments** off.
2. Set the variables from the root `.env.example` in the environment tab.
3. Add two entries with the same domain in the domains tab:

   | Service | Path   | Port   | Strip path |
   | ------- | ------ | ------ | ---------- |
   | `web`   | `/`    | `3000` | off        |
   | `api`   | `/api` | `3001` | off        |

4. Add the redirect URL `https://bonsai.example.com/api/auth/callback/discord`
   under OAuth2 in the Discord Developer Portal.
5. Deploy.
6. Register the slash commands once and after every change to them, in the
   folder with the compose file and the `.env`:

   ```sh
   docker compose -f docker-compose-prod.yml run --rm deploy-commands
   ```

> [!IMPORTANT]
> Dashboard and API must run under the same domain, because the dashboard
> checks the session cookie of the API itself. On separate subdomains the
> cookie would not arrive. Changing `BETTER_AUTH_URL` needs a new build.

Back up the `database` and `bot-data` volumes with the volume backups of
Dokploy.

### Bonsai Watch

Only the queue is stored in the database. Which video is playing and where,
the API keeps in memory, so after a restart it continues with the next video
in the queue. Video titles come from the YouTube oEmbed endpoint, no API key
is needed.

Changes to playback and queue are sent over the WebSocket `/api/watch/live`,
which also syncs every browser's clock with the server. The reverse proxy
has to pass WebSocket connections to the API, which Traefik in Dokploy does
by default. Always update API and dashboard together.

The videos play in the embedded YouTube player in each viewer's browser. If
the player shows "Sign in to confirm you're not a bot", the browser usually
blocks third-party cookies (the default in Safari, Firefox, Brave, Edge and
private windows). The viewer has to allow third-party cookies for the site,
sign in on youtube.com and reload. The page shows instructions per browser
below the player.

### YouTube blocks the server

If YouTube blocks the server's IP for Bonsai FM, set
`YOUTUBE_OAUTH_ENABLED=true` and `YOUTUBE_OAUTH_REFRESH_TOKEN` in the `.env`.
Bonsai Watch is not affected.

## Scripts

| Command                    | Description                                 |
| -------------------------- | ------------------------------------------- |
| `bun run dev`              | Start the API and the dashboard             |
| `bun run build`            | Build all apps                              |
| `bun run lint`             | Lint with oxlint                            |
| `bun run lint:fix`         | Fix auto-fixable lint errors                |
| `bun run format`           | Format with oxfmt                           |
| `bun run format:check`     | Check the formatting                        |
| `bun run check-types`      | Check the TypeScript types                  |
| `bun run db:generate`      | Generate the Prisma client                  |
| `bun run db:migrate`       | Apply migrations or create a new one        |
| `bun run db:migrate:reset` | Reset the database and apply all migrations |
| `bun run db:studio`        | Open Prisma Studio                          |
| `bun run docker:dev`       | Start the bot, Lavalink and yt-cipher       |
| `bun run docker:prod`      | Build and start the production stack        |

## Changelog

All changes are listed in [CHANGELOG.md](CHANGELOG.md).

> [!CAUTION]
> Never commit `.env` or `*.db` files, they are excluded by `.gitignore`. The
> local database contains sessions and Discord tokens.
