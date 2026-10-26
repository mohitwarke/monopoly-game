// WebSocket Protocol Definitions

import { z } from 'zod';
import type {
  UUID,
  LobbyCode,
  GameState,
  Lobby,
  LobbyPlayer,
  Move,
  TradeOffer,
  Auction,
  RulesConfig,
  Player,
  Property,
  Card,
  DiceRoll,
  GamePhase,
  PlayerAction,
  AIDifficulty,
  LobbyStatus,
} from '@monopoly/shared';
import {
  GamePhase as GamePhaseEnum,
  PlayerAction as PlayerActionEnum,
  LobbyStatus as LobbyStatusEnum,
  AIDifficulty as AIDifficultyEnum,
  GAME_CONSTANTS,
} from '@monopoly/shared';

// ============================================
// Zod Schemas for Validation
// ============================================

export const UUIDSchema = z.string().uuid();
export const LobbyCodeSchema = z.string().length(6).regex(/^[A-Z0-9]+$/);

export const DiceRollSchema = z.object({
  die1: z.number().min(1).max(6),
  die2: z.number().min(1).max(6),
  isDouble: z.boolean(),
  total: z.number().min(2).max(12),
});

export const PlayerSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema.optional(),
  name: z.string().min(1).max(32),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  money: z.number().int().min(0),
  position: z.number().int().min(0).max(39),
  properties: z.array(UUIDSchema),
  inJail: z.boolean(),
  jailTurns: z.number().int().min(0).max(3),
  getOutOfJailFreeCards: z.number().int().min(0).max(2),
  isBankrupt: z.boolean(),
  isAI: z.boolean(),
  aiDifficulty: z.nativeEnum(AIDifficultyEnum).optional(),
  netWorth: z.number().int().min(0),
});

export const PropertySchema = z.object({
  id: UUIDSchema,
  boardPosition: z.number().int().min(0).max(39),
  name: z.string(),
  type: z.enum(['street', 'railroad', 'utility', 'special']),
  group: z.enum(['brown', 'lightBlue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkBlue', 'railroad', 'utility']).nullable(),
  price: z.number().int().min(0),
  mortgageValue: z.number().int().min(0),
  rent: z.array(z.number().int().min(0)).length(6),
  houseCost: z.number().int().min(0),
  ownerId: UUIDSchema.nullable(),
  houses: z.number().int().min(0).max(5),
  isMortgaged: z.boolean(),
});

export const CardActionSchema = z.union([
  z.object({ type: z.literal('advanceTo'), target: z.number().int().min(0).max(39), collectGo: z.boolean().optional() }),
  z.object({ type: z.literal('advanceToNearest'), targetType: z.enum(['street', 'railroad', 'utility', 'special']), multiplier: z.number() }),
  z.object({ type: z.literal('moveRelative'), spaces: z.number().int() }),
  z.object({ type: z.literal('goToJail') }),
  z.object({ type: z.literal('receiveMoney'), amount: z.number().int() }),
  z.object({ type: z.literal('payMoney'), amount: z.number().int() }),
  z.object({ type: z.literal('receiveFromEachPlayer'), amount: z.number().int() }),
  z.object({ type: z.literal('payEachPlayer'), amount: z.number().int() }),
  z.object({ type: z.literal('payPerHouseHotel'), perHouse: z.number().int(), perHotel: z.number().int() }),
  z.object({ type: z.literal('getOutOfJailFree') }),
]);

export const CardSchema = z.object({
  id: z.string(),
  type: z.enum(['chance', 'communityChest']),
  text: z.string(),
  action: CardActionSchema,
});

export const TradeOfferSchema = z.object({
  id: UUIDSchema,
  fromPlayerId: UUIDSchema,
  toPlayerId: UUIDSchema,
  offeredMoney: z.number().int().min(0),
  requestedMoney: z.number().int().min(0),
  offeredProperties: z.array(UUIDSchema),
  requestedProperties: z.array(UUIDSchema),
  offeredGetOutOfJailFree: z.number().int().min(0).max(2),
  requestedGetOutOfJailFree: z.number().int().min(0).max(2),
  status: z.enum(['pending', 'accepted', 'rejected', 'cancelled']),
  createdAt: z.number().int(),
  expiresAt: z.number().int(),
});

