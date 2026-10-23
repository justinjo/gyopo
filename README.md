# Gyopo

A quiet, offline-first Korean drill PWA for numbers, counters, colors, and time. Gyopo is a static React + TypeScript app: there is no account, backend, analytics, audio, or runtime network dependency.

## Development

```sh
npm install
npm run dev
npm test
npm run build
```

The production service worker uses an explicit waiting lifecycle. A new version never reloads an open drill automatically; the learner chooses **Update** after the app checkpoints the current session.

Progress is kept in versioned IndexedDB, separate from application caches. It survives normal updates, offline launches, and connection changes. Because it is device-only, uninstalling the Home Screen app, manually clearing site data, or exceptional operating-system storage eviction can still remove it.

## Release checks

In addition to the automated suite, test the production build on the latest public iOS/Safari and as an installed Home Screen app. Cold-launch every drill in airplane mode, interrupt connectivity mid-question, restore a session after closing, and exercise both the **Later** and **Update** paths with a waiting service worker.
