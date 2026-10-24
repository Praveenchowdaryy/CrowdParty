# 🎮 CrowdParty

> **"Play Together. Laugh Louder."** — *One Link. Endless Fun.*

CrowdParty is an all-in-one real-time multiplayer party games platform built for friends, remote software engineering teams, and colleagues. Gather your squad into a persistent virtual room and switch between drawing games, lightning trivia, social debates, and reflex showdowns without ever recreating the room.

---

## 🌟 Key Features

- **⚡ Zero Friction**: No downloads, no app installs, no mandatory registration. Players join instantly on mobile, tablet, or desktop with a 6-character room code or shareable URL.
- **🔄 Persistent Rooms**: Keep the group together across multiple games and rounds. Switch from a drawing game to trivia without kicking anyone out.
- **🎨 Draw & Guess**: Real-time synchronized canvas, rich color palette, brush sizes, eraser, secret word selection, letter hints, and chat guessing.
- **🧠 Quiz Battle**: Multiplayer trivia across programming, movies, science, sports, and office culture with speed bonus scoring.
- **🔥 Hot Takes**: Social dilemmas with private voting, majority crowd prediction bonuses, and animated percentage reveals.
- **⚡ Reaction Arena**: High-stakes reflex showdown with randomized server signals, false-start penalties, and millisecond rankings.
- **🤖 Built-in Bot Simulation**: Add simulated players (`PixelBot`, `TurboBot`, etc.) with one click to test multiplayer dynamics solo.
- **👑 Host Controls & Permissions**: Server-enforced permissions for starting games, changing games, room settings, and kicking bots.
- **🔄 Seamless Reconnections**: Secure session tokens stored in `localStorage` allow players to refresh their browsers or reconnect after network drops without losing state or score.

---

## 🏗️ Architecture

CrowdParty is structured as an npm workspaces monorepo:

```text
crowdparty/
├── packages/
│   └── shared/               # Pure TypeScript shared contracts, types, & constants
│       ├── src/
│       │   ├── types/        # Room, Player, and Game lifecycle interfaces
│       │   ├── constants/    # Game catalogue metadata, avatar options
│       │   └── index.ts      # Re-exports
├── apps/
│   ├── server/               # Node.js + Express + Socket.IO Authoritative Backend
│   │   ├── src/
│   │   │   ├── engine/       # Modular Game Engine (BaseGame, GameFactory)
│   │   │   │   └── games/    # DrawAndGuess, QuizBattle, HotTakes, ReactionArena
│   │   │   ├── room/         # Room and RoomManager (lifecycle, ticks, presence)
│   │   │   ├── socket/       # Socket.IO connection and event dispatchers
│   │   │   ├── db/           # PersistenceService (Supabase / In-Memory fallback)
│   │   │   └── index.ts      # HTTP and Socket server entry point
│   │   └── tests/            # Vitest unit and integration test suite
│   └── web/                  # Next.js 14 App Router + Tailwind CSS Frontend
│       ├── src/
│       │   ├── app/          # App router pages (/, /games, /room/[code])
│       │   ├── components/   # UI components (Lobby, GameContainer, Canvas, Chat, Podium)
│       │   ├── lib/          # Socket client singleton and session storage
│       │   └── styles/       # Tailwind CSS & global design system
└── supabase/
    └── migrations/           # PostgreSQL schema, indexes, RLS, and cleanup routines
```

### Server-Authoritative Game Engine Lifecycle

Every game module inherits from `BaseGame` and follows a deterministic lifecycle:
$$\text{WAITING\_ROOM} \longrightarrow \text{STARTING} \longrightarrow \text{PLAYING} \longrightarrow \text{ROUND\_END} \longrightarrow \text{RESULTS}$$

