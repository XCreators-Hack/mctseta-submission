# WildGuard — Smart Wildlife & Heavy-Haulage Transit Corridor

MICT SETA National Skills Hackathon (Mpumalanga) MVP: real-time coordination
between heavy-haulage transport and wildlife-sensitive road corridors.

## What's in this repo

- **Next.js 16 / React 19 / TypeScript / Tailwind** frontend with four
  role-based dashboards (Admin, Driver, Logistics, Wildlife Management)
- **CesiumJS** 3D corridor map showing corridors, zones, sensors, hazards and
  trucks in real time
- **Firebase** (Auth + Firestore) backend accessed via Next.js API routes
- **Demo Mode** that simulates ESP32 sensor events end-to-end through the
  exact same pipeline a real device uses
- **ESP32 firmware** (`esp32/wildguard_sensor/wildguard_sensor.ino`) for the
  physical hardware MVP (ultrasonic sensor, servo "boom gate", LEDs, LCD)

## 1. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.local.example .env.local
```

You need:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console -> Project settings -> General -> Your apps (Web app config) |
| `FIREBASE_ADMIN_*` | Firebase Console -> Project settings -> Service accounts -> Generate new private key |
| `NEXT_PUBLIC_CESIUM_ION_TOKEN` | https://ion.cesium.com/tokens (free account) |
| `DEVICE_API_KEY` | Make up any long random string — this is the shared secret the ESP32 uses to authenticate to `/api/events`. Put the same value in the firmware sketch. |
| `DEMO_MODE_SECRET` | Optional — leave blank unless you want to gate the Demo Mode button with a shared secret |

In Firebase Console, also enable:
- **Authentication -> Sign-in method -> Email/Password**
- **Firestore Database** (production mode is fine — rules are provided)

Deploy the provided security rules and indexes (requires the Firebase CLI):

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # select your project
firebase deploy --only firestore:rules,firestore:indexes
```

## 2. Install and seed

```bash
npm install        # also copies Cesium assets into public/cesium (postinstall)
npm run seed        # populates demo companies, corridors, zones, devices, trucks, and one user per role
```

The seed script creates these accounts (password `wildguard123` for all):

| Role | Email |
|---|---|
| Admin | admin@wildguard.demo |
| Driver | driver@wildguard.demo |
| Logistics | logistics@wildguard.demo |
| Wildlife Management | wildlife@wildguard.demo |

## 3. Run

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in with any seeded account, and use the
**Demo Mode** panel on the Admin dashboard (or the "Report a hazard
manually" button on the Driver dashboard) to trigger the full event flow
without needing the physical ESP32.

## 4. Flash the ESP32 (optional — physical hardware demo)

1. Wire up: HC-SR04 (trig/echo), SG90 servo, red + green LEDs, 16x2 LCD
   (I2C backpack). Pin assignments are documented at the top of
   `esp32/wildguard_sensor/wildguard_sensor.ino`.
2. Install the Arduino libraries: `ArduinoJson`, `ESP32Servo` (or `Servo`),
   `LiquidCrystal_I2C`.
3. Edit the configuration block at the top of the sketch:
   - `WIFI_SSID` / `WIFI_PASSWORD`
   - `WILDGUARD_API_URL` — e.g. `http://<your-laptop-ip>:3000/api/events`
   - `DEVICE_API_KEY` — must match `.env.local`
   - `DEVICE_ID` — must match a `deviceCode` in Firestore (e.g. `WC-003`)
4. Flash and power on. The device will POST readings every ~1.5s; the
   backend responds with the command that drives the servo/LED/LCD.

## Project structure

See `src/app` for pages/routes, `src/components` for UI, `src/lib` for
Firebase/auth/state-machine/business logic, `src/hooks` for realtime data
hooks, and `src/types` for shared TypeScript types. Firestore rules live in
`firestore.rules` / `firestore.indexes.json` at the repo root.

## Notes on scope

- The ultrasonic sensor is a **proximity/hazard proxy only** — it does not
  identify wildlife. Production sensor layers (PIR, radar, thermal, CV,
  LiDAR) are noted as future work, not implemented here.
- The servo/boom gate is a **prototype representation** of an automated
  intervention, not a claim about controlling real road infrastructure.
- Demo/mock data (used when Firebase isn't yet configured) lives in
  `src/lib/demo/mockData.ts` and is always visibly labeled as such in the UI
  — it is never presented as real sensor or fleet data.