export const AuctionSchema = z.object({
  id: UUIDSchema,
  propertyId: UUIDSchema,
  currentBid: z.number().int().min(0),
  currentBidderId: UUIDSchema.nullable(),
  bidders: z.array(UUIDSchema),
  startedAt: z.number().int(),
  endsAt: z.number().int(),
  status: z.enum(['active', 'completed', 'cancelled']),
});

export const RulesConfigSchema = z.object({
  startingMoney: z.number().int().min(0),
  goSalary: z.number().int().min(0),
  incomeTaxAmount: z.number().int().min(0),
  luxuryTaxAmount: z.number().int().min(0),
  freeParkingJackpot: z.boolean(),
  freeParkingCollectsTaxes: z.boolean(),
  auctionOnDecline: z.boolean(),
  mustBuildEvenly: z.boolean(),
  sellHousesAtHalfPrice: z.boolean(),
  mortgageInterestRate: z.number().min(0).max(1),
  maxJailTurns: z.number().int().min(1),
  doubleRollGetsOutOfJail: z.boolean(),
  bailAmount: z.number().int().min(0),
  housesPerHotel: z.number().int().min(1),
  maxHouses: z.number().int().min(0),
  maxHotels: z.number().int().min(0),
  allowTrading: z.boolean(),
  allowTradingWhileInJail: z.boolean(),
  tradeRequiresApproval: z.boolean(),
  bankruptcyOnly: z.boolean(),
  maxTurns: z.number().int().min(1).optional(),
  timeLimitMinutes: z.number().int().min(1).optional(),
  wealthThreshold: z.number().int().min(1).optional(),
  customRules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.enum(['economy', 'property', 'jail', 'trading', 'winning', 'custom']),
    enabled: z.boolean(),
    config: z.record(z.unknown()),
  })),
});

export const GameStateSchema = z.object({
  id: UUIDSchema,
  lobbyId: UUIDSchema.optional(),
  phase: z.nativeEnum(GamePhaseEnum),
  rulesConfig: RulesConfigSchema,
  board: z.array(PropertySchema),
  players: z.array(PlayerSchema),
  currentPlayerIndex: z.number().int().min(0).max(7),
  turn: z.number().int().min(0),
  diceRoll: DiceRollSchema.optional(),
  doublesCount: z.number().int().min(0).max(3),
  chanceDeck: z.array(CardSchema),
  communityChestDeck: z.array(CardSchema),
  chanceDiscard: z.array(CardSchema),
  communityChestDiscard: z.array(CardSchema),
  freeParkingJackpot: z.number().int().min(0),
  activeTrade: TradeOfferSchema.optional(),
  activeAuction: AuctionSchema.optional(),
  pendingJailDecisionPlayerId: UUIDSchema.optional(),
  winnerId: UUIDSchema.optional(),
  moveLog: z.array(z.object({
    id: UUIDSchema,
    playerId: UUIDSchema,
    turn: z.number().int(),
    phase: z.nativeEnum(GamePhaseEnum),
    action: z.nativeEnum(PlayerActionEnum),
    data: z.record(z.unknown()),
    timestamp: z.number().int(),
  })),
  createdAt: z.number().int(),
  startedAt: z.number().int().optional(),
  endedAt: z.number().int().optional(),
});

export const LobbyPlayerSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema.optional(),
  name: z.string().min(1).max(32),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  playerIndex: z.number().int().min(0).max(7),
  isReady: z.boolean(),
  isAI: z.boolean(),
  aiDifficulty: z.nativeEnum(AIDifficultyEnum).optional(),
  joinedAt: z.number().int(),
});

