# Advanced Monopoly Game - Architecture Document

## Project Overview
A web-based, real-time multiplayer Monopoly game with:
- Real-time multiplayer with friend lobbies
- Custom rules/house rules engine
- AI opponents with difficulty levels
- Tournament/leaderboard system
- Modding/plugin system
- Cross-platform sync

---

## Tech Stack Recommendation

### Monorepo Structure (Nx or Turborepo)
```
monopoly-game/
├── apps/
│   ├── frontend/          # React + TypeScript + Vite
│   ├── backend/           # Node.js + TypeScript + Fastify
│   └── ai-worker/         # AI computation (Web Worker or separate service)
├── packages/
│   ├── shared/            # Shared types, constants, utilities
│   ├── game-engine/       # Core game logic (rules, state machine)
│   ├── rules-engine/      # Custom rules/house rules system
│   ├── networking/        # WebSocket protocols, message types
│   ├── modding/           # Plugin system, sandboxing
│   └── ui-components/     # Shared React components
├── tools/
│   ├── eslint-config/
│   ├── tsconfig/
│   └── jest-preset/
└── docker/
    ├── docker-compose.yml
    ├── Dockerfile.frontend
    ├── Dockerfile.backend
    └── Dockerfile.ai-worker
```

### Frontend (apps/frontend)
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand (lightweight) + React Query (server state)
- **Real-time**: Socket.io-client
- **Styling**: Tailwind CSS + Headless UI
- **Animation**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **Build**: Vite + TypeScript

### Backend (apps/backend)
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Fastify (fast, TypeScript-native)
- **Real-time**: Socket.io (WebSocket + fallback)
- **Database**: PostgreSQL 15+ (Prisma ORM)
- **Cache/Session**: Redis 7+ (ioredis)
- **Auth**: JWT + bcrypt (or NextAuth if adding social login)
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Observability**: Pino (logging), OpenTelemetry

### AI Worker (apps/ai-worker)
- **Option A**: Web Worker in frontend (simpler, no extra infra)
- **Option B**: Separate Node.js service (better for complex AI, scales independently)
- **Algorithm**: Minimax with alpha-beta pruning + Monte Carlo Tree Search (MCTS)
- **Difficulty**: Configurable search depth, evaluation function weights

### Shared Packages
- **shared**: Types, enums, constants, utility functions
- **game-engine**: Pure TypeScript, no dependencies - core rules, state machine, serialization
- **rules-engine**: Rule definition DSL, validation, composition
- **networking**: Message types, protocol definitions, serialization
- **modding**: Plugin API, sandbox (VM2 or isolated-vm), manifest schema
- **ui-components**: Reusable React components (board, pieces, cards, dice)

---

## Core Game Engine Design

### State Machine
```
GamePhase:
  LOBBY -> SETUP -> PLAYING -> AUCTION -> TRADING -> JAIL_DECISION -> TURN_END -> GAME_OVER
```

### Core Entities
- **Game**: id, phase, players[], board, currentPlayerIndex, turnCount, rulesConfig, createdAt
- **Player**: id, name, color, money, properties[], position, inJail, jailTurns, isAI, aiDifficulty
- **Property**: id, name, type (street/railroad/utility), price, rent[], ownerId, mortgaged, houses, hotel
- **Card**: id, type (chance/community), text, action
- **Move**: playerId, type, data, timestamp

### Serialization
- Full game state serializable to JSON
- Deterministic replay from initial state + move log
- Optimistic UI updates with server reconciliation

---

## Real-Time Multiplayer Architecture

### WebSocket Protocol (Socket.io)
```
Client -> Server Events:
  - create-lobby { rulesConfig, isPrivate, maxPlayers }
  - join-lobby { lobbyId, playerName }
  - leave-lobby
  - start-game
  - make-move { move }
  - propose-trade { targetPlayerId, offer, request }
  - respond-trade { tradeId, accept }
  - chat-message { text }

Server -> Client Events:
  - lobby-created { lobbyId, state }
  - lobby-updated { state }
  - player-joined { player }
  - player-left { playerId }
  - game-started { gameState }
  - game-state-update { gameState }
  - move-made { move, newState }
  - trade-proposed { trade }
  - trade-resolved { tradeId, accepted }
  - player-eliminated { playerId }
  - game-ended { winner, finalState }
  - error { code, message }
  - sync-request { gameId } (for cross-platform sync)
```

### Lobby System
- Public lobbies (quick match)
- Private lobbies (invite code, friends only)
- Lobby settings: rules config, max players, AI fill
- Host migration on disconnect
- Reconnection support with state sync

---

## Custom Rules / House Rules Engine

### Rule Definition (JSON/YAML)
```yaml
rules:
  - id: "free-parking-jackpot"
    name: "Free Parking Jackpot"
    description: "Taxes and fees go to Free Parking"
    category: "economy"
    enabled: true
    config:
      collectOnLanding: true
  
  - id: "auction-on-decline"
    name: "Mandatory Auction"
    description: "Unbought properties go to auction immediately"
    category: "property"
    enabled: true
```

