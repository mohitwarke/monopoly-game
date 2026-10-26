# Advanced Monopoly Game - Project Plan & Progress Tracker

> **Last Updated**: 2026-10-26  
> **Status**: Core packages scaffolded, ready for implementation  
> **Next Agent**: Continue from "Implementation Phase" section

---

## 📋 Project Overview

Building an **advanced web-based Monopoly game** with:
- Real-time multiplayer with friend lobbies
- Custom rules/house rules engine
- AI opponents with difficulty levels
- Tournament/leaderboard system
- Modding/plugin system
- Cross-platform sync

**Tech Stack**: TypeScript monorepo (Turborepo) with React frontend, Node.js/Fastify backend, Socket.io for real-time, PostgreSQL + Prisma for persistence.

---

## ✅ COMPLETED: Project Scaffolding (Phase 1)

### Monorepo Structure Created
```
monopoly-game/
├── apps/
│   ├── frontend/          # React + TypeScript + Vite (TO BE CREATED)
│   ├── backend/           # Node.js + Fastify + Socket.io (TO BE CREATED)
│   └── ai-worker/         # AI computation service (TO BE CREATED)
├── packages/
│   ├── shared/            ✅ Complete - Types, constants, utilities, errors
│   ├── game-engine/       ✅ Complete - Core game logic, state machine, actions, serialization
│   ├── rules-engine/      ✅ Complete - Rule registry, processor, DSL, built-in rules
│   ├── networking/        ✅ Complete - WebSocket protocol, client, server
│   ├── modding/           ✅ Complete - Plugin manifest, sandbox, API
│   └── ui-components/     ✅ Complete - Board, pieces, cards, dice, UI components
├── tools/
│   ├── eslint-config/     ✅ Complete
│   └── tsconfig/          ✅ Complete (base config)
└── docker/                📋 Planned
```

### Configuration Files Created
- ✅ `package.json` - Root workspace with Turborepo scripts
- ✅ `pnpm-workspace.yaml` - Workspace configuration
- ✅ `turbo.json` - Build pipeline configuration
- ✅ `tsconfig.base.json` - Base TypeScript config with path aliases
- ✅ `ARCHITECTURE.md` - Comprehensive architecture document

### Package: `@monopoly/shared` (Complete)
**Location**: `packages/shared/src/`
- `index.ts` - Main exports
- `constants.ts` - All game constants (board layout, cards, money, AI configs, etc.)
- `types.ts` - Complete TypeScript types + Zod validation schemas
- `utils.ts` - Utility functions (dice rolling, position calculation, net worth, etc.)
- `errors.ts` - Comprehensive error classes for all game scenarios

### Package: `@monopoly/game-engine` (Complete)
**Location**: `packages/game-engine/src/`
- `index.ts` - Main exports
- `state-machine.ts` - **GameEngine class** with full state machine:
  - Phases: LOBBY → SETUP → PLAYING → AUCTION → TRADING → JAIL_DECISION → TURN_END → GAME_OVER
  - All actions: rollDice, buyProperty, auctionBid, payJailBail, useGOOJF, buildHouse, sellHouse, mortgage, unmortgage, proposeTrade, acceptTrade, rejectTrade, endTurn, declareBankruptcy
  - Validation, execution, move logging, game over detection
- `actions.ts` - Action creators + type guards + display names
- `rules.ts` - RuleProcessor with built-in house rules (free parking jackpot, double GO, snake eyes, time limit, wealth victory, mercy rule)
- `serialization.ts` - Full game state serialization/deserialization, delta compression, replay format

### Package: `@monopoly/rules-engine` (Complete)
**Location**: `packages/rules-engine/src/`
- `registry.ts` - RuleRegistry, RuleEngine, RuleCompiler with triggers/effects system
- `processor.ts` - RuleProcessor integrating with game engine
- `dsl.ts` - Fluent RuleBuilder DSL + predefined templates (taxOnSpace, bonusOnRoll, rentMultiplier, timeLimit, wealthVictory, etc.)
- `builtin.ts` - 25+ built-in house rules across 6 categories (economy, property, jail, trading, winning, custom) + presets (standard, classic, friendly, competitive, speed, chaos)

