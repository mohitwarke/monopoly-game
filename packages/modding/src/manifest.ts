// Modding System - Plugin Manifest

import { z } from 'zod';
import type { UUID, PluginType, PluginPermission, PluginManifest as SharedPluginManifest } from '@monopoly/shared';
import { PluginType as PluginTypeEnum, PluginPermission as PluginPermissionEnum } from '@monopoly/shared';

/**
 * Plugin Manifest Schema (Zod)
 */
export const PluginManifestSchema = z.object({
  name: z.string().min(1).max(64),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/), // SemVer
  author: z.string().min(1).max(64),
  description: z.string().max(500),
  type: z.nativeEnum(PluginTypeEnum),
  entry: z.string().min(1), // Entry point file
  apiVersion: z.string().regex(/^\d+\.\d+$/), // Major.Minor
  permissions: z.array(z.nativeEnum(PluginPermissionEnum)),
  dependencies: z.record(z.string()).optional(),
  // UI
  icon: z.string().url().optional(),
  screenshots: z.array(z.string().url()).optional(),
  // Metadata
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  license: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Extended Manifest with computed fields
 */
export interface ExtendedPluginManifest extends PluginManifest {
  id: UUID;
  userId: UUID;
  isPublic: boolean;
  downloads: number;
  rating: number;
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
  // Computed
  compatible: boolean;
  installSize: number;
}

/**
 * Plugin Types with descriptions
 */
export const PLUGIN_TYPES: Record<PluginType, { name: string; description: string; api: string[] }> = {
  [PluginTypeEnum.BOARD_SKIN]: {
    name: 'Board Skin',
    description: 'Custom board visuals, themes, and property appearances',
    api: ['board:render', 'assets:load'],
  },
  [PluginTypeEnum.RULE_PACK]: {
    name: 'Rule Pack',
    description: 'Bundled house rules and custom rule configurations',
    api: ['rules:read', 'rules:modify'],
  },
  [PluginTypeEnum.PIECE_SET]: {
    name: 'Piece Set',
    description: 'Custom player tokens and piece animations',
    api: ['pieces:render', 'pieces:modify', 'assets:load'],
  },
  [PluginTypeEnum.AI_PERSONALITY]: {
    name: 'AI Personality',
    description: 'Custom AI behavior and difficulty settings',
    api: ['ai:read', 'ai:modify'],
  },
  [PluginTypeEnum.GAME_MODE]: {
    name: 'Game Mode',
    description: 'Complete game variants (speed, team, etc.)',
    api: ['board:modify', 'rules:modify', 'ai:modify', 'pieces:modify'],
  },
};

/**
 * Permissions with descriptions
 */
export const PLUGIN_PERMISSIONS: Record<PluginPermission, { name: string; description: string; risk: 'low' | 'medium' | 'high' }> = {
  [PluginPermissionEnum.BOARD_RENDER]: { name: 'Board Render', description: 'Read board state for rendering', risk: 'low' },
  [PluginPermissionEnum.BOARD_MODIFY]: { name: 'Board Modify', description: 'Modify board layout and properties', risk: 'high' },
  [PluginPermissionEnum.PIECES_RENDER]: { name: 'Pieces Render', description: 'Read piece state for rendering', risk: 'low' },
  [PluginPermissionEnum.PIECES_MODIFY]: { name: 'Pieces Modify', description: 'Modify piece behavior and appearance', risk: 'medium' },
  [PluginPermissionEnum.RULES_READ]: { name: 'Rules Read', description: 'Read current rules configuration', risk: 'low' },
  [PluginPermissionEnum.RULES_MODIFY]: { name: 'Rules Modify', description: 'Modify game rules at runtime', risk: 'high' },
  [PluginPermissionEnum.AI_READ]: { name: 'AI Read', description: 'Read AI state and decisions', risk: 'low' },
  [PluginPermissionEnum.AI_MODIFY]: { name: 'AI Modify', description: 'Modify AI behavior and decisions', risk: 'high' },
  [PluginPermissionEnum.ASSETS_LOAD]: { name: 'Assets Load', description: 'Load custom images, sounds, models', risk: 'medium' },
  [PluginPermissionEnum.STORAGE_READ]: { name: 'Storage Read', description: 'Read plugin local storage', risk: 'low' },
  [PluginPermissionEnum.STORAGE_WRITE]: { name: 'Storage Write', description: 'Write plugin local storage', risk: 'medium' },
  [PluginPermissionEnum.NETWORK_REQUEST]: { name: 'Network Request', description: 'Make HTTP requests (restricted domains)', risk: 'high' },
};

/**
 * Validate plugin manifest
 */
export function validateManifest(manifest: unknown): { valid: boolean; errors: string[]; manifest?: PluginManifest } {
  const result = PluginManifestSchema.safeParse(manifest);
  if (result.success) {
    return { valid: true, errors: [], manifest: result.data };
  }
  return { valid: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) };
}

