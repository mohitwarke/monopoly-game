// Networking Client - Socket.io Client Wrapper

import { io, Socket } from 'socket.io-client';
import type { UUID, LobbyCode, GameState, Lobby, LobbyPlayer, Move, TradeOffer, Auction, Player } from '@monopoly/shared';
import {
  ClientToServerMessage,
  ServerToClientMessage,
  SOCKET_EVENTS,
  ConnectionState,
  ConnectionInfo,
  validateServerMessage,
  createCreateLobbyMessage,
  createJoinLobbyMessage,
  createLeaveLobbyMessage,
  createStartGameMessage,
  createMakeMoveMessage,
  createProposeTradeMessage,
  createRespondTradeMessage,
  createChatMessageMessage,
  createSyncRequestMessage,
  createHeartbeatMessage,
} from './protocol';

export interface ClientOptions {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
  auth?: { token: string };
}

export type ClientEventMap = {
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  reconnect: (attemptNumber: number) => void;
  reconnect_attempt: (attemptNumber: number) => void;
  reconnecting: (attemptNumber: number) => void;
  reconnect_failed: () => void;
  lobby_created: (lobby: Lobby) => void;
  lobby_updated: (lobby: Lobby) => void;
  player_joined: (player: LobbyPlayer) => void;
  player_left: (playerId: UUID) => void;
  game_started: (gameState: GameState) => void;
  game_state_update: (gameState: GameState) => void;
  move_made: (move: Move, gameState: GameState) => void;
  trade_proposed: (trade: TradeOffer) => void;
  trade_resolved: (tradeId: UUID, accepted: boolean) => void;
  auction_started: (auction: Auction) => void;
  auction_bid: (auctionId: UUID, bidderId: UUID, amount: number) => void;
  auction_ended: (auctionId: UUID, winnerId: UUID | null, amount: number) => void;
  player_eliminated: (playerId: UUID) => void;
  game_ended: (winnerId: UUID, finalState: GameState) => void;
  chat_message: (playerId: UUID, playerName: string, text: string, timestamp: number) => void;
  error: (code: string, message: string, details?: Record<string, unknown>) => void;
  sync_response: (gameState: GameState) => void;
  heartbeat_ack: () => void;
  connection_state_change: (state: ConnectionState) => void;
};

type EventHandler<T extends keyof ClientEventMap> = ClientEventMap[T];

export class MonopolyClient {
  private socket: Socket;
  private options: Required<ClientOptions>;
  private connectionInfo: ConnectionInfo;
  private eventHandlers: Map<keyof ClientEventMap, Set<Function>> = new Map();
  private heartbeatInterval?: ReturnType<typeof setInterval>;
  private pendingRequests: Map<string, { resolve: Function; reject: Function; timeout: ReturnType<typeof setTimeout> }> = new Map();
  private requestId = 0;

