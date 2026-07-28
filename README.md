# Viboplr — Duplicate Finder

Find duplicate tracks in your library — the same song downloaded twice or sitting in two folders — and reclaim space by deleting the extra copies. Grouping is diacritic-insensitive (Björk = Bjork) and can optionally require duration and file-size to match too.

Externalized from [Viboplr](https://viboplr.com)'s built-in plugins — same code, now shipped as a standalone gallery plugin (id `duplicate-finder`).

## Layout
- `manifest.json` — plugin metadata and contributions.
- `index.js` — the plugin code (ES5, executed via `new Function("api", code)`).
- `scripts/` — `bump.sh` (version + changelog) and `package.sh` (build `duplicate-finder.zip` + `update.json`).

## Releasing
See [RELEASING.md](./RELEASING.md): `scripts/bump.sh <patch|minor|major>`, fill the changelog, commit, then push a `vX.Y.Z` tag — CI builds `duplicate-finder.zip` + `update.json` and publishes the release.
