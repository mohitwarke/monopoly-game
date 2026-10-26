# Monopoly Game - Development Setup Guide

> Complete step-by-step guide to run the Monopoly Game locally

---

## Prerequisites (Install Once)

| Tool | Version | Install Command |
|------|---------|-----------------|
| Node.js | 20+ | Download from [nodejs.org](https://nodejs.org/) |
| pnpm | 8.15.0 | `npm install -g pnpm@8.15.0` |
| Docker Desktop | Latest | Download from [docker.com](https://docker.com/) |
| Git | Latest | Download from [git-scm.com](https://git-scm.com/) |

---

## Quick Start (TL;DR)

```powershell
# 1. Navigate to project
cd C:\monopoly-game

# 2. Start databases (PostgreSQL + Redis)
pnpm docker:up

# 3. Install all dependencies
pnpm install

# 4. Build all packages
pnpm build

# 4. Setup frontend environment
cd apps\frontend
copy .env.example .env.local
cd ..\..

# 5. Start frontend dev server
cd apps\frontend
pnpm dev
```

Then open **http://localhost:3000** in your browser.

---

## Detailed Steps

### Step 1: Open Terminal in Project Folder

```powershell
cd C:\monopoly-game
```

### Step 2: Start Databases (PostgreSQL + Redis)

```powershell
pnpm docker:up
```

This starts:
- **PostgreSQL** on port 5432 (database)
- **Redis** on port 6379 (caching/sessions)

Verify with: `docker ps` - should show 2 containers running.

### Step 3: Install All Dependencies

```powershell
pnpm install
```

Installs packages for all workspace packages:
- `@monopoly/shared`
- `@monopoly/game-engine`
- `@monopoly/rules-engine`
- `@monopoly/networking`
- `@monopoly/modding`
- `@monopoly/ui-components`
- `@monopoly/frontend`

### Step 4: Build All Packages

```powershell
pnpm build
```

Compiles TypeScript for all shared packages so the frontend can import them.

### Step 5: Set Up Frontend Environment

```powershell
cd apps\frontend
copy .env.example .env.local
cd ..\..
```

Creates your local environment file with:
- `VITE_API_URL=http://localhost:4000/api`
- `VITE_SOCKET_URL=http://localhost:4000`

### Step 6: Start Frontend Development Server

```powershell
cd apps\frontend
pnpm dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:3000/
```

Open **http://localhost:3000** in your browser.

---

## What You'll See

1. **Landing Page** - Click "Start Playing Free" or "Sign Up"
2. **Register/Login** - Create an account
3. **Lobby List** - Create or join a game lobby
4. **Game Board** - Full Monopoly board with dice, pieces, properties

---

## Common Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages for production |
| `pnpm test` | Run all tests |
| `pnpm lint` | Check code style |
| `pnpm typecheck` | Check TypeScript types |
| `pnpm docker:up` | Start PostgreSQL + Redis |
| `pnpm docker:down` | Stop databases |
| `pnpm db:studio` | Open Prisma database UI |
| `pnpm format` | Format code with Prettier |

---

## Troubleshooting

### "Port 3000 already in use"
```powershell
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Module not found" errors
```powershell
# Reinstall and rebuild
pnpm install
pnpm build
```

### Docker not starting
- Make sure Docker Desktop is running
- Check: `docker ps` should show containers

### Database connection issues
```powershell
# Restart databases
pnpm docker:down
pnpm docker:up
```

---

## Project Structure

```
monopoly-game/
├── apps/
│   ├── frontend/          # React + Vite + Tailwind (THIS GUIDE)
│   ├── backend/           # Fastify + Prisma + Socket.io (TODO)
│   └── ai-worker/         # AI computation service (TODO)
├── packages/
│   ├── shared/            # Types, constants, utils, errors
│   ├── game-engine/       # Core game logic, state machine
│   ├── rules-engine/      # Custom rules, DSL, built-in rules
│   ├── networking/        # WebSocket protocol, client, server
│   ├── modding/           # Plugin system, sandbox, API
│   └── ui-components/     # React components (Board, Dice, Cards, etc.)
├── docker/
│   └── docker-compose.yml # PostgreSQL + Redis
└── DEVELOPMENT_GUIDE.md   # THIS FILE
```

---

## Next Steps After Running

1. **Create a lobby** - Click "Create Lobby", set name, invite friends with the 6-character code
2. **Add AI players** - In lobby, click "Add AI" to test against bots (4 difficulty levels)
3. **Start game** - Host clicks "Start Game"
4. **Play!** - Roll dice, buy properties, trade, build houses, win!

---

## Need Help?

- Check browser console (F12) for errors
- Check terminal for error messages
- Read `README.md` and `ARCHITECTURE.md` for more details
- Check `PROJECT_PLAN.md` for project status

---

## Keeping Plans Updated

Yes! I maintain a `fix-plan.md` in `/memories/session/` that tracks:
- ✅ Completed high-priority fixes
- 📋 Remaining medium/low priority tasks
- 🔄 Progress on each item

The plan is updated after each significant change to the codebase.