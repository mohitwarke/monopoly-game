// Shared TypeScript Types

import { z } from 'zod';
import {
  PropertyType,
  PropertyGroup,
  CardType,
  GamePhase,
  PlayerAction,
  AIDifficulty,
  LobbyStatus,
  TournamentFormat,
  TournamentStatus,
  MatchStatus,
  PluginType,
} from './constants';

// ============================================
// Base Types
// ============================================

export type UUID = string & { readonly __brand: unique symbol };
export type LobbyCode = string & { readonly __brand: unique symbol };

export function createUUID(): UUID {
  return crypto.randomUUID() as UUID;
}

export function createLobbyCode(): LobbyCode {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code as LobbyCode;
}

// ============================================
// Game State Types
// ============================================

export interface Position {
  x: number;
  y: number;
}

export interface DiceRoll {
  die1: number;
  die2: number;
  isDouble: boolean;
  total: number;
}

export interface Player {
  id: UUID;
  userId?: UUID; // undefined for AI players
  name: string;
  color: string;
  money: number;
  position: number;
  properties: UUID[]; // Property IDs owned
  inJail: boolean;
  jailTurns: number;
  getOutOfJailFreeCards: number; // Chance + Community Chest
  isBankrupt: boolean;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  // Computed
  netWorth: number;
}

export interface Property {
  id: UUID;
  boardPosition: number;
  name: string;
  type: PropertyType;
  group: PropertyGroup | null;
  price: number;
  mortgageValue: number;
  rent: number[]; // Index 0 = base, 1-4 = houses, 5 = hotel
  houseCost: number;
  ownerId: UUID | null;
  houses: number; // 0-4, 5 = hotel
  isMortgaged: boolean;
}

export interface Card {
  id: string;
  type: CardType;
  text: string;
  action: CardAction;
}

export type CardAction =
  | { type: 'advanceTo'; target: number; collectGo?: boolean }
  | { type: 'advanceToNearest'; targetType: PropertyType; multiplier: number }
  | { type: 'moveRelative'; spaces: number }
  | { type: 'goToJail' }
  | { type: 'receiveMoney'; amount: number }
  | { type: 'payMoney'; amount: number }
  | { type: 'receiveFromEachPlayer'; amount: number }
  | { type: 'payEachPlayer'; amount: number }
  | { type: 'payPerHouseHotel'; perHouse: number; perHotel: number }
  | { type: 'getOutOfJailFree' };

export interface TradeOffer {
  id: UUID;
  fromPlayerId: UUID;
  toPlayerId: UUID;
  offeredMoney: number;
  requestedMoney: number;
  offeredProperties: UUID[];
  requestedProperties: UUID[];
  offeredGetOutOfJailFree: number;
  requestedGetOutOfJailFree: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: number;
  expiresAt: number;
}

