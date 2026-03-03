# Tesla Command Center

A premium, dark-themed dashboard for monitoring and controlling your Tesla vehicle from any device. Built with Next.js and the Tessie API, it supports self-hosting with a **Bring Your Own Key** (BYOK) model so users can provide their own credentials via the browser with no server-side storage.

## Features

- **Rich dashboard** with battery level, range, charging status, vehicle state, weather, energy consumption, and last drive summary all at a glance
- **Quick controls** to lock/unlock, open trunks, toggle climate, start/stop charging, flash lights, honk, and more without leaving the dashboard
- **Climate management** page with temperature, seat heating/cooling, steering wheel heater, defrost, bioweapon defense mode, and cabin overheat protection
- **Charging management** page with charge limit slider, amp control, charge port, and start/stop charging
- **Controls page** for access, security modes (Sentry, Valet, Guest), speed limit, windows, software updates, Homelink, and boombox
- **Drive history** with filterable drive list, drive tagging, and Google Maps route replay
- **Charging history** with filterable charge session list
- **Live map** showing real-time vehicle location with Google Maps integration
- **Settings page** for refresh interval, distance/temperature/pressure units, and credential management
- **BYOK hosting** — deploy to Vercel and let users enter their own API keys, or set env vars for a personal instance
- **PWA-ready** with web app manifest and mobile-optimized viewport
- **Auto-polling** with configurable refresh interval to keep data up to date

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS 3, Radix UI Primitives |
| State | Zustand (persisted stores for credentials, settings) |
| Data Fetching | TanStack React Query |
| Charts | Recharts |
| Maps | Google Maps (`@vis.gl/react-google-maps`) |
| Vehicle API | Tessie |
| Notifications | Sonner (toast) |
| Hosting | Vercel (or any Node.js host) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Tessie API token](https://developer.tessie.com/) — [sign up for Tessie here](https://share.tessie.com/v4Gklbe1U0b)
- Your Tesla's VIN (17-character Vehicle Identification Number)

### Local Development

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/akrowczyk/tesla-command-center.git
cd tesla-command-center
npm install
```

2. Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:

```
TESSIE_API_KEY=your-tessie-api-key
TESSIE_VIN=your-17-character-vin
```

Optional:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key   # Enables map features
```

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. When env vars are set, everything works out of the box — no setup screen needed.

## BYOK Architecture

The app supports a **Bring Your Own Key** model for hosted deployments. Users enter their API credentials in the setup screen; keys are stored in `localStorage` (persisted via Zustand) and sent as encrypted HTTPS headers on every request. The server never persists them.

### How It Works

```
Browser                          Server (API Routes)              External APIs
┌─────────────┐                  ┌──────────────────┐             ┌───────────┐
│ Setup UI    │──save keys──▶    │                  │             │           │
│ Zustand     │──read keys──▶    │  Resolve creds   │             │           │
│ (persist)   │  X-Tessie-Key    │  1. Check header │────────────▶│ Tessie    │
│             │  X-Tessie-VIN    │  2. Fallback env │             │           │
│             │                  │  3. Return 401   │             │           │
└─────────────┘                  └──────────────────┘             └───────────┘
```

Every API route resolves credentials with this priority:

1. **Request header** — `X-Tessie-Key`, `X-Tessie-VIN` (user-provided)
2. **Environment variable** — `TESSIE_API_KEY`, `TESSIE_VIN` (server default)
3. **401 error** if neither is available

| Scenario | Env vars | User keys | What happens |
|----------|----------|-----------|--------------|
| **Local dev** | Set in `.env.local` | Not needed | Works immediately, no setup screen |
| **Personal hosted instance** | Set on Vercel | Not needed | Works like local dev |
| **Public BYOK instance** | Not set | Required | Users see setup screen on first visit |
| **Mixed** | Set on Vercel | Optional | Server keys are defaults; users can override |

### Deploying to Vercel

1. Push the repo to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Optionally set environment variables for a personal instance
4. Deploy — no special configuration needed

For a pure BYOK deployment, skip the env vars. Users will be prompted to enter their credentials on first visit.

### Security

- Credentials are stored only in the user's browser (Zustand `persist` → `localStorage`) and sent over HTTPS
- Server-side routes are stateless — credentials exist only for the duration of each request
- The Google Maps key is inherently public (loaded client-side via `NEXT_PUBLIC_` prefix)
- A `/api/config` endpoint reports whether server-side keys exist (without revealing values) so the client can decide whether to show the setup screen

## Project Structure

```
app/
├── api/
│   ├── config/             # Reports server-side key availability
│   └── tessie/             # Proxies all Tessie API calls
├── charging/               # Charge management page
├── climate/                # Climate control page
├── controls/               # Vehicle controls page
├── drives/                 # Drive & charge history page
├── map/                    # Live vehicle location map
├── settings/               # App settings & credentials
├── page.tsx                # Dashboard (home)
├── layout.tsx              # Root layout w/ providers
└── globals.css             # Global styles

components/
├── dashboard/              # Battery, status, weather, consumption, drives, quick controls
├── charging/               # Charge management UI
├── climate/                # Climate controls UI
├── controls/               # Vehicle controls UI
├── drives/                 # Drive/charge history UI
├── map/                    # Google Maps integration
├── settings/               # Settings form
├── setup/                  # BYOK setup/onboarding screen
├── layout/                 # App shell, sidebar, header
├── shared/                 # Reusable components (status badge, stat card, etc.)
└── ui/                     # Radix-based design system primitives

hooks/
├── use-vehicle-state.ts    # Auto-polling vehicle state
├── use-tessie-command.ts   # Command execution w/ optimistic updates
├── use-app-config.ts       # Server config (key availability)
├── use-drive-path.ts       # Drive route path fetching
└── use-google-maps-key.ts  # Maps API key resolution

lib/
├── tessie.ts               # Tessie API client (40+ commands)
├── store.ts                # Zustand stores (vehicle, credentials, settings)
├── types.ts                # TypeScript types for all API responses
├── constants.ts            # App-wide constants
├── units.ts                # Unit conversion utilities
├── credentials-provider.tsx# BYOK credential injection provider
├── query-provider.tsx      # TanStack Query provider
└── utils.ts                # Shared utilities
```

## Referrals

- **Tessie** — The vehicle API that powers this app. Sign up here: [share.tessie.com/v4Gklbe1U0b](https://share.tessie.com/v4Gklbe1U0b)
- **Want to buy a Tesla?** Use my referral for rewards: [ts.la/andrew80231](https://ts.la/andrew80231)

## License

[MIT](LICENSE) — Andrew Krowczyk
