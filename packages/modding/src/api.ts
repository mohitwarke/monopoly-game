// Modding System - Plugin API Definitions

import type { UUID, GameState, Player, Property, Card, DiceRoll, TradeOffer, Auction, RulesConfig, CustomRule } from '@monopoly/shared';
import { PropertyType, PropertyGroup, GamePhase, PlayerAction, AIDifficulty } from '@monopoly/shared';

/**
 * Plugin API Version
 */
export const PLUGIN_API_VERSION = '1.0';

/**
 * Events that plugins can listen to
 */
export type PluginEvent =
  | 'game:start'
  | 'game:end'
  | 'turn:start'
  | 'turn:end'
  | 'phase:change'
  | 'player:move'
  | 'player:land'
  | 'player:jail'
  | 'player:bankrupt'
  | 'property:buy'
  | 'property:auction'
  | 'property:mortgage'
  | 'property:build'
  | 'trade:propose'
  | 'trade:resolve'
  | 'dice:roll'
  | 'card:draw'
  | 'money:change'
  | 'chat:message';

/**
 * Event Data Types
 */
export interface PluginEventData {
  'game:start': { gameState: GameState };
  'game:end': { winnerId: UUID; finalState: GameState };
  'turn:start': { player: Player; gameState: GameState };
  'turn:end': { player: Player; gameState: GameState };
  'phase:change': { from: GamePhase; to: GamePhase; gameState: GameState };
  'player:move': { player: Player; from: number; to: number; diceRoll: DiceRoll };
  'player:land': { player: Player; property: Property; gameState: GameState };
  'player:jail': { player: Player; reason: 'goToJail' | 'card' | 'doubles' };
  'player:bankrupt': { player: Player; creditorId: UUID | null };
  'property:buy': { player: Player; property: Property; price: number };
  'property:auction': { property: Property; winnerId: UUID | null; amount: number };
  'property:mortgage': { player: Player; property: Property; amount: number };
  'property:build': { player: Player; property: Property; newHouseCount: number };
  'trade:propose': { trade: TradeOffer };
  'trade:resolve': { trade: TradeOffer; accepted: boolean };
  'dice:roll': { player: Player; diceRoll: DiceRoll };
  'card:draw': { player: Player; card: Card; deck: 'chance' | 'communityChest' };
  'money:change': { player: Player; amount: number; reason: string };
  'chat:message': { playerId: UUID; playerName: string; text: string };
}

/**
 * Plugin API Interface - What plugins can access
 */
export interface IPluginAPI {
  // Version
  readonly version: string;

  // Game State (read-only)
  readonly gameState: Readonly<GameState>;

  // Event System
  on<E extends PluginEvent>(event: E, handler: (data: PluginEventData[E]) => void): () => void;
  off<E extends PluginEvent>(event: E, handler: (data: PluginEventData[E]) => void): void;
  emit<E extends PluginEvent>(event: E, data: PluginEventData[E]): void;

  // Board API
  board: IBoardAPI;

  // Player API
  players: IPlayersAPI;

  // Rules API
  rules: IRulesAPI;

  // AI API
  ai: IAIAPI;

  // UI API (for board skins, piece sets)
  ui: IUIAPI;

  // Assets API
  assets: IAssetsAPI;

  // Storage API
  storage: IStorageAPI;

  // Network API (restricted)
  network: INetworkAPI;

  // Logging
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown) => void;
}

/**
 * Board API
 */
export interface IBoardAPI {
  // Get property by board position (0-39)
  getProperty(position: number): Readonly<Property> | undefined;

  // Get property by ID
  getPropertyById(id: UUID): Readonly<Property> | undefined;

  // Get all properties
  getAllProperties(): Readonly<Property>[];

  // Get properties by group
  getPropertiesByGroup(group: PropertyGroup): Readonly<Property>[];

  // Get properties by type
  getPropertiesByType(type: PropertyType): Readonly<Property>[];

  // Get owned properties for a player
  getOwnedProperties(playerId: UUID): Readonly<Property>[];

  // Get unowned properties
  getUnownedProperties(): Readonly<Property>[];

  // Get mortgaged properties
  getMortgagedProperties(playerId?: UUID): Readonly<Property>[];

  // Calculate rent for a property
  calculateRent(property: Property, diceRoll?: DiceRoll): number;

  // Check if player has monopoly on group
  hasMonopoly(playerId: UUID, group: PropertyGroup): boolean;

  // Get board position name
  getPositionName(position: number): string;

  // Get distance between positions
  getDistance(from: number, to: number): number;
}

/**
 * Players API
 */
export interface IPlayersAPI {
  // Get current player
  getCurrent(): Readonly<Player>;

  // Get player by ID
  getById(id: UUID): Readonly<Player> | undefined;

  // Get all players
  getAll(): Readonly<Player>[];

  // Get active (non-bankrupt) players
  getActive(): Readonly<Player>[];

  // Get player by user ID
  getByUserId(userId: UUID): Readonly<Player> | undefined;