export interface Auction {
  id: UUID;
  propertyId: UUID;
  currentBid: number;
  currentBidderId: UUID | null;
  bidders: UUID[]; // Players still in auction
  startedAt: number;
  endsAt: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Move {
  id: UUID;
  playerId: UUID;
  turn: number;
  phase: GamePhase;
  action: PlayerAction;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface GameState {
  id: UUID;
  lobbyId?: UUID;
  phase: GamePhase;
  rulesConfig: RulesConfig;
  board: Property[];
  players: Player[];
  currentPlayerIndex: number;
  turn: number;
  diceRoll?: DiceRoll;
  doublesCount: number;
  chanceDeck: Card[];
  communityChestDeck: Card[];
  chanceDiscard: Card[];
  communityChestDiscard: Card[];
  freeParkingJackpot: number;
  activeTrade?: TradeOffer;
  activeAuction?: Auction;
  pendingJailDecisionPlayerId?: UUID;
  winnerId?: UUID;
  moveLog: Move[];
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

// ============================================
// Rules Configuration
// ============================================

export interface RulesConfig {
  // Economy
  startingMoney: number;
  goSalary: number;
  incomeTaxAmount: number;
  luxuryTaxAmount: number;
  freeParkingJackpot: boolean;
  freeParkingCollectsTaxes: boolean;

  // Property
  auctionOnDecline: boolean;
  mustBuildEvenly: boolean;
  sellHousesAtHalfPrice: boolean;
  mortgageInterestRate: number; // 0.1 = 10%

  // Jail
  maxJailTurns: number;
  doubleRollGetsOutOfJail: boolean;
  bailAmount: number;

  // Building
  housesPerHotel: number;
  maxHouses: number;
  maxHotels: number;

  // Trading
  allowTrading: boolean;
  allowTradingWhileInJail: boolean;
  tradeRequiresApproval: boolean;

  // Winning
  bankruptcyOnly: boolean;
  maxTurns?: number;
  timeLimitMinutes?: number;
  wealthThreshold?: number;

  // Custom Rules (House Rules)
  customRules: CustomRule[];
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  category: 'economy' | 'property' | 'jail' | 'trading' | 'winning' | 'custom';
  enabled: boolean;
  config: Record<string, unknown>;
}

export const DEFAULT_RULES_CONFIG: RulesConfig = {
  startingMoney: 1500,
  goSalary: 200,
  incomeTaxAmount: 200,
  luxuryTaxAmount: 100,
  freeParkingJackpot: false,
  freeParkingCollectsTaxes: false,
  auctionOnDecline: true,
  mustBuildEvenly: true,
  sellHousesAtHalfPrice: true,
  mortgageInterestRate: 0.1,
  maxJailTurns: 3,
  doubleRollGetsOutOfJail: true,
  bailAmount: 50,
  housesPerHotel: 4,
  maxHouses: 32,
  maxHotels: 12,
  allowTrading: true,
  allowTradingWhileInJail: true,
  tradeRequiresApproval: true,
  bankruptcyOnly: true,
  customRules: [],
};

// ============================================
// Lobby Types
// ============================================

export interface Lobby {
  id: UUID;
  code: LobbyCode;
  hostId: UUID;
  name: string;
  isPrivate: boolean;
  maxPlayers: number;
  rulesConfig: RulesConfig;
  status: LobbyStatus;
  players: LobbyPlayer[];
  gameId?: UUID;
  createdAt: number;
  updatedAt: number;
}

export interface LobbyPlayer {
  id: UUID;
  userId?: UUID;
  name: string;
  color: string;
  playerIndex: number;
  isReady: boolean;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  joinedAt: number;
}

export interface CreateLobbyInput {
  name: string;
  isPrivate: boolean;
  maxPlayers: number;
  rulesConfig?: Partial<RulesConfig>;
}

export interface JoinLobbyInput {
  code: LobbyCode;
  name: string;
  isAI?: boolean;
  aiDifficulty?: AIDifficulty;
}

// ============================================
// Tournament Types
// ============================================

export interface Tournament {
  id: UUID;
  name: string;
  format: TournamentFormat;
  rulesConfig: RulesConfig;
  status: TournamentStatus;
  maxPlayers: number;
  currentRound: number;
  participants: TournamentParticipant[];
  matches: Match[];
  startedAt?: number;
  endedAt?: number;
  createdAt: number;
}

export interface TournamentParticipant {
  id: UUID;
  tournamentId: UUID;
  userId: UUID;
  seed?: number;
  eliminatedAt?: number;
  finalRank?: number;
}

export interface Match {
  id: UUID;
  tournamentId: UUID;
  round: number;
  player1Id: UUID;
  player2Id: UUID;
  gameId?: UUID;
  winnerId?: UUID;
  status: MatchStatus;
  scheduledAt?: number;
  startedAt?: number;
  endedAt?: number;
}

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: UUID;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl?: string;
  rating: number;
  ratingDeviation: number;
  volatility: number;
  createdAt: number;
  updatedAt: number;
}

export interface Device {
  id: UUID;
  userId: UUID;
  name: string;
  platform: string;
  token: string;
  lastSeen: number;
  createdAt: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================
// Plugin Types
// ============================================

export interface PluginManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  type: PluginType;
  entry: string;
  apiVersion: string;
  permissions: PluginPermission[];
  dependencies?: Record<string, string>;
}

export type PluginPermission =
  | 'board:render'
  | 'board:modify'
  | 'pieces:render'
  | 'pieces:modify'
  | 'rules:read'
  | 'rules:modify'
  | 'ai:read'
  | 'ai:modify'
  | 'assets:load'
  | 'storage:read'
  | 'storage:write'
  | 'network:request';

export interface Plugin {
  id: UUID;
  userId: UUID;
  name: string;
  version: string;
  type: PluginType;
  manifest: PluginManifest;
  code: string; // Source code
  isPublic: boolean;
  downloads: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================
// Replay Types
// ============================================

export interface Replay {
  id: UUID;
  gameId: UUID;
  initialState: GameState;
  moves: Move[];
  views: number;
  createdAt: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// WebSocket Message Types
// ============================================

export type ClientToServerMessage =
  | { type: 'create-lobby'; payload: CreateLobbyInput }
  | { type: 'join-lobby'; payload: JoinLobbyInput }
  | { type: 'leave-lobby' }
  | { type: 'start-game' }
  | { type: 'make-move'; payload: { move: Omit<Move, 'id' | 'timestamp'> } }
  | { type: 'propose-trade'; payload: Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'expiresAt'> }
  | { type: 'respond-trade'; payload: { tradeId: UUID; accept: boolean } }
  | { type: 'chat-message'; payload: { text: string } }
  | { type: 'sync-request'; payload: { gameId: UUID } }
  | { type: 'heartbeat' };

export type ServerToClientMessage =
  | { type: 'lobby-created'; payload: { lobby: Lobby } }
  | { type: 'lobby-updated'; payload: { lobby: Lobby } }
  | { type: 'player-joined'; payload: { player: LobbyPlayer } }
  | { type: 'player-left'; payload: { playerId: UUID } }
  | { type: 'game-started'; payload: { gameState: GameState } }
  | { type: 'game-state-update'; payload: { gameState: GameState } }
  | { type: 'move-made'; payload: { move: Move; gameState: GameState } }
  | { type: 'trade-proposed'; payload: { trade: TradeOffer } }
  | { type: 'trade-resolved'; payload: { tradeId: UUID; accepted: boolean } }
  | { type: 'auction-started'; payload: { auction: Auction } }
  | { type: 'auction-bid'; payload: { auctionId: UUID; bidderId: UUID; amount: number } }
  | { type: 'auction-ended'; payload: { auctionId: UUID; winnerId: UUID | null; amount: number } }
  | { type: 'player-eliminated'; payload: { playerId: UUID } }
  | { type: 'game-ended'; payload: { winnerId: UUID; finalState: GameState } }
  | { type: 'chat-message'; payload: { playerId: UUID; playerName: string; text: string; timestamp: number } }
  | { type: 'error'; payload: ApiError }
  | { type: 'sync-response'; payload: { gameState: GameState } }
  | { type: 'heartbeat-ack' };

// ============================================
// Zod Schemas for Validation
// ============================================

export const DiceRollSchema = z.object({
  die1: z.number().min(1).max(6),
  die2: z.number().min(1).max(6),
  isDouble: z.boolean(),
  total: z.number().min(2).max(12),
});

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  name: z.string().min(1).max(32),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  money: z.number().int().min(0),
  position: z.number().int().min(0).max(39),
  properties: z.array(z.string().uuid()),
  inJail: z.boolean(),
  jailTurns: z.number().int().min(0).max(3),
  getOutOfJailFreeCards: z.number().int().min(0).max(2),
  isBankrupt: z.boolean(),
  isAI: z.boolean(),
  aiDifficulty: z.nativeEnum(AIDifficulty).optional(),
  netWorth: z.number().int().min(0),
});

export const PropertySchema = z.object({
  id: z.string().uuid(),
  boardPosition: z.number().int().min(0).max(39),
  name: z.string(),
  type: z.nativeEnum(PropertyType),
  group: z.nativeEnum(PropertyGroup).nullable(),
  price: z.number().int().min(0),
  mortgageValue: z.number().int().min(0),
  rent: z.array(z.number().int().min(0)).length(6),
  houseCost: z.number().int().min(0),
  ownerId: z.string().uuid().nullable(),
  houses: z.number().int().min(0).max(5),
  isMortgaged: z.boolean(),
});

export const GameStateSchema = z.object({
  id: z.string().uuid(),
  lobbyId: z.string().uuid().optional(),
  phase: z.nativeEnum(GamePhase),
  rulesConfig: z.any(), // Complex, validate separately
  board: z.array(PropertySchema),
  players: z.array(PlayerSchema),
  currentPlayerIndex: z.number().int().min(0).max(7),
  turn: z.number().int().min(0),
  diceRoll: DiceRollSchema.optional(),
  doublesCount: z.number().int().min(0).max(3),
  chanceDeck: z.array(z.any()),
  communityChestDeck: z.array(z.any()),
  chanceDiscard: z.array(z.any()),
  communityChestDiscard: z.array(z.any()),
  freeParkingJackpot: z.number().int().min(0),
  activeTrade: z.any().optional(),
  activeAuction: z.any().optional(),
  pendingJailDecisionPlayerId: z.string().uuid().optional(),
  winnerId: z.string().uuid().optional(),
  moveLog: z.array(z.any()),
  createdAt: z.number().int(),
  startedAt: z.number().int().optional(),
  endedAt: z.number().int().optional(),
});

export const CreateLobbyInputSchema = z.object({
  name: z.string().min(1).max(64),
  isPrivate: z.boolean(),
  maxPlayers: z.number().int().min(2).max(8),
  rulesConfig: z.any().optional(),
});

export const JoinLobbyInputSchema = z.object({
  code: z.string().length(6).regex(/^[A-Z0-9]+$/),
  name: z.string().min(1).max(32),
  isAI: z.boolean().optional(),
  aiDifficulty: z.nativeEnum(AIDifficulty).optional(),
});

// Type inference helpers
export type DiceRollInput = z.infer<typeof DiceRollSchema>;
export type PlayerInput = z.infer<typeof PlayerSchema>;
export type PropertyInput = z.infer<typeof PropertySchema>;
export type GameStateInput = z.infer<typeof GameStateSchema>;
export type CreateLobbyInputValidated = z.infer<typeof CreateLobbyInputSchema>;
export type JoinLobbyInputValidated = z.infer<typeof JoinLobbyInputSchema>;