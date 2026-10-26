// Rules Engine - Built-in Rules

import type { CustomRule, RulesConfig, GameState, Player, Property, UUID } from '@monopoly/shared';
import { PropertyType, PropertyGroup, GamePhase, PlayerAction, AIDifficulty, GAME_CONSTANTS, DEFAULT_RULES_CONFIG } from '@monopoly/shared';
import { RuleDefinition, RuleTrigger, RuleEffect, RuleContext } from './registry';

/**
 * All built-in house rules
 */
export const BUILTIN_HOUSE_RULES: CustomRule[] = [
  // Economy Rules
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
    id: 'snake-eyes-bonus',
    name: 'Snake Eyes Bonus',
    description: 'Rolling snake eyes (double 1) gives a $500 bonus.',
    category: 'economy',
    enabled: false,
    config: { bonus: 500 },
  },
  {
    id: 'income-tax-percentage',
    name: 'Income Tax Percentage',
    description: 'Income tax is 10% of net worth instead of flat $200.',
    category: 'economy',
    enabled: false,
    config: { percentage: 0.1 },
  },
  {
    id: 'luxury-tax-percentage',
    name: 'Luxury Tax Percentage',
    description: 'Luxury tax is 5% of net worth instead of flat $100.',
    category: 'economy',
    enabled: false,
    config: { percentage: 0.05 },
  },

  // Property Rules
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
    id: 'free-mortgage',
    name: 'Free Mortgage',
    description: 'Mortgaging and unmortgaging properties has no interest fee.',
    category: 'property',
    enabled: false,
    config: {},
  },
  {
    id: 'sell-houses-full-price',
    name: 'Sell Houses at Full Price',
    description: 'Houses and hotels can be sold back to the bank for full price.',
    category: 'property',
    enabled: false,
    config: {},
  },
  {
    id: 'build-anywhere',
    name: 'Build Anywhere',
    description: 'Can build houses on any owned property, not just monopolies.',
    category: 'property',
    enabled: false,
    config: {},
  },
  {
    id: 'uneven-building',
    name: 'Uneven Building',
    description: 'Can build houses unevenly within a color group.',
    category: 'property',
    enabled: false,
    config: {},
  },

  // Jail Rules
  {
    id: 'free-bail',
    name: 'Free Bail',
    description: 'Getting out of jail is free (no $50 bail).',
    category: 'jail',
    enabled: false,
    config: {},
  },
  {
    id: 'jail-collects-rent',
    name: 'Jail Collects Rent',
    description: 'While in jail, you still collect rent (standard rules already do this).',
    category: 'jail',
    enabled: false,
    config: {},
  },
  {
    id: 'jail-no-trading',
    name: 'No Trading in Jail',
    description: 'Cannot propose or accept trades while in jail.',
    category: 'jail',
    enabled: false,
    config: {},
  },
  {
    id: 'jail-no-building',
    name: 'No Building in Jail',
    description: 'Cannot build houses/hotels while in jail.',
    category: 'jail',
    enabled: false,
    config: {},
  },
  {
    id: 'instant-jail-exit',
    name: 'Instant Jail Exit',
    description: 'Can pay bail or use card immediately on the turn you go to jail.',
    category: 'jail',
    enabled: false,
    config: {},
  },

  // Trading Rules
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
    id: 'no-trading',
    name: 'No Trading',
    description: 'Trading between players is disabled.',
    category: 'trading',
    enabled: false,
    config: {},
  },
  {
    id: 'trade-requires-approval',
    name: 'Trade Requires Approval',
    description: 'All trades must be approved by all other players.',
    category: 'trading',
    enabled: false,
    config: {},
  },

  // Winning Rules
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
  {
    id: 'max-turns',
    name: 'Maximum Turns',
    description: 'Game ends after maximum number of turns. Richest player wins.',
    category: 'winning',
    enabled: false,
    config: { maxTurns: 100 },
  },
  {
    id: 'elimination-only',
    name: 'Elimination Only',
    description: 'Game only ends when all but one player are bankrupt (standard).',
    category: 'winning',
    enabled: false,
    config: {},
  },

  // Custom/Other Rules
  {
    id: 'starting-money-bonus',
    name: 'Starting Money Bonus',
    description: 'Players start with extra money.',
    category: 'custom',
    enabled: false,
    config: { bonus: 500 },
  },
  {
    id: 'random-starting-properties',
    name: 'Random Starting Properties',
    description: 'Each player starts with 2 random properties.',
    category: 'custom',
    enabled: false,
    config: { count: 2 },
  },
  {
    id: 'speed-dice',
    name: 'Speed Die',
    description: 'Add a third "speed die" that modifies movement.',
    category: 'custom',
    enabled: false,
    config: {},
  },
  {
    id: 'property-auction-min-bid',
    name: 'Minimum Auction Bid',
    description: 'Auctions have a minimum starting bid.',
    category: 'custom',
    enabled: false,
    config: { minBid: 10 },
  },
];