### Rule Categories
- **Economy**: Starting money, salary, taxes, free parking
- **Property**: Auctions, building limits, mortgages
- **Jail**: Turns to escape, double roll rules, bail cost
- **Trading**: Restrictions, forced trades
- **Winning**: Bankruptcy only, time limit, wealth threshold
- **Custom**: User-defined via modding system

### Implementation
- Rule registry with validation
- Composable rule modifiers (decorator pattern)
- Server-authoritative rule enforcement
- Client-side prediction for UI

---

## AI Opponents

### Difficulty Levels
| Level | Search Depth | MCTS Sims | Evaluation Complexity | Personality |
|-------|-------------|-----------|----------------------|-------------|
| Easy  | 1-2         | 50        | Basic (money + props) | Random-ish  |
| Medium| 3-4         | 200       | Standard             | Balanced    |
| Hard  | 5-6         | 1000      | Advanced             | Aggressive  |
| Expert| 7+          | 5000      | Full (ML-enhanced)   | Optimal     |

### AI Architecture
- **Evaluation Function**: Weighted features (liquidity, property sets, development, opponent threat)
- **Search**: Minimax + Alpha-Beta + MCTS hybrid
- **Personality**: Configurable risk tolerance, trading aggression, building strategy
- **Learning**: Optional - record games for ML training (future)

### Integration
- AI runs in Web Worker (frontend) or separate service (backend)
- Same interface as human player (makeMove callback)
- Deterministic for replay (seeded RNG)

---

## Tournament & Leaderboard System

### Data Model
- **Tournament**: id, name, format, rulesConfig, status, schedule, participants[], prizes
- **Match**: id, tournamentId, round, players[], gameId, result
- **Leaderboard**: playerId, rating (Elo/Glicko), wins, losses, streak, season
- **Season**: id, startDate, endDate, leaderboardSnapshot

### Features
- Swiss/Elimination/Round-robin formats
- Real-time bracket updates
- Spectator mode for tournament games
- Rating system (Glicko-2 for accuracy)
- Seasonal rewards

---

## Modding / Plugin System

### Plugin Manifest
```json
{
  "name": "Custom Board",
  "version": "1.0.0",
  "author": "User",
  "description": "Space-themed board",
  "type": "board-skin",
  "entry": "index.js",
  "apiVersion": "1.0",
  "permissions": ["board:render", "assets:load"]
}
```

### Plugin Types
- **Board Skins**: Visual themes, custom property names/art
- **Rule Packs**: Bundled house rules
- **Piece Sets**: Custom token models
- **AI Personalities**: Custom evaluation weights
- **Game Modes**: Variants (speed, team, etc.)

### Sandboxing
- VM2 or isolated-vm for code execution
- Permission system (file system, network, game API)
- Resource limits (CPU, memory, time)
- Content Security Policy for assets

### Distribution
- Local plugins (user folder)
- Workshop/registry (future)
- Version compatibility checking

---

## Cross-Platform Sync

### Strategy
- **Account System**: Email/password + OAuth (Google, GitHub, Discord)
- **Cloud Save**: Game state, preferences, replays, custom rules synced to PostgreSQL
- **Device Management**: List linked devices, revoke access
- **Conflict Resolution**: Last-write-wins with manual merge for complex state
- **Offline Support**: Local-first (IndexedDB), sync on reconnect

### Implementation
- Backend: REST API + WebSocket for real-time sync
- Frontend: Dexie.js (IndexedDB wrapper) + sync engine
- Conflict-free replicated data types (CRDTs) for concurrent edits

---

## Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  avatarUrl     String?
  rating        Int       @default(1200)
  ratingDeviation Float   @default(350)
  volatility    Float     @default(0.06)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  games         GamePlayer[]
  tournaments   TournamentParticipant[]
  devices       Device[]
  plugins       Plugin[]
  customRules   CustomRules[]
}

model Game {
  id            String    @id @default(cuid())
  lobbyId       String?   @unique
  phase         GamePhase
  rulesConfig   Json
  state         Json      // Full serialized state
  moveLog       Json[]    // For replay
  currentTurn   Int       @default(0)
  winnerId      String?
  startedAt     DateTime?
  endedAt       DateTime?
  createdAt     DateTime  @default(now())
  players       GamePlayer[]
  tournamentId  String?
  tournament    Tournament? @relation(fields: [tournamentId], references: [id])
}

model GamePlayer {
  id        String  @id @default(cuid())
  gameId    String
  userId    String?
  user      User?   @relation(fields: [userId], references: [id])
  playerIndex Int
  name      String
  color     String
  isAI      Boolean @default(false)
  aiDifficulty String?
  finalRank Int?
  game      Game    @relation(fields: [gameId], references: [id], onDelete: Cascade)
}

