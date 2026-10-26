// Game Constants

export const GAME_CONSTANTS = {
  // Board
  BOARD_SIZE: 40,
  GO_POSITION: 0,
  JAIL_POSITION: 10,
  FREE_PARKING_POSITION: 20,
  GO_TO_JAIL_POSITION: 30,

  // Money
  STARTING_MONEY: 1500,
  GO_SALARY: 200,
  INCOME_TAX: 200,
  LUXURY_TAX: 100,
  JAIL_BAIL: 50,

  // Jail
  MAX_JAIL_TURNS: 3,
  DOUBLE_ROLL_JAIL_FREE: true,

  // Building
  MAX_HOUSES: 32,
  MAX_HOTELS: 12,
  HOUSES_PER_HOTEL: 4,

  // Players
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  DEFAULT_PLAYER_COLORS: [
    '#FF0000', // Red
    '#0000FF', // Blue
    '#00FF00', // Green
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
  ],

  // Game
  MAX_TURNS_PER_GAME: 1000, // Prevent infinite games
  TURN_TIMEOUT_MS: 60000, // 1 minute per turn
  TRADE_TIMEOUT_MS: 30000, // 30 seconds for trade response
  AUCTION_TIMEOUT_MS: 30000, // 30 seconds for auction

  // AI
  AI_MOVE_DELAY_MS: 500, // Minimum delay for AI moves (feel natural)
  AI_MAX_THINK_TIME_MS: 5000, // Maximum time AI can think

  // Networking
  RECONNECT_WINDOW_MS: 30000, // Time to reconnect before forfeit
  HEARTBEAT_INTERVAL_MS: 10000, // WebSocket heartbeat
  MAX_MESSAGE_SIZE: 1024 * 1024, // 1MB max message

  // Lobby
  LOBBY_CODE_LENGTH: 6,
  LOBBY_CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // No confusing chars
  MAX_LOBBY_PLAYERS: 8,
  LOBBY_IDLE_TIMEOUT_MS: 300000, // 5 minutes

  // Tournament
  TOURNAMENT_MIN_PLAYERS: 4,
  TOURNAMENT_MAX_PLAYERS: 64,
  SWISS_ROUNDS: 5,

  // Rating
  INITIAL_RATING: 1200,
  INITIAL_RD: 350,
  INITIAL_VOLATILITY: 0.06,
} as const;

// Property Types
export enum PropertyType {
  STREET = 'street',
  RAILROAD = 'railroad',
  UTILITY = 'utility',
  SPECIAL = 'special', // Go, Jail, Free Parking, Go to Jail, Tax
}

// Property Groups (Color Groups)
export enum PropertyGroup {
  BROWN = 'brown',
  LIGHT_BLUE = 'lightBlue',
  PINK = 'pink',
  ORANGE = 'orange',
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  DARK_BLUE = 'darkBlue',
  RAILROAD = 'railroad',
  UTILITY = 'utility',
}

// Card Types
export enum CardType {
  CHANCE = 'chance',
  COMMUNITY_CHEST = 'communityChest',
}

// Game Phases
export enum GamePhase {
  LOBBY = 'lobby',
  SETUP = 'setup',
  PLAYING = 'playing',
  AUCTION = 'auction',
  TRADING = 'trading',
  JAIL_DECISION = 'jailDecision',
  TURN_END = 'turnEnd',
  GAME_OVER = 'gameOver',
}

// Player Actions
export enum PlayerAction {
  ROLL_DICE = 'rollDice',
  BUY_PROPERTY = 'buyProperty',
  AUCTION_BID = 'auctionBid',
  PAY_JAIL_BAIL = 'payJailBail',
  USE_GET_OUT_OF_JAIL_FREE = 'useGetOutOfJailFree',
  BUILD_HOUSE = 'buildHouse',
  SELL_HOUSE = 'sellHouse',
  MORTGAGE_PROPERTY = 'mortgageProperty',
  UNMORTGAGE_PROPERTY = 'unmortgageProperty',
  PROPOSE_TRADE = 'proposeTrade',
  ACCEPT_TRADE = 'acceptTrade',
  REJECT_TRADE = 'rejectTrade',
  END_TURN = 'endTurn',
  DECLARE_BANKRUPTCY = 'declareBankruptcy',
}

// Dice
export const DICE_SIDES = 6;
export const DOUBLES_MAX = 3; // 3 doubles = go to jail

