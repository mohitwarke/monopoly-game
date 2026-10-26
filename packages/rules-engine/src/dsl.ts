// Rules Engine - Domain Specific Language for Rules

import type { CustomRule, RulesConfig, GameState, Player, Property, UUID } from '@monopoly/shared';
import { PropertyType, PropertyGroup, GamePhase, PlayerAction } from '@monopoly/shared';
import { RuleDefinition, RuleTrigger, RuleEffect, RuleContext } from './registry';

/**
 * Rule DSL - Fluent API for defining rules
 */
export class RuleBuilder {
  private definition: Partial<RuleDefinition> = {
    triggers: [],
    effects: [],
    priority: 100,
  };

  id(id: string): this {
    this.definition.id = id;
    return this;
  }

  name(name: string): this {
    this.definition.name = name;
    return this;
  }

  description(description: string): this {
    this.definition.description = description;
    return this;
  }

  category(category: CustomRule['category']): this {
    this.definition.category = category;
    return this;
  }

  priority(priority: number): this {
    this.definition.priority = priority;
    return this;
  }

  oncePerGame(): this {
    this.definition.oncePerGame = true;
    return this;
  }

  oncePerTurn(): this {
    this.definition.oncePerTurn = true;
    return this;
  }

  // Triggers
  onLand(propertyId: number | number[]): this {
    this.definition.triggers!.push({ type: 'onLand', propertyId });
    return this;
  }

  onPassGo(): this {
    this.definition.triggers!.push({ type: 'onPassGo' });
    return this;
  }

  onRoll(condition?: (roll: { die1: number; die2: number; total: number; isDouble: boolean }) => boolean): this {
    this.definition.triggers!.push({ type: 'onRoll', condition });
    return this;
  }

  onBuyProperty(): this {
    this.definition.triggers!.push({ type: 'onBuyProperty' });
    return this;
  }

  onAuctionStart(): this {
    this.definition.triggers!.push({ type: 'onAuctionStart' });
    return this;
  }

  onAuctionBid(): this {
    this.definition.triggers!.push({ type: 'onAuctionBid' });
    return this;
  }

  onAuctionEnd(): this {
    this.definition.triggers!.push({ type: 'onAuctionEnd' });
    return this;
  }

  onTradePropose(): this {
    this.definition.triggers!.push({ type: 'onTradePropose' });
    return this;
  }

  onTradeResolve(): this {
    this.definition.triggers!.push({ type: 'onTradeResolve' });
    return this;
  }

  onBuild(): this {
    this.definition.triggers!.push({ type: 'onBuild' });
    return this;
  }

  onSell(): this {
    this.definition.triggers!.push({ type: 'onSell' });
    return this;
  }

  onMortgage(): this {
    this.definition.triggers!.push({ type: 'onMortgage' });
    return this;
  }

  onUnmortgage(): this {
    this.definition.triggers!.push({ type: 'onUnmortgage' });
    return this;
  }

  onJailEnter(): this {
    this.definition.triggers!.push({ type: 'onJailEnter' });
    return this;
  }

  onJailExit(method?: 'bail' | 'card' | 'doubles'): this {
    this.definition.triggers!.push({ type: 'onJailExit', method: method! });
    return this;
  }

  onTurnStart(): this {
    this.definition.triggers!.push({ type: 'onTurnStart' });
    return this;
  }

  onTurnEnd(): this {
    this.definition.triggers!.push({ type: 'onTurnEnd' });
    return this;
  }

  onBankruptcy(): this {
    this.definition.triggers!.push({ type: 'onBankruptcy' });
    return this;
  }

  onGameEnd(): this {
    this.definition.triggers!.push({ type: 'onGameEnd' });
    return this;
  }

  periodic(intervalMs: number): this {
    this.definition.triggers!.push({ type: 'periodic', intervalMs });
    return this;
  }

  // Effects
  giveMoney(target: RuleEffect['target'], amount: number | ((ctx: RuleContext) => number)): this {
    this.definition.effects!.push({ type: 'modifyMoney', target, amount });
    return this;
  }

  takeMoney(target: RuleEffect['target'], amount: number | ((ctx: RuleContext) => number)): this {
    this.definition.effects!.push({ type: 'modifyMoney', target, amount: (ctx) => -Math.abs(typeof amount === 'function' ? amount(ctx) : amount) });
    return this;
  }

