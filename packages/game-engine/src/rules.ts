// Rules Engine - Rule validation and custom rule processing

import type { RulesConfig, CustomRule, GameState, Player, Property, UUID } from '@monopoly/shared';
import { PropertyType, PropertyGroup, GamePhase, PlayerAction, GAME_CONSTANTS, DEFAULT_RULES_CONFIG } from '@monopoly/shared';
import { validateRulesConfig as sharedValidateRulesConfig } from '@monopoly/shared';

/**
 * Rule Registry - Manages custom rules
 */
export class RuleRegistry {
  private rules: Map<string, CustomRule> = new Map();

  constructor(rules: CustomRule[] = []) {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  register(rule: CustomRule): void {
    this.rules.set(rule.id, rule);
  }

  unregister(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  get(ruleId: string): CustomRule | undefined {
    return this.rules.get(ruleId);
  }

  getAll(): CustomRule[] {
    return Array.from(this.rules.values());
  }

  getEnabled(): CustomRule[] {
    return this.getAll().filter(r => r.enabled);
  }

  getByCategory(category: CustomRule['category']): CustomRule[] {
    return this.getEnabled().filter(r => r.category === category);
  }

  isEnabled(ruleId: string): boolean {
    return this.rules.get(ruleId)?.enabled ?? false;
  }

  enable(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) rule.enabled = true;
  }

  disable(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) rule.enabled = false;
  }
}

/**
 * Built-in House Rules
 */
export const BUILTIN_HOUSE_RULES: CustomRule[] = [
  {
    id: 'free-parking-jackpot',
    name: 'Free Parking Jackpot',
    description: 'All taxes and fees go to Free Parking. Landing on Free Parking collects the jackpot.',
    category: 'economy',
    enabled: false,
    config: { collectOnLanding: true },
  },
  {
    id: 'double-go-salary',
    name: 'Double Salary on GO',
    description: 'Landing exactly on GO gives double salary ($400 instead of $200).',
    category: 'economy',
    enabled: false,
    config: { multiplier: 2 },
  },
  {
    id: 'no-auctions',
    name: 'No Auctions',
    description: 'Properties cannot be auctioned. If a player declines to buy, it remains unowned.',
    category: 'property',
    enabled: false,
    config: {},
  },
  {
    id: 'unlimited-houses',
    name: 'Unlimited Houses/Hotels',
    description: 'No limit on the number of houses and hotels (ignores the 32/12 limit).',
    category: 'property',
    enabled: false,
    config: {},
  },
  {
    id: 'free-bail',
    name: 'Free Bail',
    description: 'Getting out of jail is free (no $50 bail).',
    category: 'jail',
    enabled: false,
    config: {},
  },
  {
    id: 'jail-free-parking',
    name: 'Jail = Free Parking',
    description: 'While in jail, you collect rent as normal (standard rules already do this, this is a reminder).',
    category: 'jail',
    enabled: false,
    config: {},
  },
  {
    id: 'snake-eyes-bonus',
    name: 'Snake Eyes Bonus',
    description: 'Rolling snake eyes (double 1) gives a $500 bonus.',
    category: 'economy',
    enabled: false,
    config: { bonus: 500 },
  },
  {
    id: 'property-trading-anytime',
    name: 'Trade Anytime',
    description: 'Players can propose trades at any time, not just on their turn.',
    category: 'trading',
    enabled: false,
    config: {},
  },
  {
    id: 'forced-trade',
    name: 'Forced Trade',
    description: 'Players can force a trade once per game (target must accept).',
    category: 'trading',
    enabled: false,
    config: { usesPerGame: 1 },
  },
  {
    id: 'time-limit',
    name: 'Time Limit',
    description: 'Game ends after specified time. Richest player wins.',
    category: 'winning',
    enabled: false,
    config: { minutes: 60 },
  },
  {
    id: 'wealth-victory',
    name: 'Wealth Victory',
    description: 'First player to reach target net worth wins.',
    category: 'winning',
    enabled: false,
    config: { targetNetWorth: 5000 },
  },
  {
    id: 'mercy-rule',
    name: 'Mercy Rule',
    description: 'Game ends if a player leads by a certain margin.',
    category: 'winning',
    enabled: false,
    config: { leadMargin: 3000 },
  },
];

/**
 * Rule Processor - Applies custom rules to game state
 */
export class RuleProcessor {
  private registry: RuleRegistry;

  constructor(rulesConfig: RulesConfig) {
    this.registry = new RuleRegistry([
      ...BUILTIN_HOUSE_RULES,
      ...rulesConfig.customRules,
    ]);
  }

  getRegistry(): RuleRegistry {
    return this.registry;
  }

