# PulseCrypto — Mobile App

A React Native (Expo) app that visualises live market data from the PulseCrypto backend.

> This is the mobile half of PulseCrypto. The backend lives in a companion repo,
> **pulsecrypto-backend** — start it first (defaults to `localhost:8080`) before running this app.

## Prerequisites

- **Node.js 20+** and npm.
- **The backend running** — see the note above; without it the app has nothing to connect to.
- **To run on Android:**
  - [Android Studio](https://developer.android.com/studio) installed, with at least one AVD created via its Device Manager (Tools → Device Manager → Create Device).
  - `ANDROID_HOME` (and `ANDROID_SDK_ROOT`) set to your SDK location — typically
    `%LOCALAPPDATA%\Android\Sdk` on Windows, `~/Library/Android/sdk` on macOS — with its
    `platform-tools` and `emulator` folders on your `PATH`. This is easy to miss even with
    Android Studio and AVDs installed: without it, `expo run:android` (and pressing `a` from
    `npm start`) fails with `No Android connected device found, and no emulators could be
    started automatically`, even though the emulator itself is fine.
  - A JDK (17+) with `JAVA_HOME` set — Android Studio bundles one under its own install dir,
    or install a JDK separately.
  - Env var changes only apply to processes started *after* you set them — fully restart your
    terminal (and VSCode, if you set them while it was already open) before retrying.
- **To run on iOS:** macOS only — Xcode and CocoaPods are required to build the native
  project.
- **No native build at all:** scan the QR code shown by `npm start` with the **Expo Go** app
  on a physical device — this skips the Android/iOS SDK requirements above entirely, at the
  cost of not testing the actual native build.

## Setup

```bash
npm install
```

## Run

Start the backend first — it now lives in its own repo, [pulsecrypto-backend](../pulsecrypto-backend) (see its README for setup) — then:

```bash
npm run android       # local dev (same as npm run android:dev)
npm run android:uat   # against the UAT backend
npm run android:prd   # against the production backend

npm run ios           # local dev (same as npm run ios:dev)
npm run ios:uat       # against the UAT backend
npm run ios:prd       # against the production backend
```

Each runs `expo run:android`/`expo run:ios` directly, building and installing the native
app on a connected emulator/device — plain `android`/`ios` default to `:dev`. `npm start`
(and its `:uat`/`:prd` variants) is also available if you'd rather launch the Metro dev
server on its own and pick a target interactively (press `i` for iOS simulator, `a` for
Android emulator, or scan the QR code with Expo Go). Each of `start`/`android`/`ios`/`web`
also has a `:debug` variant (e.g. `npm run android:debug`), loading `.env.debug` —
identical to `.env.development` today, kept as a separate target for debug-only overrides
without touching the default dev env.


Personal per-environment overrides can also go in a gitignored `.env.<environment>.local`
file (e.g. `.env.development.local`) — the cascade picks it up automatically, no script
changes needed, and it never gets committed (see `.gitignore`).

## Architecture

```
usePairScope(scope) — screens declare which pairs they need while focused
                      (WatchlistScreen: "all", DetailScreen: [pair],
                      Telemetry/Settings/Terminal: none) via useSubscriptionStore
        │
        ▼
useMarketSocket()  — single WebSocket connection for the app's lifetime,
                      reconnect/backoff, reads the current pair scope into
                      every outgoing `configure` message, feeds every
                      incoming message into the store
        │
        ▼
useMarketStore()   — Zustand, keyed by pair. Screens/rows subscribe via
                      narrow selectors (s => s.pairs[pair]), not the whole map
        │
        ▼
WatchlistScreen / DetailScreen / TelemetryScreen / SettingsScreen
                   — read via selectors, never touch the socket directly
```

### Key decisions

- **Zustand, not Redux/Context.** Selector-based re-renders — a BTC tick doesn't re-render ETH's row.
- **Store coalesces updates.** `applySnapshot` keeps the same object reference for unchanged pairs, so only the pair that moved re-renders.
- **Per-row `Animated.Value`.** `FlashingPrice`, `PressureBar`, and order-book rows each own their own animation — no shared driver.
- **`Animated` API, not Reanimated.** Simple fades don't need a native animation module; would revisit for gesture/60fps work.
- **Favorites: fire-and-forget AsyncStorage.** Instant UI update; write happens in the background; restored on launch via `useFavoritesHydration`.
- **Reconnect on backgrounding.** Exponential backoff plus a forced reconnect on foreground (OS-dropped sockets don't always fire `onclose`). Status badge always shown, never a blank screen.
- **Socket sends `configure`, not just receives.** Client controls broadcast interval, JSON/msgpack encoding, and pair subset over the same connection.
- **Pair-scoping via `usePairScope`.** Each screen declares which pairs it needs while focused; the backend only computes/broadcasts that subset.
- **One FPS sampler.** Measured once in `useMarketSocket`, mirrored into `telemetryStore`; screens read it, don't resample.
- **Pull-to-refresh is a plain REST call.** Independent of the WebSocket — can't interrupt the live stream.
- **`@shopify/flash-list`, not `FlatList`.** Pair list is backend-sized, not fixed — needs virtualization. `drawDistance={500}` cuts blanking on fast scrolls.
- **Telemetry: real metrics where a real API exists.** WS rate/FPS/memory (`react-native-device-info`, device-wide not JS-heap) are real; API latency is still a placeholder.
- **Icon/splash need config plugins + `expo prebuild`.** Bare `app.json` fields for cleartext traffic, theme, and splash are no-ops without `expo-build-properties`/`expo-system-ui`/`expo-splash-screen`, and a prebuild to reach the native project.

## Assumptions

- Watchlist pair list is dynamic, from `GET /pairs` — `SUPPORTED_PAIRS` is just a cold-start fallback.
- Search is a client-side substring filter; no search endpoint.
- No auth/login — not in the assessment document, and market data here is public/read-only.
- Anything not called for in the assessment document was left out rather than guessed at; scope stayed on the core watchlist/detail/live-data feature set.

## Trade-offs not taken further (given scope)

- No offline persistence for market data (only favorites persist) — shows placeholders on relaunch rather than stale cached prices.


## AI-assisted development

Built the MVP collaboratively with Claude (Anthropic) — architecture discussion, code generation,
and in-sandbox verification (dependency install, typecheck, and Metro bundle validation).
And I steered follow-up iteration — reviewing behavior, flagging bugs and rough edges, and
directing feature/refactor work — through to the current state.
