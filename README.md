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
  project. The `ios`/`ios:*` npm scripts detect a non-macOS host and fail fast with a clear
  message instead of a deep Xcode/CocoaPods error.
- **No native build at all:** scan the QR code shown by `npm start` with the **Expo Go** app
  on a physical device — this skips the Android/iOS SDK requirements above entirely, at the
  cost of not testing the actual native build.

## Setup

```bash
cd mobile
npm install
```

## Run

Start the backend first — it now lives in its own repo, [pulsecrypto-backend](../pulsecrypto-backend) (see its README for setup) — then:

```bash
npm start          # local dev (same as npm run start:dev)
npm run start:uat  # against the UAT backend
npm run start:prd  # against the production backend
```

`npm run android`/`android:uat`/`android:prd` and `ios`/`ios:uat`/`ios:prd` work the same
way for `expo run:android`/`expo run:ios` — plain `android`/`ios` default to `:dev`.

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go
on a physical device.

### Environments

Each target has its own env file — `.env.development`, `.env.uat`, `.env.production` —
loaded via `dotenv-cli`'s cascade mode (`dotenv -c <environment>`, see `package.json`),
which layers `.env.<environment>.local` → `.env.local` → `.env.<environment>` → `.env`
(first match for a given variable wins). Only values that genuinely differ by environment
live there: backend host/port, whether the backend is served over TLS
(`EXPO_PUBLIC_BACKEND_SECURE`), and the debug-logging default (`EXPO_PUBLIC_DEBUG_WS`).
Internal tuning constants (reconnect backoff, flash animation duration) stay as plain
constants in `src/config.ts` — they're the same in every environment, so an env var would
just be indirection without a reason to vary.

`.env.development` deliberately leaves `EXPO_PUBLIC_BACKEND_HOST`/`PORT` unset: `src/config.ts`
already has a smart per-platform default (`10.0.2.2` for Android emulator, `localhost`
everywhere else) that a static dev value would only override incorrectly for one platform
or the other. `.env.uat`/`.env.production` currently hold placeholder hostnames —
replace them with the real deployed backend URLs before using those scripts for anything
but testing this setup locally.

To override any value ad hoc (e.g. a physical device on your LAN) without touching the env
files, set it directly — an already-exported shell variable always wins over the loaded
`.env` file:

```bash
EXPO_PUBLIC_BACKEND_HOST=192.168.1.42 EXPO_PUBLIC_BACKEND_PORT=8080 npm run start:dev
```

Personal per-environment overrides can also go in a gitignored `.env.<environment>.local`
file (e.g. `.env.development.local`) — the cascade picks it up automatically, no script
changes needed, and it never gets committed (see `.gitignore`).

## Architecture

```
useMarketSocket()  — single WebSocket connection for the app's lifetime,
                      reconnect/backoff, feeds every message into the store
        │
        ▼
useMarketStore()   — Zustand, keyed by pair. Screens/rows subscribe via
                      narrow selectors (s => s.pairs[pair]), not the whole map
        │
        ▼
WatchlistScreen / DetailScreen  — read via selectors, never touch the socket
```

### Key decisions

**Zustand over Redux/Context.** The app's entire performance story rests on granular
subscriptions: a BTC price tick must not re-render the ETH row. Zustand's selector-based
subscription model gives this for free — a component only re-renders when its selected
slice's *reference* changes. Context would re-render every consumer on any store change;
Redux would work but adds ceremony (actions/reducers/selectors boilerplate) this scope
doesn't need.

**The store does the coalescing, not just the UI.** `applySnapshot` compares each incoming
pair's fields against the existing entry and *reuses the same object reference* if nothing
meaningful changed. This means a broadcast tick where only BTC's price moved produces a new
object reference only for `pairs.BTCUSDT` — every other row's selector returns the exact
same reference it had before, so React skips re-rendering it. This is the mobile-side
counterpart to the backend's "don't queue, resample state" design.

**Per-row Animated.Value, not one global animation driver.** `FlashingPrice` owns its own
`Animated.Value` per instance. Flashing BTC's price green touches only BTC's row's Animated
graph — no shared animation state, no risk of one pair's flash interfering with another's.

**`Animated` API over Reanimated.** For a background-color fade at a ~100ms update
cadence, JS-driven `Animated.timing` is well within budget and avoids pulling in a native
module with its own build/version-compatibility surface, which matters for a take-home
someone else needs to `npm install` and run without native-toolchain debugging. If this
app's animation needs grew significantly (gesture-driven interactions, 60fps physics),
Reanimated would be the right call — noted here as a trade-off, not an oversight.

