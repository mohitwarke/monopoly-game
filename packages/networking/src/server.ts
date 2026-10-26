// Networking Server - Socket.io Server Implementation

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import type { UUID, LobbyCode, GameState, Lobby, LobbyPlayer, Move, TradeOffer, Auction, RulesConfig } from '@monopoly/shared';
import {
  ClientToServerMessage,
  ServerToClientMessage,
  SOCKET_EVENTS,
  validateClientMessage,
  createLobbyCreatedMessage,
  createLobbyUpdatedMessage,
  createPlayerJoinedMessage,
  createPlayerLeftMessage,
  createGameStartedMessage,
  createGameStateUpdateMessage,
  createMoveMadeMessage,
  createTradeProposedMessage,
  createTradeResolvedMessage,
  createAuctionStartedMessage,
  createAuctionBidMessage,
  createAuctionEndedMessage,
  createPlayerEliminatedMessage,
  createGameEndedMessage,
  createChatMessageMessage,
  createErrorMessage,
  createSyncResponseMessage,
  createHeartbeatAckMessage,
  getLobbyRoom,
  getGameRoom,
  getUserRoom,
  GLOBAL_ROOM,
} from './protocol';
import { generateUUID, generateLobbyCode } from '@monopoly/shared';
import { GameEngine } from '@monopoly/game-engine';
import { LobbyNotFoundError, LobbyCodeInvalidError, LobbyFullError, LobbyNotJoinableError, NotLobbyHostError, GameAlreadyInProgressError, NotEnoughPlayersError, GameNotFoundError, InvalidGamePhaseError, NotYourTurnError, PlayerNotInGameError } from '@monopoly/shared';

export interface ServerOptions {
  httpServer: HttpServer;
  corsOrigin?: string | string[];
  pingInterval?: number;
  pingTimeout?: number;
}

export interface ServerDependencies {
  // Database operations
  createLobby: (lobby: Lobby) => Promise<void>;
  getLobby: (lobbyId: UUID) => Promise<Lobby | null>;
  getLobbyByCode: (code: LobbyCode) => Promise<Lobby | null>;
  updateLobby: (lobby: Lobby) => Promise<void>;
  deleteLobby: (lobbyId: UUID) => Promise<void>;
  createGame: (game: GameState) => Promise<void>;
  getGame: (gameId: UUID) => Promise<GameState | null>;
  updateGame: (game: GameState) => Promise<void>;
  // Auth
  verifyToken: (token: string) => Promise<{ userId: UUID; username: string } | null>;
  // AI
  createAIPlayer: (difficulty: import('@monopoly/shared').AIDifficulty) => Promise<import('@monopoly/shared').Player>;
}

export class MonopolyServer {
  private io: Server;
  private dependencies: ServerDependencies;
  private lobbies: Map<UUID, Lobby> = new Map();
  private games: Map<UUID, GameEngine> = new Map();
  private socketToUser: Map<string, { userId: UUID; username: string; lobbyId?: UUID; gameId?: UUID }> = new Map();