The server controls round deadlines, validates actions, and separates:
1. **Public Game State**: Sent to all clients (round number, scores, hints, canvas strokes, question prompts).
2. **Private Game State**: Sent only to specific clients (secret drawing word for drawer, user's private vote/prediction before reveal).

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### 1. Install Dependencies
```bash
# In the root crowdparty directory
npm install
```

### 2. Environment Configuration
Copy the example environment files:
```bash
# Server environment
cp apps/server/.env.example apps/server/.env

# Web environment
cp apps/web/.env.example apps/web/.env.local
```

### 3. Run Development Servers
You can run both backend and frontend concurrently with one command:
```bash
npm run dev
```

Or run them individually in separate terminal tabs:
```bash
# Terminal 1: Backend Server (runs on http://localhost:4000)
npm run dev:server

# Terminal 2: Next.js Frontend (runs on http://localhost:3000)
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 👥 How to Test Multiple Players Locally

1. Open [http://localhost:3000](http://localhost:3000) in your main browser window.
2. Enter your nickname (e.g. `HostAlice`), pick an avatar, and click **Start New Party**.
3. You will enter the Waiting Lobby with a 6-character room code (e.g. `PARTY9`).
4. **Option A (Simulated Bots)**: Click the **"Add Bot"** button in the lobby header to add simulated players instantly!
5. **Option B (Multiple Windows)**: Open an **Incognito / Private Window** or a second browser (Chrome/Firefox/Safari) and navigate to `http://localhost:3000/room/PARTY9` to join as a second human player!

---

## 🧪 Running Automated Tests

CrowdParty includes unit and integration tests covering room generation, player presence, host permissions, session reconnections, and all four game modules.

Run the test suite:
```bash
npm run test
```

To run TypeScript verification across all packages:
```bash
npm run typecheck
```

---

## 🧩 How to Add a New Game Module

Adding a new game to CrowdParty takes only 3 straightforward steps without touching room presence, chat, or socket plumbing:

1. **Define Shared State Types** in `packages/shared/src/types/games/your-game.ts`:
   - Create `YourGamePublicState` (extending `BasePublicGameState`) and `YourGamePrivateState`.
2. **Implement the Game Engine** in `apps/server/src/engine/games/YourGame.ts`:
   - Extend `BaseGame` and implement `start()`, `tick(now)`, `handleAction(playerId, action)`, `getPublicState()`, and `getPrivateState(playerId)`.
   - Register it in `GameFactory.ts`.
3. **Build the Game UI Component** in `apps/web/src/components/room/games/YourGameView.tsx`:
   - Render the game UI and connect actions via `onSendAction`.
   - Add the game card to `packages/shared/src/constants/games.ts`.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

Active rooms and games run in-memory for microsecond responsiveness. Supabase is used for durable history, player profiles, and moderation reports.

If you don't configure Supabase, CrowdParty runs automatically in **in-memory fallback mode** with zero setup required.

To connect Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and run `supabase/migrations/001_create_crowdparty_schema.sql`.
3. Add your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `apps/server/.env`.

---

## 🚢 Production Deployment

### Frontend (Vercel)
1. Import the repository into Vercel.
2. Set Root Directory to `apps/web`.
3. Configure Environment Variables:
   - `NEXT_PUBLIC_SOCKET_URL`: `https://api.yourdomain.com` (URL of your backend)
4. Deploy!

### Backend (Railway / Render / Fly.io)
1. Deploy `apps/server` as a persistent Node.js service (WebSockets require persistent processes, not serverless functions).
2. Set Environment Variables:
   - `PORT`: `4000` (or host provided)
   - `CORS_ORIGIN`: `https://yourdomain.com`
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`
3. Start command: `node dist/index.js` or `npm start`.

### Custom Domain & HTTPS
Configure DNS:
- `yourdomain.com` $\rightarrow$ CNAME to Vercel
- `api.yourdomain.com` $\rightarrow$ CNAME to Railway/Render
- SSL/TLS is handled automatically by both Vercel and Railway/Cloudflare.
