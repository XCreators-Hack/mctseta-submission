# EcoWildGuard — Frontend Prototype

Next.js + TypeScript dashboard for the ESP32 → Express API → Next.js telemetry pipeline.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

App runs at http://localhost:3000. It expects your Express API at the URL in
`.env.local` (default `http://localhost:4000`) — start that separately.

## How telemetry flows

1. `src/lib/config.ts` defines the device ID, poll interval (2s), and stale
   threshold (10s).
2. `src/lib/useTelemetry.ts` is a hook that calls `getTelemetry()` on mount
   and then on a `setInterval`, guarding against overlapping requests with
   a ref flag, and cleaning up (`clearInterval` + `AbortController.abort()`)
   on unmount.
3. `src/lib/api.ts` is the only file that calls `fetch()`. It never throws —
   every outcome (success, 404, network failure) is normalized into a
   `TelemetryResult` union so components just switch on `connectionState`.
4. `src/app/page.tsx` (Dashboard) consumes the hook and renders one of:
   connecting / offline / no-telemetry / stale-offline / live cards.
5. Adding a new sensor later (e.g. engine temperature) means: add the field
   to `Telemetry` in `src/lib/types.ts`, render it with the existing
   `TelemetryCard` component, and drop it into the dashboard grid. No
   changes to the polling/fetch layer are required.

## Project structure

```
src/
  app/
    layout.tsx        Root shell (Sidebar + Header)
    page.tsx           Dashboard
    device/page.tsx     Device info
    system/page.tsx     System status
    globals.css
  components/
    Sidebar.tsx
    Header.tsx
    DeviceStatus.tsx
    DistanceCard.tsx
    TelemetryCard.tsx   Generic reusable sensor card
    ConnectionStatus.tsx
    LastUpdated.tsx
    StatePanel.tsx      Loading/offline/empty states
  lib/
    api.ts              All fetch() calls live here
    types.ts            Telemetry interfaces
    useTelemetry.ts      Polling hook
    config.ts           Device ID, poll interval, stale threshold
    format.ts           Status label + timestamp formatting
```

## Notes

- No database, no Firebase/Supabase — the Express API is the only backend,
  and it's expected to hold telemetry in memory only.
- The device API key used between ESP32 and Express is never referenced
  anywhere in this frontend.
- `NEXT_PUBLIC_API_URL` is the only configuration point for the API address.
