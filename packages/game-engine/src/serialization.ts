// Serialization - Game state serialization for replay, sync, and storage

import type { GameState, Move, Player, Property, Card, TradeOffer, Auction, RulesConfig, UUID, DiceRoll } from '@monopoly/shared';
import { GamePhase, PlayerAction, PropertyType, PropertyGroup, CardType } from '@monopoly/shared';

/**
 * Serialized Game State - Compact format for storage/transfer
 */
export interface SerializedGameState {
  v: number; // Version
  id: string;
  lobbyId?: string;
  phase: number; // GamePhase enum index
  rules: SerializedRulesConfig;
  board: SerializedProperty[];
  players: SerializedPlayer[];
  currentPlayerIndex: number;
  turn: number;
  diceRoll?: SerializedDiceRoll;
  doublesCount: number;
  chanceDeck: string[]; // Card IDs
  communityChestDeck: string[];
  chanceDiscard: string[];
  communityChestDiscard: string[];
  freeParkingJackpot: number;
  activeTrade?: SerializedTradeOffer;
  activeAuction?: SerializedAuction;
  pendingJailDecisionPlayerId?: string;
  winnerId?: string;
  moveLog: SerializedMove[];
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface SerializedRulesConfig {
  startingMoney: number;
  goSalary: number;
  incomeTaxAmount: number;
  luxuryTaxAmount: number;
  freeParkingJackpot: boolean;
  freeParkingCollectsTaxes: boolean;
  auctionOnDecline: boolean;
  mustBuildEvenly: boolean;
  sellHousesAtHalfPrice: boolean;
  mortgageInterestRate: number;
  maxJailTurns: number;
  doubleRollGetsOutOfJail: boolean;
  bailAmount: number;
  housesPerHotel: number;
  maxHouses: number;
  maxHotels: number;
  allowTrading: boolean;
  allowTradingWhileInJail: boolean;
  tradeRequiresApproval: boolean;
  bankruptcyOnly: boolean;
  maxTurns?: number;
  timeLimitMinutes?: number;
  wealthThreshold?: number;
  customRules: SerializedCustomRule[];
}

export interface SerializedCustomRule {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface SerializedProperty {
  id: string;
  pos: number; // boardPosition
  name: string;
  type: number; // PropertyType enum index
  group: number | null; // PropertyGroup enum index
  price: number;
  mortgageValue: number;
  rent: number[];
  houseCost: number;
  ownerId: string | null;
  houses: number;
  mortgaged: boolean;
}

export interface SerializedPlayer {
  id: string;
  userId?: string;
  name: string;
  color: string;
  money: number;
  pos: number; // position
  properties: string[]; // Property IDs
  inJail: boolean;
  jailTurns: number;
  goojfCards: number; // Get Out of Jail Free cards
  bankrupt: boolean;
  isAI: boolean;
  aiDifficulty?: number; // AIDifficulty enum index
  netWorth: number;
}

export interface SerializedDiceRoll {
  d1: number;
  d2: number;
  double: boolean;
  total: number;
}

export interface SerializedMove {
  id: string;
  playerId: string;
  turn: number;
  phase: number;
  action: number; // PlayerAction enum index
  data: Record<string, unknown>;
  timestamp: number;
}

export interface SerializedTradeOffer {
  id: string;
  from: string;
  to: string;
  offeredMoney: number;
  requestedMoney: number;
  offeredProps: string[];
  requestedProps: string[];
  offeredGOOJF: number;
  requestedGOOJF: number;
  status: string;
  createdAt: number;
  expiresAt: number;
}

export interface SerializedAuction {
  id: string;
  propertyId: string;
  currentBid: number;
  currentBidderId: string | null;
  bidders: string[];
  startedAt: number;
  endsAt: number;
  status: string;
}

/**
 * Serialize GameState to compact format
 */
export function serializeGameState(state: GameState): SerializedGameState {
  return {
    v: 1,
    id: state.id,
    lobbyId: state.lobbyId,
    phase: Object.values(GamePhase).indexOf(state.phase),
    rules: serializeRulesConfig(state.rulesConfig),
    board: state.board.map(serializeProperty),
    players: state.players.map(serializePlayer),
    currentPlayerIndex: state.currentPlayerIndex,
    turn: state.turn,
    diceRoll: state.diceRoll ? serializeDiceRoll(state.diceRoll) : undefined,
    doublesCount: state.doublesCount,
    chanceDeck: state.chanceDeck.map(c => c.id),
    communityChestDeck: state.communityChestDeck.map(c => c.id),
    chanceDiscard: state.chanceDiscard.map(c => c.id),
    communityChestDiscard: state.communityChestDiscard.map(c => c.id),
    freeParkingJackpot: state.freeParkingJackpot,
    activeTrade: state.activeTrade ? serializeTradeOffer(state.activeTrade) : undefined,
    activeAuction: state.activeAuction ? serializeAuction(state.activeAuction) : undefined,
    pendingJailDecisionPlayerId: state.pendingJailDecisionPlayerId,
    winnerId: state.winnerId,
    moveLog: state.moveLog.map(serializeMove),
    createdAt: state.createdAt,
    startedAt: state.startedAt,
    endedAt: state.endedAt,
  };
}

/**
 * Deserialize GameState from compact format
 */
export function deserializeGameState(data: SerializedGameState): GameState {
  return {
    id: data.id,
    lobbyId: data.lobbyId,
    phase: Object.values(GamePhase)[data.phase],
    rulesConfig: deserializeRulesConfig(data.rules),
    board: data.board.map(deserializeProperty),
    players: data.players.map(deserializePlayer),
    currentPlayerIndex: data.currentPlayerIndex,
    turn: data.turn,
    diceRoll: data.diceRoll ? deserializeDiceRoll(data.diceRoll) : undefined,
    doublesCount: data.doublesCount,
    chanceDeck: data.chanceDeck.map(id => ({ id, type: 'chance' as const, text: '', action: { type: 'advanceTo' as const, target: 0 } })),
    communityChestDeck: data.communityChestDeck.map(id => ({ id, type: 'communityChest' as const, text: '', action: { type: 'advanceTo' as const, target: 0 } })),
    chanceDiscard: data.chanceDiscard.map(id => ({ id, type: 'chance' as const, text: '', action: { type: 'advanceTo' as const, target: 0 } })),
    communityChestDiscard: data.communityChestDiscard.map(id => ({ id, type: 'communityChest' as const, text: '', action: { type: 'advanceTo' as const, target: 0 } })),
    freeParkingJackpot: data.freeParkingJackpot,
    activeTrade: data.activeTrade ? deserializeTradeOffer(data.activeTrade) : undefined,
    activeAuction: data.activeAuction ? deserializeAuction(data.activeAuction) : undefined,
    pendingJailDecisionPlayerId: data.pendingJailDecisionPlayerId,
    winnerId: data.winnerId,
    moveLog: data.moveLog.map(deserializeMove),
    createdAt: data.createdAt,
    startedAt: data.startedAt,
    endedAt: data.endedAt,
  };
}

// ============================================
// Individual Serializers
// ============================================

function serializeRulesConfig(config: RulesConfig): SerializedRulesConfig {
  return {
    startingMoney: config.startingMoney,
    goSalary: config.goSalary,
    incomeTaxAmount: config.incomeTaxAmount,
    luxuryTaxAmount: config.luxuryTaxAmount,
    freeParkingJackpot: config.freeParkingJackpot,
    freeParkingCollectsTaxes: config.freeParkingCollectsTaxes,
    auctionOnDecline: config.auctionOnDecline,
    mustBuildEvenly: config.mustBuildEvenly,
    sellHousesAtHalfPrice: config.sellHousesAtHalfPrice,
    mortgageInterestRate: config.mortgageInterestRate,
    maxJailTurns: config.maxJailTurns,
    doubleRollGetsOutOfJail: config.doubleRollGetsOutOfJail,
    bailAmount: config.bailAmount,
    housesPerHotel: config.housesPerHotel,
    maxHouses: config.maxHouses,
    maxHotels: config.maxHotels,
    allowTrading: config.allowTrading,
    allowTradingWhileInJail: config.allowTradingWhileInJail,
    tradeRequiresApproval: config.tradeRequiresApproval,
    bankruptcyOnly: config.bankruptcyOnly,
    maxTurns: config.maxTurns,
    timeLimitMinutes: config.timeLimitMinutes,
    wealthThreshold: config.wealthThreshold,
    customRules: config.customRules.map(serializeCustomRule),
  };
}

function deserializeRulesConfig(data: SerializedRulesConfig): RulesConfig {
  return {
    startingMoney: data.startingMoney,
    goSalary: data.goSalary,
    incomeTaxAmount: data.incomeTaxAmount,
    luxuryTaxAmount: data.luxuryTaxAmount,
    freeParkingJackpot: data.freeParkingJackpot,
    freeParkingCollectsTaxes: data.freeParkingCollectsTaxes,
    auctionOnDecline: data.auctionOnDecline,
    mustBuildEvenly: data.mustBuildEvenly,
    sellHousesAtHalfPrice: data.sellHousesAtHalfPrice,
    mortgageInterestRate: data.mortgageInterestRate,
    maxJailTurns: data.maxJailTurns,
    doubleRollGetsOutOfJail: data.doubleRollGetsOutOfJail,
    bailAmount: data.bailAmount,
    housesPerHotel: data.housesPerHotel,
    maxHouses: data.maxHouses,
    maxHotels: data.maxHotels,
    allowTrading: data.allowTrading,
    allowTradingWhileInJail: data.allowTradingWhileInJail,
    tradeRequiresApproval: data.tradeRequiresApproval,
    bankruptcyOnly: data.bankruptcyOnly,
    maxTurns: data.maxTurns,
    timeLimitMinutes: data.timeLimitMinutes,
    wealthThreshold: data.wealthThreshold,
    customRules: data.customRules.map(deserializeCustomRule),
  };
}

function serializeCustomRule(rule: { id: string; name: string; description: string; category: string; enabled: boolean; config: Record<string, unknown> }): SerializedCustomRule {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description,
    category: rule.category,
    enabled: rule.enabled,
    config: rule.config,
  };
}

function deserializeCustomRule(data: SerializedCustomRule): { id: string; name: string; description: string; category: string; enabled: boolean; config: Record<string, unknown> } {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category,
    enabled: data.enabled,
    config: data.config,
  };
}