  /**
   * Apply rules when landing on Free Parking
   */
  applyFreeParkingRules(state: GameState, player: Player): void {
    if (this.registry.isEnabled('free-parking-jackpot') && state.freeParkingJackpot > 0) {
      player.money += state.freeParkingJackpot;
      state.freeParkingJackpot = 0;
    }
  }

  /**
   * Apply rules when passing/landing on GO
   */
  applyGoRules(state: GameState, player: Player, landedExactly: boolean): void {
    let salary = state.rulesConfig.goSalary;

    if (this.registry.isEnabled('double-go-salary') && landedExactly) {
      salary *= 2;
    }

    player.money += salary;
  }

  /**
   * Apply rules for property purchase/auction
   */
  applyPropertyRules(state: GameState, property: Property): boolean {
    // No auctions rule
    if (this.registry.isEnabled('no-auctions')) {
      return false; // Don't auction
    }
    return true; // Allow auction
  }

  /**
   * Apply rules for building limits
   */
  getBuildingLimits(state: GameState): { maxHouses: number; maxHotels: number } {
    if (this.registry.isEnabled('unlimited-houses')) {
      return { maxHouses: Infinity, maxHotels: Infinity };
    }
    return {
      maxHouses: state.rulesConfig.maxHouses,
      maxHotels: state.rulesConfig.maxHotels,
    };
  }

  /**
   * Apply rules for jail bail
   */
  getJailBailAmount(state: GameState): number {
    if (this.registry.isEnabled('free-bail')) {
      return 0;
    }
    return state.rulesConfig.bailAmount;
  }

  /**
   * Apply rules for dice rolls
   */
  applyDiceRollRules(state: GameState, player: Player, diceRoll: { die1: number; die2: number; total: number }): void {
    if (this.registry.isEnabled('snake-eyes-bonus') && diceRoll.die1 === 1 && diceRoll.die2 === 1) {
      player.money += 500;
    }
  }

  /**
   * Apply rules for trading
   */
  canTradeAnytime(state: GameState): boolean {
    return this.registry.isEnabled('property-trading-anytime');
  }

  /**
   * Check victory conditions
   */
  checkVictoryConditions(state: GameState): UUID | null {
    // Standard bankruptcy check
    const activePlayers = state.players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1) {
      return activePlayers[0]?.id ?? null;
    }

    // Time limit
    if (this.registry.isEnabled('time-limit')) {
      const timeLimit = this.registry.get('time-limit')?.config.minutes as number ?? 60;
      const elapsed = Date.now() - (state.startedAt ?? Date.now());
      if (elapsed >= timeLimit * 60 * 1000) {
        // Richest player wins
        let richest = activePlayers[0];
        for (const p of activePlayers) {
          if (p.netWorth > richest.netWorth) richest = p;
        }
        return richest.id;
      }
    }

    // Wealth victory
    if (this.registry.isEnabled('wealth-victory')) {
      const target = this.registry.get('wealth-victory')?.config.targetNetWorth as number ?? 5000;
      for (const p of activePlayers) {
        if (p.netWorth >= target) return p.id;
      }
    }

    // Mercy rule
    if (this.registry.isEnabled('mercy-rule')) {
      const margin = this.registry.get('mercy-rule')?.config.leadMargin as number ?? 3000;
      const sorted = [...activePlayers].sort((a, b) => b.netWorth - a.netWorth);
      if (sorted.length >= 2 && sorted[0].netWorth - sorted[1].netWorth >= margin) {
        return sorted[0].id;
      }
    }

    // Max turns
    if (state.rulesConfig.maxTurns && state.turn >= state.rulesConfig.maxTurns) {
      let richest = activePlayers[0];
      for (const p of activePlayers) {
        if (p.netWorth > richest.netWorth) richest = p;
      }
      return richest.id;
    }