export const LobbySchema = z.object({
  id: UUIDSchema,
  code: LobbyCodeSchema,
  hostId: UUIDSchema,
  name: z.string().min(1).max(64),
  isPrivate: z.boolean(),
  maxPlayers: z.number().int().min(2).max(8),
  rulesConfig: RulesConfigSchema,
  status: z.nativeEnum(LobbyStatusEnum),
  players: z.array(LobbyPlayerSchema),
  gameId: UUIDSchema.optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

// ============================================
// Client -> Server Messages
// ============================================

export const CreateLobbyInputSchema = z.object({
  name: z.string().min(1).max(64),
  isPrivate: z.boolean(),
  maxPlayers: z.number().int().min(2).max(8),
  rulesConfig: RulesConfigSchema.partial().optional(),
});

export const JoinLobbyInputSchema = z.object({
  code: LobbyCodeSchema,
  name: z.string().min(1).max(32),
  isAI: z.boolean().optional(),
  aiDifficulty: z.nativeEnum(AIDifficultyEnum).optional(),
});

export const MoveInputSchema = z.object({
  move: z.object({
    playerId: UUIDSchema,
    turn: z.number().int(),
    phase: z.nativeEnum(GamePhaseEnum),
    action: z.nativeEnum(PlayerActionEnum),
    data: z.record(z.unknown()),
  }),
});

export const ProposeTradeInputSchema = z.object({
  fromPlayerId: UUIDSchema,
  toPlayerId: UUIDSchema,
  offeredMoney: z.number().int().min(0),
  requestedMoney: z.number().int().min(0),
  offeredProperties: z.array(UUIDSchema),
  requestedProperties: z.array(UUIDSchema),
  offeredGetOutOfJailFree: z.number().int().min(0).max(2),
  requestedGetOutOfJailFree: z.number().int().min(0).max(2),
});

export const RespondTradeInputSchema = z.object({
  tradeId: UUIDSchema,
  accept: z.boolean(),
});

export const ChatMessageInputSchema = z.object({
  text: z.string().min(1).max(500),
});

export const SyncRequestInputSchema = z.object({
  gameId: UUIDSchema,
});

export const ClientToServerMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('create-lobby'), payload: CreateLobbyInputSchema }),
  z.object({ type: z.literal('join-lobby'), payload: JoinLobbyInputSchema }),
  z.object({ type: z.literal('leave-lobby'), payload: z.undefined() }),
  z.object({ type: z.literal('start-game'), payload: z.undefined() }),
  z.object({ type: z.literal('make-move'), payload: MoveInputSchema }),
  z.object({ type: z.literal('propose-trade'), payload: ProposeTradeInputSchema }),
  z.object({ type: z.literal('respond-trade'), payload: RespondTradeInputSchema }),
  z.object({ type: z.literal('chat-message'), payload: ChatMessageInputSchema }),
  z.object({ type: z.literal('sync-request'), payload: SyncRequestInputSchema }),
  z.object({ type: z.literal('heartbeat'), payload: z.undefined() }),
]);

// ============================================
// Server -> Client Messages
// ============================================

export const ErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const ServerToClientMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('lobby-created'), payload: z.object({ lobby: LobbySchema }) }),
  z.object({ type: z.literal('lobby-updated'), payload: z.object({ lobby: LobbySchema }) }),
  z.object({ type: z.literal('player-joined'), payload: z.object({ player: LobbyPlayerSchema }) }),
  z.object({ type: z.literal('player-left'), payload: z.object({ playerId: UUIDSchema }) }),
  z.object({ type: z.literal('game-started'), payload: z.object({ gameState: GameStateSchema }) }),
  z.object({ type: z.literal('game-state-update'), payload: z.object({ gameState: GameStateSchema }) }),
  z.object({ type: z.literal('move-made'), payload: z.object({ move: z.object({
    id: UUIDSchema,
    playerId: UUIDSchema,
    turn: z.number().int(),
    phase: z.nativeEnum(GamePhaseEnum),
    action: z.nativeEnum(PlayerActionEnum),
    data: z.record(z.unknown()),
    timestamp: z.number().int(),
  }), gameState: GameStateSchema }) }),
  z.object({ type: z.literal('trade-proposed'), payload: z.object({ trade: TradeOfferSchema }) }),
  z.object({ type: z.literal('trade-resolved'), payload: z.object({ tradeId: UUIDSchema, accepted: z.boolean() }) }),
  z.object({ type: z.literal('auction-started'), payload: z.object({ auction: AuctionSchema }) }),
  z.object({ type: z.literal('auction-bid'), payload: z.object({ auctionId: UUIDSchema, bidderId: UUIDSchema, amount: z.number().int() }) }),
  z.object({ type: z.literal('auction-ended'), payload: z.object({ auctionId: UUIDSchema, winnerId: UUIDSchema.nullable(), amount: z.number().int() }) }),
  z.object({ type: z.literal('player-eliminated'), payload: z.object({ playerId: UUIDSchema }) }),
  z.object({ type: z.literal('game-ended'), payload: z.object({ winnerId: UUIDSchema, finalState: GameStateSchema }) }),
  z.object({ type: z.literal('chat-message'), payload: z.object({ playerId: UUIDSchema, playerName: z.string(), text: z.string(), timestamp: z.number().int() }) }),
  z.object({ type: z.literal('error'), payload: ErrorPayloadSchema }),
  z.object({ type: z.literal('sync-response'), payload: z.object({ gameState: GameStateSchema }) }),
  z.object({ type: z.literal('heartbeat-ack'), payload: z.undefined() }),
]);