function serializeProperty(prop: Property): SerializedProperty {
  return {
    id: prop.id,
    pos: prop.boardPosition,
    name: prop.name,
    type: Object.values(PropertyType).indexOf(prop.type),
    group: prop.group ? Object.values(PropertyGroup).indexOf(prop.group) : null,
    price: prop.price,
    mortgageValue: prop.mortgageValue,
    rent: prop.rent,
    houseCost: prop.houseCost,
    ownerId: prop.ownerId,
    houses: prop.houses,
    mortgaged: prop.isMortgaged,
  };
}

function deserializeProperty(data: SerializedProperty): Property {
  return {
    id: data.id,
    boardPosition: data.pos,
    name: data.name,
    type: Object.values(PropertyType)[data.type],
    group: data.group !== null ? Object.values(PropertyGroup)[data.group] : null,
    price: data.price,
    mortgageValue: data.mortgageValue,
    rent: data.rent,
    houseCost: data.houseCost,
    ownerId: data.ownerId,
    houses: data.houses,
    isMortgaged: data.mortgaged,
  };
}

function serializePlayer(player: Player): SerializedPlayer {
  return {
    id: player.id,
    userId: player.userId,
    name: player.name,
    color: player.color,
    money: player.money,
    pos: player.position,
    properties: player.properties,
    inJail: player.inJail,
    jailTurns: player.jailTurns,
    goojfCards: player.getOutOfJailFreeCards,
    bankrupt: player.isBankrupt,
    isAI: player.isAI,
    aiDifficulty: player.aiDifficulty !== undefined ? Object.values(['easy', 'medium', 'hard', 'expert']).indexOf(player.aiDifficulty) : undefined,
    netWorth: player.netWorth,
  };
}