// Standard Monopoly Board Layout (0-indexed)
export const STANDARD_BOARD = [
  { position: 0, name: 'GO', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 1, name: 'Mediterranean Avenue', type: PropertyType.STREET, group: PropertyGroup.BROWN, price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50 },
  { position: 2, name: 'Community Chest', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 3, name: 'Baltic Avenue', type: PropertyType.STREET, group: PropertyGroup.BROWN, price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50 },
  { position: 4, name: 'Income Tax', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 5, name: 'Reading Railroad', type: PropertyType.RAILROAD, group: PropertyGroup.RAILROAD, price: 200, rent: [25, 50, 100, 200] },
  { position: 6, name: 'Oriental Avenue', type: PropertyType.STREET, group: PropertyGroup.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
  { position: 7, name: 'Chance', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 8, name: 'Vermont Avenue', type: PropertyType.STREET, group: PropertyGroup.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
  { position: 9, name: 'Connecticut Avenue', type: PropertyType.STREET, group: PropertyGroup.LIGHT_BLUE, price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50 },
  { position: 10, name: 'Jail / Just Visiting', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 11, name: 'St. Charles Place', type: PropertyType.STREET, group: PropertyGroup.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
  { position: 12, name: 'Electric Company', type: PropertyType.UTILITY, group: PropertyGroup.UTILITY, price: 150, rent: [0] }, // Special: 4x or 10x dice
  { position: 13, name: 'States Avenue', type: PropertyType.STREET, group: PropertyGroup.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
  { position: 14, name: 'Virginia Avenue', type: PropertyType.STREET, group: PropertyGroup.PINK, price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100 },
  { position: 15, name: 'Pennsylvania Railroad', type: PropertyType.RAILROAD, group: PropertyGroup.RAILROAD, price: 200, rent: [25, 50, 100, 200] },
  { position: 16, name: 'St. James Place', type: PropertyType.STREET, group: PropertyGroup.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
  { position: 17, name: 'Community Chest', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 18, name: 'Tennessee Avenue', type: PropertyType.STREET, group: PropertyGroup.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
  { position: 19, name: 'New York Avenue', type: PropertyType.STREET, group: PropertyGroup.ORANGE, price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100 },
  { position: 20, name: 'Free Parking', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 21, name: 'Kentucky Avenue', type: PropertyType.STREET, group: PropertyGroup.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
  { position: 22, name: 'Chance', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 23, name: 'Indiana Avenue', type: PropertyType.STREET, group: PropertyGroup.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
  { position: 24, name: 'Illinois Avenue', type: PropertyType.STREET, group: PropertyGroup.RED, price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150 },
  { position: 25, name: 'B. & O. Railroad', type: PropertyType.RAILROAD, group: PropertyGroup.RAILROAD, price: 200, rent: [25, 50, 100, 200] },
  { position: 26, name: 'Atlantic Avenue', type: PropertyType.STREET, group: PropertyGroup.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
  { position: 27, name: 'Ventnor Avenue', type: PropertyType.STREET, group: PropertyGroup.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
  { position: 28, name: 'Water Works', type: PropertyType.UTILITY, group: PropertyGroup.UTILITY, price: 150, rent: [0] }, // Special: 4x or 10x dice
  { position: 29, name: 'Marvin Gardens', type: PropertyType.STREET, group: PropertyGroup.YELLOW, price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150 },
  { position: 30, name: 'Go to Jail', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 31, name: 'Pacific Avenue', type: PropertyType.STREET, group: PropertyGroup.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
  { position: 32, name: 'North Carolina Avenue', type: PropertyType.STREET, group: PropertyGroup.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
  { position: 33, name: 'Community Chest', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 34, name: 'Pennsylvania Avenue', type: PropertyType.STREET, group: PropertyGroup.GREEN, price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200 },
  { position: 35, name: 'Short Line', type: PropertyType.RAILROAD, group: PropertyGroup.RAILROAD, price: 200, rent: [25, 50, 100, 200] },
  { position: 36, name: 'Chance', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 37, name: 'Park Place', type: PropertyType.STREET, group: PropertyGroup.DARK_BLUE, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200 },
  { position: 38, name: 'Luxury Tax', type: PropertyType.SPECIAL, group: null, price: 0, rent: [0] },
  { position: 39, name: 'Boardwalk', type: PropertyType.STREET, group: PropertyGroup.DARK_BLUE, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200 },
] as const;

// Standard Chance Cards
export const STANDARD_CHANCE_CARDS = [
  { id: 'c1', text: 'Advance to GO (Collect $200)', action: 'advanceTo', target: 0, collectGo: true },
  { id: 'c2', text: 'Advance to Illinois Ave.', action: 'advanceTo', target: 24 },
  { id: 'c3', text: 'Advance to St. Charles Place', action: 'advanceTo', target: 11 },
  { id: 'c4', text: 'Advance to Utility', action: 'advanceToNearest', targetType: PropertyType.UTILITY, multiplier: 10 },
  { id: 'c5', text: 'Advance to Railroad', action: 'advanceToNearest', targetType: PropertyType.RAILROAD, multiplier: 2 },
  { id: 'c6', text: 'Advance to Railroad', action: 'advanceToNearest', targetType: PropertyType.RAILROAD, multiplier: 2 },
  { id: 'c7', text: 'Bank pays you dividend of $50', action: 'receiveMoney', amount: 50 },
  { id: 'c8', text: 'Get Out of Jail Free', action: 'getOutOfJailFree' },
  { id: 'c9', text: 'Go Back 3 Spaces', action: 'moveRelative', spaces: -3 },
  { id: 'c10', text: 'Go to Jail', action: 'goToJail' },
  { id: 'c11', text: 'Make general repairs on all your property', action: 'payPerHouseHotel', perHouse: 25, perHotel: 100 },
  { id: 'c12', text: 'Pay poor tax of $15', action: 'payMoney', amount: 15 },
  { id: 'c13', text: 'Take a trip to Reading Railroad', action: 'advanceTo', target: 5 },
  { id: 'c14', text: 'Take a walk on the Boardwalk', action: 'advanceTo', target: 39 },
  { id: 'c15', text: 'You have been elected Chairman of the Board', action: 'payEachPlayer', amount: 50 },
  { id: 'c16', text: 'Your building loan matures', action: 'receiveMoney', amount: 150 },
] as const;

// Standard Community Chest Cards
export const STANDARD_COMMUNITY_CHEST_CARDS = [
  { id: 'cc1', text: 'Advance to GO (Collect $200)', action: 'advanceTo', target: 0, collectGo: true },
  { id: 'cc2', text: 'Bank error in your favor', action: 'receiveMoney', amount: 200 },
  { id: 'cc3', text: 'Doctor\'s fee', action: 'payMoney', amount: 50 },
  { id: 'cc4', text: 'From sale of stock you get $50', action: 'receiveMoney', amount: 50 },
  { id: 'cc5', text: 'Get Out of Jail Free', action: 'getOutOfJailFree' },
  { id: 'cc6', text: 'Grand Opera Night', action: 'receiveFromEachPlayer', amount: 50 },
  { id: 'cc7', text: 'Holiday Fund matures', action: 'receiveMoney', amount: 100 },
  { id: 'cc8', text: 'Income tax refund', action: 'receiveMoney', amount: 20 },
  { id: 'cc9', text: 'It is your birthday', action: 'receiveFromEachPlayer', amount: 10 },
  { id: 'cc10', text: 'Life insurance matures', action: 'receiveMoney', amount: 100 },
  { id: 'cc11', text: 'Pay hospital fees', action: 'payMoney', amount: 100 },
  { id: 'cc12', text: 'Pay school fees', action: 'payMoney', amount: 50 },
  { id: 'cc13', text: 'Receive $25 consultancy fee', action: 'receiveMoney', amount: 25 },
  { id: 'cc14', text: 'You are assessed for street repairs', action: 'payPerHouseHotel', perHouse: 40, perHotel: 115 },
  { id: 'cc15', text: 'You have won second prize in a beauty contest', action: 'receiveMoney', amount: 10 },
  { id: 'cc16', text: 'You inherit $100', action: 'receiveMoney', amount: 100 },
] as const;

// AI Difficulty Levels
export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export const AI_DIFFICULTY_CONFIG = {
  [AIDifficulty.EASY]: {
    searchDepth: 2,
    mctsSimulations: 50,
    evaluationWeights: { liquidity: 0.3, propertySets: 0.2, development: 0.1, opponentThreat: 0.1 },
    riskTolerance: 0.7,
    tradingAggression: 0.3,
    buildingStrategy: 'conservative',
  },
  [AIDifficulty.MEDIUM]: {
    searchDepth: 4,
    mctsSimulations: 200,
    evaluationWeights: { liquidity: 0.25, propertySets: 0.3, development: 0.2, opponentThreat: 0.15 },
    riskTolerance: 0.5,
    tradingAggression: 0.5,
    buildingStrategy: 'balanced',
  },
  [AIDifficulty.HARD]: {
    searchDepth: 6,
    mctsSimulations: 1000,
    evaluationWeights: { liquidity: 0.2, propertySets: 0.35, development: 0.25, opponentThreat: 0.2 },
    riskTolerance: 0.3,
    tradingAggression: 0.7,
    buildingStrategy: 'aggressive',
  },
  [AIDifficulty.EXPERT]: {
    searchDepth: 8,
    mctsSimulations: 5000,
    evaluationWeights: { liquidity: 0.15, propertySets: 0.4, development: 0.3, opponentThreat: 0.15 },
    riskTolerance: 0.2,
    tradingAggression: 0.8,
    buildingStrategy: 'optimal',
  },
} as const;

// Lobby Status
export enum LobbyStatus {
  WAITING = 'waiting',
  STARTING = 'starting',
  IN_GAME = 'inGame',
  FINISHED = 'finished',
}

// Tournament Formats
export enum TournamentFormat {
  SWISS = 'swiss',
  ELIMINATION = 'elimination',
  ROUND_ROBIN = 'roundRobin',
}

// Tournament Status
export enum TournamentStatus {
  UPCOMING = 'upcoming',
  REGISTRATION = 'registration',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Match Status
export enum MatchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  FORFEIT = 'forfeit',
}

// Plugin Types
export enum PluginType {
  BOARD_SKIN = 'boardSkin',
  RULE_PACK = 'rulePack',
  PIECE_SET = 'pieceSet',
  AI_PERSONALITY = 'aiPersonality',
  GAME_MODE = 'gameMode',
}