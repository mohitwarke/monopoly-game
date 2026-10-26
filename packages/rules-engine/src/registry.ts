// Rules Engine - Rule Registry

import type { CustomRule, RulesConfig, GameState, Player, Property, UUID } from '@monopoly/shared';
import { PropertyType, PropertyGroup, GamePhase, PlayerAction, AIDifficulty } from '@monopoly/shared';

/**
 * Rule Registry - Manages custom rules with validation and versioning
 */
export class RuleRegistry {
  private rules: Map<string, RegisteredRule> = new Map();
  private ruleVersions: Map<string, number> = new Map();

  constructor(initialRules: CustomRule[] = []) {
    for (const rule of initialRules) {
      this.register(rule);
    }
  }

  /**
   * Register a new rule
   */
  register(rule: CustomRule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Rule with id ${rule.id} already exists`);
    }

    const registered: RegisteredRule = {
      ...rule,
      registeredAt: Date.now(),
      version: 1,
    };

    this.rules.set(rule.id, registered);
    this.ruleVersions.set(rule.id, 1);
  }

  /**
   * Update an existing rule
   */
  update(ruleId: string, updates: Partial<CustomRule>): void {
    const existing = this.rules.get(ruleId);
    if (!existing) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const updated: RegisteredRule = {
      ...existing,
      ...updates,
      id: ruleId, // Prevent ID change
      version: existing.version + 1,
      updatedAt: Date.now(),
    };

    this.rules.set(ruleId, updated);
    this.ruleVersions.set(ruleId, updated.version);
  }

  /**
   * Unregister a rule
   */
  unregister(ruleId: string): boolean {
    this.ruleVersions.delete(ruleId);
    return this.rules.delete(ruleId);
  }

  /**
   * Get a rule by ID
   */
  get(ruleId: string): RegisteredRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all rules
   */
  getAll(): RegisteredRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get enabled rules
   */
  getEnabled(): RegisteredRule[] {
    return this.getAll().filter(r => r.enabled);
  }

  /**
   * Get rules by category
   */
  getByCategory(category: CustomRule['category']): RegisteredRule[] {
    return this.getEnabled().filter(r => r.category === category);
  }

  /**
   * Check if rule is enabled
   */
  isEnabled(ruleId: string): boolean {
    return this.rules.get(ruleId)?.enabled ?? false;
  }

  /**
   * Enable a rule
   */
  enable(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      rule.updatedAt = Date.now();
    }
  }

  /**
   * Disable a rule
   */
  disable(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      rule.updatedAt = Date.now();
    }
  }

  /**
   * Get rule version
   */
  getVersion(ruleId: string): number {
    return this.ruleVersions.get(ruleId) ?? 0;
  }

  /**
   * Export rules for sharing
   */
  export(): ExportedRuleSet {
    return {
      version: 1,
      exportedAt: Date.now(),
      rules: this.getAll().map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        enabled: r.enabled,
        config: r.config,
        version: r.version,
      })),
    };
  }

  /**
   * Import rules from export
   */
  import(data: ExportedRuleSet, overwrite: boolean = false): { imported: number; skipped: number; errors: string[] } {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const rule of data.rules) {
      try {
        if (this.rules.has(rule.id)) {
          if (overwrite) {
            this.update(rule.id, rule);
            imported++;
          } else {
            skipped++;
          }
        } else {
          this.register(rule);
          imported++;
        }
      } catch (error) {
        errors.push(`Failed to import ${rule.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { imported, skipped, errors };
  }

  /**
   * Validate all rules
   */
  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of this.getAll()) {
      // Check for duplicate IDs (shouldn't happen with Map)
      // Check config validity
      if (!rule.config || typeof rule.config !== 'object') {
        errors.push({ ruleId: rule.id, message: 'Rule config must be an object' });
      }

      // Category-specific validation
      switch (rule.category) {
        case 'economy':
          if (rule.config.amount !== undefined && typeof rule.config.amount !== 'number') {
            errors.push({ ruleId: rule.id, message: 'Economy rules require numeric amount' });
          }
          break;
        case 'property':
          if (rule.config.group !== undefined && !Object.values(PropertyGroup).includes(rule.config.group as PropertyGroup)) {
            warnings.push({ ruleId: rule.id, message: `Unknown property group: ${rule.config.group}` });
          }
          break;
        case 'winning':
          if (rule.config.targetNetWorth !== undefined && typeof rule.config.targetNetWorth !== 'number') {
            errors.push({ ruleId: rule.id, message: 'Winning rules require numeric targetNetWorth' });
          }
          break;
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}

export interface RegisteredRule extends CustomRule {
  registeredAt: number;
  updatedAt?: number;
  version: number;
}

export interface ExportedRuleSet {
  version: number;
  exportedAt: number;
  rules: Array<{
    id: string;
    name: string;
    description: string;
    category: CustomRule['category'];
    enabled: boolean;
    config: Record<string, unknown>;
    version: number;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  ruleId: string;
  message: string;
}

export interface ValidationWarning {
  ruleId: string;
  message: string;
}

/**
 * Rule Context - Provides game state access to rules
 */
export interface RuleContext {
  gameState: GameState;
  currentPlayer: Player;
  trigger: RuleTrigger;
  timestamp: number;
}

/**
 * Rule Trigger Types
 */
export type RuleTrigger =
  | { type: 'onLand'; playerId: UUID; propertyId: UUID }
  | { type: 'onPassGo'; playerId: UUID }
  | { type: 'onRoll'; playerId: UUID; diceRoll: { die1: number; die2: number; total: number; isDouble: boolean } }
  | { type: 'onBuyProperty'; playerId: UUID; propertyId: UUID }
  | { type: 'onAuctionStart'; propertyId: UUID }
  | { type: 'onAuctionBid'; playerId: UUID; propertyId: UUID; amount: number }
  | { type: 'onAuctionEnd'; propertyId: UUID; winnerId: UUID | null; amount: number }
  | { type: 'onTradePropose'; fromPlayerId: UUID; toPlayerId: UUID }
  | { type: 'onTradeResolve'; tradeId: UUID; accepted: boolean }
  | { type: 'onBuild'; playerId: UUID; propertyId: UUID; newHouseCount: number }
  | { type: 'onSell'; playerId: UUID; propertyId: UUID; newHouseCount: number }
  | { type: 'onMortgage'; playerId: UUID; propertyId: UUID }
  | { type: 'onUnmortgage'; playerId: UUID; propertyId: UUID }
  | { type: 'onJailEnter'; playerId: UUID }
  | { type: 'onJailExit'; playerId: UUID; method: 'bail' | 'card' | 'doubles' }
  | { type: 'onTurnStart'; playerId: UUID }
  | { type: 'onTurnEnd'; playerId: UUID }
  | { type: 'onBankruptcy'; playerId: UUID; creditorId: UUID | null }
  | { type: 'onGameEnd'; winnerId: UUID }
  | { type: 'periodic'; intervalMs: number };

/**
 * Rule Effect Types
 */
export type RuleEffect =
  | { type: 'modifyMoney'; target: 'current' | 'all' | 'owner' | 'target' | UUID; amount: number | ((ctx: RuleContext) => number) }
  | { type: 'modifyProperty'; target: 'landed' | 'all' | 'group' | UUID; changes: Partial<Property> }
  | { type: 'movePlayer'; target: 'current' | 'target' | UUID; spaces: number | ((ctx: RuleContext) => number) }
  | { type: 'sendToJail'; target: 'current' | 'target' | UUID }
  | { type: 'freeFromJail'; target: 'current' | 'target' | UUID }
  | { type: 'giveCard'; target: 'current' | 'target' | UUID; cardType: 'chance' | 'communityChest' }
  | { type: 'skipTurn'; target: 'current' | 'target' | UUID }
  | { type: 'extraTurn'; target: 'current' | UUID }
  | { type: 'modifyRent'; target: 'landed' | 'group' | 'all' | UUID; multiplier: number | ((ctx: RuleContext) => number) }
  | { type: 'setPhase'; phase: GamePhase }
  | { type: 'custom'; handler: (ctx: RuleContext) => void | Promise<void> };

/**
 * Rule Definition - Complete rule with triggers and effects
 */
export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  category: CustomRule['category'];
  triggers: RuleTrigger[];
  effects: RuleEffect[];
  configSchema: Record<string, unknown>; // JSON Schema
  priority: number; // Higher = runs first
  oncePerGame?: boolean;
  oncePerTurn?: boolean;
}

/**
 * Compiled Rule - Ready for execution
 */
export interface CompiledRule {
  definition: RuleDefinition;
  config: Record<string, unknown>;
  enabled: boolean;
  triggerCount: Map<string, number>; // Track executions for oncePerGame/Turn
}

/**
 * Rule Compiler - Compiles rule definitions into executable form
 */
export class RuleCompiler {
  compile(definition: RuleDefinition, config: Record<string, unknown>): CompiledRule {
    // Validate config against schema
    this.validateConfig(definition.configSchema, config);

    return {
      definition,
      config,
      enabled: true,
      triggerCount: new Map(),
    };
  }

  private validateConfig(schema: Record<string, unknown>, config: Record<string, unknown>): void {
    // Basic JSON Schema validation would go here
    // For now, just check required fields
    const required = (schema.required as string[]) ?? [];
    for (const field of required) {
      if (!(field in config)) {
        throw new Error(`Missing required config field: ${field}`);
      }
    }
  }
}

/**
 * Rule Engine - Executes compiled rules
 */
export class RuleEngine {
  private compiler = new RuleCompiler();
  private compiledRules: Map<string, CompiledRule> = new Map();

  loadRules(definitions: RuleDefinition[], configs: Record<string, Record<string, unknown>>): void {
    this.compiledRules.clear();
    for (const def of definitions) {
      const config = configs[def.id] ?? {};
      this.compiledRules.set(def.id, this.compiler.compile(def, config));
    }
  }

  enableRule(ruleId: string): void {
    const rule = this.compiledRules.get(ruleId);
    if (rule) rule.enabled = true;
  }

  disableRule(ruleId: string): void {
    const rule = this.compiledRules.get(ruleId);
    if (rule) rule.enabled = false;
  }

  async executeTrigger(trigger: RuleTrigger, context: RuleContext): Promise<void> {
    // Sort rules by priority (highest first)
    const rules = Array.from(this.compiledRules.values())
      .filter(r => r.enabled)
      .sort((a, b) => b.definition.priority - a.definition.priority);

    for (const rule of rules) {
      if (this.matchesTrigger(rule.definition.triggers, trigger)) {
        // Check oncePerGame/oncePerTurn limits
        const triggerKey = JSON.stringify(trigger);
        const count = rule.triggerCount.get(triggerKey) ?? 0;

        if (rule.definition.oncePerGame && count > 0) continue;
        if (rule.definition.oncePerTurn && count > 0) {
          // Check if same turn
          const turnKey = `${triggerKey}:${context.gameState.turn}`;
          const turnCount = rule.triggerCount.get(turnKey) ?? 0;
          if (turnCount > 0) continue;
        }

        // Execute effects
        for (const effect of rule.definition.effects) {
          await this.executeEffect(effect, context, rule.config);
        }

        // Update counters
        rule.triggerCount.set(triggerKey, count + 1);
        if (rule.definition.oncePerTurn) {
          const turnKey = `${triggerKey}:${context.gameState.turn}`;
          rule.triggerCount.set(turnKey, (rule.triggerCount.get(turnKey) ?? 0) + 1);
        }
      }
    }
  }

  private matchesTrigger(triggers: RuleTrigger[], trigger: RuleTrigger): boolean {
    return triggers.some(t => this.triggerMatches(t, trigger));
  }

  private triggerMatches(pattern: RuleTrigger, actual: RuleTrigger): boolean {
    if (pattern.type !== actual.type) return false;

    // For onLand, check if property matches
    if (pattern.type === 'onLand' && actual.type === 'onLand') {
      if (Array.isArray(pattern.propertyId)) {
        return pattern.propertyId.includes(actual.propertyId);
      }
      return pattern.propertyId === actual.propertyId;
    }

    // For onRoll with condition
    if (pattern.type === 'onRoll' && actual.type === 'onRoll') {
      if (pattern.condition) {
        return pattern.condition(actual.diceRoll);
      }
      return true;
    }

    return true;
  }

  private async executeEffect(effect: RuleEffect, context: RuleContext, config: Record<string, unknown>): Promise<void> {
    switch (effect.type) {
      case 'modifyMoney': {
        const amount = typeof effect.amount === 'function' ? effect.amount(context) : effect.amount;
        const targets = this.resolveTargets(effect.target, context);
        for (const target of targets) {
          target.money += amount;
        }
        break;
      }
      case 'modifyProperty': {
        const targets = this.resolvePropertyTargets(effect.target, context);
        for (const target of targets) {
          Object.assign(target, effect.changes);
        }
        break;
      }
      case 'movePlayer': {
        const spaces = typeof effect.spaces === 'function' ? effect.spaces(context) : effect.spaces;
        const targets = this.resolveTargets(effect.target, context);
        for (const target of targets) {
          target.position = (target.position + spaces) % 40;
        }
        break;
      }
      case 'sendToJail': {
        const targets = this.resolveTargets(effect.target, context);
        for (const target of targets) {
          target.inJail = true;
          target.jailTurns = 0;
          target.position = 10;
        }
        break;
      }
      case 'freeFromJail': {
        const targets = this.resolveTargets(effect.target, context);
        for (const target of targets) {
          target.inJail = false;
          target.jailTurns = 0;
        }
        break;
      }
      case 'giveCard': {
        const targets = this.resolveTargets(effect.target, context);
        for (const target of targets) {
          target.getOutOfJailFreeCards++;
        }
        break;
      }
      case 'skipTurn': {
        // Would need game engine integration
        break;
      }
      case 'extraTurn': {
        // Would need game engine integration
        break;
      }
      case 'modifyRent': {
        const multiplier = typeof effect.multiplier === 'function' ? effect.multiplier(context) : effect.multiplier;
        const targets = this.resolvePropertyTargets(effect.target, context);
        for (const target of targets) {
          // Store multiplier for rent calculation
          (target as any).rentMultiplier = multiplier;
        }
        break;
      }
      case 'setPhase': {
        context.gameState.phase = effect.phase;
        break;
      }
      case 'custom': {
        await effect.handler(context);
        break;
      }
    }
  }

  private resolveTargets(target: RuleEffect['target'], context: RuleContext): Player[] {
    switch (target) {
      case 'current':
        return [context.currentPlayer];
      case 'all':
        return context.gameState.players.filter(p => !p.isBankrupt);
      case 'owner':
        // Would need property context
        return [];
      case 'target':
        // Would need trade context
        return [];
      default:
        // UUID
        const player = context.gameState.players.find(p => p.id === target);
        return player ? [player] : [];
    }
  }

  private resolvePropertyTargets(target: RuleEffect['target'], context: RuleContext): Property[] {
    switch (target) {
      case 'landed':
        // Would need landed property context
        return [];
      case 'all':
        return context.gameState.board;
      case 'group':
        // Would need group context
        return [];
      default:
        // UUID
        const prop = context.gameState.board.find(p => p.id === target);
        return prop ? [prop] : [];
    }
  }
}