  setMoney(target: RuleEffect['target'], amount: number | ((ctx: RuleContext) => number)): this {
    this.definition.effects!.push({ type: 'custom', handler: (ctx) => {
      const targets = this.resolveTargets(target, ctx);
      const value = typeof amount === 'function' ? amount(ctx) : amount;
      for (const t of targets) t.money = value;
    }});
    return this;
  }

  movePlayer(target: RuleEffect['target'], spaces: number | ((ctx: RuleContext) => number)): this {
    this.definition.effects!.push({ type: 'movePlayer', target, spaces });
    return this;
  }

  sendToJail(target: RuleEffect['target']): this {
    this.definition.effects!.push({ type: 'sendToJail', target });
    return this;
  }

  freeFromJail(target: RuleEffect['target']): this {
    this.definition.effects!.push({ type: 'freeFromJail', target });
    return this;
  }

  giveGetOutOfJailFreeCard(target: RuleEffect['target']): this {
    this.definition.effects!.push({ type: 'giveCard', target, cardType: 'chance' });
    return this;
  }

  giveCommunityChestCard(target: RuleEffect['target']): this {
    this.definition.effects!.push({ type: 'giveCard', target, cardType: 'communityChest' });
    return this;
  }

  skipTurn(target: RuleEffect['target']): this {
    this.definition.effects!.push({ type: 'skipTurn', target });
    return this;
  }

  extraTurn(target: RuleEffect['target']): this {
    this.definition.effects!.push({ type: 'extraTurn', target });
    return this;
  }

  multiplyRent(target: RuleEffect['target'], multiplier: number | ((ctx: RuleContext) => number)): this {
    this.definition.effects!.push({ type: 'modifyRent', target, multiplier });
    return this;
  }

  setPhase(phase: GamePhase): this {
    this.definition.effects!.push({ type: 'setPhase', phase });
    return this;
  }

  customEffect(handler: (ctx: RuleContext) => void | Promise<void>): this {
    this.definition.effects!.push({ type: 'custom', handler });
    return this;
  }

  modifyProperty(target: RuleEffect['target'], changes: Partial<Property>): this {
    this.definition.effects!.push({ type: 'modifyProperty', target, changes });
    return this;
  }

  configSchema(schema: Record<string, unknown>): this {
    this.definition.configSchema = schema;
    return this;
  }

  build(): RuleDefinition {
    if (!this.definition.id) throw new Error('Rule ID is required');
    if (!this.definition.name) throw new Error('Rule name is required');
    if (!this.definition.category) throw new Error('Rule category is required');
    if (!this.definition.triggers || this.definition.triggers.length === 0) {
      throw new Error('At least one trigger is required');
    }
    if (!this.definition.effects || this.definition.effects.length === 0) {
      throw new Error('At least one effect is required');
    }

    return this.definition as RuleDefinition;
  }

  private resolveTargets(target: RuleEffect['target'], context: RuleContext): Player[] {
    switch (target) {
      case 'current':
        return [context.currentPlayer];
      case 'all':
        return context.gameState.players.filter(p => !p.isBankrupt);
      case 'owner':
        return [];
      case 'target':
        return [];
      default:
        const player = context.gameState.players.find(p => p.id === target);
        return player ? [player] : [];
    }
  }
}

/**
 * Create a new rule builder
 */
export function rule(): RuleBuilder {
  return new RuleBuilder();
}

/**
 * Predefined rule templates
 */