**Order book volume changes use `LayoutAnimation`, not per-cell Animated.Value.** Row
widths already recompute on every store update (the underlying data is genuinely new each
tick); `LayoutAnimation.configureNext` before the update batches a smooth transition for
the whole re-layout in one call, rather than manually driving N Animated.Values per
render — this is the JS-thread-cheapest way to satisfy the "should animate smoothly"
requirement.

**Favourites persistence: fire-and-forget AsyncStorage writes.** `toggleFavourite`
updates in-memory state synchronously (instant UI feedback) and writes to `AsyncStorage`
without blocking the UI thread on the write completing. Favourites are restored once on
app start via `useFavouritesHydration`.

**Offline/reconnect handling.** The WS hook reconnects with exponential backoff
(mirroring the backend's own backoff toward Binance), and additionally forces a reconnect
attempt when the app returns to the foreground — backgrounded sockets are frequently
dropped silently by the OS, so relying on `onclose` alone can leave the app looking
"connected" when it isn't. The watchlist always shows the last-known data plus a status
badge (`Live` / `Connecting…` / `Reconnecting…` / `Offline`), never a blank screen.

**The socket is no longer receive-only.** `useMarketSocket` also sends a `{"type":
"configure", intervalMs?, format?}` control message over the same live connection — once
on open/reconnect, and again (debounced) whenever a Telemetry & Settings toggle or the
Update Frequency slider changes — to pick its own broadcast cadence and JSON/msgpack
encoding without ever tearing down the socket. Incoming frames are decoded based on
`event.data`'s runtime type (`string` → JSON, `ArrayBuffer` → msgpack via `@msgpack/msgpack`,
a pure-JS library that needs no native linking under managed Expo).

**One `requestAnimationFrame` sampler, not two.** `useFrameRate`'s FPS sampling is called
once, inside `useMarketSocket` (needed there to drive the adaptive-polling calculation),
and mirrored into `telemetryStore`. `TelemetrySettingsScreen` reads `fps` from the store
instead of calling `useFrameRate()` itself — the same "compute once, store, read via
selector" pattern the store already uses for `messagesPerSecond`.

**Pull-to-refresh only touches `/pairs/meta`.** `usePairsMeta`'s `refresh()` is a plain
REST call, entirely independent of the WebSocket connection — pulling to refresh cannot
interrupt or restart the live stream, satisfying that requirement directly by construction
rather than needing special-case logic to avoid interference.

## Assumptions

- The five pairs are a known, fixed set (`src/constants.ts`), mirroring the backend's
  default configuration — this keeps the watchlist populated immediately on cold start
  rather than waiting on the first REST/WS response.
- "Search" is a client-side filter over the fixed pair list (substring match on symbol or
  display name) rather than hitting a search endpoint, since the pair set is small and
  fixed.

## Trade-offs not taken further (given scope)

- No FlashList — with a fixed set of 5 rows, a plain `FlatList` performs identically;
  FlashList would matter for a much larger, dynamic pair list.
- No offline data persistence for market data itself (only favourites persist). On
  relaunch after being fully offline, the watchlist shows placeholders until the socket
  reconnects, rather than stale cached prices — a deliberate choice to avoid showing
  numbers that could be significantly stale without a clear "last seen" affordance.

## Verification performed in this environment

This sandbox has no simulator/emulator, so the app couldn't be visually run end-to-end
here. What *was* verified:
- `tsc --noEmit` passes cleanly across the whole `src/` tree.
- `expo export --platform ios` and `--platform android` both bundle successfully via
  Metro (830/828 modules resolved, zero resolution errors) — this exercises the full
  import graph and catches version-incompatibility issues before they'd surface on device
  (one was actually caught and fixed this way: `react-native-gesture-handler` at the
  pinned version was incompatible with the scaffolded RN version's internals and was
  removed, since the app doesn't use gesture-handler-dependent features).
- The backend's WebSocket/REST behavior was separately verified live (see
  the separate pulsecrypto-backend repo's README), confirming the payload shapes this app's types/store assume.

A device/simulator screen recording is still needed as a deliverable per the assignment
and should be captured by running `npx expo start` locally against the backend.

## AI-assisted development

Built collaboratively with Claude (Anthropic) — architecture discussion, code generation,
and in-sandbox verification (dependency install, typecheck, and Metro bundle validation
for both iOS and Android, which caught and fixed a real dependency version mismatch
before it would have surfaced at runtime).
