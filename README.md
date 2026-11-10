# Gyopo

A quiet, offline-first Korean drill PWA for numbers, counters, colors, and time. Gyopo is a static React + TypeScript app: there is no account, backend, analytics, audio, or runtime network dependency.

## Development

```sh
npm install
npm run dev
npm test
npm run build
```

## GitHub Pages

Pushes to `main` are tested, built with the `/gyopo/` base path, and deployed by GitHub Actions. The installed PWA is available at <https://justinjo.github.io/gyopo/>.

The production service worker uses an explicit waiting lifecycle. A new version never reloads an open drill automatically; the learner chooses **Update** after the app checkpoints the current session.

Progress is kept in versioned IndexedDB, separate from application caches. It survives normal updates, offline launches, and connection changes. Because it is device-only, uninstalling the Home Screen app, manually clearing site data, or exceptional operating-system storage eviction can still remove it.

## Release checks

In addition to the automated suite, test the production build on the latest public iOS/Safari and as an installed Home Screen app. Cold-launch every drill in airplane mode, interrupt connectivity mid-question, restore a session after closing, and exercise both the **Later** and **Update** paths with a waiting service worker.

## Benzi

The Mandarin practice app lives in `benzi/` and is published at <https://justinjo.github.io/gyopo/benzi/>. It has no link from Gyopo’s main page. Both apps are built and deployed together, with separate progress databases and service workers.

Run `npm run dev:benzi` and open `/benzi/` to develop Benzi. `npm test` runs both apps’ tests; `npm run build:pages` builds the complete site. Pronunciation recordings and their license are bundled in `benzi/public/audio/`; see [audio credits](benzi/AUDIO_CREDITS.md).