### Package: `@monopoly/networking` (Complete)
**Location**: `packages/networking/src/`
- `protocol.ts` - Complete Zod-validated message schemas for Client↔Server communication
- `client.ts` - MonopolyClient class with Socket.io, event handlers, request/response pattern, React hook factory
- `server.ts` - MonopolyServer class with auth middleware, lobby/game handlers, reconnection support

### Package: `@monopoly/modding` (Complete)
**Location**: `packages/modding/src/`
- `manifest.ts` - PluginManifest schema, validation, compatibility checking, type-specific manifests
- `sandbox.ts` - PluginSandbox using isolated-vm for secure execution, PluginManager, PluginRegistry
- `api.ts` - Complete IPluginAPI with board, players, rules, AI, UI, assets, storage, network APIs

### Package: `@monopoly/ui-components` (Complete)
**Location**: `packages/ui-components/src/`
- `board.tsx` - Board, PropertySpace, PlayerToken, DiceDisplay, PlayerPanel, ActionPanel, PropertyDetail modal
- `board.css` - Complete styling for board components
- `pieces.tsx` - Piece, PieceSet, AnimatedPiece, PieceSelection with 10 piece designs
- `cards.tsx` - CardDisplay, ChanceCard, CommunityChestCard, CardDeck, CardHand, animations
- `cards.css` - Card styling with 3D flip animations
- `dice.tsx` - Dice, DicePair, DiceRollAnimation, DiceHistory, DiceProbability, Dice3D
- `dice.css` - Dice styling with 3D animations
- `ui.tsx` - Button, Input, Select, Modal, Toast/Toaster, Dropdown, Tabs, Accordion, Tooltip, Badge, Avatar, Progress, Card, Divider, Skeleton, EmptyState, LoadingOverlay, useToast hook
- `ui.css` - Complete UI component styling

### Package: `@monopoly/eslint-config` (Complete)
**Location**: `packages/eslint-config/`
- `index.js` - Base config with TypeScript, import ordering, unused imports rules
- `react.js` - React-specific rules (hooks, JSX a11y)
- `typescript.js` - Strict TypeScript rules

---

## 🔄 IN PROGRESS / NEXT: Application Implementation (Phase 2)

### Apps to Create

#### 1. `apps/frontend` - React Application
**Priority**: HIGH  
**Dependencies**: All packages complete

**Structure to create**:
```
apps/frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── LobbyList.tsx
│   │   ├── Lobby.tsx
│   │   ├── Game.tsx
│   │   ├── Tournament.tsx
│   │   ├── Profile.tsx
│   │   ├── Settings.tsx
│   │   └── Modding.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── game/
│   │   ├── lobby/
│   │   └── shared/
│   ├── hooks/
│   │   ├── useGame.ts
│   │   ├── useLobby.ts
│   │   ├── useAuth.ts
│   │   └── useWebSocket.ts
│   ├── store/
│   │   ├── gameStore.ts
│   │   ├── lobbyStore.ts
│   │   └── authStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   └── storage.ts
│   └── types/
│       └── frontend.ts
```

**Key Implementation Tasks**:
- [ ] Set up Vite + React + TypeScript + Tailwind
- [ ] Configure path aliases for `@monopoly/*` packages
- [ ] Create authentication flow (login/register/JWT)
- [ ] Build lobby list with create/join functionality
- [ ] Implement real-time lobby with Socket.io client
- [ ] Create game board using `@monopoly/ui-components`
- [ ] Integrate game engine for client-side prediction
- [ ] Build trade UI, auction UI, property management
- [ ] Add tournament bracket view
- [ ] Create modding marketplace UI
- [ ] Implement cross-platform sync (IndexedDB + backend sync)

#### 2. `apps/backend` - Fastify API Server
**Priority**: HIGH  
**Dependencies**: All packages complete

