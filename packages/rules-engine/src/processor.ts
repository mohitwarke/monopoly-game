// Rules Engine - Rule Processor

import type { RulesConfig, CustomRule, GameState, Player, Property, UUID, Card, DiceRoll, TradeOffer, Auction } from '@monopoly/shared';
import { PropertyType, PropertyGroup, GamePhase, PlayerAction, AIDifficulty, GAME_CONSTANTS, DEFAULT_RULES_CONFIG } from '@monopoly/shared';
import { RuleRegistry, RuleEngine, RuleDefinition, RuleTrigger, RuleEffect, RuleContext, CompiledRule } from './registry';

/**
 * Rule Processor - High-level interface for applying rules to game
 */
export class RuleProcessor {
  private registry: RuleRegistry;
  private engine: RuleEngine;
  private definitions: RuleDefinition[] = [];

  constructor(rulesConfig: RulesConfig) {
    this.registry = new RuleRegistry(rulesConfig.customRules);
    this.engine = new RuleEngine();
    this.loadBuiltinRules();
    this.loadCustomRules(rulesConfig.customRules);
  }

  private loadBuiltinRules(): void {
    // Built-in rule definitions
    this.definitions = [
      // Free Parking Jackpot
      {
        id: 'free-parking-jackpot',
        name: 'Free Parking Jackpot',
        description: 'All taxes and fees go to Free Parking. Landing on Free Parking collects the jackpot.',
        category: 'economy',
        triggers: [
          { type: 'onLand', propertyId: 20 }, // Free Parking position
        ],
        effects: [
          { type: 'modifyMoney', target: 'current', amount: (ctx: RuleContext) => ctx.gameState.freeParkingJackpot },
          { type: 'custom', handler: (ctx: RuleContext) => { ctx.gameState.freeParkingJackpot = 0; } },
        ],
        configSchema: { type: 'object', properties: { collectOnLanding: { type: 'boolean' } } },
        priority: 100,
      },
      // Double GO Salary
      {
        id: 'double-go-salary',
        name: 'Double Salary on GO',
        description: 'Landing exactly on GO gives double salary.',
        category: 'economy',
        triggers: [
          { type: 'onLand', propertyId: 0 }, // GO position
        ],
        effects: [
          { type: 'modifyMoney', target: 'current', amount: (ctx: RuleContext) => ctx.gameState.rulesConfig.goSalary },
        ],
        configSchema: { type: 'object', properties: { multiplier: { type: 'number', default: 2 } } },
        priority: 100,
      },
      // Snake Eyes Bonus
      {
        id: 'snake-eyes-bonus',
        name: 'Snake Eyes Bonus',
        description: 'Rolling snake eyes (double 1) gives a bonus.',
        category: 'economy',
        triggers: [
          { type: 'onRoll', condition: (roll) => roll.die1 === 1 && roll.die2 === 1 },
        ],
        effects: [
          { type: 'modifyMoney', target: 'current', amount: 500 },
        ],
        configSchema: { type: 'object', properties: { bonus: { type: 'number', default: 500 } } },
        priority: 100,
      },
      // Free Bail
      {
        id: 'free-bail',
        name: 'Free Bail',
        description: 'Getting out of jail is free.',
        category: 'jail',
        triggers: [
          { type: 'onJailExit', method: 'bail' },
        ],
        effects: [
          { type: 'custom', handler: (ctx: RuleContext) => {
            // Refund the bail amount
            const player = ctx.currentPlayer;
            player.money += ctx.gameState.rulesConfig.bailAmount;
          }},
        ],
        configSchema: { type: 'object' },
        priority: 100,
      },
      // Time Limit Victory
      {
        id: 'time-limit',
        name: 'Time Limit',
        description: 'Game ends after specified time. Richest player wins.',
        category: 'winning',
        triggers: [
          { type: 'periodic', intervalMs: 60000 }, // Check every minute
        ],
        effects: [
          { type: 'custom', handler: (ctx: RuleContext) => {
            const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'time-limit')?.config as { minutes?: number } ?? {};
            const timeLimit = config.minutes ?? 60;
            const elapsed = Date.now() - (ctx.gameState.startedAt ?? Date.now());
            if (elapsed >= timeLimit * 60 * 1000) {
              const activePlayers = ctx.gameState.players.filter(p => !p.isBankrupt);
              let richest = activePlayers[0];
              for (const p of activePlayers) {
                if (p.netWorth > richest.netWorth) richest = p;
              }
              ctx.gameState.phase = GamePhase.GAME_OVER;
              ctx.gameState.winnerId = richest.id;
              ctx.gameState.endedAt = Date.now();
            }
          }},
        ],
        configSchema: { type: 'object', properties: { minutes: { type: 'number', default: 60 } } },
        priority: 50,
      },
      // Wealth Victory
      {
        id: 'wealth-victory',
        name: 'Wealth Victory',
        description: 'First player to reach target net worth wins.',
        category: 'winning',
        triggers: [
          { type: 'onTurnEnd' },
        ],
        effects: [
          { type: 'custom', handler: (ctx: RuleContext) => {
            const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'wealth-victory')?.config as { targetNetWorth?: number } ?? {};
            const target = config.targetNetWorth ?? 5000;
            if (ctx.currentPlayer.netWorth >= target) {
              ctx.gameState.phase = GamePhase.GAME_OVER;
              ctx.gameState.winnerId = ctx.currentPlayer.id;
              ctx.gameState.endedAt = Date.now();
            }
          }},
        ],
        configSchema: { type: 'object', properties: { targetNetWorth: { type: 'number', default: 5000 } } },
        priority: 50,
      },
      // Mercy Rule
      {
        id: 'mercy-rule',
        name: 'Mercy Rule',
        description: 'Game ends if a player leads by a certain margin.',
        category: 'winning',
        triggers: [
          { type: 'onTurnEnd' },
        ],
        effects: [
          { type: 'custom', handler: (ctx: RuleContext) => {
            const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'mercy-rule')?.config as { leadMargin?: number } ?? {};
            const margin = config.leadMargin ?? 3000;
            const activePlayers = ctx.gameState.players.filter(p => !p.isBankrupt);
            if (activePlayers.length >= 2) {
              const sorted = [...activePlayers].sort((a, b) => b.netWorth - a.netWorth);
              if (sorted[0].netWorth - sorted[1].netWorth >= margin) {
                ctx.gameState.phase = GamePhase.GAME_OVER;
                ctx.gameState.winnerId = sorted[0].id;
                ctx.gameState.endedAt = Date.now();
              }
            }
          }},
        ],
        configSchema: { type: 'object', properties: { leadMargin: { type: 'number', default: 3000 } } },
        priority: 50,
      },
    ];
  }

  private loadCustomRules(customRules: CustomRule[]): void {
    for (const rule of customRules) {
      if (rule.enabled) {
        // Custom rules would be defined via DSL or modding system
        // For now, we just register them
        this.registry.register(rule);
      }
    }
  }

  /**
   * Process a trigger and apply all matching rules
   */
  async processTrigger(trigger: RuleTrigger, context: RuleContext): Promise<void> {
    await this.engine.executeTrigger(trigger, context);
  }

  /**
   * Get the registry for direct access
   */
  getRegistry(): RuleRegistry {
    return this.registry;
  }

  /**
   * Get the engine for direct access
   */
  getEngine(): RuleEngine {
    return this.engine;
  }

  /**
   * Check victory conditions
   */
  checkVictoryConditions(gameState: GameState): UUID | null {
    // Standard bankruptcy check
    const activePlayers = gameState.players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1) {
      return activePlayers[0]?.id ?? null;
    }

    // Check custom victory rules
    for (const rule of this.registry.getByCategory('winning')) {
      if (rule.id === 'time-limit') {
        const config = rule.config as { minutes?: number };
        const timeLimit = config?.minutes ?? 60;
        const elapsed = Date.now() - (gameState.startedAt ?? Date.now());
        if (elapsed >= timeLimit * 60 * 1000) {
          let richest = activePlayers[0];
          for (const p of activePlayers) {
            if (p.netWorth > richest.netWorth) richest = p;
          }
          return richest.id;
        }
      } else if (rule.id === 'wealth-victory') {
        const config = rule.config as { targetNetWorth?: number };
        const target = config?.targetNetWorth ?? 5000;
        for (const p of activePlayers) {
          if (p.netWorth >= target) return p.id;
        }
      } else if (rule.id === 'mercy-rule') {
        const config = rule.config as { leadMargin?: number };
        const margin = config?.leadMargin ?? 3000;
        const sorted = [...activePlayers].sort((a, b) => b.netWorth - a.netWorth);
        if (sorted[0].netWorth - sorted[1].netWorth >= margin) {
          return sorted[0].id;
        }
      }
    }

    // Max turns
    if (gameState.rulesConfig.maxTurns && gameState.turn >= gameState.rulesConfig.maxTurns) {
      let richest = activePlayers[0];
      for (const p of activePlayers) {
        if (p.netWorth > richest.netWorth) richest = p;
      }
      return richest.id;
    }

    return null;
  }

  /**
   * Calculate rent with custom rules applied
   */
  calculateRent(property: Property, board: Property[], diceRoll?: DiceRoll, rulesConfig?: RulesConfig): number {
    if (property.isMortgaged || property.ownerId === null) return 0;

    let rent = 0;

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

    // Apply rent multipliers from custom rules
    const multiplier = (property as any).rentMultiplier;
    if (multiplier) {
      rent = Math.floor(rent * multiplier);
    }

    return rent;
  }

  /**
   * Get building limits with custom rules
   */
  getBuildingLimits(rulesConfig: RulesConfig): { maxHouses: number; maxHotels: number } {
    const unlimitedRule = this.registry.get('unlimited-houses');
    if (unlimitedRule?.enabled) {
      return { maxHouses: Infinity, maxHotels: Infinity };
    }
    return {
      maxHouses: rulesConfig.maxHouses,
      maxHotels: rulesConfig.maxHotels,
    };
  }

  /**
   * Get jail bail amount with custom rules
   */
  getJailBailAmount(rulesConfig: RulesConfig): number {
    const freeBailRule = this.registry.get('free-bail');
    if (freeBailRule?.enabled) {
      return 0;
    }
    return rulesConfig.bailAmount;
  }

  /**
   * Check if auctions are enabled
   */
  areAuctionsEnabled(rulesConfig: RulesConfig): boolean {
    const noAuctionsRule = this.registry.get('no-auctions');
    if (noAuctionsRule?.enabled) {
      return false;
    }
    return rulesConfig.auctionOnDecline;
  }

  /**
   * Check if trading is allowed anytime
   */
  canTradeAnytime(rulesConfig: RulesConfig): boolean {
    const tradeAnytimeRule = this.registry.get('property-trading-anytime');
    return tradeAnytimeRule?.enabled ?? false;
  }

  /**
   * Validate rules config
   */
  static validateConfig(config: RulesConfig): { valid: boolean; errors: string[] } {
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
 * Create a rule processor from rules config
 */
export function createRuleProcessor(rulesConfig: RulesConfig): RuleProcessor {
  return new RuleProcessor(rulesConfig);
}

/**
 * Rule evaluation context for DSL
 */
export interface EvaluationContext {
  gameState: GameState;
  currentPlayer: Player;
  trigger: RuleTrigger;
  variables: Record<string, unknown>;
}

/**
 * Simple expression evaluator for rule configs
 */
export function evaluateExpression(expr: string, context: EvaluationContext): unknown {
  // Very simple expression evaluator - in production use a proper expression parser
  // This is just for demonstration
  try {
    // Replace variables
    let evaluated = expr;
    for (const [key, value] of Object.entries(context.variables)) {
      evaluated = evaluated.replace(new RegExp(`\\$${key}`, 'g'), String(value));
    }
    // eslint-disable-next-line no-eval
    return eval(evaluated);
  } catch {
    return undefined;
  }
}