// Socket Service
import { io, Socket } from 'socket.io-client';
import type { UUID, LobbyCode, GameState, Lobby, LobbyPlayer, Move, TradeOffer, Auction } from '@monopoly/shared';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

type SocketEventMap = {
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
};

type EventHandler<K extends keyof SocketEventMap> = SocketEventMap[K];

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<keyof SocketEventMap, Set<Function>> = new Map();
  private token: string | null = null;

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.token = token;
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupListeners(): void {
    if (!this.socket) return;

    const events: (keyof SocketEventMap)[] = [
      'connect', 'disconnect', 'connect_error', 'reconnect',
      'reconnect_attempt', 'reconnecting', 'reconnect_failed',
      'lobby_created', 'lobby_updated', 'player_joined', 'player_left',
      'game_started', 'game_state_update', 'move_made',
      'trade_proposed', 'trade_resolved', 'auction_started',
      'auction_bid', 'auction_ended', 'player_eliminated',
      'game_ended', 'chat_message', 'error', 'sync_response', 'heartbeat_ack'
    ];

    for (const event of events) {
      this.socket.on(event, (data: any) => {
        this.emit(event, data);
      });
    }
  }

  on<K extends keyof SocketEventMap>(event: K, handler: EventHandler<K>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof SocketEventMap>(event: K, handler: EventHandler<K>): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  private emit<K extends keyof SocketEventMap>(event: K, ...args: Parameters<EventHandler<K>>): void {
    this.eventHandlers.get(event)?.forEach(handler => {
      try {
        (handler as Function)(...args);
      } catch (error) {
        console.error(`Error in socket event handler for ${event}:`, error);
      }
    });
  }

  // Lobby operations
  createLobby(name: string, isPrivate: boolean, maxPlayers: number, rulesConfig?: any): Promise<Lobby> {
    return this.request('create-lobby', { name, isPrivate, maxPlayers, rulesConfig });
  }

  joinLobby(code: LobbyCode, name: string, isAI?: boolean, aiDifficulty?: string): Promise<Lobby> {
    return this.request('join-lobby', { code, name, isAI, aiDifficulty });
  }

  leaveLobby(): Promise<void> {
    return this.request('leave-lobby', undefined);
  }

  startGame(): Promise<GameState> {
    return this.request('start-game', undefined);
  }

  // Game operations
  makeMove(move: Omit<Move, 'id' | 'timestamp'>): void {
    this.send('make-move', { move });
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
    this.send('propose-trade', {
      fromPlayerId,
      toPlayerId,
      offeredMoney,
      requestedMoney,
      offeredProperties,
      requestedProperties,
      offeredGetOutOfJailFree,
      requestedGetOutOfJailFree,
    });
  }

  respondTrade(tradeId: UUID, accept: boolean): void {
    this.send('respond-trade', { tradeId, accept });
  }

  sendChatMessage(text: string): void {
    this.send('chat-message', { text });
  }

  requestSync(gameId: UUID): void {
    this.send('sync-request', { gameId });
  }

  // Request/Response pattern
  private async request<T>(type: string, payload: any): Promise<T> {
    if (!this.socket) throw new Error('Socket not connected');

    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      const handler = (data: any) => {
        if (data.requestId === requestId) {
          clearTimeout(timeout);
          this.socket?.off('request-response', handler);
          if (data.success) {
            resolve(data.data);
          } else {
            reject(new Error(data.error?.message || 'Request failed'));
          }
        }
      };

      this.socket?.on('request-response', handler);
      this.socket?.emit('request', { requestId, message: { type, payload } });
    });
  }

  private send(type: string, payload: any): void {
    this.socket?.emit('message', { type, payload });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();