function deserializePlayer(data: SerializedPlayer): Player {
  return {
    id: data.id,
    userId: data.userId,
    name: data.name,
    color: data.color,
    money: data.money,
    position: data.pos,
    properties: data.properties,
    inJail: data.inJail,
    jailTurns: data.jailTurns,
    getOutOfJailFreeCards: data.goojfCards,
    isBankrupt: data.bankrupt,
    isAI: data.isAI,
    aiDifficulty: data.aiDifficulty !== undefined ? ['easy', 'medium', 'hard', 'expert'][data.aiDifficulty] as 'easy' | 'medium' | 'hard' | 'expert' : undefined,
    netWorth: data.netWorth,
  };
}

function serializeDiceRoll(roll: DiceRoll): SerializedDiceRoll {
  return {
    d1: roll.die1,
    d2: roll.die2,
    double: roll.isDouble,
    total: roll.total,
  };
}

function deserializeDiceRoll(data: SerializedDiceRoll): DiceRoll {
  return {
    die1: data.d1,
    die2: data.d2,
    isDouble: data.double,
    total: data.total,
  };
}

function serializeMove(move: Move): SerializedMove {
  return {
    id: move.id,
    playerId: move.playerId,
    turn: move.turn,
    phase: Object.values(GamePhase).indexOf(move.phase),
    action: Object.values(PlayerAction).indexOf(move.action),
    data: move.data,
    timestamp: move.timestamp,
  };
}