export const RuleTemplates = {
  // Economy templates
  taxOnSpace: (space: number, amount: number) =>
    rule()
      .id(`tax-on-${space}`)
      .name(`Tax on Space ${space}`)
      .description(`Pay $${amount} when landing on space ${space}`)
      .category('economy')
      .onLand(space)
      .takeMoney('current', amount)
      .configSchema({
        type: 'object',
        properties: { space: { type: 'number' }, amount: { type: 'number' } },
        required: ['space', 'amount'],
      })
      .build(),

  bonusOnRoll: (condition: (roll: { die1: number; die2: number }) => boolean, amount: number) =>
    rule()
      .id(`bonus-on-roll-${Date.now()}`)
      .name('Bonus on Roll')
      .description(`Get $${amount} when rolling specific combination`)
      .category('economy')
      .onRoll(condition)
      .giveMoney('current', amount)
      .configSchema({
        type: 'object',
        properties: { condition: { type: 'string' }, amount: { type: 'number' } },
        required: ['condition', 'amount'],
      })
      .build(),

  // Property templates
  rentMultiplier: (group: PropertyGroup, multiplier: number) =>
    rule()
      .id(`rent-multiplier-${group}`)
      .name(`${group} Rent Multiplier`)
      .description(`Multiply rent for ${group} properties by ${multiplier}x`)
      .category('property')
      .onLand([]) // Would need group-based trigger
      .multiplyRent('group', multiplier)
      .configSchema({
        type: 'object',
        properties: { group: { type: 'string' }, multiplier: { type: 'number' } },
        required: ['group', 'multiplier'],
      })
      .build(),

  // Jail templates
  freeJailExit: () =>
    rule()
      .id('free-jail-exit')
      .name('Free Jail Exit')
      .description('Getting out of jail is free')
      .category('jail')
      .onJailExit('bail')
      .customEffect((ctx) => {
        ctx.currentPlayer.money += ctx.gameState.rulesConfig.bailAmount;
      })
      .configSchema({ type: 'object' })
      .build(),

  // Winning templates
  timeLimit: (minutes: number) =>
    rule()
      .id('time-limit')
      .name(`${minutes} Minute Time Limit`)
      .description(`Game ends after ${minutes} minutes. Richest player wins.`)
      .category('winning')
      .periodic(60000)
      .customEffect((ctx) => {
        const elapsed = Date.now() - (ctx.gameState.startedAt ?? Date.now());
        if (elapsed >= minutes * 60 * 1000) {
          const active = ctx.gameState.players.filter(p => !p.isBankrupt);
          let richest = active[0];
          for (const p of active) if (p.netWorth > richest.netWorth) richest = p;
          ctx.gameState.phase = GamePhase.GAME_OVER;
          ctx.gameState.winnerId = richest.id;
          ctx.gameState.endedAt = Date.now();
        }
      })
      .configSchema({
        type: 'object',
        properties: { minutes: { type: 'number', default: 60 } },
      })
      .build(),

  wealthVictory: (targetNetWorth: number) =>
    rule()
      .id('wealth-victory')
      .name(`Wealth Victory: $${targetNetWorth}`)
      .description(`First player to reach $${targetNetWorth} net worth wins`)
      .category('winning')
      .onTurnEnd()
      .customEffect((ctx) => {
        if (ctx.currentPlayer.netWorth >= targetNetWorth) {
          ctx.gameState.phase = GamePhase.GAME_OVER;
          ctx.gameState.winnerId = ctx.currentPlayer.id;
          ctx.gameState.endedAt = Date.now();
        }
      })
      .configSchema({
        type: 'object',
        properties: { targetNetWorth: { type: 'number', default: 5000 } },
      })
      .build(),

  mercyRule: (leadMargin: number) =>
    rule()
      .id('mercy-rule')
      .name(`Mercy Rule: $${leadMargin} Lead`)
      .description(`Game ends if a player leads by $${leadMargin}`)
      .category('winning')
      .onTurnEnd()
      .customEffect((ctx) => {
        const active = ctx.gameState.players.filter(p => !p.isBankrupt);
        if (active.length >= 2) {
          const sorted = [...active].sort((a, b) => b.netWorth - a.netWorth);
          if (sorted[0].netWorth - sorted[1].netWorth >= leadMargin) {
            ctx.gameState.phase = GamePhase.GAME_OVER;
            ctx.gameState.winnerId = sorted[0].id;
            ctx.gameState.endedAt = Date.now();
          }
        }
      })
      .configSchema({
        type: 'object',
        properties: { leadMargin: { type: 'number', default: 3000 } },
      })
      .build(),
};

/**
 * Parse rule from JSON/YAML
 */
export function parseRule(json: string): RuleDefinition {
  const parsed = JSON.parse(json);
  return parsed as RuleDefinition;
}

/**
 * Serialize rule to JSON
 */