  constructor(options: ServerOptions, dependencies: ServerDependencies) {
    this.dependencies = dependencies;
    this.io = new Server(options.httpServer, {
      cors: {
        origin: options.corsOrigin ?? '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingInterval: options.pingInterval ?? 10000,
      pingTimeout: options.pingTimeout ?? 5000,
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const user = await this.dependencies.verifyToken(token);
        if (!user) {
          return next(new Error('Invalid token'));
        }
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupConnectionHandlers(): void {
    this.io.on(SOCKET_EVENTS.CONNECT, (socket) => {
      const user = socket.data.user;
      this.socketToUser.set(socket.id, { userId: user.userId, username: user.username });
      socket.join(getUserRoom(user.userId));
      socket.join(GLOBAL_ROOM);

      console.log(`User connected: ${user.username} (${socket.id})`);

      // Handle messages
      socket.on('message', async (data: unknown) => {
        await this.handleMessage(socket, data);
      });

      // Handle request/response
      socket.on('request', async (data: { requestId: string; message: ClientToServerMessage }) => {
        await this.handleRequest(socket, data.requestId, data.message);
      });

      // Handle disconnect
      socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
        this.handleDisconnect(socket, reason);
      });
    });
  }

  private async handleMessage(socket: Socket, data: unknown): Promise<void> {
    const validation = validateClientMessage(data);
    if (!validation.success) {
      socket.emit('message', createErrorMessage('INVALID_MESSAGE', 'Invalid message format', validation.error.flatten()));
      return;
    }

    const message = validation.message;
    const user = socket.data.user;

    try {
      switch (message.type) {
        case 'create-lobby':
          await this.handleCreateLobby(socket, user, message.payload);
          break;
        case 'join-lobby':
          await this.handleJoinLobby(socket, user, message.payload);
          break;
        case 'leave-lobby':
          await this.handleLeaveLobby(socket, user);
          break;
        case 'start-game':
          await this.handleStartGame(socket, user);
          break;
        case 'make-move':
          await this.handleMakeMove(socket, user, message.payload.move);
          break;
        case 'propose-trade':
          await this.handleProposeTrade(socket, user, message.payload);
          break;
        case 'respond-trade':
          await this.handleRespondTrade(socket, user, message.payload.tradeId, message.payload.accept);
          break;
        case 'chat-message':
          await this.handleChatMessage(socket, user, message.payload.text);
          break;
        case 'sync-request':
          await this.handleSyncRequest(socket, user, message.payload.gameId);
          break;
        case 'heartbeat':
          socket.emit('message', createHeartbeatAckMessage());
          break;
      }
    } catch (error) {
      this.sendError(socket, error);
    }
  }

  private async handleRequest(socket: Socket, requestId: string, message: ClientToServerMessage): Promise<void> {
    const user = socket.data.user;

    try {
      let result: unknown;

      switch (message.type) {
        case 'create-lobby':
          result = await this.handleCreateLobby(socket, user, message.payload);
          break;
        case 'join-lobby':
          result = await this.handleJoinLobby(socket, user, message.payload);
          break;
        case 'leave-lobby':
          result = await this.handleLeaveLobby(socket, user);
          break;
        case 'start-game':
          result = await this.handleStartGame(socket, user);
          break;
        default:
          throw new Error('Request type not supported');
      }

      socket.emit('request-response', { requestId, success: true, data: result });
    } catch (error) {
      socket.emit('request-response', {
        requestId,
        success: false,
        error: { code: this.getErrorCode(error), message: this.getErrorMessage(error) },
      });
    }
  }

  // ============================================
  // Lobby Handlers
  // ============================================

  private async handleCreateLobby(socket: Socket, user: { userId: UUID; username: string }, payload: { name: string; isPrivate: boolean; maxPlayers: number; rulesConfig?: Partial<RulesConfig> }): Promise<Lobby> {
    const lobby: Lobby = {
      id: generateUUID(),
      code: generateLobbyCode(),
      hostId: user.userId,
      name: payload.name,
      isPrivate: payload.isPrivate,
      maxPlayers: payload.maxPlayers,
      rulesConfig: payload.rulesConfig ? { ...payload.rulesConfig } as RulesConfig : {} as RulesConfig,
      status: 'waiting',
      players: [{
        id: generateUUID(),
        userId: user.userId,
        name: user.username,
        color: '#FF0000',
        playerIndex: 0,
        isReady: false,
        isAI: false,
        joinedAt: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.lobbies.set(lobby.id, lobby);
    await this.dependencies.createLobby(lobby);

    socket.join(getLobbyRoom(lobby.id));
    this.socketToUser.get(socket.id)!.lobbyId = lobby.id;

    socket.emit('message', createLobbyCreatedMessage(lobby));
    return lobby;
  }

  private async handleJoinLobby(socket: Socket, user: { userId: UUID; username: string }, payload: { code: LobbyCode; name: string; isAI?: boolean; aiDifficulty?: import('@monopoly/shared').AIDifficulty }): Promise<Lobby> {
    const lobby = await this.dependencies.getLobbyByCode(payload.code);
    if (!lobby) throw new LobbyCodeInvalidError(payload.code);
    if (lobby.status !== 'waiting') throw new LobbyNotJoinableError(lobby.id, 'Lobby is not accepting players');
    if (lobby.players.length >= lobby.maxPlayers) throw new LobbyFullError(lobby.id);

    const player: LobbyPlayer = {
      id: generateUUID(),
      userId: payload.isAI ? undefined : user.userId,
      name: payload.name,
      color: this.getNextPlayerColor(lobby),
      playerIndex: lobby.players.length,
      isReady: false,
      isAI: payload.isAI ?? false,
      aiDifficulty: payload.aiDifficulty,
      joinedAt: Date.now(),
    };

    lobby.players.push(player);
    lobby.updatedAt = Date.now();
    await this.dependencies.updateLobby(lobby);

    socket.join(getLobbyRoom(lobby.id));
    this.socketToUser.get(socket.id)!.lobbyId = lobby.id;

    this.io.to(getLobbyRoom(lobby.id)).emit('message', createPlayerJoinedMessage(player));
    this.io.to(getLobbyRoom(lobby.id)).emit('message', createLobbyUpdatedMessage(lobby));

    return lobby;
  }

  private async handleLeaveLobby(socket: Socket, user: { userId: UUID; username: string }): Promise<void> {
    const socketUser = this.socketToUser.get(socket.id);
    if (!socketUser?.lobbyId) return;

    const lobby = this.lobbies.get(socketUser.lobbyId);
    if (!lobby) return;

    const playerIndex = lobby.players.findIndex(p => p.userId === user.userId);
    if (playerIndex === -1) return;

    const [removedPlayer] = lobby.players.splice(playerIndex, 1);
    lobby.updatedAt = Date.now();

    // Reassign player indices
    lobby.players.forEach((p, i) => { p.playerIndex = i; });

    // If host left, assign new host
    if (lobby.hostId === user.userId && lobby.players.length > 0) {
      lobby.hostId = lobby.players[0].userId ?? lobby.players[0].id;
    }

    if (lobby.players.length === 0) {
      this.lobbies.delete(lobby.id);
      await this.dependencies.deleteLobby(lobby.id);
    } else {
      await this.dependencies.updateLobby(lobby);
      this.io.to(getLobbyRoom(lobby.id)).emit('message', createPlayerLeftMessage(removedPlayer.id));
      this.io.to(getLobbyRoom(lobby.id)).emit('message', createLobbyUpdatedMessage(lobby));
    }

    socket.leave(getLobbyRoom(lobby.id));
    socketUser.lobbyId = undefined;
  }

  private async handleStartGame(socket: Socket, user: { userId: UUID; username: string }): Promise<GameState> {
    const socketUser = this.socketToUser.get(socket.id);
    if (!socketUser?.lobbyId) throw new Error('Not in a lobby');

    const lobby = this.lobbies.get(socketUser.lobbyId);
    if (!lobby) throw new LobbyNotFoundError(socketUser.lobbyId);
    if (lobby.hostId !== user.userId) throw new NotLobbyHostError(lobby.id, user.userId);
    if (lobby.status !== 'waiting') throw new GameAlreadyInProgressError(lobby.id);

    const humanPlayers = lobby.players.filter(p => !p.isAI);
    if (humanPlayers.length < 2) throw new NotEnoughPlayersError(lobby.id, humanPlayers.length, 2);

    // Create game players
    const players = lobby.players.map((lp, index) => ({
      id: lp.id,
      userId: lp.userId,
      name: lp.name,
      color: lp.color,
      money: lobby.rulesConfig.startingMoney,
      position: 0,
      properties: [],
      inJail: false,
      jailTurns: 0,
      getOutOfJailFreeCards: 0,
      isBankrupt: false,
      isAI: lp.isAI,
      aiDifficulty: lp.aiDifficulty,
      netWorth: lobby.rulesConfig.startingMoney,
    }));

    const gameId = generateUUID();
    const engine = GameEngine.createFromLobby(gameId, lobby.id, players, lobby.rulesConfig);
    this.games.set(gameId, engine);

    lobby.status = 'inGame';
    lobby.gameId = gameId;
    lobby.updatedAt = Date.now();
    await this.dependencies.updateLobby(lobby);

    const gameState = engine.getState();
    await this.dependencies.createGame(gameState);

    // Move sockets to game room
    for (const [sid, su] of this.socketToUser) {
      if (su.lobbyId === lobby.id) {
        const sock = this.io.sockets.sockets.get(sid);
        if (sock) {
          sock.leave(getLobbyRoom(lobby.id));
          sock.join(getGameRoom(gameId));
          su.gameId = gameId;
        }
      }
    }

    this.io.to(getGameRoom(gameId)).emit('message', createGameStartedMessage(gameState));
    return gameState;
  }

  // ============================================
  // Game Handlers
  // ============================================

  private async handleMakeMove(socket: Socket, user: { userId: UUID; username: string }, move: Omit<Move, 'id' | 'timestamp'>): Promise<void> {
    const socketUser = this.socketToUser.get(socket.id);
    if (!socketUser?.gameId) throw new Error('Not in a game');

    const engine = this.games.get(socketUser.gameId);
    if (!engine) throw new GameNotFoundError(socketUser.gameId);

    const gameState = engine.getState();
    const player = gameState.players.find(p => p.userId === user.userId || p.id === move.playerId);
    if (!player) throw new PlayerNotInGameError(gameState.id, move.playerId);

    // Validate it's the player's turn (or valid out-of-turn action)
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isCurrentPlayer = currentPlayer.id === player.id;

    const outOfTurnActions = ['acceptTrade', 'rejectTrade', 'auctionBid'];
    if (!isCurrentPlayer && !outOfTurnActions.includes(move.action)) {
      throw new NotYourTurnError(gameState.id, player.id, currentPlayer.id);
    }

    // Apply move
    const newState = engine.applyMove(move);
    await this.dependencies.updateGame(newState);

    // Broadcast to game room
    this.io.to(getGameRoom(socketUser.gameId)).emit('message', createMoveMadeMessage(
      newState.moveLog[newState.moveLog.length - 1],
      newState
    ));

    // Check for game end
    if (newState.phase === 'gameOver') {
      this.io.to(getGameRoom(socketUser.gameId)).emit('message', createGameEndedMessage(newState.winnerId!, newState));
      this.games.delete(socketUser.gameId);
    }
  }

  private async handleProposeTrade(socket: Socket, user: { userId: UUID; username: string }, payload: Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'expiresAt'>): Promise<void> {
    const socketUser = this.socketToUser.get(socket.id);
    if (!socketUser?.gameId) throw new Error('Not in a game');

    const engine = this.games.get(socketUser.gameId);
    if (!engine) throw new GameNotFoundError(socketUser.gameId);

    const gameState = engine.getState();
    const player = gameState.players.find(p => p.userId === user.userId);
    if (!player) throw new PlayerNotInGameError(gameState.id, user.userId);

    // Validate trade
    if (payload.fromPlayerId !== player.id) {
      throw new Error('Can only propose trades as yourself');
    }

    const newState = engine.applyMove({
      playerId: player.id,
      turn: gameState.turn,
      phase: 'trading',
      action: 'proposeTrade',
      data: payload,
    });

    await this.dependencies.updateGame(newState);

    const trade = newState.activeTrade!;
    this.io.to(getGameRoom(socketUser.gameId)).emit('message', createTradeProposedMessage(trade));
  }

  private async handleRespondTrade(socket: Socket, user: { userId: UUID; username: string }, tradeId: UUID, accept: boolean): Promise<void> {
    const socketUser = this.socketToUser.get(socket.id);
    if (!socketUser?.gameId) throw new Error('Not in a game');

    const engine = this.games.get(socketUser.gameId);
    if (!engine) throw new GameNotFoundError(socketUser.gameId);

    const gameState = engine.getState();
    const player = gameState.players.find(p => p.userId === user.userId);
    if (!player) throw new PlayerNotInGameError(gameState.id, user.userId);

    const trade = gameState.activeTrade;
    if (!trade || trade.id !== tradeId) throw new Error('Trade not found');
    if (trade.toPlayerId !== player.id) throw new Error('Not the intended recipient');

    const newState = engine.applyMove({
      playerId: player.id,
      turn: gameState.turn,
      phase: 'trading',
      action: accept ? 'acceptTrade' : 'rejectTrade',
      data: { tradeId },
    });

    await this.dependencies.updateGame(newState);
    this.io.to(getGameRoom(socketUser.gameId)).emit('message', createTradeResolvedMessage(tradeId, accept));
  }

  private async handleChatMessage(socket: Socket, user: { userId: UUID; username: string }, text: string): Promise<void> {
    const socketUser = this.socketToUser.get(socket.id);
    if (!socketUser?.gameId && !socketUser?.lobbyId) return;

    const room = socketUser.gameId ? getGameRoom(socketUser.gameId) : getLobbyRoom(socketUser.lobbyId!);
    this.io.to(room).emit('message', createChatMessageMessage(user.userId, user.username, text));
  }

  private async handleSyncRequest(socket: Socket, user: { userId: UUID; username: string }, gameId: UUID): Promise<void> {
    const game = await this.dependencies.getGame(gameId);
    if (!game) throw new GameNotFoundError(gameId);

    socket.emit('message', createSyncResponseMessage(game));
  }

  // ============================================
  // Disconnect Handler
  // ============================================

  private handleDisconnect(socket: Socket, reason: string): void {
    const socketUser = this.socketToUser.get(socket.id);
    if (!socketUser) return;

    // Handle lobby disconnect
    if (socketUser.lobbyId) {
      const lobby = this.lobbies.get(socketUser.lobbyId);
      if (lobby) {
        const playerIndex = lobby.players.findIndex(p => p.userId === socketUser.userId);
        if (playerIndex !== -1) {
          const [removedPlayer] = lobby.players.splice(playerIndex, 1);
          lobby.players.forEach((p, i) => { p.playerIndex = i; });
          lobby.updatedAt = Date.now();

          if (lobby.hostId === socketUser.userId && lobby.players.length > 0) {
            lobby.hostId = lobby.players[0].userId ?? lobby.players[0].id;
          }

          if (lobby.players.length === 0) {
            this.lobbies.delete(lobby.id);
            this.dependencies.deleteLobby(lobby.id);
          } else {
            this.dependencies.updateLobby(lobby);
            this.io.to(getLobbyRoom(lobby.id)).emit('message', createPlayerLeftMessage(removedPlayer.id));
            this.io.to(getLobbyRoom(lobby.id)).emit('message', createLobbyUpdatedMessage(lobby));
          }
        }
      }
    }

    // Handle game disconnect (player has reconnect window)
    if (socketUser.gameId) {
      // Don't immediately remove - allow reconnection
      // Could emit player disconnected event
      this.io.to(getGameRoom(socketUser.gameId)).emit('message', createChatMessageMessage(
        'system',
        'System',
        `${socketUser.username} disconnected (${reason})`
      ));
    }

    this.socketToUser.delete(socket.id);
    console.log(`User disconnected: ${socketUser.username} (${reason})`);
  }

  // ============================================
  // Helpers
  // ============================================

  private getNextPlayerColor(lobby: Lobby): string {
    const usedColors = new Set(lobby.players.map(p => p.color));
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
    for (const color of colors) {
      if (!usedColors.has(color)) return color;
    }
    return colors[lobby.players.length % colors.length];
  }

  private sendError(socket: Socket, error: unknown): void {
    const code = this.getErrorCode(error);
    const message = this.getErrorMessage(error);
    socket.emit('message', createErrorMessage(code, message));
  }

  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      // Check for known error types
      const errorMap: Record<string, string> = {
        'GameNotFoundError': 'GAME_NOT_FOUND',
        'InvalidGamePhaseError': 'INVALID_GAME_PHASE',
        'NotYourTurnError': 'NOT_YOUR_TURN',
        'PlayerNotInGameError': 'PLAYER_NOT_IN_GAME',
        'LobbyNotFoundError': 'LOBBY_NOT_FOUND',
        'LobbyCodeInvalidError': 'LOBBY_CODE_INVALID',
        'LobbyFullError': 'LOBBY_FULL',
        'LobbyNotJoinableError': 'LOBBY_NOT_JOINABLE',
        'NotLobbyHostError': 'NOT_LOBBY_HOST',
        'GameAlreadyInProgressError': 'GAME_ALREADY_IN_PROGRESS',
        'NotEnoughPlayersError': 'NOT_ENOUGH_PLAYERS',
      };
      return errorMap[error.constructor.name] || 'INTERNAL_ERROR';
    }
    return 'INTERNAL_ERROR';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'An unknown error occurred';
  }

  // ============================================
  // Public API
  // ============================================

  getIO(): Server {
    return this.io;
  }

  getLobby(lobbyId: UUID): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  getGame(gameId: UUID): GameEngine | undefined {
    return this.games.get(gameId);
  }

  broadcastToLobby(lobbyId: UUID, message: ServerToClientMessage): void {
    this.io.to(getLobbyRoom(lobbyId)).emit('message', message);
  }

  broadcastToGame(gameId: UUID, message: ServerToClientMessage): void {
    this.io.to(getGameRoom(gameId)).emit('message', message);
  }

  broadcastToUser(userId: UUID, message: ServerToClientMessage): void {
    this.io.to(getUserRoom(userId)).emit('message', message);
  }

  shutdown(): void {
    this.io.close();
  }
}