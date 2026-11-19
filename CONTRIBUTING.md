# Contributing to Bonsai Bot

This file describes how changes make their way into the project: branches,
commits, pull requests, CI and releases. How to set up the project locally is
described in the [README](README.md#development).

## Overview

```text
feat/…     ─┐
fix/…      ─┼─ PR (squash) ─▶ develop ─ release PR (merge commit) ─▶ main ─▶ tag vX.Y.Z
refactor/… ─┘
```

- **`develop`** is the working branch. All changes land here via pull
  request.
- **`main`** only contains released versions. The only thing that lands here
  is `develop`, via a release PR.
- Nothing is pushed to `main` or `develop` directly, every change goes
  through a pull request.

## Branches

Always branch off an up-to-date `develop`:

```sh
git switch develop
git pull
git switch -c feat/watch-history
```

The branch name follows the commit or PR title:

```text
<type>/<short-description>
```

- `<type>` is the same type as in the PR title (see
  [Commits and PR titles](#commits-and-pr-titles)), i.e. `feat`, `fix`,
  `refactor`, `style`, `docs`, `build`, `ci`, `chore` or `revert`.
- `<short-description>` sums up the PR in two to four words: English,
  lowercase, hyphenated, without articles.

| Branch                     | PR title                                             |
| -------------------------- | ---------------------------------------------------- |
| `feat/bonsai-watch`        | `feat: add bonsai watch`                             |
| `fix/watch-skip-crash`     | `fix: stop the page crash after skipping a video`    |
| `refactor/minor-fixes`     | `refactor: apply some minor fixes`                   |
| `docs/changelog`           | `docs: add the changelog and the contributing guide` |
| `build/dokploy-compose`    | `build: adapt the production compose for dokploy`    |
| `ci/dependabot`            | `ci: add the dependabot config`                      |
| `chore/remove-prettier`    | `chore: remove prettier`                             |
| `revert/playstation-store` | `revert: add playstation store links`                |

Dependabot branches are named `dependabot/…` and are created automatically.
Delete the branch after the merge.

## Commits and PR titles

Commit messages and PR titles follow
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>: <description>
```

- English, all lowercase, imperative mood, no trailing period
- The description is a short sentence, usually with an article:
  `feat: add the wishlist`, not `feat: wishlist`

| Type       | Used for                           | Example                                                     |
| ---------- | ---------------------------------- | ----------------------------------------------------------- |
| `feat`     | New feature or visible enhancement | `feat: add likes and a delete confirmation to the wishlist` |
| `fix`      | Bug fix                            | `fix: keep bonsai watch in sync after pause and play`       |
| `refactor` | Restructuring without new features | `refactor: apply some minor fixes`                          |
| `style`    | Formatting only, no code changes   | `style: format the api and web apps`                        |
| `docs`     | Documentation only                 | `docs: rewrite the readme in english`                       |
| `build`    | Build, Docker, dependencies        | `build: adapt the production compose for dokploy`           |
| `ci`       | GitHub Actions, Dependabot         | `ci: add the dependabot config`                             |
| `chore`    | Misc, e.g. tooling or `bun.lock`   | `chore: remove prettier`                                    |
| `revert`   | Reverts an earlier commit          | `revert: add playstation store links`                       |

For `revert`, the description is the one of the reverted commit. When using
the "Revert" button on GitHub, the PR is initially titled
`Revert "feat: …"`. Change the title to the format above before merging.

Dependabot follows this format on its own (`chore(deps): …`, `ci: …`,
`build: …`).

> [!IMPORTANT]
> Because PRs to `develop` are squash-merged, the **PR title** becomes the
> commit message on `develop` and later in the release. So it must follow the
> format above. If the PR has only one commit, GitHub uses that commit's
> message instead. Otherwise, the individual commits on the branch itself
> can be named freely.

## Pull requests

1. Push the branch and open a PR to **`develop`**.
2. Give it a title in the format above.
3. For changes that affect users or operators, add an entry under
   `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) (see
   [Changelog](#changelog)).
4. Wait for CI to pass. Don't merge without a green `ci` check.
5. Merge with **"Squash and merge"**.

A review is currently not required. `CODEOWNERS` automatically adds the
owner as a reviewer.

### Before pushing

CI checks the same things as these commands, so it is best to run them
locally first:

```sh
bun run format:check   # formatting (oxfmt)
bun run lint           # linting (oxlint)
bun run check-types    # TypeScript types
bun run build          # build all apps
```

`bun format` fixes formatting errors.

When changing the database schema, commit the new migration from
`packages/database/prisma/migrations/` as well (see
[Changing the schema](README.md#changing-the-schema)). New slash commands
have to be registered again (see [Development](README.md#development)).

## CI

The [`ci.yml`](.github/workflows/ci.yml) workflow runs on every PR to
`develop` and `main` and checks, in order:

1. Formatting (`bun run format:check`)
2. Linting (`bun run lint`)
3. Types (`bun run check-types`)
4. Build (`bun run build`)

The job is called `ci`. Keep the name, it is meant to be the required
status check for `main` and `develop`. There are currently no tests.

## Changelog

[CHANGELOG.md](CHANGELOG.md) follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/):

- New entries go under `## [Unreleased]` in the matching section: `Added`,
  `Changed`, `Deprecated`, `Removed`, `Fixed` or `Security`.
- Describe what changes for users or operators, not how it is implemented.
- Each entry ends with the PR number, e.g. `([#28])`, with the matching link
  at the bottom of the file.
- Purely internal changes without impact (formatting, renames, `bun.lock`)
  don't need an entry.

## Releases

Versions follow [Semantic Versioning](https://semver.org/):
`MAJOR.MINOR.PATCH`, e.g. `v1.5.0` for new features or `v1.5.1` for bug
fixes only.

1. **Prepare the changelog:** On a branch (e.g. `docs/release-v1.5.0`),
   rename `## [Unreleased]` in `CHANGELOG.md` to `## [1.5.0] - YYYY-MM-DD`,
   add a new, empty `## [Unreleased]` above it and update the links at the
   bottom. Merge it into `develop` via PR.
2. **Open the release PR:** Open a PR from `develop` to `main` titled
   `v1.5.0`. **Leave the description empty**: the
   [`release-pr.yml`](.github/workflows/release-pr.yml) workflow fills it
   from the [`release_pr_template.md`](.github/release_pr_template.md)
   template with all commits since the last release. Then just add the
   summary at the top.
3. **Merge** with **"Create a merge commit"**.
4. **Tag and GitHub release:** On GitHub, go to **Releases → Draft a new
   release** and create the tag `v1.5.0` on `main`. Use the version's section
   from `CHANGELOG.md` as the release notes.

## Dependencies

Every Monday, Dependabot opens PRs to `develop` (configured in
[`dependabot.yml`](.github/dependabot.yml)):

- Bun packages: minor and patch updates grouped in one PR, major updates
  individually
- GitHub Actions in one PR
- Docker images from the Dockerfiles (`oven/bun`) and the Compose files
  (Lavalink, yt-cipher)

These PRs are handled like any other: wait for CI, briefly test major
updates locally, then squash-merge.