function deserializeMove(data: SerializedMove): Move {
  return {
    id: data.id,
    playerId: data.playerId,
    turn: data.turn,
    phase: Object.values(GamePhase)[data.phase],
    action: Object.values(PlayerAction)[data.action],
    data: data.data,
    timestamp: data.timestamp,
  };
}

function serializeTradeOffer(trade: TradeOffer): SerializedTradeOffer {
  return {
    id: trade.id,
    from: trade.fromPlayerId,
    to: trade.toPlayerId,
    offeredMoney: trade.offeredMoney,
    requestedMoney: trade.requestedMoney,
    offeredProps: trade.offeredProperties,
    requestedProps: trade.requestedProperties,
    offeredGOOJF: trade.offeredGetOutOfJailFree,
    requestedGOOJF: trade.requestedGetOutOfJailFree,
    status: trade.status,
    createdAt: trade.createdAt,
    expiresAt: trade.expiresAt,
  };
}

function deserializeTradeOffer(data: SerializedTradeOffer): TradeOffer {
  return {
    id: data.id,
    fromPlayerId: data.from,
    toPlayerId: data.to,
    offeredMoney: data.offeredMoney,
    requestedMoney: data.requestedMoney,
    offeredProperties: data.offeredProps,
    requestedProperties: data.requestedProps,
    offeredGetOutOfJailFree: data.offeredGOOJF,
    requestedGetOutOfJailFree: data.requestedGOOJF,
    status: data.status as TradeOffer['status'],
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
  };
}

function serializeAuction(auction: Auction): SerializedAuction {
  return {
    id: auction.id,
    propertyId: auction.propertyId,
    currentBid: auction.currentBid,
    currentBidderId: auction.currentBidderId,
    bidders: auction.bidders,
    startedAt: auction.startedAt,
    endsAt: auction.endsAt,
    status: auction.status,
  };
}

function deserializeAuction(data: SerializedAuction): Auction {
  return {
    id: data.id,
    propertyId: data.propertyId,
    currentBid: data.currentBid,
    currentBidderId: data.currentBidderId,
    bidders: data.bidders,
    startedAt: data.startedAt,
    endsAt: data.endsAt,
    status: data.status as Auction['status'],
  };
}

/**
 * Compress serialized state for storage (using JSON + compression)
 */
export function compressGameState(state: SerializedGameState): Uint8Array {
  const json = JSON.stringify(state);
  // In production, use a compression library like lz-string or pako
  // For now, just return UTF-8 bytes
  return new TextEncoder().encode(json);
}

/**
 * Decompress game state
 */
export function decompressGameState(data: Uint8Array): SerializedGameState {
  const json = new TextDecoder().decode(data);
  return JSON.parse(json);
}

/**
 * Create a replay file format
 */
export interface ReplayFile {
  version: number;
  gameId: string;
  initialState: SerializedGameState;
  moves: SerializedMove[];
  metadata: {
    createdAt: number;
    duration: number;
    winnerId?: string;
    playerNames: string[];
  };
}