// ============================================
// Type Exports
// ============================================

export type CreateLobbyInput = z.infer<typeof CreateLobbyInputSchema>;
export type JoinLobbyInput = z.infer<typeof JoinLobbyInputSchema>;
export type MoveInput = z.infer<typeof MoveInputSchema>;
export type ProposeTradeInput = z.infer<typeof ProposeTradeInputSchema>;
export type RespondTradeInput = z.infer<typeof RespondTradeInputSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;
export type SyncRequestInput = z.infer<typeof SyncRequestInputSchema>;

export type ClientToServerMessage = z.infer<typeof ClientToServerMessageSchema>;
export type ServerToClientMessage = z.infer<typeof ServerToClientMessageSchema>;

// ============================================
// Message Creators (Client)
// ============================================

export function createCreateLobbyMessage(payload: CreateLobbyInput): ClientToServerMessage {
  return { type: 'create-lobby', payload };
}

export function createJoinLobbyMessage(payload: JoinLobbyInput): ClientToServerMessage {
  return { type: 'join-lobby', payload };
}

export function createLeaveLobbyMessage(): ClientToServerMessage {
  return { type: 'leave-lobby', payload: undefined };
}

export function createStartGameMessage(): ClientToServerMessage {
  return { type: 'start-game', payload: undefined };
}

export function createMakeMoveMessage(move: Omit<Move, 'id' | 'timestamp'>): ClientToServerMessage {
  return { type: 'make-move', payload: { move } };
}

export function createProposeTradeMessage(payload: ProposeTradeInput): ClientToServerMessage {
  return { type: 'propose-trade', payload };
}

export function createRespondTradeMessage(tradeId: UUID, accept: boolean): ClientToServerMessage {
  return { type: 'respond-trade', payload: { tradeId, accept } };
}

export function createChatMessageMessage(text: string): ClientToServerMessage {
  return { type: 'chat-message', payload: { text } };
}

export function createSyncRequestMessage(gameId: UUID): ClientToServerMessage {
  return { type: 'sync-request', payload: { gameId } };
}

export function createHeartbeatMessage(): ClientToServerMessage {
  return { type: 'heartbeat', payload: undefined };
}

// ============================================
// Message Creators (Server)
// ============================================

export function createLobbyCreatedMessage(lobby: Lobby): ServerToClientMessage {
  return { type: 'lobby-created', payload: { lobby } };
}

export function createLobbyUpdatedMessage(lobby: Lobby): ServerToClientMessage {
  return { type: 'lobby-updated', payload: { lobby } };
}

export function createPlayerJoinedMessage(player: LobbyPlayer): ServerToClientMessage {
  return { type: 'player-joined', payload: { player } };
}

export function createPlayerLeftMessage(playerId: UUID): ServerToClientMessage {
  return { type: 'player-left', payload: { playerId } };
}

export function createGameStartedMessage(gameState: GameState): ServerToClientMessage {
  return { type: 'game-started', payload: { gameState } };
}

export function createGameStateUpdateMessage(gameState: GameState): ServerToClientMessage {
  return { type: 'game-state-update', payload: { gameState } };
}

export function createMoveMadeMessage(move: Move, gameState: GameState): ServerToClientMessage {
  return { type: 'move-made', payload: { move, gameState } };
}

export function createTradeProposedMessage(trade: TradeOffer): ServerToClientMessage {
  return { type: 'trade-proposed', payload: { trade } };
}

export function createTradeResolvedMessage(tradeId: UUID, accepted: boolean): ServerToClientMessage {
  return { type: 'trade-resolved', payload: { tradeId, accepted } };
}