  // Get AI players
  getAIPlayers(): Readonly<Player>[];

  // Get human players
  getHumanPlayers(): Readonly<Player>[];

  // Get player net worth
  getNetWorth(playerId: UUID): number;

  // Check if player can afford amount
  canAfford(playerId: UUID, amount: number): boolean;
}

/**
 * Rules API
 */
export interface IRulesAPI {
  // Get current rules config
  getConfig(): Readonly<RulesConfig>;

  // Get custom rules
  getCustomRules(): Readonly<CustomRule[]>;

  // Check if custom rule is enabled
  isRuleEnabled(ruleId: string): boolean;

  // Get rule config
  getRuleConfig(ruleId: string): Record<string, unknown> | undefined;

  // Validate rules config
  validateConfig(config: Partial<RulesConfig>): { valid: boolean; errors: string[] };

  // Get default rules config
  getDefaultConfig(): RulesConfig;
}

/**
 * AI API
 */
export interface IAIAPI {
  // Get AI difficulty config
  getDifficultyConfig(difficulty: AIDifficulty): Readonly<{
    searchDepth: number;
    mctsSimulations: number;
    evaluationWeights: Record<string, number>;
    riskTolerance: number;
    tradingAggression: number;
    buildingStrategy: string;
  }>;

  // Evaluate game state for a player (returns score)
  evaluateState(playerId: UUID): number;

  // Get best move for AI player
  getBestMove(playerId: UUID): { action: PlayerAction; data: Record<string, unknown> } | null;

  // Register custom AI personality
  registerPersonality(id: string, config: {
    name: string;
    difficulty: AIDifficulty;
    evaluationWeights: Record<string, number>;
    riskTolerance: number;
    tradingAggression: number;
    buildingStrategy: string;
  }): void;

  // Unregister AI personality
  unregisterPersonality(id: string): void;
}

/**
 * UI API - For board skins, piece sets, custom components
 */
export interface IUIAPI {
  // Register a custom React component
  registerComponent(name: string, component: React.ComponentType<any>): void;

  // Unregister component
  unregisterComponent(name: string): void;

  // Get registered component
  getComponent(name: string): React.ComponentType<any> | undefined;

  // Register board renderer
  registerBoardRenderer(renderer: BoardRenderer): void;

  // Register piece renderer
  registerPieceRenderer(renderer: PieceRenderer): void;

  // Register card renderer
  registerCardRenderer(renderer: CardRenderer): void;

  // Add custom CSS
  addStyles(css: string): void;

  // Remove custom CSS
  removeStyles(css: string): void;
}

/**
 * Board Renderer Interface
 */
export interface BoardRenderer {
  name: string;
  render: (props: BoardRendererProps) => React.ReactElement;
}

export interface BoardRendererProps {
  board: Readonly<Property[]>;
  players: Readonly<Player[]>;
  currentPlayer: Readonly<Player>;
  diceRoll?: DiceRoll;
  highlightedProperties?: UUID[];
  onPropertyClick?: (property: Property) => void;
}

/**
 * Piece Renderer Interface
 */
export interface PieceRenderer {
  name: string;
  render: (props: PieceRendererProps) => React.ReactElement;
}

export interface PieceRendererProps {
  player: Readonly<Player>;
  position: { x: number; y: number };
  isCurrentPlayer: boolean;
  animation?: 'idle' | 'move' | 'jump' | 'celebrate' | 'bankrupt';
}

/**
 * Card Renderer Interface
 */
export interface CardRenderer {
  name: string;
  render: (props: CardRendererProps) => React.ReactElement;
}

export interface CardRendererProps {
  card: Readonly<Card>;
  onClose: () => void;
}

/**
 * Assets API
 */
export interface IAssetsAPI {
  // Load image from URL (cached)
  loadImage(url: string): Promise<HTMLImageElement>;

  // Load audio from URL
  loadAudio(url: string): Promise<HTMLAudioElement>;

  // Load 3D model (GLTF/GLB)
  loadModel(url: string): Promise<unknown>;

  // Load JSON data
  loadJSON<T>(url: string): Promise<T>;

  // Preload assets
  preload(urls: string[]): Promise<void>;

  // Clear cache
  clearCache(): void;
}

/**
 * Storage API - Persistent key-value storage per plugin
 */
export interface IStorageAPI {
  // Get value
  get<T>(key: string): T | undefined;

  // Set value
  set<T>(key: string, value: T): void;

  // Delete key
  delete(key: string): void;

  // Check if key exists
  has(key: string): boolean;

  // Get all keys
  keys(): string[];

  // Clear all data
  clear(): void;

  // Get storage size estimate
  size(): number;
}

/**
 * Network API - Restricted HTTP requests
 */
export interface INetworkAPI {
  // Fetch with domain restrictions
  fetch(url: string, options?: RequestInit): Promise<Response>;

  // Allowed domains (read-only)
  readonly allowedDomains: string[];
}

/**
 * Plugin Lifecycle Hooks
 */