/**
 * Built-in Rule Definitions (for DSL)
 */
export const BUILTIN_RULE_DEFINITIONS: RuleDefinition[] = [
  // Free Parking Jackpot
  {
    id: 'free-parking-jackpot',
    name: 'Free Parking Jackpot',
    description: 'All taxes and fees go to Free Parking. Landing on Free Parking collects the jackpot.',
    category: 'economy',
    triggers: [
      { type: 'onLand', propertyId: 20 }, // Free Parking
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
      { type: 'onLand', propertyId: 0 }, // GO
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
  // Income Tax Percentage
  {
    id: 'income-tax-percentage',
    name: 'Income Tax Percentage',
    description: 'Income tax is a percentage of net worth.',
    category: 'economy',
    triggers: [
      { type: 'onLand', propertyId: 4 }, // Income Tax
    ],
    effects: [
      { type: 'custom', handler: (ctx: RuleContext) => {
        const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'income-tax-percentage')?.config as { percentage?: number } ?? {};
        const percentage = config.percentage ?? 0.1;
        const tax = Math.floor(ctx.currentPlayer.netWorth * percentage);
        ctx.currentPlayer.money -= tax;
        if (ctx.gameState.rulesConfig.freeParkingCollectsTaxes) {
          ctx.gameState.freeParkingJackpot += tax;
        }
      }},
    ],
    configSchema: { type: 'object', properties: { percentage: { type: 'number', default: 0.1 } } },
    priority: 100,
  },
  // No Auctions
  {
    id: 'no-auctions',
    name: 'No Auctions',
    description: 'Properties cannot be auctioned.',
    category: 'property',
    triggers: [
      { type: 'onAuctionStart' },
    ],
    effects: [
      { type: 'setPhase', phase: GamePhase.PLAYING },
    ],
    configSchema: { type: 'object' },
    priority: 200,
  },
  // Unlimited Houses
  {
    id: 'unlimited-houses',
    name: 'Unlimited Houses/Hotels',
    description: 'No limit on houses and hotels.',
    category: 'property',
    triggers: [
      { type: 'onBuild' },
    ],
    effects: [
      { type: 'custom', handler: () => {} }, // Handled by getBuildingLimits
    ],
    configSchema: { type: 'object' },
    priority: 100,
  },
  // Free Mortgage
  {
    id: 'free-mortgage',
    name: 'Free Mortgage',
    description: 'No interest on mortgages.',
    category: 'property',
    triggers: [
      { type: 'onMortgage' },
      { type: 'onUnmortgage' },
    ],
    effects: [
      { type: 'custom', handler: (ctx: RuleContext) => {
        ctx.gameState.rulesConfig.mortgageInterestRate = 0;
      }},
    ],
    configSchema: { type: 'object' },
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
        ctx.currentPlayer.money += ctx.gameState.rulesConfig.bailAmount;
      }},
    ],
    configSchema: { type: 'object' },
    priority: 100,
  },
  // Trade Anytime
  {
    id: 'property-trading-anytime',
    name: 'Trade Anytime',
    description: 'Can propose trades at any time.',
    category: 'trading',
    triggers: [],
    effects: [],
    configSchema: { type: 'object' },
    priority: 50,
  },
  // Forced Trade
  {
    id: 'forced-trade',
    name: 'Forced Trade',
    description: 'Force a trade once per game.',
    category: 'trading',
    triggers: [
      { type: 'onTradePropose' },
    ],
    effects: [
      { type: 'custom', handler: (ctx: RuleContext) => {
        // Would need special handling in trade logic
      }},
    ],
    configSchema: { type: 'object', properties: { usesPerGame: { type: 'number', default: 1 } } },
    priority: 100,
    oncePerGame: true,
  },
  // Time Limit
  {
    id: 'time-limit',
    name: 'Time Limit',
    description: 'Game ends after specified time.',
    category: 'winning',
    triggers: [
      { type: 'periodic', intervalMs: 60000 },
    ],
    effects: [
      { type: 'custom', handler: (ctx: RuleContext) => {
        const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'time-limit')?.config as { minutes?: number } ?? {};
        const timeLimit = config.minutes ?? 60;
        const elapsed = Date.now() - (ctx.gameState.startedAt ?? Date.now());
        if (elapsed >= timeLimit * 60 * 1000) {
          const active = ctx.gameState.players.filter(p => !p.isBankrupt);
          let richest = active[0];
          for (const p of active) if (p.netWorth > richest.netWorth) richest = p;
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
    description: 'First to reach target net worth wins.',
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
    description: 'Game ends if player leads by margin.',
    category: 'winning',
    triggers: [
      { type: 'onTurnEnd' },
    ],
    effects: [
      { type: 'custom', handler: (ctx: RuleContext) => {
        const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'mercy-rule')?.config as { leadMargin?: number } ?? {};
        const margin = config.leadMargin ?? 3000;
        const active = ctx.gameState.players.filter(p => !p.isBankrupt);
        if (active.length >= 2) {
          const sorted = [...active].sort((a, b) => b.netWorth - a.netWorth);
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
  // Max Turns
  {
    id: 'max-turns',
    name: 'Maximum Turns',
    description: 'Game ends after max turns.',
    category: 'winning',
    triggers: [
      { type: 'onTurnEnd' },
    ],
    effects: [
      { type: 'custom', handler: (ctx: RuleContext) => {
        const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'max-turns')?.config as { maxTurns?: number } ?? {};
        const maxTurns = config.maxTurns ?? 100;
        if (ctx.gameState.turn >= maxTurns) {
          const active = ctx.gameState.players.filter(p => !p.isBankrupt);
          let richest = active[0];
          for (const p of active) if (p.netWorth > richest.netWorth) richest = p;
          ctx.gameState.phase = GamePhase.GAME_OVER;
          ctx.gameState.winnerId = richest.id;
          ctx.gameState.endedAt = Date.now();
        }
      }},
    ],
    configSchema: { type: 'object', properties: { maxTurns: { type: 'number', default: 100 } } },
    priority: 50,
  },
  // Starting Money Bonus
  {
    id: 'starting-money-bonus',
    name: 'Starting Money Bonus',
    description: 'Extra starting money.',
    category: 'custom',
    triggers: [
      { type: 'onTurnStart' },
    ],
    effects: [
      { type: 'custom', handler: (ctx: RuleContext) => {
        if (ctx.gameState.turn === 0) {
          const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'starting-money-bonus')?.config as { bonus?: number } ?? {};
          const bonus = config.bonus ?? 500;
          for (const player of ctx.gameState.players) {
            player.money += bonus;
          }
        }
      }},
    ],
    configSchema: { type: 'object', properties: { bonus: { type: 'number', default: 500 } } },
    priority: 100,
    oncePerGame: true,
  },
  // Random Starting Properties
  {
    id: 'random-starting-properties',
    name: 'Random Starting Properties',
    description: 'Each player starts with random properties.',
    category: 'custom',
    triggers: [
      { type: 'onTurnStart' },
    ],
    effects: [
      { type: 'custom', handler: (ctx: RuleContext) => {
        if (ctx.gameState.turn === 0) {
          const config = ctx.gameState.rulesConfig.customRules.find(r => r.id === 'random-starting-properties')?.config as { count?: number } ?? {};
          const count = config.count ?? 2;
          const unowned = ctx.gameState.board.filter(p => p.ownerId === null && p.type !== PropertyType.SPECIAL);
          for (const player of ctx.gameState.players) {
            for (let i = 0; i < count && unowned.length > 0; i++) {
              const idx = Math.floor(Math.random() * unowned.length);
              const prop = unowned.splice(idx, 1)[0];
              prop.ownerId = player.id;
              player.properties.push(prop.id);
            }
          }
        }
      }},
    ],
    configSchema: { type: 'object', properties: { count: { type: 'number', default: 2 } } },
    priority: 100,
    oncePerGame: true,
  },
];

/**
 * Rule Categories for UI
 */
export const RULE_CATEGORIES = [
  { id: 'economy', name: 'Economy', description: 'Money, taxes, salaries, Free Parking', icon: '💰' },
  { id: 'property', name: 'Property', description: 'Auctions, building, mortgages, rent', icon: '🏠' },
  { id: 'jail', name: 'Jail', description: 'Bail, jail rules, trading in jail', icon: '🚔' },
  { id: 'trading', name: 'Trading', description: 'Trade rules, forced trades, approval', icon: '🤝' },
  { id: 'winning', name: 'Winning', description: 'Victory conditions, time limits', icon: '🏆' },
  { id: 'custom', name: 'Custom', description: 'Other custom rules', icon: '⚙️' },
] as const;

/**
 * Get rules by category
 */
export function getRulesByCategory(category: CustomRule['category']): CustomRule[] {
  return BUILTIN_HOUSE_RULES.filter(r => r.category === category);
}

/**
 * Get rule by ID
 */
export function getBuiltinRule(ruleId: string): CustomRule | undefined {
  return BUILTIN_HOUSE_RULES.find(r => r.id === ruleId);
}

/**
 * Get rule definition by ID
 */
export function getBuiltinRuleDefinition(ruleId: string): RuleDefinition | undefined {
  return BUILTIN_RULE_DEFINITIONS.find(r => r.id === ruleId);
}

/**
 * Popular rule presets
 */
export const RULE_PRESETS = {
  standard: {
    name: 'Standard Rules',
    description: 'Official Monopoly rules',
    rules: [] as string[],
  },
  classic: {
    name: 'Classic House Rules',
    description: 'Most popular house rules',
    rules: ['free-parking-jackpot', 'double-go-salary', 'snake-eyes-bonus'] as string[],
  },
  friendly: {
    name: 'Friendly Game',
    description: 'Relaxed rules for casual play',
    rules: ['free-parking-jackpot', 'free-bail', 'unlimited-houses', 'property-trading-anytime'] as string[],
  },
  competitive: {
    name: 'Competitive',
    description: 'Strict rules for serious play',
    rules: ['no-auctions', 'trade-requires-approval', 'max-turns'] as string[],
  },
  speed: {
    name: 'Speed Monopoly',
    description: 'Fast-paced 30-minute game',
    rules: ['time-limit', 'wealth-victory', 'starting-money-bonus', 'random-starting-properties'] as string[],
    config: {
      'time-limit': { minutes: 30 },
      'wealth-victory': { targetNetWorth: 3000 },
      'starting-money-bonus': { bonus: 1000 },
      'random-starting-properties': { count: 3 },
    },
  },
  chaos: {
    name: 'Chaos Mode',
    description: 'Maximum randomness and chaos',
    rules: ['free-parking-jackpot', 'double-go-salary', 'snake-eyes-bonus', 'unlimited-houses', 'free-bail', 'forced-trade', 'property-trading-anytime'] as string[],
    config: {
      'forced-trade': { usesPerGame: 3 },
    },
  },
} as const;

/**
 * Apply preset to rules config
 */
export function applyPreset(rulesConfig: RulesConfig, presetId: keyof typeof RULE_PRESETS): RulesConfig {
  const preset = RULE_PRESETS[presetId];
  const newConfig = { ...rulesConfig };
  newConfig.customRules = [];

  for (const ruleId of preset.rules) {
    const builtin = getBuiltinRule(ruleId);
    if (builtin) {
      const config = preset.config?.[ruleId] ?? {};
      newConfig.customRules.push({ ...builtin, enabled: true, config });
    }
  }

  return newConfig;
}

/**
 * Validate rules config with built-in rules
 */
export function validateRulesConfigWithBuiltins(config: RulesConfig): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Base validation
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

  // Check for conflicting rules
  const enabledRules = config.customRules.filter(r => r.enabled).map(r => r.id);

  if (enabledRules.includes('no-auctions') && enabledRules.includes('property-auction-min-bid')) {
    warnings.push('No auctions and minimum auction bid are conflicting');
  }

  if (enabledRules.includes('unlimited-houses') && (config.maxHouses !== 32 || config.maxHotels !== 12)) {
    warnings.push('Unlimited houses overrides maxHouses/maxHotels settings');
  }

  if (enabledRules.includes('free-bail') && config.bailAmount !== 50) {
    warnings.push('Free bail overrides bailAmount setting');
  }

  if (enabledRules.includes('no-trading') && enabledRules.includes('property-trading-anytime')) {
    warnings.push('No trading and trade anytime are conflicting');
  }

  // Check winning conditions
  const winningRules = enabledRules.filter(r => 
    ['time-limit', 'wealth-victory', 'mercy-rule', 'max-turns'].includes(r)
  );
  if (winningRules.length > 1) {
    warnings.push(`Multiple winning conditions enabled: ${winningRules.join(', ')}. First to trigger wins.`);
  }

  return { valid: errors.length === 0, errors, warnings };
}