export function serializeRule(definition: RuleDefinition): string {
  return JSON.stringify(definition, null, 2);
}

/**
 * Validate rule definition
 */
export function validateRuleDefinition(definition: RuleDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!definition.id) errors.push('Rule ID is required');
  if (!definition.name) errors.push('Rule name is required');
  if (!definition.category) errors.push('Rule category is required');
  if (!definition.triggers || definition.triggers.length === 0) {
    errors.push('At least one trigger is required');
  }
  if (!definition.effects || definition.effects.length === 0) {
    errors.push('At least one effect is required');
  }

  // Validate triggers
  for (const trigger of definition.triggers ?? []) {
    if (trigger.type === 'onLand' && Array.isArray(trigger.propertyId)) {
      for (const pid of trigger.propertyId) {
        if (pid < 0 || pid > 39) errors.push(`Invalid property ID: ${pid}`);
      }
    }
  }

  // Validate effects
  for (const effect of definition.effects ?? []) {
    if (effect.type === 'modifyMoney' && typeof effect.amount === 'function') {
      // Can't validate function
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Rule Set - Collection of rules that work together
 */
export interface RuleSet {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  rules: RuleDefinition[];
  defaultConfig: Record<string, Record<string, unknown>>;
}

/**
 * Create a rule set
 */
export function createRuleSet(
  id: string,
  name: string,
  description: string,
  version: string,
  author: string,
  rules: RuleDefinition[],
  defaultConfig: Record<string, Record<string, unknown>> = {}
): RuleSet {
  return { id, name, description, version, author, rules, defaultConfig };
}

/**
 * Standard Monopoly Rule Set
 */
export const STANDARD_RULE_SET: RuleSet = createRuleSet(
  'standard',
  'Standard Monopoly',
  'Official Monopoly rules',
  '1.0.0',
  'Monopoly Game',
  [
    // Standard rules are handled by the game engine, not the rules engine
    // This is just a placeholder
  ],
  {}
);

/**
 * House Rules Rule Set
 */
export const HOUSE_RULES_RULE_SET: RuleSet = createRuleSet(
  'house-rules',
  'Popular House Rules',
  'Common house rules for Monopoly',
  '1.0.0',
  'Community',
  [
    RuleTemplates.freeJailExit(),
    RuleTemplates.timeLimit(60),
    RuleTemplates.wealthVictory(5000),
    RuleTemplates.mercyRule(3000),
  ],
  {
    'free-jail-exit': {},
    'time-limit': { minutes: 60 },
    'wealth-victory': { targetNetWorth: 5000 },
    'mercy-rule': { leadMargin: 3000 },
  }
);

/**
 * Speed Game Rule Set
 */
export const SPEED_GAME_RULE_SET: RuleSet = createRuleSet(
  'speed-game',
  'Speed Monopoly',
  'Fast-paced Monopoly variant',
  '1.0.0',
  'Monopoly Game',
  [
    RuleTemplates.timeLimit(30),
    RuleTemplates.wealthVictory(3000),
    rule()
      .id('double-salary')
      .name('Double Salary')
      .description('Double salary on GO')
      .category('economy')
      .onPassGo()
      .giveMoney('current', (ctx) => ctx.gameState.rulesConfig.goSalary)
      .configSchema({ type: 'object' })
      .build(),
    rule()
      .id('start-with-properties')
      .name('Start with Properties')
      .description('Each player starts with 2 random properties')
      .category('property')
      .onTurnStart()
      .customEffect((ctx) => {
        if (ctx.gameState.turn === 0) {
          // Give each player 2 random unowned properties
          const unowned = ctx.gameState.board.filter(p => p.ownerId === null && p.type !== PropertyType.SPECIAL);
          for (const player of ctx.gameState.players) {
            for (let i = 0; i < 2 && unowned.length > 0; i++) {
              const idx = Math.floor(Math.random() * unowned.length);
              const prop = unowned.splice(idx, 1)[0];
              prop.ownerId = player.id;
              player.properties.push(prop.id);
            }
          }
        }
      })
      .configSchema({ type: 'object' })
      .build(),
  ],
  {
    'time-limit': { minutes: 30 },
    'wealth-victory': { targetNetWorth: 3000 },
    'double-salary': {},
    'start-with-properties': {},
  }
);