export interface PluginLifecycle {
  // Called when plugin is loaded
  onLoad?(api: IPluginAPI): void | Promise<void>;

  // Called when plugin is unloaded
  onUnload?(api: IPluginAPI): void | Promise<void>;

  // Called when game starts
  onGameStart?(api: IPluginAPI, gameState: GameState): void | Promise<void>;

  // Called when game ends
  onGameEnd?(api: IPluginAPI, winnerId: UUID, finalState: GameState): void | Promise<void>;

  // Called each turn
  onTurnStart?(api: IPluginAPI, player: Player): void | Promise<void>;
  onTurnEnd?(api: IPluginAPI, player: Player): void | Promise<void>;

  // Called when phase changes
  onPhaseChange?(api: IPluginAPI, from: GamePhase, to: GamePhase): void | Promise<void>;
}

/**
 * Plugin Entry Point - What plugins must export
 */
export interface PluginEntryPoint {
  // Plugin metadata
  manifest: {
    name: string;
    version: string;
    author: string;
    description: string;
    type: string;
    apiVersion: string;
    permissions: string[];
  };

  // Lifecycle hooks
  lifecycle?: PluginLifecycle;

  // Custom API extensions
  api?: Record<string, unknown>;

  // Default export for React components (board skins, piece sets)
  default?: React.ComponentType<any>;
}

/**
 * Create a plugin API instance
 */
export function createPluginAPI(gameState: GameState): IPluginAPI {
  // This would be implemented with actual game state access
  // For now, return a mock implementation
  return {
    version: PLUGIN_API_VERSION,
    gameState,
    on: () => () => {},
    off: () => {},
    emit: () => {},
    board: {
      getProperty: () => undefined,
      getPropertyById: () => undefined,
      getAllProperties: () => [],
      getPropertiesByGroup: () => [],
      getPropertiesByType: () => [],
      getOwnedProperties: () => [],
      getUnownedProperties: () => [],
      getMortgagedProperties: () => [],
      calculateRent: () => 0,
      hasMonopoly: () => false,
      getPositionName: () => '',
      getDistance: () => 0,
    },
    players: {
      getCurrent: () => ({} as Player),
      getById: () => undefined,
      getAll: () => [],
      getActive: () => [],
      getByUserId: () => undefined,
      getAIPlayers: () => [],
      getHumanPlayers: () => [],
      getNetWorth: () => 0,
      canAfford: () => false,
    },
    rules: {
      getConfig: () => ({} as RulesConfig),
      getCustomRules: () => [],
      isRuleEnabled: () => false,
      getRuleConfig: () => undefined,
      validateConfig: () => ({ valid: true, errors: [] }),
      getDefaultConfig: () => ({} as RulesConfig),
    },
    ai: {
      getDifficultyConfig: () => ({
        searchDepth: 0,
        mctsSimulations: 0,
        evaluationWeights: {},
        riskTolerance: 0,
        tradingAggression: 0,
        buildingStrategy: '',
      }),
      evaluateState: () => 0,
      getBestMove: () => null,
      registerPersonality: () => {},
      unregisterPersonality: () => {},
    },
    ui: {
      registerComponent: () => {},
      unregisterComponent: () => {},
      getComponent: () => undefined,
      registerBoardRenderer: () => {},
      registerPieceRenderer: () => {},
      registerCardRenderer: () => {},
      addStyles: () => {},
      removeStyles: () => {},
    },
    assets: {
      loadImage: async () => new Image(),
      loadAudio: async () => new Audio(),
      loadModel: async () => ({}),
      loadJSON: async () => ({}),
      preload: async () => {},
      clearCache: () => {},
    },
    storage: {
      get: () => undefined,
      set: () => {},
      delete: () => {},
      has: () => false,
      keys: () => [],
      clear: () => {},
      size: () => 0,
    },
    network: {
      fetch: async () => new Response(),
      allowedDomains: [],
    },
    log: () => {},
  };
}

/**
 * Plugin Types for TypeScript
 */
export type PluginType = 
  | 'boardSkin'
  | 'rulePack'
  | 'pieceSet'
  | 'aiPersonality'
  | 'gameMode';

/**
 * Permission Types
 */
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

/**
 * API Compatibility Check
 */
export function checkAPICompatibility(pluginApiVersion: string): { compatible: boolean; reason?: string } {
  const [pluginMajor, pluginMinor] = pluginApiVersion.split('.').map(Number);
  const [currentMajor, currentMinor] = PLUGIN_API_VERSION.split('.').map(Number);

  if (pluginMajor > currentMajor) {
    return { compatible: false, reason: `Plugin requires API v${pluginApiVersion}, current is v${PLUGIN_API_VERSION}` };
  }

  if (pluginMajor === currentMajor && pluginMinor > currentMinor) {
    return { compatible: false, reason: `Plugin requires API v${pluginApiVersion}, current is v${PLUGIN_API_VERSION}` };
  }

  return { compatible: true };
}