export function createReplayFile(gameState: GameState): ReplayFile {
  const serialized = serializeGameState(gameState);
  return {
    version: 1,
    gameId: gameState.id,
    initialState: {
      ...serialized,
      moveLog: [], // Initial state has no moves
    },
    moves: serialized.moveLog,
    metadata: {
      createdAt: gameState.createdAt,
      duration: (gameState.endedAt ?? Date.now()) - (gameState.startedAt ?? gameState.createdAt),
      winnerId: gameState.winnerId,
      playerNames: gameState.players.map(p => p.name),
    },
  };
}

export function serializeReplayFile(replay: ReplayFile): string {
  return JSON.stringify(replay);
}

export function deserializeReplayFile(json: string): ReplayFile {
  return JSON.parse(json);
}

/**
 * Replay a game from replay file
 */
export function replayGame(replay: ReplayFile): GameState[] {
  const states: GameState[] = [];
  let currentState = deserializeGameState(replay.initialState);
  states.push(currentState);

  for (const move of replay.moves) {
    // Apply move (would use GameEngine in practice)
    // This is a simplified version
    currentState = { ...currentState }; // Clone
    states.push(currentState);
  }

  return states;
}

/**
 * Delta compression for real-time sync
 */
export interface StateDelta {
  version: number;
  timestamp: number;
  changes: StateChange[];
}

export type StateChange =
  | { type: 'playerMoney'; playerId: string; money: number; netWorth: number }
  | { type: 'playerPosition'; playerId: string; position: number }
  | { type: 'playerJail'; playerId: string; inJail: boolean; jailTurns: number }
  | { type: 'propertyOwner'; propertyId: string; ownerId: string | null }
  | { type: 'propertyHouses'; propertyId: string; houses: number }
  | { type: 'propertyMortgaged'; propertyId: string; mortgaged: boolean }
  | { type: 'phase'; phase: number }
  | { type: 'currentPlayer'; index: number }
  | { type: 'turn'; turn: number }
  | { type: 'diceRoll'; roll: SerializedDiceRoll | null }
  | { type: 'doublesCount'; count: number }
  | { type: 'freeParkingJackpot'; amount: number }
  | { type: 'trade'; trade: SerializedTradeOffer | null }
  | { type: 'auction'; auction: SerializedAuction | null }
  | { type: 'winner'; winnerId: string | null }
  | { type: 'move'; move: SerializedMove };

/**
 * Compute delta between two game states
 */
export function computeStateDelta(oldState: GameState, newState: GameState): StateDelta {
  const changes: StateChange[] = [];

  // Player changes
  for (let i = 0; i < newState.players.length; i++) {
    const oldPlayer = oldState.players[i];
    const newPlayer = newState.players[i];
    if (!oldPlayer || !newPlayer) continue;

    if (oldPlayer.money !== newPlayer.money || oldPlayer.netWorth !== newPlayer.netWorth) {
      changes.push({ type: 'playerMoney', playerId: newPlayer.id, money: newPlayer.money, netWorth: newPlayer.netWorth });
    }
    if (oldPlayer.position !== newPlayer.position) {
      changes.push({ type: 'playerPosition', playerId: newPlayer.id, position: newPlayer.position });
    }
    if (oldPlayer.inJail !== newPlayer.inJail || oldPlayer.jailTurns !== newPlayer.jailTurns) {
      changes.push({ type: 'playerJail', playerId: newPlayer.id, inJail: newPlayer.inJail, jailTurns: newPlayer.jailTurns });
    }
  }

  // Property changes
  for (const newProp of newState.board) {
    const oldProp = oldState.board.find(p => p.id === newProp.id);
    if (!oldProp) continue;

    if (oldProp.ownerId !== newProp.ownerId) {
      changes.push({ type: 'propertyOwner', propertyId: newProp.id, ownerId: newProp.ownerId });
    }
    if (oldProp.houses !== newProp.houses) {
      changes.push({ type: 'propertyHouses', propertyId: newProp.id, houses: newProp.houses });
    }
    if (oldProp.isMortgaged !== newProp.isMortgaged) {
      changes.push({ type: 'propertyMortgaged', propertyId: newProp.id, mortgaged: newProp.isMortgaged });
    }
  }

  // Game state changes
  if (oldState.phase !== newState.phase) {
    changes.push({ type: 'phase', phase: Object.values(GamePhase).indexOf(newState.phase) });
  }
  if (oldState.currentPlayerIndex !== newState.currentPlayerIndex) {
    changes.push({ type: 'currentPlayer', index: newState.currentPlayerIndex });
  }
  if (oldState.turn !== newState.turn) {
    changes.push({ type: 'turn', turn: newState.turn });
  }
  if (JSON.stringify(oldState.diceRoll) !== JSON.stringify(newState.diceRoll)) {
    changes.push({ type: 'diceRoll', roll: newState.diceRoll ? serializeDiceRoll(newState.diceRoll) : null });
  }
  if (oldState.doublesCount !== newState.doublesCount) {
    changes.push({ type: 'doublesCount', count: newState.doublesCount });
  }
  if (oldState.freeParkingJackpot !== newState.freeParkingJackpot) {
    changes.push({ type: 'freeParkingJackpot', amount: newState.freeParkingJackpot });
  }
  if (JSON.stringify(oldState.activeTrade) !== JSON.stringify(newState.activeTrade)) {
    changes.push({ type: 'trade', trade: newState.activeTrade ? serializeTradeOffer(newState.activeTrade) : null });
  }
  if (JSON.stringify(oldState.activeAuction) !== JSON.stringify(newState.activeAuction)) {
    changes.push({ type: 'auction', auction: newState.activeAuction ? serializeAuction(newState.activeAuction) : null });
  }
  if (oldState.winnerId !== newState.winnerId) {
    changes.push({ type: 'winner', winnerId: newState.winnerId ?? null });
  }

  // New moves
  const newMoves = newState.moveLog.slice(oldState.moveLog.length);
  for (const move of newMoves) {
    changes.push({ type: 'move', move: serializeMove(move) });
  }

  return {
    version: 1,
    timestamp: Date.now(),
    changes,
  };
}