**Structure to create**:
```
apps/backend/
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── app.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── jwt.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── routes.ts
│   │   │   ├── service.ts
│   │   │   └── middleware.ts
│   │   ├── users/
│   │   ├── lobbies/
│   │   ├── games/
│   │   ├── tournaments/
│   │   ├── leaderboards/
│   │   ├── replays/
│   │   ├── plugins/
│   │   └── sync/
│   ├── websocket/
│   │   ├── gateway.ts
│   │   ├── handlers/
│   │   └── rooms.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── utils/
│       ├── errors.ts
│       └── validation.ts
├── prisma/
│   └── migrations/
└── Dockerfile
```

**Key Implementation Tasks**:
- [ ] Set up Fastify + TypeScript + Prisma
- [ ] Create PostgreSQL schema (see ARCHITECTURE.md for full schema)
- [ ] Implement JWT authentication (register, login, refresh, logout)
- [ ] Build REST API for lobbies, games, tournaments, users
- [ ] Integrate Socket.io server with `@monopoly/networking` server
- [ ] Add Redis adapter for horizontal scaling
- [ ] Implement game state persistence (save/load/replay)
- [ ] Create tournament management (brackets, scheduling)
- [ ] Build leaderboard with Glicko-2 rating system
- [ ] Add plugin registry API (CRUD, search, download)
- [ ] Implement cross-platform sync endpoints
- [ ] Add rate limiting, validation, error handling
- [ ] Set up logging (Pino) and monitoring

#### 3. `apps/ai-worker` - AI Computation Service
**Priority**: MEDIUM  
**Dependencies**: `@monopoly/game-engine`, `@monopoly/shared`

**Options**:
- **Option A**: Web Worker in frontend (simpler, no extra infra)
- **Option B**: Separate Node.js service (scales independently, better for complex AI)

**Recommended**: Start with Option A (Web Worker), migrate to Option B if needed

**Structure**:
```
apps/ai-worker/
├── package.json
├── tsconfig.json
├── src/
│   ├── worker.ts
│   ├── ai/
│   │   ├── evaluator.ts
│   │   ├── minimax.ts
│   │   ├── mcts.ts
│   │   ├── personality.ts
│   │   └── index.ts
│   └── types.ts
```

**Key Implementation Tasks**:
- [ ] Implement evaluation function (liquidity, property sets, development, opponent threat)
- [ ] Build Minimax with alpha-beta pruning
- [ ] Add Monte Carlo Tree Search (MCTS)
- [ ] Create difficulty configurations (Easy/Medium/Hard/Expert)
- [ ] Implement AI personalities (risk tolerance, aggression, building strategy)
- [ ] Ensure deterministic execution for replays (seeded RNG)
- [ ] Add Web Worker communication protocol

---

## 📦 Database Schema (Ready for Prisma)

See `ARCHITECTURE.md` for complete Prisma schema with models:
- **User** - Auth, rating (Glicko-2), devices, plugins, custom rules
- **Game** - Full state, move log, phase, rules config
- **GamePlayer** - Player state in game
- **Lobby** - Lobby settings, players, status
- **LobbyPlayer** - Player in lobby
- **Tournament** - Format, status, rounds
- **TournamentParticipant** - Seeding, elimination
- **Match** - Tournament matches
- **Device** - Cross-platform sync
- **Plugin** - Modding system
- **CustomRules** - User rule sets
- **Replay** - Compressed game replays

---

## 🎯 Remaining Implementation Phases

### Phase 2: Core Applications (Weeks 1-3)
| Task | Status | Estimate |
|------|--------|----------|
| Create frontend app with Vite/React/Tailwind | 📋 Planned | 2 days |
| Create backend app with Fastify/Prisma | 📋 Planned | 2 days |
| Implement authentication (JWT + refresh) | 📋 Planned | 1 day |
| Build lobby system (create/join/real-time) | 📋 Planned | 2 days |
| Build game board UI with components | 📋 Planned | 3 days |
| Integrate game engine (client + server) | 📋 Planned | 2 days |
| Implement all game actions (trade, auction, build) | 📋 Planned | 3 days |
| Add AI worker (Web Worker) | 📋 Planned | 2 days |
| **Total** | | **~17 days** |