    return null;
  }

  /**
   * Calculate rent with custom rules
   */
  calculateRent(property: Property, board: Property[], diceRoll?: { total: number }): number {
    // Standard rent calculation (delegated to shared utils in practice)
    // This is here for custom rule modifications
    let rent = 0;

    if (property.isMortgaged || property.ownerId === null) return 0;

    if (property.type === PropertyType.UTILITY) {
      const ownerProps = board.filter(p => p.ownerId === property.ownerId && p.type === PropertyType.UTILITY);
      const multiplier = ownerProps.length === 2 ? 10 : 4;
      rent = (diceRoll?.total ?? 7) * multiplier;
    } else if (property.type === PropertyType.RAILROAD) {
      const owned = board.filter(p => p.ownerId === property.ownerId && p.type === PropertyType.RAILROAD).length;
      rent = [0, 25, 50, 100, 200][owned] ?? 0;
    } else if (property.type === PropertyType.STREET) {
      const hasMonopoly = board
        .filter(p => p.group === property.group && p.type === PropertyType.STREET)
        .every(p => p.ownerId === property.ownerId);
      if (property.houses === 0 && hasMonopoly) {
        rent = property.rent[0] * 2;
      } else {
        rent = property.rent[property.houses] ?? 0;
      }
    }

    return rent;
  }

  /**
   * Validate rules config
   */
  static validateConfig(config: RulesConfig): { valid: boolean; errors: string[] } {
    return sharedValidateRulesConfig(config);
  }

  /**
   * Merge custom rules with defaults
   */
  static mergeWithDefaults(partial: Partial<RulesConfig>): RulesConfig {
    return {
      ...DEFAULT_RULES_CONFIG,
      ...partial,
      customRules: partial.customRules ?? DEFAULT_RULES_CONFIG.customRules,
    };
  }
}

/**
 * Rule Definition Schema (for modding system)
 */
export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  category: 'economy' | 'property' | 'jail' | 'trading' | 'winning' | 'custom';
  triggers: RuleTrigger[];
  effects: RuleEffect[];
  configSchema: Record<string, unknown>; // JSON Schema for config
}

export type RuleTrigger =
  | { type: 'onLand'; space: number | number[] }
  | { type: 'onPassGo' }
  | { type: 'onRoll'; condition?: (roll: { die1: number; die2: number }) => boolean }
  | { type: 'onBuyProperty' }
  | { type: 'onAuction' }
  | { type: 'onTrade' }
  | { type: 'onBuild' }
  | { type: 'onMortgage' }
  | { type: 'onJailEnter' }
  | { type: 'onJailExit' }
  | { type: 'onTurnStart' }
  | { type: 'onTurnEnd' }
  | { type: 'onBankruptcy' }
  | { type: 'periodic'; intervalMs: number };

export type RuleEffect =
  | { type: 'modifyMoney'; player: 'current' | 'all' | 'owner' | 'target'; amount: number | ((state: GameState) => number) }
  | { type: 'modifyProperty'; property: 'landed' | 'all' | 'group'; changes: Partial<Property> }
  | { type: 'movePlayer'; player: 'current' | 'target'; spaces: number | ((state: GameState) => number) }
  | { type: 'sendToJail'; player: 'current' | 'target' }
  | { type: 'freeFromJail'; player: 'current' | 'target' }
  | { type: 'giveCard'; player: 'current' | 'target'; cardType: 'chance' | 'communityChest' }
  | { type: 'skipTurn'; player: 'current' | 'target' }
  | { type: 'extraTurn'; player: 'current' }
  | { type: 'modifyRent'; property: 'landed' | 'group' | 'all'; multiplier: number }
  | { type: 'custom'; handler: (state: GameState, config: Record<string, unknown>) => void };

/**
 * Create a custom rule from definition
 */
export function createCustomRule(definition: RuleDefinition, config: Record<string, unknown>): CustomRule {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    enabled: true,
    config,
  };
}

/**
 * Predefined rule templates for modding
 */
export const RULE_TEMPLATES: RuleDefinition[] = [
  {
    id: 'custom-tax',
    name: 'Custom Tax',
    description: 'Add a custom tax on specific spaces',
    category: 'economy',
    triggers: [{ type: 'onLand', space: [] }],
    effects: [{ type: 'modifyMoney', player: 'current', amount: -100 }],
    configSchema: {
      type: 'object',
      properties: {
        spaces: { type: 'array', items: { type: 'number' } },
        amount: { type: 'number' },
      },
      required: ['spaces', 'amount'],
    },
  },
  {
    id: 'custom-bonus',
    name: 'Custom Bonus',
    description: 'Give bonus money on specific dice rolls',
    category: 'economy',
    triggers: [{ type: 'onRoll', condition: (roll) => roll.die1 === roll.die2 }],
    effects: [{ type: 'modifyMoney', player: 'current', amount: 100 }],
    configSchema: {
      type: 'object',
      properties: {
        condition: { type: 'string' }, // Expression
        amount: { type: 'number' },
      },
      required: ['condition', 'amount'],
    },
  },
  {
    id: 'custom-rent',
    name: 'Custom Rent Modifier',
    description: 'Modify rent for specific property groups',
    category: 'property',
    triggers: [{ type: 'onLand', space: [] }],
    effects: [{ type: 'modifyRent', property: 'group', multiplier: 1.5 }],
    configSchema: {
      type: 'object',
      properties: {
        groups: { type: 'array', items: { type: 'string' } },
        multiplier: { type: 'number' },
      },
      required: ['groups', 'multiplier'],
    },
  },
];