/**
 * Apply delta to game state
 */
export function applyStateDelta(state: GameState, delta: StateDelta): GameState {
  const newState = { ...state };

  for (const change of delta.changes) {
    switch (change.type) {
      case 'playerMoney': {
        const player = newState.players.find(p => p.id === change.playerId);
        if (player) {
          player.money = change.money;
          player.netWorth = change.netWorth;
        }
        break;
      }
      case 'playerPosition': {
        const player = newState.players.find(p => p.id === change.playerId);
        if (player) player.position = change.position;
        break;
      }
      case 'playerJail': {
        const player = newState.players.find(p => p.id === change.playerId);
        if (player) {
          player.inJail = change.inJail;
          player.jailTurns = change.jailTurns;
        }
        break;
      }
      case 'propertyOwner': {
        const prop = newState.board.find(p => p.id === change.propertyId);
        if (prop) prop.ownerId = change.ownerId;
        break;
      }
      case 'propertyHouses': {
        const prop = newState.board.find(p => p.id === change.propertyId);
        if (prop) prop.houses = change.houses;
        break;
      }
      case 'propertyMortgaged': {
        const prop = newState.board.find(p => p.id === change.propertyId);
        if (prop) prop.isMortgaged = change.mortgaged;
        break;
      }
      case 'phase':
        newState.phase = Object.values(GamePhase)[change.phase];
        break;
      case 'currentPlayer':
        newState.currentPlayerIndex = change.index;
        break;
      case 'turn':
        newState.turn = change.turn;
        break;
      case 'diceRoll':
        newState.diceRoll = change.roll ? deserializeDiceRoll(change.roll) : undefined;
        break;
      case 'doublesCount':
        newState.doublesCount = change.count;
        break;
      case 'freeParkingJackpot':
        newState.freeParkingJackpot = change.amount;
        break;
      case 'trade':
        newState.activeTrade = change.trade ? deserializeTradeOffer(change.trade) : undefined;
        break;
      case 'auction':
        newState.activeAuction = change.auction ? deserializeAuction(change.auction) : undefined;
        break;
      case 'winner':
        newState.winnerId = change.winnerId ?? undefined;
        if (change.winnerId) newState.phase = GamePhase.GAME_OVER;
        break;
      case 'move':
        newState.moveLog.push(deserializeMove(change.move));
        break;
    }
  }

  return newState;
}