  constructor(options: ClientOptions) {
    this.options = {
      url: options.url,
      autoConnect: options.autoConnect ?? true,
      reconnection: options.reconnection ?? true,
      reconnectionAttempts: options.reconnectionAttempts ?? 10,
      reconnectionDelay: options.reconnectionDelay ?? 1000,
      timeout: options.timeout ?? 10000,
      auth: options.auth ?? { token: '' },
    };

    this.connectionInfo = {
      state: ConnectionState.DISCONNECTED,
      lastHeartbeat: 0,
      reconnectAttempts: 0,
    };

    this.socket = io(this.options.url, {
      autoConnect: this.options.autoConnect,
      reconnection: this.options.reconnection,
      reconnectionAttempts: this.options.reconnectionAttempts,
      reconnectionDelay: this.options.reconnectionDelay,
      timeout: this.options.timeout,
      auth: this.options.auth,
      transports: ['websocket', 'polling'],
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      this.updateConnectionState(ConnectionState.CONNECTED);
      this.connectionInfo.socketId = this.socket.id;
      this.startHeartbeat();
      this.emit('connect');
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      this.updateConnectionState(ConnectionState.DISCONNECTED);
      this.stopHeartbeat();
      this.emit('disconnect', reason);
    });

    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      this.updateConnectionState(ConnectionState.FAILED);
      this.emit('connect_error', error);
    });

    this.socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
      this.updateConnectionState(ConnectionState.CONNECTED);
      this.connectionInfo.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('reconnect', attemptNumber);
    });

    this.socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
      this.updateConnectionState(ConnectionState.RECONNECTING);
      this.connectionInfo.reconnectAttempts = attemptNumber;
      this.emit('reconnect_attempt', attemptNumber);
    });

    this.socket.on(SOCKET_EVENTS.RECONNECTING, (attemptNumber) => {
      this.emit('reconnecting', attemptNumber);
    });

    this.socket.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
      this.updateConnectionState(ConnectionState.FAILED);
      this.emit('reconnect_failed');
    });

    // Game events
    this.socket.on(SOCKET_EVENTS.LOBBY_CREATED, (data) => {
      this.emit('lobby_created', data.lobby);
    });

    this.socket.on(SOCKET_EVENTS.LOBBY_UPDATED, (data) => {
      this.emit('lobby_updated', data.lobby);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      this.emit('player_joined', data.player);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data) => {
      this.emit('player_left', data.playerId);
    });

    this.socket.on(SOCKET_EVENTS.GAME_STARTED, (data) => {
      this.connectionInfo.gameId = data.gameState.id;
      this.emit('game_started', data.gameState);
    });

    this.socket.on(SOCKET_EVENTS.GAME_STATE_UPDATE, (data) => {
      this.emit('game_state_update', data.gameState);
    });

    this.socket.on(SOCKET_EVENTS.MOVE_MADE, (data) => {
      this.emit('move_made', data.move, data.gameState);
    });

    this.socket.on(SOCKET_EVENTS.TRADE_PROPOSED, (data) => {
      this.emit('trade_proposed', data.trade);
    });

    this.socket.on(SOCKET_EVENTS.TRADE_RESOLVED, (data) => {
      this.emit('trade_resolved', data.tradeId, data.accepted);
    });

    this.socket.on(SOCKET_EVENTS.AUCTION_STARTED, (data) => {
      this.emit('auction_started', data.auction);
    });

    this.socket.on(SOCKET_EVENTS.AUCTION_BID, (data) => {
      this.emit('auction_bid', data.auctionId, data.bidderId, data.amount);
    });

    this.socket.on(SOCKET_EVENTS.AUCTION_ENDED, (data) => {
      this.emit('auction_ended', data.auctionId, data.winnerId, data.amount);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_ELIMINATED, (data) => {
      this.emit('player_eliminated', data.playerId);
    });

    this.socket.on(SOCKET_EVENTS.GAME_ENDED, (data) => {
      this.connectionInfo.gameId = undefined;
      this.emit('game_ended', data.winnerId, data.finalState);
    });

    this.socket.on(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, (data) => {
      this.emit('chat_message', data.playerId, data.playerName, data.text, data.timestamp);
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (data) => {
      this.emit('error', data.code, data.message, data.details);
    });

    this.socket.on(SOCKET_EVENTS.SYNC_RESPONSE, (data) => {
      this.emit('sync_response', data.gameState);
    });

    this.socket.on(SOCKET_EVENTS.HEARTBEAT_ACK, () => {
      this.connectionInfo.lastHeartbeat = Date.now();
      this.emit('heartbeat_ack');
    });

    // Handle request responses
    this.socket.on('request-response', (data: { requestId: string; success: boolean; data?: unknown; error?: { code: string; message: string } }) => {
      const pending = this.pendingRequests.get(data.requestId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(data.requestId);
        if (data.success) {
          pending.resolve(data.data);
        } else {
          pending.reject(new Error(data.error?.message || 'Request failed'));
        }
      }
    });
  }

  private updateConnectionState(state: ConnectionState): void {
    this.connectionInfo.state = state;
    this.emit('connection_state_change', state);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send(createHeartbeatMessage());
    }, 10000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  // ============================================
  // Public API
  // ============================================

  connect(): void {
    if (this.connectionInfo.state === ConnectionState.DISCONNECTED) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo };
  }

  isConnected(): boolean {
    return this.connectionInfo.state === ConnectionState.CONNECTED;
  }

  // Event handling
  on<T extends keyof ClientEventMap>(event: T, handler: EventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<T extends keyof ClientEventMap>(event: T, handler: EventHandler<T>): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  private emit<T extends keyof ClientEventMap>(event: T, ...args: Parameters<EventHandler<T>>): void {
    this.eventHandlers.get(event)?.forEach(handler => {
      try {
        (handler as Function)(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  // Request/Response pattern for critical operations
  private async sendRequest<T>(message: ClientToServerMessage, timeoutMs: number = 10000): Promise<T> {
    const requestId = `${++this.requestId}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Request timeout'));
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });
      this.socket.emit('request', { requestId, message });
    });
  }

  private send(message: ClientToServerMessage): void {
    this.socket.emit('message', message);
  }

  // ============================================
  // Lobby Operations
  // ============================================

  async createLobby(name: string, isPrivate: boolean, maxPlayers: number, rulesConfig?: Partial<import('@monopoly/shared').RulesConfig>): Promise<Lobby> {
    return this.sendRequest<Lobby>(createCreateLobbyMessage({ name, isPrivate, maxPlayers, rulesConfig }));
  }

  async joinLobby(code: LobbyCode, name: string, isAI?: boolean, aiDifficulty?: import('@monopoly/shared').AIDifficulty): Promise<Lobby> {
    return this.sendRequest<Lobby>(createJoinLobbyMessage({ code, name, isAI, aiDifficulty }));
  }

  async leaveLobby(): Promise<void> {
    return this.sendRequest<void>(createLeaveLobbyMessage());
  }

  async startGame(): Promise<GameState> {
    return this.sendRequest<GameState>(createStartGameMessage());
  }

  // ============================================
  // Game Operations
  // ============================================

  makeMove(move: Omit<Move, 'id' | 'timestamp'>): void {
    this.send(createMakeMoveMessage(move));
  }

  proposeTrade(
    fromPlayerId: UUID,
    toPlayerId: UUID,
    offeredMoney: number,
    requestedMoney: number,
    offeredProperties: UUID[],
    requestedProperties: UUID[],
    offeredGetOutOfJailFree: number,
    requestedGetOutOfJailFree: number
  ): void {
    this.send(createProposeTradeMessage({
      fromPlayerId,
      toPlayerId,
      offeredMoney,
      requestedMoney,
      offeredProperties,
      requestedProperties,
      offeredGetOutOfJailFree,
      requestedGetOutOfJailFree,
    }));
  }

  respondTrade(tradeId: UUID, accept: boolean): void {
    this.send(createRespondTradeMessage(tradeId, accept));
  }

  sendChatMessage(text: string): void {
    this.send(createChatMessageMessage(text));
  }

  requestSync(gameId: UUID): void {
    this.send(createSyncRequestMessage(gameId));
  }

  // ============================================
  // Cleanup
  // ============================================

  destroy(): void {
    this.stopHeartbeat();
    this.socket.removeAllListeners();
    this.eventHandlers.clear();
    this.pendingRequests.forEach(({ timeout }) => clearTimeout(timeout));
    this.pendingRequests.clear();
    this.socket.disconnect();
  }
}

// ============================================
// React Hook (for frontend)
// ============================================

/**
 * React hook for using the Monopoly client
 * Usage:
 * const { client, connectionState, lobby, gameState, createLobby, joinLobby, ... } = useMonopolyClient(url);
 */
export function createClientHook() {
  // This would be implemented in the frontend package with React
  // Placeholder for the hook factory
  return null;
}