export function createAuctionStartedMessage(auction: Auction): ServerToClientMessage {
  return { type: 'auction-started', payload: { auction } };
}

export function createAuctionBidMessage(auctionId: UUID, bidderId: UUID, amount: number): ServerToClientMessage {
  return { type: 'auction-bid', payload: { auctionId, bidderId, amount } };
}

export function createAuctionEndedMessage(auctionId: UUID, winnerId: UUID | null, amount: number): ServerToClientMessage {
  return { type: 'auction-ended', payload: { auctionId, winnerId, amount } };
}

export function createPlayerEliminatedMessage(playerId: UUID): ServerToClientMessage {
  return { type: 'player-eliminated', payload: { playerId } };
}

export function createGameEndedMessage(winnerId: UUID, finalState: GameState): ServerToClientMessage {
  return { type: 'game-ended', payload: { winnerId, finalState } };
}

export function createChatMessageMessage(playerId: UUID, playerName: string, text: string): ServerToClientMessage {
  return { type: 'chat-message', payload: { playerId, playerName, text, timestamp: Date.now() } };
}

export function createErrorMessage(code: string, message: string, details?: Record<string, unknown>): ServerToClientMessage {
  return { type: 'error', payload: { code, message, details } };
}

export function createSyncResponseMessage(gameState: GameState): ServerToClientMessage {
  return { type: 'sync-response', payload: { gameState } };
}

export function createHeartbeatAckMessage(): ServerToClientMessage {
  return { type: 'heartbeat-ack', payload: undefined };
}

// ============================================
// Validation Helpers
// ============================================

export function validateClientMessage(data: unknown): { success: true; message: ClientToServerMessage } | { success: false; error: z.ZodError } {
  const result = ClientToServerMessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, message: result.data };
  }
  return { success: false, error: result.error };
}

export function validateServerMessage(data: unknown): { success: true; message: ServerToClientMessage } | { success: false; error: z.ZodError } {
  const result = ServerToClientMessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, message: result.data };
  }
  return { success: false, error: result.error };
}

// ============================================
// Event Names (for Socket.io)
// ============================================

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECTING: 'reconnecting',
  RECONNECT_FAILED: 'reconnect_failed',

  // Client -> Server
  CREATE_LOBBY: 'create-lobby',
  JOIN_LOBBY: 'join-lobby',
  LEAVE_LOBBY: 'leave-lobby',
  START_GAME: 'start-game',
  MAKE_MOVE: 'make-move',
  PROPOSE_TRADE: 'propose-trade',
  RESPOND_TRADE: 'respond-trade',
  CHAT_MESSAGE: 'chat-message',
  SYNC_REQUEST: 'sync-request',
  HEARTBEAT: 'heartbeat',

  // Server -> Client
  LOBBY_CREATED: 'lobby-created',
  LOBBY_UPDATED: 'lobby-updated',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  GAME_STARTED: 'game-started',
  GAME_STATE_UPDATE: 'game-state-update',
  MOVE_MADE: 'move-made',
  TRADE_PROPOSED: 'trade-proposed',
  TRADE_RESOLVED: 'trade-resolved',
  AUCTION_STARTED: 'auction-started',
  AUCTION_BID: 'auction-bid',
  AUCTION_ENDED: 'auction-ended',
  PLAYER_ELIMINATED: 'player-eliminated',
  GAME_ENDED: 'game-ended',
  CHAT_MESSAGE_RECEIVED: 'chat-message',
  ERROR: 'error',
  SYNC_RESPONSE: 'sync-response',
  HEARTBEAT_ACK: 'heartbeat-ack',
} as const;

// ============================================
// Room Names
// ============================================

export function getLobbyRoom(lobbyId: UUID): string {
  return `lobby:${lobbyId}`;
}

export function getGameRoom(gameId: UUID): string {
  return `game:${gameId}`;
}

export function getUserRoom(userId: UUID): string {
  return `user:${userId}`;
}

export const GLOBAL_ROOM = 'global';

// ============================================
// Connection State
// ============================================

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

export interface ConnectionInfo {
  state: ConnectionState;
  socketId?: string;
  userId?: UUID;
  lobbyId?: UUID;
  gameId?: UUID;
  lastHeartbeat: number;
  reconnectAttempts: number;
}