/**
 * Check if manifest is compatible with current API version
 */
export function checkCompatibility(manifest: PluginManifest, currentApiVersion: string): { compatible: boolean; reason?: string } {
  const [manifestMajor, manifestMinor] = manifest.apiVersion.split('.').map(Number);
  const [currentMajor, currentMinor] = currentApiVersion.split('.').map(Number);

  if (manifestMajor > currentMajor) {
    return { compatible: false, reason: `Plugin requires API v${manifest.apiVersion}, current is v${currentApiVersion}` };
  }

  if (manifestMajor === currentMajor && manifestMinor > currentMinor) {
    return { compatible: false, reason: `Plugin requires API v${manifest.apiVersion}, current is v${currentApiVersion}` };
  }

  return { compatible: true };
}

/**
 * Get required permissions for plugin type
 */
export function getDefaultPermissions(type: PluginType): PluginPermission[] {
  const typeInfo = PLUGIN_TYPES[type];
  return typeInfo.api as PluginPermission[];
}

/**
 * Create a basic manifest template
 */
export function createManifestTemplate(type: PluginType): Partial<PluginManifest> {
  return {
    name: '',
    version: '1.0.0',
    author: '',
    description: '',
    type,
    entry: 'index.js',
    apiVersion: '1.0',
    permissions: getDefaultPermissions(type),
  };
}

/**
 * Plugin Manifest for specific types
 */
export interface BoardSkinManifest extends PluginManifest {
  type: PluginTypeEnum.BOARD_SKIN;
  config: {
    theme: string;
    propertyStyles: Record<string, PropertyStyle>;
    animations: BoardAnimations;
  };
}

export interface PropertyStyle {
  color: string;
  texture?: string;
  fontFamily?: string;
  fontSize?: number;
  showIcons: boolean;
}

export interface BoardAnimations {
  diceRoll: boolean;
  pieceMove: boolean;
  propertyPurchase: boolean;
  building: boolean;
}

export interface RulePackManifest extends PluginManifest {
  type: PluginTypeEnum.RULE_PACK;
  config: {
    rules: string[]; // Rule IDs
    defaultConfig: Record<string, Record<string, unknown>>;
  };
}

export interface PieceSetManifest extends PluginManifest {
  type: PluginTypeEnum.PIECE_SET;
  config: {
    pieces: PieceDefinition[];
    animations: PieceAnimations;
  };
}

export interface PieceDefinition {
  id: string;
  name: string;
  model: string; // Path to 3D model or sprite
  scale: number;
  colorable: boolean;
}

export interface PieceAnimations {
  idle: string;
  move: string;
  jump: string;
  celebrate: string;
  bankrupt: string;
}

export interface AIPersonalityManifest extends PluginManifest {
  type: PluginTypeEnum.AI_PERSONALITY;
  config: {
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    personality: AIPersonalityTraits;
    evaluationWeights: Record<string, number>;
  };
}

export interface AIPersonalityTraits {
  riskTolerance: number; // 0-1
  aggression: number; // 0-1
  tradingWillingness: number; // 0-1
  buildingStrategy: 'conservative' | 'balanced' | 'aggressive' | 'optimal';
  monopolyPriority: number; // 0-1
  cashReserve: number; // Minimum cash to keep
}

export interface GameModeManifest extends PluginManifest {
  type: PluginTypeEnum.GAME_MODE;
  config: {
    name: string;
    description: string;
    minPlayers: number;
    maxPlayers: number;
    rules: string[];
    customLogic: string; // Entry point for custom game logic
  };
}

/**
 * API Version
 */
export const CURRENT_API_VERSION = '1.0';

/**
 * Manifest version for migration
 */
export const MANIFEST_VERSION = 1;