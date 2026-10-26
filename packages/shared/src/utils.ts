// Utility Functions

import type { UUID, LobbyCode, DiceRoll, Player, Property, GameState, RulesConfig, DEFAULT_RULES_CONFIG } from './types';
import { GAME_CONSTANTS, PropertyType, PropertyGroup, STANDARD_BOARD, STANDARD_CHANCE_CARDS, STANDARD_COMMUNITY_CHEST_CARDS } from './constants';

/**
 * Generate a cryptographically secure random UUID
 */
export function generateUUID(): UUID {
  return crypto.randomUUID() as UUID;
}

/**
 * Generate a lobby code (6 characters, no confusing chars)
 */
export function generateLobbyCode(): LobbyCode {
  const chars = GAME_CONSTANTS.LOBBY_CODE_CHARS;
  let code = '';
  for (let i = 0; i < GAME_CONSTANTS.LOBBY_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code as LobbyCode;
}

/**
 * Roll two six-sided dice
 */
export function rollDice(): DiceRoll {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return {
    die1,
    die2,
    isDouble: die1 === die2,
    total: die1 + die2,
  };
}

/**
 * Create a seeded random number generator for deterministic replays
 */
export function createSeededRandom(seed: number) {
  let state = seed;
  return function random(): number {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Roll dice with a seeded RNG (for deterministic replays)
 */
export function rollDiceSeeded(random: () => number): DiceRoll {
  const die1 = Math.floor(random() * 6) + 1;
  const die2 = Math.floor(random() * 6) + 1;
  return {
    die1,
    die2,
    isDouble: die1 === die2,
    total: die1 + die2,
  };
}

/**
 * Calculate next position on board (wraps at 40)
 */
export function calculateNextPosition(currentPosition: number, spaces: number): number {
  const newPosition = (currentPosition + spaces) % GAME_CONSTANTS.BOARD_SIZE;
  return newPosition < 0 ? newPosition + GAME_CONSTANTS.BOARD_SIZE : newPosition;
}

/**
 * Check if passing GO (collect salary)
 */
export function didPassGo(fromPosition: number, toPosition: number): boolean {
  if (fromPosition <= toPosition) {
    return fromPosition < GAME_CONSTANTS.GO_POSITION && toPosition >= GAME_CONSTANTS.GO_POSITION;
  }
  // Wrapped around
  return true;
}

/**
 * Create initial game state from rules config
 */
export function createInitialGameState(
  gameId: UUID,
  lobbyId: UUID | undefined,
  players: Player[],
  rulesConfig: RulesConfig
): GameState {
  // Create board properties
  const board: Property[] = STANDARD_BOARD.map((space, index) => ({
    id: generateUUID(),
    boardPosition: index,
    name: space.name,
    type: space.type,
    group: space.group,
    price: space.price,
    mortgageValue: Math.floor(space.price / 2),
    rent: space.rent,
    houseCost: space.houseCost ?? 0,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
  }));

  // Create and shuffle decks
  const chanceDeck = shuffleArray([...STANDARD_CHANCE_CARDS].map(c => ({
    ...c,
    id: `chance-${c.id}`,
    type: 'chance' as const,
  })));

  const communityChestDeck = shuffleArray([...STANDARD_COMMUNITY_CHEST_CARDS].map(c => ({
    ...c,
    id: `cc-${c.id}`,
    type: 'communityChest' as const,
  })));

  return {
    id: gameId,
    lobbyId,
    phase: 'setup',
    rulesConfig,
    board,
    players,
    currentPlayerIndex: 0,
    turn: 0,
    doublesCount: 0,
    chanceDeck,
    communityChestDeck,
    chanceDiscard: [],
    communityChestDiscard: [],
    freeParkingJackpot: 0,
    moveLog: [],
    createdAt: Date.now(),
  };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffle array with seeded RNG
 */
export function shuffleArraySeeded<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Calculate player net worth
 */
export function calculateNetWorth(player: Player, board: Property[]): number {
  let worth = player.money;
  for (const propId of player.properties) {
    const prop = board.find(p => p.id === propId);
    if (prop) {
      worth += prop.price;
      if (prop.houses > 0) {
        worth += prop.houseCost * prop.houses;
      }
      if (prop.isMortgaged) {
        worth -= prop.mortgageValue;
      }
    }
  }
  return worth;
}

/**
 * Get property by board position
 */
export function getPropertyAtPosition(board: Property[], position: number): Property | undefined {
  return board.find(p => p.boardPosition === position);
}

/**
 * Get all properties owned by a player
 */
export function getPlayerProperties(board: Property[], playerId: UUID): Property[] {
  return board.filter(p => p.ownerId === playerId);
}

/**
 * Check if player owns all properties in a group (monopoly)
 */
export function hasMonopoly(board: Property[], playerId: UUID, group: PropertyGroup): boolean {
  const groupProps = board.filter(p => p.group === group && p.type === PropertyType.STREET);
  return groupProps.length > 0 && groupProps.every(p => p.ownerId === playerId);
}

/**
 * Calculate rent for a property
 */
export function calculateRent(property: Property, board: Property[], diceRoll?: DiceRoll): number {
  if (property.isMortgaged || property.ownerId === null) {
    return 0;
  }

  // Utility rent
  if (property.type === PropertyType.UTILITY) {
    const multiplier = hasMonopoly(board, property.ownerId, PropertyGroup.UTILITY) ? 10 : 4;
    return (diceRoll?.total ?? 7) * multiplier;
  }

  // Railroad rent
  if (property.type === PropertyType.RAILROAD) {
    const owned = getPlayerProperties(board, property.ownerId).filter(p => p.type === PropertyType.RAILROAD).length;
    return [0, 25, 50, 100, 200][owned] ?? 0;
  }

  // Street rent
  if (property.type === PropertyType.STREET) {
    const hasMonopoly_ = hasMonopoly(board, property.ownerId, property.group!);
    if (property.houses === 0 && hasMonopoly_) {
      return property.rent[0] * 2; // Double rent for monopoly
    }
    return property.rent[property.houses] ?? 0;
  }

  return 0;
}

/**
 * Get next player index (skipping bankrupt players)
 */
export function getNextPlayerIndex(gameState: GameState): number {
  let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  let attempts = 0;
  while (gameState.players[nextIndex].isBankrupt && attempts < gameState.players.length) {
    nextIndex = (nextIndex + 1) % gameState.players.length;
    attempts++;
  }
  return nextIndex;
}

/**
 * Check if game is over (only one non-bankrupt player)
 */
export function checkGameOver(gameState: GameState): UUID | null {
  const activePlayers = gameState.players.filter(p => !p.isBankrupt);
  if (activePlayers.length <= 1) {
    return activePlayers[0]?.id ?? null;
  }
  return null;
}

/**
 * Deep clone game state (for immutable updates)
 */
export function cloneGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Merge partial rules config with defaults
 */
export function mergeRulesConfig(partial: Partial<RulesConfig>): RulesConfig {
  return {
    ...DEFAULT_RULES_CONFIG,
    ...partial,
    customRules: partial.customRules ?? DEFAULT_RULES_CONFIG.customRules,
  };
}

/**
 * Validate rules config
 */
export function validateRulesConfig(config: RulesConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.startingMoney < 0) errors.push('Starting money must be non-negative');
  if (config.goSalary < 0) errors.push('GO salary must be non-negative');
  if (config.maxJailTurns < 1) errors.push('Max jail turns must be at least 1');
  if (config.bailAmount < 0) errors.push('Bail amount must be non-negative');
  if (config.mortgageInterestRate < 0 || config.mortgageInterestRate > 1) {
    errors.push('Mortgage interest rate must be between 0 and 1');
  }
  if (config.housesPerHotel < 1) errors.push('Houses per hotel must be at least 1');
  if (config.maxHouses < 0) errors.push('Max houses must be non-negative');
  if (config.maxHotels < 0) errors.push('Max hotels must be non-negative');

  return { valid: errors.length === 0, errors };
}

/**
 * Format money for display
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format time for display (mm:ss)
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  throw lastError!;
}