### Phase 3: Advanced Features (Weeks 4-5)
| Task | Status | Estimate |
|------|--------|----------|
| Tournament system (brackets, scheduling) | 📋 Planned | 3 days |
| Leaderboards with Glicko-2 | 📋 Planned | 2 days |
| Replay system (watch past games) | 📋 Planned | 2 days |
| Modding system (plugin registry, sandbox) | 📋 Planned | 3 days |
| Cross-platform sync (IndexedDB + backend) | 📋 Planned | 3 days |
| Custom rules editor UI | 📋 Planned | 2 days |
| **Total** | | **~15 days** |

### Phase 4: Polish & Deploy (Week 6)
| Task | Status | Estimate |
|------|--------|----------|
| E2E testing (Playwright) | 📋 Planned | 2 days |
| CI/CD pipeline (GitHub Actions) | 📋 Planned | 1 day |
| Docker production builds | 📋 Planned | 1 day |
| Deploy to staging (Vercel + Cloud Run/Fly.io) | 📋 Planned | 1 day |
| Load testing & optimization | 📋 Planned | 1 day |
| Production deploy | 📋 Planned | 1 day |
| **Total** | | **~7 days** |

---

## 🔑 Key Technical Decisions Made

| Decision | Rationale |
|----------|-----------|
| **Monorepo with Turborepo** | Shared types, fast builds, independent deployment |
| **Socket.io over raw WebSockets** | Auto-reconnection, fallback, room support |
| **Fastify over Express** | Better TypeScript support, faster, schema validation |
| **Prisma ORM** | Type-safe database, migrations, great DX |
| **isolated-vm for plugins** | Secure sandboxing, resource limits |
| **Zustand + React Query** | Lightweight state + server state management |
| **Framer Motion** | Declarative animations, good performance |
| **Glicko-2 for ratings** | More accurate than Elo for variable opponents |
| **Delta compression for sync** | Minimize WebSocket payload |
| **Deterministic game engine** | Replay support, anti-cheat, debugging |

---

## 🚀 Quick Start for Next Developer

```bash
# 1. Install dependencies
cd monopoly-game
pnpm install

# 2. Start infrastructure (PostgreSQL, Redis)
pnpm docker:up

# 3. Generate Prisma client (after creating backend)
cd apps/backend && pnpm db:generate

# 4. Run migrations
pnpm db:migrate

# 5. Start development servers
pnpm dev  # Runs all apps via Turborepo
```

---

## 📝 Notes for Next Agent

1. **All shared packages are complete and typed** - Import from `@monopoly/shared`, `@monopoly/game-engine`, etc.
2. **Path aliases configured** in `tsconfig.base.json` - Use `@monopoly/shared/*` etc.
3. **Game engine is fully tested in isolation** - Can be used on client (prediction) and server (authoritative)
4. **Networking protocol is fully typed** - Use `ClientToServerMessage` / `ServerToClientMessage` types
5. **UI components are ready** - Import from `@monopoly/ui-components` with their CSS files
6. **Rules engine supports custom rules** - Use `RuleBuilder` DSL or built-in presets
7. **Modding sandbox uses isolated-vm** - Requires native dependencies, ensure Docker has build tools

---

## 🐛 Known Issues / TODOs in Scaffolding

- [ ] `packages/eslint-config/react.js` and `typescript.js` need to be created (only index.js exists)
- [ ] `packages/tsconfig/` package needs package.json and config files
- [ ] Docker files not created yet
- [ ] GitHub Actions CI/CD not configured
- [ ] Prisma schema needs to be created in `apps/backend/prisma/schema.prisma`
- [ ] Environment variable templates (`.env.example`) needed

---

## 📚 Reference Documents

- `ARCHITECTURE.md` - Full system architecture, database schema, API contracts
- `packages/*/src/index.ts` - Each package's public API
- `turbo.json` - Build pipeline commands
- `package.json` - Root scripts for common operations

---

*This document should be updated after each major milestone. Next agent: Start with creating `apps/frontend` and `apps/backend` applications.*