model Lobby {
  id            String    @id @default(cuid())
  code          String    @unique // 6-char invite code
  hostId        String
  host          User      @relation(fields: [hostId], references: [id])
  name          String
  isPrivate     Boolean   @default(true)
  maxPlayers    Int       @default(6)
  rulesConfig   Json
  status        LobbyStatus
  players       LobbyPlayer[]
  gameId        String?   @unique
  game          Game?     @relation(fields: [gameId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model LobbyPlayer {
  id        String  @id @default(cuid())
  lobbyId   String
  lobby     Lobby   @relation(fields: [lobbyId], references: [id], onDelete: Cascade)
  userId    String?
  user      User?   @relation(fields: [userId], references: [id])
  playerIndex Int
  name      String
  color     String
  isReady   Boolean @default(false)
  isAI      Boolean @default(false)
  aiDifficulty String?
}

model Tournament {
  id          String   @id @default(cuid())
  name        String
  format      TournamentFormat
  rulesConfig Json
  status      TournamentStatus
  maxPlayers  Int
  currentRound Int    @default(0)
  startedAt   DateTime?
  endedAt     DateTime?
  createdAt   DateTime @default(now())
  participants TournamentParticipant[]
  matches     Match[]
}

model TournamentParticipant {
  id            String     @id @default(cuid())
  tournamentId  String
  tournament    Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  seed          Int?
  eliminatedAt  DateTime?
  finalRank     Int?
}

model Match {
  id            String   @id @default(cuid())
  tournamentId  String
  tournament    Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  round         Int
  player1Id     String
  player2Id     String
  gameId        String?  @unique
  game          Game?    @relation(fields: [gameId], references: [id])
  winnerId      String?
  status        MatchStatus
  scheduledAt   DateTime?
  startedAt     DateTime?
  endedAt       DateTime?
}

model Device {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  platform  String
  token     String   @unique
  lastSeen  DateTime @default(now())
  createdAt DateTime @default(now())
}

model Plugin {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  version     String
  type        PluginType
  manifest    Json
  code        String   // Source code
  isPublic    Boolean  @default(false)
  downloads   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CustomRules {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  rules       Json     // Rule definitions
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Replay {
  id        String   @id @default(cuid())
  gameId    String   @unique
  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  data      Json     // Compressed move log + initial state
  views     Int      @default(0)
  createdAt DateTime @default(now())
}

enum GamePhase {
  LOBBY
  SETUP
  PLAYING
  AUCTION
  TRADING
  JAIL_DECISION
  TURN_END
  GAME_OVER
}

enum LobbyStatus {
  WAITING
  STARTING
  IN_GAME
  FINISHED
}

enum TournamentFormat {
  SWISS
  ELIMINATION
  ROUND_ROBIN
}

enum TournamentStatus {
  UPCOMING
  REGISTRATION
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum MatchStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FORFEIT
}

enum PluginType {
  BOARD_SKIN
  RULE_PACK
  PIECE_SET
  AI_PERSONALITY
  GAME_MODE
}
```

---

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Start all services (with Docker)
docker-compose up -d

# Run database migrations
pnpm db:migrate

# Start dev servers
pnpm dev          # All apps
pnpm dev:frontend # Frontend only
pnpm dev:backend  # Backend only
```

### Testing
```bash
pnpm test           # All tests
pnpm test:unit      # Unit tests
pnpm test:integration # Integration tests
pnpm test:e2e       # Playwright E2E
```

### Code Quality
```bash
pnpm lint           # ESLint
pnpm typecheck      # TypeScript
pnpm format         # Prettier
```

---

## Deployment

### Production (Docker + Kubernetes/Cloud Run)
- Frontend: Static hosting (Vercel, Netlify, Cloudflare Pages)
- Backend: Container (Cloud Run, Fly.io, Railway, K8s)
- Database: Managed PostgreSQL (Neon, Supabase, RDS)
- Redis: Managed (Upstash, Redis Cloud, ElastiCache)
- WebSocket: Sticky sessions or Redis adapter for scaling

### CI/CD (GitHub Actions)
- Lint, typecheck, test on PR
- Build Docker images on merge to main
- Deploy to staging on main
- Deploy to production on tag

---

## Security Considerations

- **Authentication**: JWT with short expiry, refresh tokens
- **Authorization**: Resource-based (game ownership, lobby membership)
- **Rate Limiting**: Per-IP and per-user (API + WebSocket)
- **Input Validation**: Zod schemas on all endpoints
- **Plugin Sandbox**: Strict permissions, no filesystem/network
- **Replay Protection**: Nonce-based for critical actions
- **Data Privacy**: GDPR-compliant, data export/delete

---

## Scalability Targets

| Metric | Target |
|--------|--------|
| Concurrent Games | 10,000+ |
| Concurrent Players | 50,000+ |
| WebSocket Connections | 100,000+ |
| API Latency (p99) | < 100ms |
| Game State Sync | < 50ms |
| AI Move Calculation | < 200ms (Hard) |

---

## Future Extensibility

- **Mobile Apps**: React Native (share ~80% code)
- **Desktop**: Tauri (Rust backend, web frontend)
- **Spectator Mode**: Read-only WebSocket connections
- **Streaming Integration**: Twitch/YouTube overlays
- **ML AI**: Train on replay data
- **Blockchain**: Optional NFT pieces/boards (separate mode)
- **Accessibility**: Screen reader, high contrast, keyboard nav