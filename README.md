# 🎲 Advanced Monopoly Game

> A modern, full-featured Monopoly implementation with real-time multiplayer, AI opponents, custom rules, tournaments, modding, and cross-platform sync.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-4-black)](https://fastify.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-black)](https://socket.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-1.12-ef4444)](https://turbo.build/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2d3748)](https://prisma.io/)

---

## 🎯 Features

| Category | Features |
|----------|----------|
| **Multiplayer** | Real-time WebSocket play, friend lobbies with invite codes, reconnection support, spectator mode |
| **AI Opponents** | 4 difficulty levels (Easy→Expert), Minimax + MCTS, configurable personalities |
| **Custom Rules** | 25+ built-in house rules, rule DSL for creating custom rules, rule presets |
| **Tournaments** | Swiss/Elimination/Round-robin formats, Glicko-2 ratings, seasonal leaderboards |
| **Modding** | Plugin system (board skins, rule packs, piece sets, AI personalities, game modes), secure sandbox |
| **Cross-Platform** | Cloud sync, offline-first (IndexedDB), device management, conflict resolution |
| **Replays** | Full game recording, watch past games, shareable replay links |

---

## 🏗️ Architecture

### Monorepo Structure (Turborepo)
```
monopoly-game/
├── apps/
│   ├── frontend/          # React + Vite + Tailwind (TO BE BUILT)
│   ├── backend/           # Fastify + Prisma + Socket.io (TO BE BUILT)
│   └── ai-worker/         # AI computation service (TO BE BUILT)
├── packages/
│   ├── shared/            # Types, constants, utilities, errors
│   ├── game-engine/       # Core game logic, state machine, serialization
│   ├── rules-engine/      # Rule registry, processor, DSL, built-in rules
│   ├── networking/        # WebSocket protocol, client, server
│   ├── modding/           # Plugin manifest, sandbox, API
│   └── ui-components/     # Board, pieces, cards, dice, UI components
├── tools/
│   ├── eslint-config/     # Shared ESLint configs
│   └── tsconfig/          # Shared TypeScript configs
└── docker/                # Docker Compose for local dev
```

### Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, React Query |
| **Backend** | Node.js 20, Fastify, Socket.io, Prisma ORM, PostgreSQL, Redis |
| **Real-time** | Socket.io with Redis adapter for horizontal scaling |
| **Database** | PostgreSQL 15+ (Prisma), Redis 7+ (sessions, caching, pub/sub) |
| **AI** | Minimax + Alpha-Beta + MCTS, deterministic for replays |
| **Modding** | isolated-vm sandbox, permission system, resource limits |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **CI/CD** | GitHub Actions, Docker, Cloud Run / Fly.io / Vercel |

---

## 📦 Packages (Ready to Use)

All packages are **fully implemented, typed, and tested in isolation**. Import via path aliases:

```typescript
// Configured in tsconfig.base.json
import { GameEngine } from '@monopoly/game-engine';
import { GameState, Player, Property } from '@monopoly/shared';
import { RuleProcessor, rule } from '@monopoly/rules-engine';
import { MonopolyClient, MonopolyServer } from '@monopoly/networking';
import { PluginManager, PluginSandbox } from '@monopoly/modding';
import { Board, Piece, CardDisplay, DicePair } from '@monopoly/ui-components';
```

### Package Details

| Package | Description | Key Exports |
|---------|-------------|-------------|
| `@monopoly/shared` | Core types, constants, utils, errors | `GameState`, `Player`, `Property`, `RulesConfig`, `formatMoney`, `rollDice`, error classes |
| `@monopoly/game-engine` | Authoritative game logic | `GameEngine`, `createRollDiceMove`, `serializeGameState`, `computeStateDelta` |
| `@monopoly/rules-engine` | Custom rules system | `RuleProcessor`, `RuleBuilder` (DSL), `BUILTIN_HOUSE_RULES`, `RULE_PRESETS` |
| `@monopoly/networking` | WebSocket communication | `MonopolyClient`, `MonopolyServer`, message schemas, event types |
| `@monopoly/modding` | Plugin system | `PluginManager`, `PluginSandbox`, `IPluginAPI`, `PluginManifest` |
| `@monopoly/ui-components` | React game UI | `Board`, `Piece`, `CardDisplay`, `DicePair`, `Button`, `Modal`, `Toast`, etc. |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8.15+
- Docker (for PostgreSQL + Redis)

### Installation
```bash
# Clone and install
git clone <repo-url>
cd monopoly-game
pnpm install

# Start infrastructure (PostgreSQL, Redis)
pnpm docker:up

# Generate Prisma client (after creating apps/backend)
cd apps/backend && pnpm db:generate

# Run migrations
pnpm db:migrate

# Start all development servers
pnpm dev
```

### Available Scripts
```bash
pnpm dev              # Start all apps (frontend, backend, ai-worker)
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm typecheck        # Type-check all packages
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm test:e2e         # E2E tests (Playwright)
pnpm format           # Prettier format
pnpm db:studio        # Open Prisma Studio
pnpm docker:up        # Start PostgreSQL + Redis
pnpm docker:down      # Stop infrastructure
```

---

## 🎮 Game Engine Overview

### State Machine
```
LOBBY → SETUP → PLAYING → AUCTION → TRADING → JAIL_DECISION → TURN_END → GAME_OVER
```

### Core Actions
- `rollDice` - Roll two dice, handle doubles, movement
- `buyProperty` / `auctionBid` - Property acquisition
- `payJailBail` / `useGetOutOfJailFree` - Jail resolution
- `buildHouse` / `sellHouse` / `mortgageProperty` / `unmortgageProperty` - Property management
- `proposeTrade` / `acceptTrade` / `rejectTrade` - Player trading
- `endTurn` - Turn progression with double-roll handling
- `declareBankruptcy` - Player elimination

### Deterministic & Serializable
- Full game state serializable to JSON
- Move log enables complete replay from initial state
- Seeded RNG for deterministic AI and replays
- Delta compression for efficient real-time sync

---

## 🤖 AI System

### Difficulty Levels
| Level | Search Depth | MCTS Sims | Personality |
|-------|-------------|-----------|-------------|
| Easy  | 2           | 50        | Conservative, random-ish |
| Medium| 4           | 200       | Balanced |
| Hard  | 6           | 1,000     | Aggressive |
| Expert| 8           | 5,000     | Optimal |

### Evaluation Factors
- **Liquidity** - Cash reserves
- **Property Sets** - Monopoly completion
- **Development** - Houses/hotels built
- **Opponent Threat** - Blocking opponents

---

## 📜 Custom Rules Engine

### Built-in House Rules (25+)
```typescript
// Economy
'free-parking-jackpot'     // Taxes go to Free Parking
'double-go-salary'         // $400 for landing on GO
'snake-eyes-bonus'         // $500 for double-1

// Property
'no-auctions'              // Decline = stays unowned
'unlimited-houses'         // No 32/12 limit
'free-mortgage'            // No 10% interest

// Jail
'free-bail'                // $0 to exit jail
'instant-jail-exit'        // Can pay immediately

// Winning
'time-limit'               // Game ends after N minutes
'wealth-victory'           // First to $X net worth wins
'mercy-rule'               // End if lead > $X
```

### Rule DSL (Create Custom Rules)
```typescript
import { rule } from '@monopoly/rules-engine';

const myRule = rule()
  .id('custom-tax')
  .name('Luxury Tax on Boardwalk')
  .category('economy')
  .onLand(39)  // Boardwalk position
  .takeMoney('current', 500)
  .configSchema({ type: 'object', properties: { amount: { type: 'number' }}})
  .build();
```

### Presets
```typescript
import { applyPreset, RULE_PRESETS } from '@monopoly/rules-engine';

const config = applyPreset(defaultRules, 'speed');  // 30-min game
const config = applyPreset(defaultRules, 'chaos');  // Maximum randomness
```

---

## 🔌 Plugin System

### Plugin Types
| Type | Description | Permissions |
|------|-------------|-------------|
| `boardSkin` | Custom board visuals | `board:render`, `assets:load` |
| `rulePack` | Bundled house rules | `rules:read`, `rules:modify` |
| `pieceSet` | Custom tokens | `pieces:render`, `assets:load` |
| `aiPersonality` | Custom AI behavior | `ai:read`, `ai:modify` |
| `gameMode` | Full game variants | All permissions |

### Example Plugin Manifest
```json
{
  "name": "Space Monopoly",
  "version": "1.0.0",
  "type": "boardSkin",
  "entry": "index.js",
  "apiVersion": "1.0",
  "permissions": ["board:render", "assets:load"],
  "config": {
    "theme": "space",
    "propertyStyles": { ... }
  }
}
```

### Security
- **isolated-vm** sandbox with memory/CPU limits
- Permission-based API access
- No filesystem/network access by default
- Resource quotas enforced

---

## 🗄️ Database Schema (Prisma)

Key models (see `ARCHITECTURE.md` for full schema):

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  username      String   @unique
  rating        Int      @default(1200)      // Glicko-2
  ratingDeviation Float  @default(350)
  volatility    Float    @default(0.06)
  games         GamePlayer[]
  tournaments   TournamentParticipant[]
  devices       Device[]
  plugins       Plugin[]
}

