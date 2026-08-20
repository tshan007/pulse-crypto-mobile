# PulseCrypto — Mobile App

A React Native (Expo) app that visualises live market data from the PulseCrypto backend.

> This is the mobile half of PulseCrypto. The backend lives in a companion repo,
> **pulsecrypto-backend** — start it first (defaults to `localhost:8080`) before running this app.

## Setup

```bash
cd mobile
npm install
```

## Run

Start the backend first — it now lives in its own repo, [pulsecrypto-backend](../pulsecrypto-backend) (see its README for setup) — then:

```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go
on a physical device.

### Pointing at the backend

By default the app connects to `localhost:8080`, with an automatic override to `10.0.2.2`
for Android emulators (which can't reach the host machine via `localhost`). To point at a
different host — e.g. a physical device on the same network, or a deployed backend —
set:

```bash
EXPO_PUBLIC_BACKEND_HOST=192.168.1.42 EXPO_PUBLIC_BACKEND_PORT=8080 npx expo start
```

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