model Game {
  id            String   @id @default(cuid())
  phase         GamePhase
  rulesConfig   Json
  state         Json     // Full serialized state
  moveLog       Json[]   // For replay
  players       GamePlayer[]
  tournamentId  String?
}

model Lobby {
  id            String   @id @default(cuid())
  code          String   @unique  // 6-char invite code
  hostId        String
  players       LobbyPlayer[]
  gameId        String?  @unique
}

model Tournament {
  id          String   @id @default(cuid())
  format      TournamentFormat  // SWISS, ELIMINATION, ROUND_ROBIN
  status      TournamentStatus
  participants TournamentParticipant[]
  matches     Match[]
}
```

---

## 🔐 Authentication & Security

- **JWT** with short-lived access tokens + refresh tokens
- **bcrypt** password hashing
- **Rate limiting** per IP and per user
- **Zod** validation on all inputs
- **Plugin sandbox** with strict permissions
- **Replay protection** via nonces

---

## 📊 Scalability Targets

| Metric | Target |
|--------|--------|
| Concurrent Games | 10,000+ |
| Concurrent Players | 50,000+ |
| WebSocket Connections | 100,000+ |
| API Latency (p99) | < 100ms |
| Game State Sync | < 50ms |
| AI Move (Hard) | < 200ms |

---

## 📁 Project Documentation

| Document | Purpose |
|----------|---------|
| `ARCHITECTURE.md` | Complete system architecture, database schema, API contracts |
| `PROJECT_PLAN.md` | Implementation progress, next steps, handoff guide |
| `packages/*/src/index.ts` | Each package's public API |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `pnpm lint && pnpm typecheck && pnpm test`
5. Submit a PR

### Code Style
- TypeScript strict mode
- ESLint + Prettier (configured in `@monopoly/eslint-config`)
- Conventional commits (enforced by changesets)

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- Monopoly® is a trademark of Hasbro, Inc.
- This is an independent implementation for educational/entertainment purposes
- Built with modern web technologies and love for board games

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: `ARCHITECTURE.md` and `PROJECT_PLAN.md`

---

*Last updated: 2026-10-26 | Phase 1 (Scaffolding) Complete | Ready for Phase 2 (App Implementation)*